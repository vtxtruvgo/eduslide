const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configure Cloudinary (Make sure to provide these in .env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'eduslide_presentations',
        upload_preset: 'eduslide_yeahzz',
        resource_type: 'raw', // PPT/PDFs are not standard images
        format: async (req, file) => {
            // Keep original extension or rely on resource_type: raw to handle it
            const ext = path.extname(file.originalname).substring(1).toLowerCase();
            return ext;
        },
        public_id: (req, file) => Date.now() + '-' + file.originalname.replace(/\s+/g, '_')
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.pdf', '.ppt', '.pptx'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, PPT, and PPTX files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: fileFilter
});

module.exports = upload;
