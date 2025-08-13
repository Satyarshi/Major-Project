const Student = require('../models/Student');
const Course = require('../models/Course');

exports.addStudentsToCourse = async (req, res) => {
  try {
    const { session, semester,  section, courseName, students } = req.body;

    // Find course by name (case-insensitive)
    const course = await Course.findOne({ courseName: new RegExp('^' + courseName + '$', 'i') });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const courseId = course._id;

    const createdStudents = [];
    for (const s of students) {
      let student = await Student.findOne({ rollNo: s.rollNo });
      if (!student) {
        student = new Student({
          session,
          name: s.name,
          rollNo: s.rollNo,
          section: section ,
          courses: [courseId],
          semester: semester,
          // Don't set email field at all - let it be undefined
        });
      } else {
        if (!student.courses.includes(courseId)) {
          student.courses.push(courseId);
        }
      }
      await student.save();
      createdStudents.push(student);
    }

    res.status(201).json({
      message: 'Students added/updated for the course',
      students: createdStudents
    });
  } catch (err) {
    console.error('Error adding students:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    // Check if req.user exists
    if (!req.user || !req.user.id || !req.user.type) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id, type } = req.user;

    const Model = type === 'faculty' ? Faculty : Student;
    const user = await Model.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Get current user error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
