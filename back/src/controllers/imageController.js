require('dotenv').config();
const fs = require('fs');
const path = require('path');

exports.getImage = async (req, reply) => {
    const { filename } = req.query;

    if (!filename) {
        return reply.code(400).send('No file name provided.');
    }

    const uploadsDir = path.join(__dirname, '../../profile_images');
    const imagePath = path.join(uploadsDir, path.basename(filename));
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(filename).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
        return reply.code(400).send('Only image files are allowed.');
    }

    try {
        await fs.promises.access(imagePath, fs.constants.F_OK);

        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
        };
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        reply.header('Content-Type', contentType);
        reply.header('Content-Disposition', `inline; filename="${filename}"`);
        return fs.createReadStream(imagePath);

    } catch (err) {
        console.error('Image not found:', imagePath);
        return reply.code(404).send('Image not found.');
    }
};