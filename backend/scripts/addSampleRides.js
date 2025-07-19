const mongoose = require('mongoose');
require('dotenv').config();
const Ride = require('../models/Ride');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ridelink', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

// Sample rides data
const sampleRides = [
  {
    pickupPoint: {
      name: 'Gandhipuram Bus Stand',
      city: 'Coimbatore',
      address: 'Gandhipuram, Coimbatore'
    },
    dropoffPoint: {
      name: 'Central Railway Station',
      city: 'Chennai',
      address: 'Chennai Central, Chennai'
    },
    date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    time: '08:00',
    passengerCount: 3,
    pricePerSeat: 450,
    selectedRoute: {
      distance: '436.3 km',
      time: '8 hours 10 min',
      toll: true
    },
    status: 'active',
    user: '6462e95e1f0d8b9a0c9b4567' // Dummy user ID
  },
  {
    pickupPoint: {
      name: 'Infopark',
      city: 'Coimbatore',
      address: 'Infopark Campus, Coimbatore'
    },
    dropoffPoint: {
      name: 'Electronic City',
      city: 'Bangalore',
      address: 'Electronic City Phase 1, Bangalore'
    },
    date: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    time: '07:30',
    passengerCount: 2,
    pricePerSeat: 350,
    selectedRoute: {
      distance: '195.5 km',
      time: '4 hours 15 min',
      toll: false
    },
    status: 'active',
    user: '6462e95e1f0d8b9a0c9b4567' // Dummy user ID
  },
  {
    pickupPoint: {
      name: 'Coimbatore Airport',
      city: 'Coimbatore',
      address: 'Coimbatore International Airport'
    },
    dropoffPoint: {
      name: 'Mysore Palace',
      city: 'Mysore',
      address: 'Mysore Palace, Mysore'
    },
    date: new Date(), // Today
    time: '14:00',
    passengerCount: 4,
    pricePerSeat: 300,
    selectedRoute: {
      distance: '210.8 km',
      time: '4 hours 45 min',
      toll: true
    },
    status: 'active',
    user: '6462e95e1f0d8b9a0c9b4567' // Dummy user ID
  }
];

// Function to add sample rides
const addSampleRides = async () => {
  try {
    // First, check if there are already rides in the database
    const existingRides = await Ride.find();
    
    if (existingRides.length > 0) {
      console.log(`Found ${existingRides.length} existing rides. Skipping sample data insertion.`);
      process.exit(0);
    }
    
    // Insert sample rides
    const result = await Ride.insertMany(sampleRides);
    console.log(`Successfully added ${result.length} sample rides to the database!`);
    
    // Disconnect from MongoDB
    mongoose.disconnect();
  } catch (error) {
    console.error('Error adding sample rides:', error);
    process.exit(1);
  }
};

// Run the function
addSampleRides();
