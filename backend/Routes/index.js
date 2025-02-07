const express = require('express')
const router = express.Router();

const authRoute = require("./auth")
const shoproute = require('./shop')
const userRoute = require('./user')
const aiRoute = require('./ai');
const coursesRoute = require('./courses')
const videoCourseRoute = require('./video')
const questionsRoute = require('./questions')


router.use('/auth', authRoute)
router.use('/ai', aiRoute)
router.use('/shop', shoproute)
router.use('/user', userRoute)
router.use('/courses', coursesRoute, videoCourseRoute)
router.use('/question', questionsRoute)

module.exports = router;