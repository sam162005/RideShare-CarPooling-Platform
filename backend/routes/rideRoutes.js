const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Ride = require('../models/Ride');

// @route   POST api/rides
// @desc    Create a new ride
// @access  Public (temporarily)
router.post('/', async (req, res) => {
  try {
    console.log('Received ride data:', JSON.stringify(req.body, null, 2));
    
    // Extract all fields from the request body
    const {
      pickupPoint,
      dropoffPoint,
      date,
      time,
      passengerCount,
      pricePerSeat,
      selectedRoute,
      user, // Use the user ID from the request body for now
      publishedAt,
      status
    } = req.body;

    // Validate required fields with detailed logging
    if (!pickupPoint || !dropoffPoint || !date || !time) {
      const missingFields = [];
      if (!pickupPoint) missingFields.push('pickupPoint');
      if (!dropoffPoint) missingFields.push('dropoffPoint');
      if (!date) missingFields.push('date');
      if (!time) missingFields.push('time');
      
      console.error(`Missing required fields: ${missingFields.join(', ')}`);
      console.error('Request body:', JSON.stringify(req.body, null, 2));
      return res.status(400).json({ msg: `Please provide all required fields: ${missingFields.join(', ')}` });
    }

    // Create new ride document with proper structure
    const newRide = new Ride({
      pickupPoint: {
        name: pickupPoint.name || 'Unknown',
        city: pickupPoint.city || 'Unknown',
        address: pickupPoint.address || 'Unknown'
      },
      dropoffPoint: {
        name: dropoffPoint.name || 'Unknown',
        city: dropoffPoint.city || 'Unknown',
        address: dropoffPoint.address || 'Unknown'
      },
      date: new Date(date),
      time: time,
      passengerCount: parseInt(passengerCount) || 1,
      pricePerSeat: parseInt(pricePerSeat) || 0,
      selectedRoute: selectedRoute || { distance: '0 km', time: '0 min', toll: false },
      user: user || '6462e95e1f0d8b9a0c9b4567', // Fallback to dummy user ID
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      status: status || 'active'
    });

    console.log('Attempting to save ride to MongoDB:', JSON.stringify(newRide, null, 2));
    
    try {
      const ride = await newRide.save();
      console.log('Ride saved successfully! MongoDB ID:', ride._id);
      return res.json(ride);
    } catch (saveError) {
      console.error('MongoDB save error:', saveError);
      return res.status(500).json({ error: `MongoDB save error: ${saveError.message}` });
    }
  } catch (err) {
    console.error('Error processing ride data:', err);
    return res.status(500).json({ error: err.message });
  }
});

// @route   GET api/rides
// @desc    Get all rides
// @access  Public
router.get('/', async (req, res) => {
  try {
    const rides = await Ride.find().sort({ publishedAt: -1 });
    res.json(rides);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/rides/user/:userId
// @desc    Get all rides for a specific user
// @access  Public (should be private in production)
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`Fetching rides for user: ${userId}`);
    
    const rides = await Ride.find({ user: userId }).sort({ publishedAt: -1 });
    console.log(`Found ${rides.length} rides for user ${userId}`);
    
    res.json(rides);
  } catch (err) {
    console.error(`Error fetching user rides: ${err.message}`);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/rides/search
// @desc    Search rides by criteria
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { pickupCity, dropoffCity, date, passengerCount, maxPrice } = req.query;
    
    let query = {};
    
    if (pickupCity) {
      query['pickupPoint.city'] = { $regex: pickupCity, $options: 'i' };
    }
    
    if (dropoffCity) {
      query['dropoffPoint.city'] = { $regex: dropoffCity, $options: 'i' };
    }
    
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = {
        $gte: searchDate,
        $lt: nextDay
      };
    }
    
    if (passengerCount) {
      query.passengerCount = { $gte: parseInt(passengerCount) };
    }
    
    if (maxPrice) {
      query.pricePerSeat = { $lte: parseInt(maxPrice) };
    }
    
    const rides = await Ride.find(query).sort({ publishedAt: -1 });
    res.json(rides);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/rides/:id
// @desc    Get ride by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ msg: 'Ride not found' });
    }
    
    res.json(ride);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ride not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/rides/:id
// @desc    Delete a ride
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ msg: 'Ride not found' });
    }
    
    // Check user
    if (ride.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await ride.deleteOne();
    
    res.json({ msg: 'Ride removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ride not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/rides/:id
// @desc    Update a ride
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ msg: 'Ride not found' });
    }
    
    // Check user
    if (ride.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    ride = await Ride.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.json(ride);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ride not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
