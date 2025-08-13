
const express = require('express');
const { auth } = require('../middleware/auth');
const facultyController = require('../Controllers/profilefaculty');

const router = express.Router();

// @route   GET /api/faculty/profile
// @desc    Get current logged-in faculty or student
// @access  Private
router.get('/faculty/profile', auth, facultyController.getCurrentUser);

// @route   PUT /api/faculty/update
// @desc    Update faculty details (only for faculty)
// @access  Private
router.put('/faculty/update', auth, facultyController.updateFacultyDetails);

module.exports = router;
