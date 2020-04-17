const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  id: String,
  username: {
    type: String,
    required: true,
  },
  mail: String,
  password: String,
  image: String,
  role: { type: String, default: 'user' },
  active: { type: String, default: false },
  meta: {
    votes: Number,
    favs: Number,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
