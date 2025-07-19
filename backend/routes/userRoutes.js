const express = require('express');
const router = express.Router();
const { getMe, updateUserProfile, uploadProfilePicture,getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload folder exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1680054555911.png
  }
});

const upload = multer({ storage });

// Routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateUserProfile);
router.get('/profile', protect, getUserProfile); 
router.post('/upload-profile-pic', protect, upload.single('profilePic'), uploadProfilePicture);

module.exports = router;
