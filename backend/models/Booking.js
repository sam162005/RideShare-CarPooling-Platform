const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ride',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  seats: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  bookedAt: {
    type: Date,
    default: Date.now
  },
  contactInfo: {
    name: String,
    phone: String,
    email: String
  },
  message: {
    type: String,
    default: ''
  },
  isRead: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('booking', BookingSchema);
