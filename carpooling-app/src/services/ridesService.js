// API URL for rides
const API_URL = 'http://localhost:5000/api/rides';

// Helper function to get the auth token
const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.token || '';
};

// Helper function to handle API errors
const handleApiError = (error) => {
  console.error('API Error:', error);
  throw error;
};

// Add a new ride to the database
export const publishRide = async (rideData) => {
  try {
    console.log('Publishing ride with data:', rideData);
    
    // Ensure the ride data matches the MongoDB schema structure exactly
    const formattedRideData = {
      pickupPoint: {
        name: rideData.pickupPoint?.name || 'Unknown',
        city: rideData.pickupPoint?.city || 'Unknown',
        address: rideData.pickupPoint?.address || 'Unknown'
      },
      dropoffPoint: {
        name: rideData.dropoffPoint?.name || 'Unknown',
        city: rideData.dropoffPoint?.city || 'Unknown',
        address: rideData.dropoffPoint?.address || 'Unknown'
      },
      date: rideData.date || new Date().toISOString(),
      time: rideData.time || '12:00',
      passengerCount: parseInt(rideData.passengerCount) || 1,
      pricePerSeat: parseInt(rideData.pricePerSeat) || 0,
      selectedRoute: {
        distance: rideData.selectedRoute?.distance || '0 km',
        time: rideData.selectedRoute?.time || '0 min',
        toll: Boolean(rideData.selectedRoute?.toll) || false
      },
      publishedAt: new Date().toISOString(),
      status: 'active',
      user: '6462e95e1f0d8b9a0c9b4567' // Dummy user ID for now
    };
    
    // Log the formatted data
    console.log('Formatted ride data for MongoDB:', JSON.stringify(formattedRideData, null, 2));
    
    // Always store in localStorage first as a backup
    const localRide = {
      ...formattedRideData,
      id: `local_${Date.now()}`
    };
    
    const localRides = JSON.parse(localStorage.getItem('carpooling_rides') || '[]');
    localRides.unshift(localRide);
    localStorage.setItem('carpooling_rides', JSON.stringify(localRides));
    console.log('Ride saved to localStorage as backup');
    
    // Try to send to backend API with explicit content type and no-cache
    console.log('Sending ride to API:', API_URL);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify(formattedRideData)
    });
    
    // Log the raw response
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    // If API call succeeds, use the returned ride from MongoDB
    const newRide = await response.json();
    console.log('Ride successfully published to MongoDB:', newRide);
    
    // Return the MongoDB ride (with proper MongoDB ID)
    return newRide;
  } catch (error) {
    console.error('Error publishing ride to MongoDB:', error);
    
    // Since we already saved to localStorage, just return the local ride
    const localRides = JSON.parse(localStorage.getItem('carpooling_rides') || '[]');
    return localRides[0]; // Return the most recently added ride
  }
};

// Get all rides
export const getAllRides = async () => {
  try {
    console.log('Fetching rides from API:', API_URL);
    const response = await fetch(API_URL);

    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const rides = await response.json();
    console.log('Rides fetched successfully:', rides);
    
    // If we got rides from the API, return them
    if (rides.length > 0) {
      return rides;
    }
    
    // Otherwise, check localStorage
    const localRides = JSON.parse(localStorage.getItem('carpooling_rides') || '[]');
    if (localRides.length > 0) {
      console.log('Found rides in localStorage:', localRides);
      return localRides;
    }
    
    // If no rides anywhere, return hardcoded sample rides
    console.log('No rides found, returning hardcoded sample rides');
    return getSampleRides();
  } catch (error) {
    console.error('Error fetching rides from API:', error);
    
    // Check localStorage
    const localRides = JSON.parse(localStorage.getItem('carpooling_rides') || '[]');
    if (localRides.length > 0) {
      console.log('Falling back to localStorage rides:', localRides);
      return localRides;
    }
    
    // If no rides in localStorage either, return hardcoded sample rides
    console.log('No rides in localStorage, returning hardcoded sample rides');
    return getSampleRides();
  }
};

// Function to get hardcoded sample rides
const getSampleRides = () => {
  return [
    {
      id: 'sample_123456',
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
      date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      time: '08:00',
      passengerCount: 3,
      pricePerSeat: 450,
      selectedRoute: {
        distance: '436.3 km',
        time: '8 hours',
        toll: true
      },
      publishedAt: new Date().toISOString(),
      status: 'active'
    },
    {
      id: 'sample_234567',
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
      date: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
      time: '07:30',
      passengerCount: 2,
      pricePerSeat: 350,
      selectedRoute: {
        distance: '195.5 km',
        time: '4 hours',
        toll: false
      },
      publishedAt: new Date().toISOString(),
      status: 'active'
    },
    {
      id: 'sample_345678',
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
      date: new Date().toISOString(), // Today
      time: '14:00',
      passengerCount: 4,
      pricePerSeat: 300,
      selectedRoute: {
        distance: '210.8 km',
        time: '4 hours',
        toll: true
      },
      publishedAt: new Date().toISOString(),
      status: 'active'
    }
  ];
};

