const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/userController');

const upload = multer({ dest: 'uploads/' });

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: API for user operations
 */

/**
 * @swagger
 * /api/users/upload-users:
 *   post:
 *     summary: Upload CSV file
 *     description: Upload a CSV file to process user data in the background using RabbitMQ and Redis.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The CSV file containing user data
 *     responses:
 *       200:
 *         description: CSV upload started. Processing in background.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: CSV upload started. Processing in background.
 *       400:
 *         description: Error in file upload or processing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No file uploaded
 *       500:
 *         description: Internal server error.
 *     security:
 *       - bearerAuth: []
 */


router.post('/upload-users', upload.single('file'), userController.uploadUsers);

router.get('/', userController.getUsers);

module.exports = router;
