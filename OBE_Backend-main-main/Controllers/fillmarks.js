const Marks = require('../models/Marks');
const Student = require('../models/Student');
const Course = require('../models/Course');

exports.getStudentsForCourse = async (req, res) => {
  try {
    const { session, semester, section, courseName } = req.body;

    // Find course by name (case-insensitive) and get its ID
    const course = await Course.findOne({ courseName: new RegExp('^' + courseName + '$', 'i') });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const courseId = course._id; // Convert course name to course ID

    // Find students enrolled in the course using course ID
    const students = await Student.find({ courses: courseId, session, semester, section })
      .select('name rollNo');

    if (!students.length) {
      return res.status(404).json({ error: 'No students found for this course' });
    }

    res.json({ students });
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Server error' });
  }
};



exports.fillMarks = async (req, res) => {
  try {
    const { session, semester, section, courseName, marksData } = req.body;

    // Find course by name (case-insensitive)
    const course = await Course.findOne({ courseName: new RegExp('^' + courseName + '$', 'i') });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    for (const entry of marksData) {
      const student = await Student.findOne({ rollNo: entry.rollNo });
      if (!student) continue;

      // Prepare marks array, handling "A" and "NA"
      const marksArr = [];
      for (const m of entry.marks) {
        if ([m.preCT, m.ct1, m.pue, m.addlCT].every(val => val === "NA" || val === undefined)) continue;

        marksArr.push({
          coNumber: m.coNumber,
          preCT: m.preCT === "A" ? null : m.preCT === "NA" ? undefined : m.preCT,
          ct1: m.ct1 === "A" ? null : m.ct1 === "NA" ? undefined : m.ct1,
          pue: m.pue === "A" ? null : m.pue === "NA" ? undefined : m.pue,
          addlCT: m.addlCT === "A" ? null : m.addlCT === "NA" ? undefined : m.addlCT,
          isAbsent: [m.preCT, m.ct1, m.pue, m.addlCT].includes("A")
        });
      }

      await Marks.findOneAndUpdate(
        {
          student: student._id,
          course: course._id,
          session,
          semester,
          section
        },
        {
          student: student._id,
          course: course._id,
          session,
          semester,
          section,
          marks: marksArr,
          assignmentTA: entry.assignmentTA,
          universityMark: entry.universityMark
        },
        { upsert: true, new: true }
      );
    }

    res.json({ message: 'Marks filled successfully' });
  } catch (err) {
    console.error('Error filling marks:', err);
    res.status(500).json({ error: 'Server error' });
  }
};