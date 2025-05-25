const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  age: String,
  skills: [String],
});

module.exports = mongoose.model('Resume', resumeSchema);