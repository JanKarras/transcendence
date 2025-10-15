require('dotenv').config();
const fs = require('fs');
const path = require('path');
const FileType = require('file-type');

const rawAllowed = (process.env.ALLOWED_IMAGE_TYPES || '').trim();
const ALLOWED_MIME_TYPES = rawAllowed
  ? rawAllowed.split(',').map(s => s.trim().toLowerCase())
  : ['image/png','image/jpeg','image/webp','image/gif'];

exports.getImage = async (req, reply) => {
    const { filename } = req.query;
    if (!filename) return reply.code(400).send('No file name provided.');

    const uploadsDir = path.join(__dirname, '../../profile_images');
    const safeFilename = path.basename(filename);
    const imagePath = path.join(uploadsDir, safeFilename);

    if (!imagePath.startsWith(uploadsDir)) {
        return reply.code(400).send('Invalid file path.');
    }

    try {
        await fs.promises.access(imagePath, fs.constants.F_OK);

        const buffer = await fs.promises.readFile(imagePath);
        const type = await FileType.fileTypeFromBuffer(buffer);

        if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) {
            return reply.code(400).send('File is not a valid image.');
        }

        reply.header('Content-Type', type.mime);
        reply.header('Content-Disposition', `inline; filename="${safeFilename}"`);
        return fs.createReadStream(imagePath);

    } catch (err) {
        console.error('Image not found or invalid:', imagePath, err);
        return reply.code(404).send('Image not found.');
    }
};
