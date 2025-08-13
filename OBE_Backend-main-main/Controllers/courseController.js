// controllers/CourseController.js
const Course = require('../models/Course');

exports.createCourse = async (req, res) => {
  try {
    const {
      courseName,
      courseId,
      session,
      semester,
      department,
      class: className,
      sections
    } = req.body;

    const course = new Course({
      courseName,
      courseId,
      session,
      semester,
      department,
      faculty: req.user.id, // From JWT
      class: className,
      sections
    });

    await course.save();

    // Attach course to faculty's courses array
    const Faculty = require('../models/Faculty');
    await Faculty.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { courses: course._id } }
    );

    return res.status(201).json({ message: 'Course created successfully', course });
  } catch (err) {
    console.error('Error creating course:', err);
    return res.status(500).json({ error: 'Server error while creating course' });
  }
};
