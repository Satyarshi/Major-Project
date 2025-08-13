// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const CourseController = require('../Controllers/courseController');
const { auth, isFaculty, isStudent } = require('../middleware/auth');
router.post('/courses/create', auth, isFaculty, CourseController.createCourse);
module.exports = router;
