const mongoose = require('mongoose');

const { Schema } = mongoose;

const defaultDate = { type: Date, default: Date.now, required: true };

const userSchema = new Schema({
  id: String,
  username: {
    type: String,
    required: true,
  },
  mail: String,
  password: String,
  image: String,
  meta: {
    votes: Number,
    favs: Number,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
