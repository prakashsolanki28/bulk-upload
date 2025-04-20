const amqp = require('amqplib');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const logFilePath = path.join(__dirname, '../logs/failed_inserts.log');

async function startWorker() {
    const db = await mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'Edu@2024',
        database: process.env.DB_NAME || 'bulkdata',
        waitForConnections: true,
        connectionLimit: 10,
    });

    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue('csv_chunk_queue');

    // inset into log file
    channel.consume('csv_chunk_queue', async (msg) => {

        const decompressed = zlib.gunzipSync(msg.content).toString();
        const rows = JSON.parse(decompressed);

        const values = rows.map(row => [
            row.Name,
            row.Age,
            row.Country,
            row.Subscription_Type,
            row.Watch_Time_Hours,
            row.Favorite_Genre,
            row.Last_Login
        ]);

        try {
            await db.query(
                'INSERT INTO users (name, age, country, subscription_type, watch_time_hours, favorite_genre, last_login) VALUES ?',
                [values]
            );
            channel.ack(msg);
        } catch (err) {
            console.error('DB Insert error:', err);
            // Log the failed insert
            const failedInsert = {
                rows,
                error: err.message,
                timestamp: new Date().toISOString(),
            };

            fs.appendFileSync(logFilePath, JSON.stringify(failedInsert) + '\n');
            channel.nack(msg);
        }
    });
    console.log('Worker started...');
}

startWorker();