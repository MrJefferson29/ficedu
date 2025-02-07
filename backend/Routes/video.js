const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');
const path = require('path');
const { addItem, getAllItems, getItemById, updateItem, deleteItem } = require('../Controllers/shop');
const authenticateUser = require('../Middleware/auth');

const router = express.Router();

// Cloudinary Storage Configuration for Images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shop-items', // Folder in Cloudinary
    format: async (req, file) => 'png', // Convert all uploads to PNG
    public_id: (req, file) => `${file.fieldname}-${Date.now()}`
  }
});

const uploadImages = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Cloudinary Storage Configuration for Videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shop-videos', // Folder in Cloudinary
    resource_type: 'video',
    format: async (req, file) => 'mp4', // Convert all uploads to MP4
    public_id: (req, file) => `${file.fieldname}-${Date.now()}`
  }
});

const uploadVideos = multer({
  storage: videoStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

// Route for adding an item
router.post('/add', authenticateUser, uploadImages.array('images', 5), addItem);

// Route for getting all items
router.get('/get-all', getAllItems);

// Route for getting a single item by ID
router.get('/:id', getItemById);

// Route to update the item
router.put('/:id/update', uploadImages.array('images', 5), updateItem);

// Route for deleting an item by ID
router.delete('/:id', deleteItem);

// Route to upload a video
router.post('/:id/video', uploadVideos.single('file'), (req, res) => {
  res.json({ message: 'Video uploaded successfully', url: req.file.path });
});

module.exports = router;
