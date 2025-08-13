// middleware/auth.js
const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized: No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // { id, type }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

exports.isFaculty = (req, res, next) => {
  if (req.user?.type !== 'faculty') {
    return res.status(403).json({ error: 'Access denied: Faculty only' });
  }
  next();
};

// Additional middleware to check if user is a student
exports.isStudent = (req, res, next) => {
  if (req.user?.type !== 'student') {
    return res.status(403).json({ error: 'Access denied: Student only' });
  }
  next();
};

