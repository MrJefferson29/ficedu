const express = require('express');
const { addVideo, getVideosByCourse, getVideoDetails, updateVideo } = require('../Controllers/video'); // Import the controller
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Save videos in the 'uploads' folder
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `video-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });
  
  const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed!'), false);
      }
    },
  });
// Route to upload a video for a specific course
router.post('/:id/video', upload.single('file'), addVideo);  // Accepts only 1 video file
router.get('/get-all/:courseId', getVideosByCourse);
router.get('/details/:id', getVideoDetails);
router.put('/edit/:id', upload.single('file'), updateVideo);

module.exports = router;