// Get a specific ride by ID
export const getRideById = async (rideId) => {
  try {
    const response = await fetch(`${API_URL}/${rideId}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const ride = await response.json();
    return ride;
  } catch (error) {
    handleApiError(error);
    // Fallback to localStorage if API fails
    const rides = JSON.parse(localStorage.getItem('carpooling_rides') || '[]');
    return rides.find(ride => ride.id === rideId);
  }
};

// Search rides by criteria
export const searchRides = async (criteria) => {
  try {
    // Build query string from criteria
    const queryParams = new URLSearchParams();
    
    if (criteria.pickupCity) queryParams.append('pickupCity', criteria.pickupCity);
    if (criteria.dropoffCity) queryParams.append('dropoffCity', criteria.dropoffCity);
    if (criteria.date) queryParams.append('date', criteria.date);
    if (criteria.passengerCount) queryParams.append('passengerCount', criteria.passengerCount);
    if (criteria.maxPrice) queryParams.append('maxPrice', criteria.maxPrice);
    
    const response = await fetch(`${API_URL}/search?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const rides = await response.json();
    
    // If we got rides from the API, return them
    if (rides.length > 0) {
      return rides;
    }
    
    // Otherwise, filter the hardcoded sample rides
    return filterSampleRides(criteria);
  } catch (error) {
    console.error('Error searching rides from API:', error);
    
    // Check localStorage first
    let localRides = JSON.parse(localStorage.getItem('carpooling_rides') || '[]');
    
    // If localStorage has rides, filter them
    if (localRides.length > 0) {
      return filterRides(localRides, criteria);
    }
    
    // Otherwise, filter the hardcoded sample rides
    return filterSampleRides(criteria);
  }
};

// Helper function to filter rides by criteria
const filterRides = (rides, criteria) => {
  let filteredRides = [...rides];
  
  // Filter by pickup city
  if (criteria.pickupCity) {
    filteredRides = filteredRides.filter(ride => 
      ride.pickupPoint?.city?.toLowerCase().includes(criteria.pickupCity.toLowerCase())
    );
  }
  
  // Filter by dropoff city
  if (criteria.dropoffCity) {
    filteredRides = filteredRides.filter(ride => 
      ride.dropoffPoint?.city?.toLowerCase().includes(criteria.dropoffCity.toLowerCase())
    );
  }
  
  // Filter by date
  if (criteria.date) {
    const searchDate = new Date(criteria.date).toDateString();
    filteredRides = filteredRides.filter(ride => {
      if (!ride.date) return false;
      const rideDate = new Date(ride.date).toDateString();
      return rideDate === searchDate;
    });
  }
  
  // Filter by passenger count
  if (criteria.passengerCount) {
    filteredRides = filteredRides.filter(ride => 
      ride.passengerCount >= criteria.passengerCount
    );
  }
  
  // Filter by price range
  if (criteria.maxPrice) {
    filteredRides = filteredRides.filter(ride => 
      ride.pricePerSeat <= criteria.maxPrice
    );
  }
  
  return filteredRides;
};

// Filter sample rides by criteria
const filterSampleRides = (criteria) => {
  return filterRides(getSampleRides(), criteria);
};

// Get rides for the current user
export const getUserRides = async () => {
  try {
    // Get the current user ID (in a real app, this would come from authentication)
    const userId = localStorage.getItem('userId') || '6462e95e1f0d8b9a0c9b4567'; // Default to dummy ID if none exists
    
    console.log('Fetching user rides from API:', `${API_URL}/user/${userId}`);
    const response = await fetch(`${API_URL}/user/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching user rides: ${response.status}`);
    }
    
    const rides = await response.json();
    console.log(`Retrieved ${rides.length} rides for user`);
    
    // Store in localStorage as backup
    localStorage.setItem('user_rides', JSON.stringify(rides));
    
    return rides;
  } catch (error) {
    console.error('Error fetching user rides:', error);
    
    // Fallback to localStorage if API fails
    const localRides = JSON.parse(localStorage.getItem('user_rides') || '[]');
    if (localRides.length > 0) {
      console.log('Returning rides from localStorage');
      return localRides;
    }
    
    // If no local rides, return all rides filtered by the dummy user ID
    const allRides = await getAllRides();
    const userId = localStorage.getItem('userId') || '6462e95e1f0d8b9a0c9b4567';
    return allRides.filter(ride => ride.user === userId);
  }
};

