const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads'); // Directory to save uploaded files
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
const { model, Schema } = require('mongoose');

const registerSchema = new Schema({
    userName: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            password: {
                type: String,
                required: true,
                select: false
            },
            image: {
                type: String,
                required: true
            },
            video: {
                type: String,
                required: true 
            },
}, { timestamps: true });

const RegisterModel = model('Register', registerSchema);

module.exports = RegisterModel;






