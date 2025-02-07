const Feature = require('../Models/features');
const multer = require('multer');
const path = require('path');

// Multer configuration (similar to the third file)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this path is correct and writable
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter to allow only images and videos
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  }
});

// Create a new feature with file upload
exports.createFeature = async (req, res) => {
  upload.array('files', 10)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { title, notes, category } = req.body;
      const files = req.files.map(file => file.path); // Get file paths

      const feature = new Feature({
        title,
        notes,
        category,
        files, // Store the file paths
      });

      const savedFeature = await feature.save();
      res.status(201).json({ message: 'Feature created successfully', feature: savedFeature });
    } catch (error) {
      res.status(500).json({ message: 'Error creating feature', error: error.message });
    }
  });
};

// Other feature CRUD operations remain the same...
