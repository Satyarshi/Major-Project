// controllers/CourseController.js
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');

exports.createCourse = async (req, res) => {
  try {
    const {
      // Course details
      courseName,
      courseId,
      courseCode,
      session,
      semester,
      department,
      class: className,
      sections,

      // Marks & outcomes
      theoryTAMarks,
      universityExamMarks,
      targetLevels,
      outcomes
    } = req.body;

    // Check if course with outcomes already exists for this faculty
    const existingCourse = await Course.findOne({
      courseName: new RegExp('^' + courseName + '$', 'i'),
      faculty: req.user.id
    });

    if (existingCourse) {
      return res.status(400).json({
        error: 'Course outcomes already filled for this subject by you'
      });
    }

    // Create new course document (merged schema)
    const course = new Course({
      courseName,
      courseId,
      courseCode,
      session,
      semester,
      department,
      faculty: req.user.id, // From JWT
      class: className,
      sections,
      theoryTAMarks,
      universityExamMarks,
      targetLevels,
      outcomes
    });

    await course.save();

    // Attach course to faculty's courses array
    await Faculty.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { courses: course._id } }
    );

    return res.status(201).json({
      message: 'Course and outcomes created successfully',
      course
    });

  } catch (err) {
    console.error('Error creating course with outcomes:', err);
    return res.status(500).json({ error: 'Server error while creating course with outcomes' });
  }
};
