// controllers/userController.js
const User = require('../models/User');

// Get current user profile
const getMe = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get detailed user profile
const getUserProfile = async (req, res) => {
  try {
    // Use lean() for better performance when we just need the data
    const user = await User.findById(req.user._id).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Add createdAt if it doesn't exist (for older accounts)
    if (!user.createdAt) {
      user.createdAt = user._id.getTimestamp();
    }
    
    // Add default rating and ride count for UI display if not present
    if (!user.rating) {
      user.rating = 5.0;
    }
    
    if (!user.rideCount) {
      user.rideCount = 0;
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    console.log('Updating user profile with data:', req.body);
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('User not found with ID:', req.user._id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // List of allowed fields to update
    const allowedFields = ['name', 'email', 'phone', 'bio', 'preferences', 'vehicle'];
    
    // Track which fields were updated
    const updatedFields = [];
    
    // Update only allowed fields that are sent
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        user[key] = req.body[key];
        updatedFields.push(key);
      }
    });
    
    console.log('Updated fields:', updatedFields);
    
    // Set updatedAt timestamp
    user.updatedAt = new Date();
    
    const updatedUser = await user.save();
    console.log('User saved successfully');
    
    // Return the complete updated user object
    const fullUser = await User.findById(req.user._id).lean();
    
    // Add default rating and ride count for UI display if not present
    if (!fullUser.rating) {
      fullUser.rating = 5.0;
    }
    
    if (!fullUser.rideCount) {
      fullUser.rideCount = 0;
    }
    
    console.log('Returning updated user data');
    res.status(200).json(fullUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: error.message });
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    console.log('Processing profile picture upload');
    if (!req.file) {
      console.log('No file found in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log('File uploaded:', req.file.filename);
    
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('User not found with ID:', req.user._id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create URL for the uploaded file
    const profilePicture = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, '/')}`;  // Fix Windows backslashes
    console.log('Profile picture URL:', profilePicture);
    user.profilePicture = profilePicture;
    
    // Set updatedAt timestamp
    user.updatedAt = new Date();
    
    await user.save();
    console.log('User profile updated with new profile picture');
    
    // Return the complete updated user object
    const fullUser = await User.findById(req.user._id).lean();
    
    // Add default rating and ride count for UI display if not present
    if (!fullUser.rating) {
      fullUser.rating = 5.0;
    }
    
    if (!fullUser.rideCount) {
      fullUser.rideCount = 0;
    }
    
    console.log('Returning complete user data with updated profile picture');
    res.status(200).json(fullUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMe,
  updateUserProfile,
  uploadProfilePicture,
  getUserProfile
};