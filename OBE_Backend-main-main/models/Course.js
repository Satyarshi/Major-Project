const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  courseId: { type: String, required: true },
  session: { type: String, required: true },
  semester: { type: String, required: true },
  department: { type: String, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  class: { type: String, required: true },
  sections: [{ type: String, required: true }],  // Multiple sections supported,
  outcomes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CourseOutcome' }]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
