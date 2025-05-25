const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const jwt = require('jsonwebtoken');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });


// Upload resume and extract info
router.post('/upload',upload.single('file'), async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).send('Unauthorized');

  const decoded = jwt.verify(token, 'your_jwt_secret');
  const userId = decoded.userId;

  const file = req.file;
  if (!file) return res.status(400).send('No file uploaded');

  let text = '';
  if (file.mimetype === 'application/pdf') {
    const data = await pdfParse(file.buffer);
    text = data.text;
  } else if (file.mimetype.startsWith('text/')) {
    text = file.buffer.toString('utf-8');
  } else {
    return res.status(400).send('Unsupported file type');
  }

  // Simple regex extraction
  const nameMatch = text.match(/Name[:\s]+([A-Za-z\s]+)/i);
  const ageMatch = text.match(/Age[:\s]+(\d+)/i);
  const skillsMatch = text.match(/Skills[:\s]+([\w\s,]+)/i);

  const name = nameMatch ? nameMatch[1].trim() : 'Not Found';
  const age = ageMatch ? ageMatch[1] : 'Not Found';
  const skills = skillsMatch ? skillsMatch[1].split(/[,]+/).map(s => s.trim()) : [];

  // Save to DB
  const resume = new Resume({ userId, name, age, skills });
  await resume.save();

  res.json({ name, age, skills });
});

// Get latest resume
router.get('/resume', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).send('Unauthorized');

  const decoded = jwt.verify(token, 'your_jwt_secret');
  const userId = decoded.userId;

  const resume = await Resume.findOne({ userId }).sort({ _id: -1 });
  if (!resume) return res.status(404).send('No resume data');

  res.json(resume);
});

module.exports = router;