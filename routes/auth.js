const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Signup
router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) return res.render('signup', { error: 'Username exists' });
  const hashed = await bcrypt.hash(password, 10);
  await new User({ username, password: hashed }).save();
  res.redirect('/login');
});

// Login
router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.render('login', { error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.render('login', { error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');
  // Store token in session or cookie, here for simplicity we redirect with token in query
  res.redirect(`/dashboard?token=${token}`);
});

module.exports = router;