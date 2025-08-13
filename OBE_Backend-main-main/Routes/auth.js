const express = require('express');
const router = express.Router();
const { registerFaculty, registerStudent, login } = require('../Controllers/authController');

const { auth } = require('../middleware/auth');


// @route   POST /api/v1/auth/register/faculty
// @desc    Register faculty
// @access  Public
router.post('/auth/register/faculty', registerFaculty);

// @route   POST /api/v1/auth/register/student
// @desc    Register student
// @access  Public
router.post('/auth/register/student', registerStudent);

// @route   POST /api/v1/auth/login
// @desc    Login user (faculty or student) - role based
// @access  Public
router.post('/auth/login', login);


module.exports = router;
