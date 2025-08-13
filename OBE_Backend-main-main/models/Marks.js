const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  session: { type: String, required: true },
  semester: { type: String, required: true },
  section: { type: String, required: true },

  // All marks per CO, for each test type
  marks: [
    {
      coNumber: { type: String, required: true },
      preCT: { type: Number, default: null },
      ct1: { type: Number, default: null },
      pue: { type: Number, default: null },
      addlCT: { type: Number, default: null },
      isAbsent: { type: Boolean, default: false }
    }
  ],

  assignmentTA: { type: Number, default: null },
  universityMark: { type: Number, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Marks', marksSchema);