const Marks = require("../models/Marks");
const Student = require("../models/Student");
const Course = require("../models/Course");

exports.getStudentsForCourse = async (req, res) => {
  try {
    const { session, semester, section, courseName } = req.body;

    // Find course by name (case-insensitive) and get its ID
    const course = await Course.findOne({
      courseName: new RegExp("^" + courseName + "$", "i"),
    });
    if (!course) return res.status(404).json({ error: "Course not found" });

    const courseId = course._id; // Convert course name to course ID

    // Find students enrolled in the course using course ID
    const students = await Student.find({
      courses: courseId,
      session,
      semester,
      section,
    }).select("name rollNo");

    if (!students.length) {
      return res
        .status(404)
        .json({ error: "No students found for this course" });
    }

    res.json({ students });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.fillMarks = async (req, res) => {
  try {
    const { session, semester, section, courseId, marksData } = req.body;

    for (const entry of marksData) {
      const student = await Student.findOne({ rollNo: entry.rollNo });
      if (!student) continue;

      // find existing record for this student + course
      let marksDoc = await Marks.findOne({
        student: student._id,
        course: courseId,
        session,
        semester,
        section,
      });

      if (!marksDoc) {
        marksDoc = new Marks({
          student: student._id,
          course: courseId,
          session,
          semester,
          section,
          exams: [],
        });
      }

      for (const exam of entry.exams) {
        // check if this exam already exists
        let existingExam = marksDoc.exams.find((e) => e.examType === exam.examType);

        if (!existingExam) {
          // create subdocument using schema
          existingExam = marksDoc.exams.create({
            examType: exam.examType,
            totalMarks: exam.totalMarks || null,
            coMarks: [],
          });
          marksDoc.exams.push(existingExam);
        } else {
          // update totalMarks if provided
          if (exam.totalMarks) {
            existingExam.totalMarks = exam.totalMarks;
          }
        }

        for (const co of exam.coMarks) {
          let existingCo = existingExam.coMarks.find(
            (c) => c.coNumber === co.coNumber
          );

          if (existingCo) {
            // update existing CO
            if (co.marksObtained === "NA") {
              existingCo.marksObtained = null;
              existingCo.isApplicable = false;
            } else if (co.marksObtained === "A") {
              existingCo.marksObtained = null;
              existingCo.isApplicable = true;
            } else {
              existingCo.marksObtained = Number(co.marksObtained);
              existingCo.isApplicable = true;
            }
            existingCo.minMarks = Number(co.minMarks);
          } else {
            // add new CO marks as subdoc
            existingExam.coMarks.push(
              existingExam.coMarks.create({
                coNumber: co.coNumber,
                marksObtained:
                  co.marksObtained === "NA"
                    ? null
                    : co.marksObtained === "A"
                    ? null
                    : Number(co.marksObtained),
                isApplicable: co.marksObtained === "NA" ? false : true,
                minMarks: Number(co.minMarks),
              })
            );
          }
        }
      }

      // update universityMark if provided
      if (entry.universityMark !== undefined) {
        marksDoc.universityMark = entry.universityMark;
      }

      await marksDoc.save();
    }

    res.json({ message: "Marks filled successfully" });
  } catch (err) {
    console.error("Error filling marks:", err);
    res.status(500).json({ error: "Server error" });
  }
};


