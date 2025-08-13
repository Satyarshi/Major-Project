const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  session: { type: String, required: true },
  name: String,
  rollNo: { type: String, unique: true },
  section: String,
  semester: String, // Add semester field
  password: String, // Hashed password for authentication
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
});

module.exports = mongoose.model('Student', studentSchema);