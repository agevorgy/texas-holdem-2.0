const mongoose = require('mongoose');
const shortid = require('shortid');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  card: {
    type: String,
    enum: [null, '1', '2', '3', '5', '8', '13', '?'],
  },
  role: {
    type: String,
    enum: ['Participant', 'Observer'],
  },
});

const sessionSchema = new mongoose.Schema({
  id: {
    type: String,
    default: shortid.generate,
  },
  state: {
    type: Boolean,
  },
  users: [userSchema],
});

// Export model
module.exports = mongoose.model('Session', sessionSchema);
module.exports = mongoose.model('User', userSchema);
