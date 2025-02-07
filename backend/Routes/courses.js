const {createCourse, getAllCourses, updateCourse, getCourseById} = require('../Controllers/courses')
const multer = require('multer');
const path = require('path');
const express = require('express')

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.post('/create',upload.array('images', 5), createCourse)
router.post('/get-all', getAllCourses)
router.get('/:id', getCourseById)
router.put('/:id/update', upload.array('images', 5), updateCourse)

module.exports = router;