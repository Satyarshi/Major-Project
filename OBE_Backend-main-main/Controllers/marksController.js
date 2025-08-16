const Marks = require('../models/Marks');
const Student = require('../models/Student');
const Course = require('../models/Course');

const getMarks = async (req, res) => {
  try {
    const { session, section, courseId, semester } = req.query;

    if (!session || !section || !courseId || !semester) {
      return res.status(400).json({ error: 'session, section, courseId, and semester are required.' });
    }

    const sectionArray = section.split(',').map(s => s.trim());

    // Step 1: Ensure course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Step 2: Find students in given section, semester, and course
    const students = await Student.find({
      section,
      semester,
      courses: courseId
    });

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found for given criteria' });
    }

    const studentIds = students.map(s => s._id);

    // Step 3: Fetch marks for those students
    const marks = await Marks.find({
      student: { $in: studentIds },
      course: courseId,
      session,
      section: { $in: sectionArray },
      semester
    })
      .populate('student', 'name rollNo')
      .populate('course', 'courseName courseId');

    // Step 4: Directly return marks without merging minMarks
    return res.status(200).json({ marks });

  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getMarks
};
