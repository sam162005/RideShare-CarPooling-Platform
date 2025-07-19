// api/user.js
import axios from 'axios';

// In browser environments, we need to use a direct URL
// For production, you would configure this with environment variables in a .env file
const API_URL = 'http://localhost:5000/api/users';

// Helper function to get the token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  // Return the token even if it's null or undefined
  // The caller will handle the case when there's no token
  return token;
};

// Helper function to create authenticated request config
const getAuthConfig = (contentType = 'application/json') => {
  const token = getAuthToken();
  
  // If no token is found, return config without Authorization header
  if (!token) {
    console.warn('No authentication token found, proceeding without Authorization header');
    return {
      headers: {
        'Content-Type': contentType
      }
    };
  }
  
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': contentType
    }
  };
};

// Get user profile with retry mechanism
export const getUserProfile = async (retryCount = 2) => {
  try {
    const config = getAuthConfig();
    const storedUserId = localStorage.getItem('userId');
    
    console.log('Getting user profile with token:', config.headers.Authorization);
    const response = await axios.get(`${API_URL}/profile`, config);
    
    // Verify that the returned user ID matches the stored user ID
    if (response.data && response.data._id) {
      // If we have a stored user ID, verify it matches
      if (storedUserId && storedUserId !== response.data._id) {
        console.error('User ID mismatch! Expected:', storedUserId, 'Got:', response.data._id);
        // Clear all storage and force re-login
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
        throw new Error('Session invalid. Please login again.');
      }
      
      // Store the user ID if not already stored
      if (!storedUserId) {
        localStorage.setItem('userId', response.data._id);
      }
      
      // Store the fetched data in localStorage for offline access
      localStorage.setItem('user', JSON.stringify(response.data));
      console.log('User profile data stored for ID:', response.data._id);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error.response?.data || error.message);
    
    // If we have retries left and it's a network error, retry after a delay
    if (retryCount > 0 && (!error.response || error.response.status >= 500)) {
      console.log(`Retrying profile fetch... (${retryCount} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return getUserProfile(retryCount - 1);
    }
    
    throw error;
  }
};

export const updateUserProfile = async (userData, retryCount = 2) => {
  try {
    const config = getAuthConfig();
    const storedUserId = localStorage.getItem('userId');
    
    console.log('Updating profile with data:', userData);
    const response = await axios.put(`${API_URL}/me`, userData, config);
    
    // If update is successful, verify user ID and update the localStorage data
    if (response.data) {
      // Verify that the returned user ID matches the stored user ID
      if (response.data._id && storedUserId && storedUserId !== response.data._id) {
        console.error('User ID mismatch during update! Expected:', storedUserId, 'Got:', response.data._id);
        // Clear all storage and force re-login
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
        throw new Error('Session invalid. Please login again.');
      }
      
      // Get existing user data
      const existingUserStr = localStorage.getItem('user');
      let existingUser = {};
      
      if (existingUserStr) {
        try {
          existingUser = JSON.parse(existingUserStr);
        } catch (e) {
          console.error('Error parsing existing user data:', e);
        }
      }
      
      // Merge with updated data and save back to localStorage
      const updatedUser = { ...existingUser, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('User profile updated for ID:', response.data._id || storedUserId);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error.response?.data || error.message);
    
    // If we have retries left and it's a network error, retry after a delay
    if (retryCount > 0 && (!error.response || error.response.status >= 500)) {
      console.log(`Retrying profile update... (${retryCount} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return updateUserProfile(userData, retryCount - 1);
    }
    
    throw error;
  }
};

export const uploadProfilePicture = async (formData, retryCount = 2) => {
  try {
    const config = getAuthConfig('multipart/form-data');
    const storedUserId = localStorage.getItem('userId');
    
    console.log('Uploading profile picture');
    const response = await axios.post(`${API_URL}/upload-profile-pic`, formData, config);
    
    // If update is successful, verify user ID and update the localStorage data
    if (response.data) {
      // Verify that the returned user ID matches the stored user ID
      if (response.data._id && storedUserId && storedUserId !== response.data._id) {
        console.error('User ID mismatch during profile picture upload! Expected:', storedUserId, 'Got:', response.data._id);
        // Clear all storage and force re-login
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
        throw new Error('Session invalid. Please login again.');
      }
      
      // Get existing user data
      const existingUserStr = localStorage.getItem('user');
      let existingUser = {};
      
      if (existingUserStr) {
        try {
          existingUser = JSON.parse(existingUserStr);
        } catch (e) {
          console.error('Error parsing existing user data:', e);
        }
      }
      
      // Merge with updated data and save back to localStorage
      const updatedUser = { ...existingUser, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('Profile picture updated for user ID:', response.data._id || storedUserId);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error uploading profile picture:', error.response?.data || error.message);
    
    // If we have retries left and it's a network error, retry after a delay
    if (retryCount > 0 && (!error.response || error.response.status >= 500)) {
      console.log(`Retrying profile picture upload... (${retryCount} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return uploadProfilePicture(formData, retryCount - 1);
    }
    
    throw error;
  }
};