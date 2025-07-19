const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const User = require('../models/User');
const { sendBookingConfirmation } = require('../services/emailService');
const mongoose = require('mongoose');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    console.log('Creating booking with data:', req.body);
    console.log('User from request:', req.user);
    
    try {
        const { rideId, seats, message } = req.body;
        const userId = req.user.id;

        console.log('Extracted data:', { rideId, seats, message, userId });

        // Validate required fields
        if (!rideId || !seats) {
            console.log('Missing required fields');
            return res.status(400).json({ 
                success: false,
                msg: 'Please provide all required fields' 
            });
        }

        // Check if rideId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(rideId)) {
            console.log('Invalid ride ID format:', rideId);
            return res.status(400).json({
                success: false,
                msg: 'Invalid ride ID format'
            });
        }

        // Find the ride and user
        console.log('Finding ride with ID:', rideId);
        const ride = await Ride.findById(rideId);
        console.log('Found ride:', ride ? 'Yes' : 'No');
        
        console.log('Finding user with ID:', userId);
        const user = await User.findById(userId);
        console.log('Found user:', user ? 'Yes' : 'No');

        if (!ride) {
            console.log('Ride not found');
            return res.status(404).json({ 
                success: false,
                msg: 'Ride not found' 
            });
        }

        if (!user) {
            console.log('User not found');
            return res.status(404).json({ 
                success: false,
                msg: 'User not found' 
            });
        }

        // Check available seats
        const seatsRequested = parseInt(seats);
        console.log('Seats requested:', seatsRequested, 'Available:', ride.passengerCount);
        if (ride.passengerCount < seatsRequested) {
            console.log('Not enough seats available');
            return res.status(400).json({ 
                success: false,
                msg: `Not enough seats available. Only ${ride.passengerCount} seat(s) left.` 
            });
        }

        // Check if user is trying to book their own ride
        if (ride.user.toString() === userId) {
            console.log('User trying to book their own ride');
            return res.status(400).json({
                success: false,
                msg: 'You cannot book your own ride'
            });
        }

        // Check if user has already booked this ride
        const existingBooking = await Booking.findOne({
            ride: rideId,
            user: userId,
            status: { $ne: 'cancelled' }
        });

        if (existingBooking) {
            console.log('User has already booked this ride:', existingBooking._id);
            return res.status(400).json({
                success: false,
                msg: 'You have already booked this ride. Check your bookings.'
            });
        }

        // Create booking
        console.log('Creating booking object');
        const booking = new Booking({
            ride: rideId,
            user: userId,
            seats: seatsRequested,
            message: message || '',
            status: 'confirmed',
            totalPrice: ride.pricePerSeat * seatsRequested
        });

        // Update available seats
        console.log('Updating ride passenger count');
        ride.passengerCount -= seatsRequested;
        
        // Save both booking and ride updates
        console.log('Saving booking');
        await booking.save();
        console.log('Saving ride');
        await ride.save();

        // Send confirmation email
        try {
            console.log('Sending confirmation email to:', user.email);
            await sendBookingConfirmation({
                userEmail: user.email,
                rideDetails: {
                    pickupPoint: ride.pickupPoint,
                    dropoffPoint: ride.dropoffPoint,
                    date: ride.date,
                    time: ride.time,
                    pricePerSeat: ride.pricePerSeat,
                    passengerCount: ride.passengerCount
                },
                bookingId: booking._id,
                seats: seatsRequested
            });
            console.log('Email sent successfully');
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the request if email fails
        }

        console.log('Booking created successfully:', booking._id);
        res.status(201).json({
            success: true,
            data: booking
        });

    } catch (err) {
        console.error('Booking error:', err);
        console.error('Error stack:', err.stack);
        
        // Handle specific error cases
        if (err.code === 11000) {
            return res.status(400).json({ 
                success: false,
                msg: 'You have already booked this ride. Check your bookings.' 
            });
        }
        
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                msg: 'Validation error',
                errors: messages
            });
        }
        
        // Handle insufficient seats error
        if (err.message && err.message.includes('seats')) {
            return res.status(400).json({
                success: false,
                msg: err.message
            });
        }
        
        console.error('Server error during booking:', err);
        res.status(500).json({ 
            success: false,
            msg: 'Failed to create booking. Please try again.',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
    try {
        console.log('Getting bookings for user:', req.user.id);
        const bookings = await Booking.find({ user: req.user.id })
            .populate('ride', 'pickupPoint dropoffPoint date time pricePerSeat')
            .sort({ createdAt: -1 });
        
        console.log('Found bookings:', bookings.length);
        res.json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        console.error('Error getting bookings:', err);
        res.status(500).json({ 
            success: false,
            msg: 'Server error' 
        });
    }
};
