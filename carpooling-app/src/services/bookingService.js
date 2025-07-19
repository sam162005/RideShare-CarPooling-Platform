// API URL for bookings
const API_URL = 'http://localhost:5000/api/bookings';

// Helper function to handle API errors
const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // Check if it's a response error with details
  if (error.response) {
    console.error('Response status:', error.response.status);
    console.error('Response data:', error.response.data);
  }
  
  throw error;
};

// Book a ride
export const bookRide = async (bookingData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required. Please log in.');
    }
    
    // Format booking data to match backend expectations
    const formattedBookingData = {
      rideId: bookingData.rideId,
      seats: parseInt(bookingData.seats) || 1,
      message: bookingData.message || ''
    };
    
    console.log('Booking ride with data:', formattedBookingData);
    console.log('Using token:', token.substring(0, 10) + '...');
    
    // Send booking to API with authentication
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formattedBookingData)
    });
    
    // Log response status
    console.log('Response status:', response.status);
    
    const responseData = await response.json();
    console.log('Response data:', responseData);
    
    if (!response.ok) {
      // Log detailed error information
      console.error('Booking failed with status:', response.status);
      console.error('Error details:', responseData);
      
      throw new Error(responseData.msg || 'Failed to create booking');
    }
    
    return responseData.data || responseData;
  } catch (error) {
    console.error('Error in bookRide service:', error);
    
    // Check for network errors
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    // Check for token expiration
    if (error.message.includes('jwt expired') || 
        error.message.includes('invalid token') || 
        error.message.includes('not authenticated')) {
      localStorage.removeItem('token'); // Clear invalid token
      throw new Error('Session expired. Please log in again.');
    }
    
    // Rethrow the error with more context if needed
    throw error;
  }
};

// Get all bookings for the current user
export const getMyBookings = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_URL}/my-bookings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || 'Failed to fetch bookings');
    }
    
    return data.data || [];
  } catch (error) {
    handleApiError(error);
  }
};

// Cancel a booking
export const cancelBooking = async (bookingId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_URL}/${bookingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || 'Failed to cancel booking');
    }
    
    // Update local storage
    const localBookings = JSON.parse(localStorage.getItem('user_bookings') || '[]');
    const updatedBookings = localBookings.map(booking => {
      if (booking._id === bookingId || booking.id === bookingId) {
        return { ...booking, status: 'cancelled' };
      }
      return booking;
    });
    localStorage.setItem('user_bookings', JSON.stringify(updatedBookings));
    
    return data.data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// Get all bookings for a specific ride
export const getRideBookings = async (rideId) => {
  try {
    const response = await fetch(`${API_URL}/ride/${rideId}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, status, isRead = true) => {
  try {
    const response = await fetch(`${API_URL}/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, isRead })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    handleApiError(error);
    return null;
  }
};
