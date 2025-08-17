// const mongoose = require('mongoose');

// const marksSchema = new mongoose.Schema({
//   student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
//   course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
//   session: { type: String, required: true },
//   semester: { type: String, required: true },
//   section: { type: String, required: true },

//   // All marks per CO, for each test type
//   marks: [
//     {
//       coNumber: { type: String, required: true },
//       preCT: { type: Number, default: null },
//       ct1: { type: Number, default: null },
//       pue: { type: Number, default: null },
//       addlCT: { type: Number, default: null },
//       isAbsent: { type: Boolean, default: false }
//     }
//   ],

//   assignmentTA: { type: Number, default: null },
//   universityMark: { type: Number, default: null }
// }, { timestamps: true });

// module.exports = mongoose.model('Marks', marksSchema);
const mongoose = require('mongoose');

const coMarksSchema = new mongoose.Schema({
  coNumber: { type: String, required: true }, // e.g., "CO1"
  marksObtained: { type: String, default: null }, // null or actual marks
  isApplicable: { type: Boolean, default: false }, // false if not applicable
  minMarks: { type: Number, required: true }, 
}, { _id: false });

const examSchema = new mongoose.Schema({
  examType: { type: String, required: true }, // e.g., "preCT", "CT1", "CT2", "PUE", "Assignment"
  totalMarks: { type: Number, required: true }, 
  coMarks: [coMarksSchema], // Marks for each CO in this exam
}, { _id: false });

const marksSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  session: { type: String, required: true }, 
  semester: { type: String, required: true },
  section: { type: String, required: true }, 

  exams: [examSchema], // List of all exams with CO-wise marks

  universityMark: { type: Number, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Marks', marksSchema);
