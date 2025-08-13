const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  session: { type: String, required: true },
  name: String,
  facultyId: { type: String, unique: true },
  email: { type: String, unique: true },
  department: String,
  password: String, // Hashed
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
});

module.exports = mongoose.model('Faculty', facultySchema); 