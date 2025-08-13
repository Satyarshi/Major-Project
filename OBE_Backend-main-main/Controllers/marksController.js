const Marks = require('../models/Marks');
const Student = require('../models/Student');
const Course = require('../models/Course');

const getMarks = async (req, res) => {
  try {
    const { session, section, courseId, semester } = req.query;

    if (!session || !section || !courseId || !semester) {
      return res.status(400).json({ error: 'session, section, courseId, and semester are required.' });
    }

    // Step 1: Validate the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Step 2: Find all students in that session and section enrolled in the course
    const students = await Student.find({
      session,
      section,
      semester,
      courses: courseId
    });

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found for given criteria' });
    }

    // Step 3: Get their marks
    const studentIds = students.map(s => s._id);

    const marks = await Marks.find({
      student: { $in: studentIds },
      course: courseId,
      session,
      section,
      semester
    }).populate('student', 'name rollNo')  // Populate basic student info
      .populate('course', 'courseName courseId'); // Optional

    return res.status(200).json({ marks });

  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getMarks
};