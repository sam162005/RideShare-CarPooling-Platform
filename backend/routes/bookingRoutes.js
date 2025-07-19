const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createBooking, getMyBookings } = require('../controllers/bookingController');

// @route   POST api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', auth, createBooking);

// @route   GET api/bookings/my-bookings
// @desc    Get user's bookings
// @access  Private
router.get('/my-bookings', auth, getMyBookings);

module.exports = router;
