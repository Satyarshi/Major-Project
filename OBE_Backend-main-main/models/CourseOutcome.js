const mongoose = require('mongoose');

const courseOutcomeSchema = new mongoose.Schema({

  // Course details
  courseName: { type: String, required: true },
  courseCode: { type: String, required: true },

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

module.exports = mongoose.model('CourseOutcome', courseOutcomeSchema);
