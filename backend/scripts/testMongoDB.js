const mongoose = require('mongoose');
require('dotenv').config();
const Ride = require('../models/Ride');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ridelink', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected for testing'))
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

// Test ride data
const testRide = {
  pickupPoint: {
    name: 'Test Pickup Point',
    city: 'Coimbatore',
    address: 'Test Address, Coimbatore'
  },
  dropoffPoint: {
    name: 'Test Dropoff Point',
    city: 'Chennai',
    address: 'Test Address, Chennai'
  },
  date: new Date(),
  time: '10:00',
  passengerCount: 2,
  pricePerSeat: 300,
  selectedRoute: {
    distance: '400 km',
    time: '6 hours',
    toll: true
  },
  status: 'active',
  user: '6462e95e1f0d8b9a0c9b4567' // Dummy user ID
};

// Function to test MongoDB connection and insertion
const testMongoDBInsertion = async () => {
  try {
    console.log('Creating test ride document...');
    const newRide = new Ride(testRide);
    
    console.log('Attempting to save to MongoDB...');
    const savedRide = await newRide.save();
    
    console.log('Test ride saved successfully!');
    console.log('Saved ride data:', JSON.stringify(savedRide, null, 2));
    
    // Check if we can retrieve the ride
    console.log('Attempting to retrieve all rides...');
    const allRides = await Ride.find();
    console.log(`Found ${allRides.length} rides in the database`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during MongoDB test:', error);
    process.exit(1);
  }
};

// Run the test
testMongoDBInsertion();
