// controllers/CourseOutcomeController.js
const Course = require('../models/Course');
const CourseOutcome = require('../models/CourseOutcome');

exports.addCourseOutcomes = async (req, res) => {
  try {
    // Accept data according to new schema
    const { courseName, courseCode, theoryTAMarks, universityExamMarks, targetLevels, outcomes } = req.body;

    // Check if CourseOutcome already exists for this course and faculty
    const existingCourseOutcome = await CourseOutcome.findOne({ 
      courseName: new RegExp('^' + courseName + '$', 'i'),
      faculty: req.user.id 
    });

    if (existingCourseOutcome) {
      return res.status(400).json({ error: 'Course outcomes already filled for this subject by you' });
    }

    // Create new CourseOutcome document
    const courseOutcome = new CourseOutcome({
      courseName,
      courseCode,
      theoryTAMarks,
      universityExamMarks,
      targetLevels,
      outcomes,
      faculty: req.user.id
    });

    await courseOutcome.save();

    return res.status(201).json({
      message: 'Course outcomes created successfully',
      courseOutcome
    });
  } catch (err) {
    console.error('Error adding outcomes:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
