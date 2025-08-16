const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // assuming you have DB connection setup
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Add your frontend URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Routes
app.use('/api/v1', require('./Routes/auth'));
app.use('/api/v1', require('./Routes/courses'));
app.use('/api/v1', require('./Routes/addStudent'));
app.use('/api/v1', require('./Routes/facultyprofile'));
app.use('/api/v1', require('./Routes/marks'));

const PORT =  5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