// Delete a ride
export const deleteRide = async (rideId) => {
  try {
    const token = getAuthToken();
    
    // If no token or local ride, handle locally
    if (!token || rideId.startsWith('local_')) {
      let rides = JSON.parse(localStorage.getItem('carpooling_rides') || '[]');
      rides = rides.filter(ride => ride.id !== rideId);
      localStorage.setItem('carpooling_rides', JSON.stringify(rides));
      return;
    }
    
    const response = await fetch(`${API_URL}/${rideId}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
  } catch (error) {
    handleApiError(error);
    // Fallback to localStorage if API fails
    let rides = JSON.parse(localStorage.getItem('carpooling_rides') || '[]');
    rides = rides.filter(ride => ride.id !== rideId);
    localStorage.setItem('carpooling_rides', JSON.stringify(rides));
  }
};

// Update a ride
export const updateRide = async (rideId, updatedData) => {
  try {
    const token = getAuthToken();
    
    // If no token or local ride, handle locally
    if (!token || rideId.startsWith('local_')) {
      let rides = JSON.parse(localStorage.getItem('carpooling_rides') || '[]');
      const index = rides.findIndex(ride => ride.id === rideId);
      
      if (index !== -1) {
        rides[index] = { ...rides[index], ...updatedData };
        localStorage.setItem('carpooling_rides', JSON.stringify(rides));
        return rides[index];
      }
      
      return null;
    }
    
    const response = await fetch(`${API_URL}/${rideId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(updatedData)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const updatedRide = await response.json();
    return updatedRide;
  } catch (error) {
    handleApiError(error);
    // Fallback to localStorage if API fails
    let rides = JSON.parse(localStorage.getItem('carpooling_rides') || '[]');
    const index = rides.findIndex(ride => ride.id === rideId);
    
    if (index !== -1) {
      rides[index] = { ...rides[index], ...updatedData };
      localStorage.setItem('carpooling_rides', JSON.stringify(rides));
      return rides[index];
    }
    
    return null;
  }
};

// Add sample rides for testing (only if no rides exist)
export const initializeSampleRides = async () => {
  try {
    // Check if rides exist in the API
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const rides = await response.json();
    
    // If no rides exist and we have a token, add sample rides
    if (rides.length === 0) {
      const token = getAuthToken();
      
      // If no token, store samples in localStorage
      if (!token) {
        const localRides = JSON.parse(localStorage.getItem('carpooling_rides') || '[]');
        
        if (localRides.length === 0) {
          const sampleRides = [
            {
              id: 'local_123456',
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
              date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
              time: '08:00',
              passengerCount: 3,
              pricePerSeat: 450,
              selectedRoute: {
                distance: '436.3 km',
                time: '8 hours 10 min',
                toll: true
              },
              publishedAt: new Date().toISOString(),
              status: 'active'
            },
            {
              id: 'local_234567',
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
              date: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
              time: '07:30',
              passengerCount: 2,
              pricePerSeat: 350,
              selectedRoute: {
                distance: '195.5 km',
                time: '4 hours 15 min',
                toll: false
              },
              publishedAt: new Date().toISOString(),
              status: 'active'
            },
            {
              id: 'local_345678',
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
              date: new Date().toISOString(), // Today
              time: '14:00',
              passengerCount: 4,
              pricePerSeat: 300,
              selectedRoute: {
                distance: '210.8 km',
                time: '4 hours 45 min',
                toll: true
              },
              publishedAt: new Date().toISOString(),
              status: 'active'
            }
          ];
          
          localStorage.setItem('carpooling_rides', JSON.stringify(sampleRides));
        }
      } else {
        // We have a token and no rides, so add sample rides to the API
        // This would be implemented in a real app, but we'll skip it for this demo
        // as it would require multiple API calls
      }
    }
  } catch (error) {
    handleApiError(error);
    // Fallback to localStorage
    const localRides = JSON.parse(localStorage.getItem('carpooling_rides') || '[]');
    
    if (localRides.length === 0) {
      const sampleRides = [
        {
          id: 'local_123456',
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
          date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
          time: '08:00',
          passengerCount: 3,
          pricePerSeat: 450,
          selectedRoute: {
            distance: '436.3 km',
            time: '8 hours 10 min',
            toll: true
          },
          publishedAt: new Date().toISOString(),
          status: 'active'
        },
        {
          id: 'local_234567',
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
          date: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
          time: '07:30',
          passengerCount: 2,
          pricePerSeat: 350,
          selectedRoute: {
            distance: '195.5 km',
            time: '4 hours 15 min',
            toll: false
          },
          publishedAt: new Date().toISOString(),
          status: 'active'
        },
        {
          id: 'local_345678',
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
          date: new Date().toISOString(), // Today
          time: '14:00',
          passengerCount: 4,
          pricePerSeat: 300,
          selectedRoute: {
            distance: '210.8 km',
            time: '4 hours 45 min',
            toll: true
          },
          publishedAt: new Date().toISOString(),
          status: 'active'
        }
      ];
      
      localStorage.setItem('carpooling_rides', JSON.stringify(sampleRides));
    }
  }
};
