const express = require('express');
const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const pdfParse = require('pdf-parse');
const path = require('path');
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('cors')());

mongoose.connect('mongodb://localhost:27017/resumeExtractor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Serve static files if needed
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', authRoutes);
app.use('/', resumeRoutes);

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.redirect('/login');

  const token = authHeader.split(' ')[1];
  if (!token) return res.redirect('/login');

  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) return res.redirect('/login');
    req.userId = decoded.userId;
    next();
  });
};

// Main page (after login)
app.get('/dashboard', authMiddleware, async (req, res) => {
  // Fetch latest resume
  const Resume = require('./models/Resume');
  const resume = await Resume.findOne({ userId: req.userId }).sort({ _id: -1 });
  res.render('index', { resume });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));