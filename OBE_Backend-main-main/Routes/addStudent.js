const express = require('express');
const router = express.Router();
const { addStudentsToCourse } = require('../Controllers/addStudentsToCourse');
const { fillMarks, getStudentsForCourse } = require('../Controllers/fillmarks');
const { auth, isFaculty } = require('../middleware/auth');

// POST /api/v1/students/add
router.post('/students/add', auth, isFaculty, addStudentsToCourse);

// POST /api/v1/students/fetch
router.post('/students/fetch', auth, isFaculty, getStudentsForCourse);

// POST /api/v1/students/fillMarks
router.post('/students/fillMarks', auth, isFaculty, fillMarks);

module.exports = router;