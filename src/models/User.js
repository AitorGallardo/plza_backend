const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  id: String,
  username: {
    type: String,
    required: true,
    unique: true,
    dropDups: true,
  },
  mail: String,
  password: String,
  image: String,
  tag: String,
  role: { type: String, default: 'user' },
  active: { type: Boolean, default: false },
  following: [{ type: String }],
  followers: [{ type: String }],
  events: [{ type: String }],
  images: [{ type: String }],
  description: { type: String, maxlength: 80, default: '' },
  instagram: { type: String, default: '' },
  meta: {
    votes: Number,
    favs: Number,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
