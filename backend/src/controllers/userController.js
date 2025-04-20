const amqp = require('amqplib');
const fs = require('fs');
const csv = require('fast-csv');
const User = require('../models/user');
const redis = require('../services/redis');
const { Op } = require('sequelize');
const zlib = require('zlib');

exports.uploadUsers = async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = file.path;
        if (!filePath) {
            return res.status(400).json({ error: 'No file path found' });
        }

        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue('csv_chunk_queue');

        const CHUNK_SIZE = 1000;
        let buffer = [];

        const stream = fs.createReadStream(filePath).pipe(csv.parse({ headers: true }));

        stream.on('data', async (row) => {
            buffer.push(row);
            if (buffer.length === CHUNK_SIZE) {
                stream.pause();
                const compressed = zlib.gzipSync(Buffer.from(JSON.stringify(buffer)));
                await channel.sendToQueue('csv_chunk_queue', compressed);
                buffer = [];
                stream.resume();
            }
        });

        stream.on('end', async () => {
            if (buffer.length) {
                const compressed = zlib.gzipSync(Buffer.from(JSON.stringify(buffer)));
                await channel.sendToQueue('csv_chunk_queue', compressed);
            }

            fs.unlinkSync(filePath);

            // clears all redis cache
            const keys = await redis.keys('users:*');
            if (keys.length) await redis.del(...keys);

            return res.json({ message: 'CSV upload started. Processing in background.' });
        });
    } catch (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ error: err.message });
    }
};


exports.getUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const cacheKey = `users:page:${page}:limit:${limit}:search:${search}`;

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            return res.status(200).json({
                ...parsed,
                db: 'cache',
            });
        }

        const users = await User.findAll({
            limit,
            offset,
            order: [['id', 'ASC']],
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                ],
            },
        });

        const totalUsers = await redis.get('users:total');
        let total = totalUsers ? parseInt(totalUsers) : await User.count();

        if (!totalUsers) {
            await redis.set('users:total', total, 'EX', 300);
        }

        const totalPages = Math.ceil(total / limit);

        const response = {
            users,
            pagination: {
                totalUsers: total,
                currentPage: page,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                nextPage: page < totalPages ? page + 1 : null,
                prevPage: page > 1 ? page - 1 : null,
                limit,
                offset,
                pageSize: users.length,
            },
        };

        await redis.set(cacheKey, JSON.stringify(response), 'EX', 300);

        return res.status(200).json({
            ...response,
            db: 'mysql',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
};
