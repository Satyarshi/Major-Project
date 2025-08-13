// routes/courseOutcomeRoutes.js
const express = require('express');
const router = express.Router();
const CourseOutcomeController = require('../Controllers/CourseOutcomeController');
const { auth, isFaculty } = require('../middleware/auth');

router.post('/courses/outcomes', auth, isFaculty, CourseOutcomeController.addCourseOutcomes);

module.exports = router;
