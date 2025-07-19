const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String, // hashed
  phone: String,
  bio: String,
  preferences: String,
  vehicle: String,
  profilePicture: String, // URL or filename
  rating: {
    type: Number,
    default: 5.0
  },
  rideCount: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  govtIdVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Virtual for user's membership duration
UserSchema.virtual('memberSince').get(function() {
  return this.createdAt ? this.createdAt.getFullYear() : new Date().getFullYear();
});

// Ensure virtuals are included when converting to JSON
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', UserSchema);
