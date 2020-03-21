const mongoose = require('mongoose');

const { Schema } = mongoose;

const requiredNumber = {
  type: Number,
  required: true,
};
const defaultDate = { type: Date, default: Date.now, required: true };

const eventSchema = new Schema({
  id: String,
  name: {
    type: String,
    required: true,
  },
  rate: Number,
  description: String,
  comments: Array,
  image: String,
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0,
  },
  latitude: requiredNumber,
  longitude: requiredNumber,
  created_at: defaultDate,
  updated_at: defaultDate,
  date: defaultDate,
  owner: String,
  max_members: {
    type: Number,
    min: 1,
    max: 20,
    default: 1,
  },
  members: Array,
  hidden: Boolean,
  meta: {
    votes: Number,
    favs: Number,
  },
}, {
  timestamps: true,
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
