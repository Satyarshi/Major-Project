const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({

  // Basic course details
  courseName: { type: String, required: true },
  courseId: { type: String, required: true },  // from Course
  courseCode: { type: String, required: true }, // from CourseOutcome
  session: { type: String, required: true },
  semester: { type: String, required: true },
  department: { type: String, required: true },
  class: { type: String, required: true },
  sections: [{ type: String, required: true }],  // Multiple sections supported

  // Faculty reference
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },

  // Marks
  theoryTAMarks: { type: Number, required: true },
  universityExamMarks: { type: Number, required: true },

  // Target levels
  targetLevels: [
    {
      level: { type: Number, required: true },
      targetValue: { type: Number, required: true }
    }
  ],

  // Course outcomes
  outcomes: [
    {
      coNumber: { type: String, required: true }, // e.g., CO1
      description: { type: String, required: true },
      minMarks: { type: Number, required: true }
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
