const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');


const { getMarks } = require('../Controllers/marksController');

router.get('/marks', auth, getMarks);

module.exports = router;