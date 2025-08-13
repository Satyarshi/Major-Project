const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const updateFacultyDetails = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const updateFields = req.body;

    // Remove fields that should not be updated here
    delete updateFields.password;
    delete updateFields.email;
    delete updateFields.facultyId;

    const faculty = await Faculty.findByIdAndUpdate(
      facultyId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json({
      success: true,
      message: 'Faculty details updated',
      faculty
    });
  } catch (err) {
    console.error('Update faculty details error:', err.message);
    res.status(500).json({ message: 'Server error' });
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
    const user = await Model.findById(id).select('-password').populate('courses').lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Get current user error:', err.message);
    res.status(500).json({ message: 'Server error' });
  } 
};

module.exports = {
    updateFacultyDetails,
    getCurrentUser
};