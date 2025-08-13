const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

// Utility: Create JWT token
const generateToken = (id, type) => {
  const payload = {
    user: {
      id,
      type
    }
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Register Faculty (minimal info)
const registerFaculty = async (req, res) => {
  try {
    console.log("Faculty registration attempt:", req.body);
    const { name, facultyId, email, password , session } = req.body;

    // Validate required fields
    if (!name || !facultyId || !email || !password || !session) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if faculty already exists
    const existing = await Faculty.findOne({ $or: [{ email }, { facultyId }] });
    if (existing) {
      return res.status(400).json({ message: 'Faculty already exists with this email or faculty ID' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new faculty (minimal info)
    const faculty = await Faculty.create({
      name,
      facultyId,
      email,
      password: hashedPassword,
      session: req.body.session, // Optional session field
    });

    const token = generateToken(faculty.id, 'faculty');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: faculty.id,
        name,
        email,
        facultyId,
        role: 'faculty',
        session: req.body.session // Include session in response
      }
    });
  } catch (err) {
    console.error('Faculty registration error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


// Register Student
const registerStudent = async (req, res) => {
  try {
    console.log("Student registration attempt:", req.body);
    
    const { name, rollNo, class: className, section, email, password } = req.body;

    // Validate required fields
    if (!name || !rollNo || !className || !section || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if student already exists
    const existing = await Student.findOne({ $or: [{ email }, { rollNo }] });
    if (existing) {
      return res.status(400).json({ message: 'Student already exists with this email or roll number' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new student
    const student = await Student.create({
      name,
      rollNo,
      class: className,
      section,
      email,
      password: hashedPassword
    });

    const token = generateToken(student.id, 'student');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: student.id,
        name,
        email,
        rollNo,
        class: className,
        section,
        role: 'student'
      }
    });
  } catch (err) {
    console.error('Student registration error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login (role-based using email and password)
const login = async (req, res) => {
  try {
    console.log("Login attempt:", req.body);
    
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    // Validate role
    if (role !== 'faculty' && role !== 'student') {
      return res.status(400).json({ message: 'Role must be either "faculty" or "student"' });
    }

    let user;
    let userType;

    // Find user based on role
    if (role === 'faculty') {
      user = await Faculty.findOne({ email });
      userType = 'faculty';
    } else {
      user = await Student.findOne({ email });
      userType = 'student';
    }

    // Check if user exists
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id, userType);

    // Prepare user data based on role
    let userData;
    if (userType === 'faculty') {
      userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        facultyId: user.facultyId,
        role: 'faculty'
      };
    } else {
      userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        class: user.class,
        section: user.section,
        role: 'student'
      };
    }

    res.json({
      success: true,
      token,
      user: userData
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  registerFaculty,
  registerStudent,
  login
};
