// controllers/CourseController.js
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

exports.createCourse = async (req, res) => {
  try {
    const {
      courseName,
      courseId,
      session,
      semester,
      department,
      class: className,
      sections,
      targetLevels,
      outcomes
    } = req.body;

    // Check if course already exists with EXACT same fields
    const existingCourse = await Course.findOne({
      courseName: new RegExp('^' + courseName + '$', 'i'),
      courseId,
      session,
      semester,
      department,
      sections: { $all: sections, $size: sections.length }, // ensure sections match
      faculty: req.user.id
    });

    if (existingCourse) {
      return res.status(400).json({
        error: 'Course with same details already exists'
      });
    }

    // Create new course document
    const course = new Course({
      courseName,
      courseId,
      session,
      semester,
      department,
      faculty: req.user.id, // from JWT
      class: className,
      sections,
      targetLevels,
      outcomes
    });

    await course.save();

    // Attach course to faculty's courses
    await Faculty.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { courses: course._id } }
    );

    // Attach course to students whose semester, section, session, department & class match
    await Student.updateMany(
      {
        semester,
        section: { $in: sections },  // students in any of these sections
        session,
        department,
        class: className
      },
      { $addToSet: { courses: course._id } } // avoid duplicates
    );

    return res.status(201).json({
      message: 'Course created successfully and mapped to students',
      course
    });

  } catch (err) {
    console.error('Error creating course with outcomes:', err);
    return res.status(500).json({ error: 'Server error while creating course with outcomes' });
  }
};
