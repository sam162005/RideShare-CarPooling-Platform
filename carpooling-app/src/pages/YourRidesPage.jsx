import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaRupeeSign, FaClock, FaEdit, FaTrash, FaEye, FaCarSide, FaFilter, FaSearch, FaStar, FaRegStar } from 'react-icons/fa';
import Header from '../components/Header';
import { getUserRides, deleteRide } from '../services/ridesService';
import './YourRidesPage.css';

const YourRidesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('published');
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    dateRange: 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: 'date-desc'
  });
  const [favoriteRides, setFavoriteRides] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rideToDelete, setRideToDelete] = useState(null);
  const [stats, setStats] = useState({
    totalPublished: 0,
    totalBookings: 0,
    totalEarnings: 0,
    totalDistance: 0,
    averageRating: 4.7
  });

  // Fetch rides on component mount
  useEffect(() => {
    const fetchRides = async () => {
      setIsLoading(true);
      try {
        // Get rides specific to the current user
        const userRides = await getUserRides();
        
        // Store all user rides
        setRides(userRides);
        
        // Set initial filtered rides based on active tab
        filterRidesByTab(userRides, activeTab);
        
        // Calculate stats based on user rides
        calculateStats(userRides);
        
        // Load favorite rides from localStorage
        const savedFavorites = JSON.parse(localStorage.getItem('favorite_rides') || '[]');
        setFavoriteRides(savedFavorites);
      } catch (error) {
        console.error('Error fetching user rides:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRides();
  }, [activeTab]);

  // Calculate ride statistics from actual user ride data
  const calculateStats = (rides) => {
    // Count published rides
    const published = rides.length;
    
    // Count upcoming rides
    const today = new Date();
    const upcoming = rides.filter(ride => new Date(ride.date) >= today).length;
    
    // Count completed rides
    const completed = rides.filter(ride => new Date(ride.date) < today).length;
    
    // Calculate total earnings (assuming each seat is booked)
    const earnings = rides.reduce((total, ride) => {
      const bookedSeats = ride.bookedSeats || Math.floor(ride.passengerCount * 0.7); // Estimate 70% booking rate if not specified
      return total + (ride.pricePerSeat * bookedSeats);
    }, 0);
    
    // Calculate total distance covered
    const distance = rides.reduce((total, ride) => {
      const distanceStr = ride.selectedRoute?.distance || "0 km";
      const distanceVal = parseInt(distanceStr.split(' ')[0]) || 0;
      return total + distanceVal;
    }, 0);
    
    // Calculate average rating if available, otherwise use a default
    const ridesWithRatings = rides.filter(ride => ride.rating);
    const averageRating = ridesWithRatings.length > 0 
      ? ridesWithRatings.reduce((sum, ride) => sum + ride.rating, 0) / ridesWithRatings.length
      : 4.7; // Default if no ratings
    
    setStats({
      totalPublished: published,
      totalBookings: rides.reduce((sum, ride) => sum + (ride.bookedSeats || 0), 0),
      totalEarnings: earnings,
      totalDistance: distance,
      averageRating: averageRating.toFixed(1)
    });
  };

  // Filter rides based on active tab
  const filterRidesByTab = (allRides, tab) => {
    let filtered = [];
    
    switch (tab) {
      case 'published':
        filtered = allRides;
        break;
      case 'upcoming':
        filtered = allRides.filter(ride => {
          const rideDate = new Date(ride.date);
          const today = new Date();
          return rideDate >= today;
        });
        break;
      case 'completed':
        filtered = allRides.filter(ride => {
          const rideDate = new Date(ride.date);
          const today = new Date();
          return rideDate < today;
        });
        break;
      case 'favorites':
        filtered = allRides.filter(ride => favoriteRides.includes(ride.id));
        break;
      default:
        filtered = allRides;
    }
    
    // Apply search filter if any
    if (searchTerm) {
      filtered = filtered.filter(ride => 
        ride.pickupPoint?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.dropoffPoint?.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply additional filters
    filtered = applyFilters(filtered);
    
    setFilteredRides(filtered);
  };

  // Apply filters to rides
  const applyFilters = (rides) => {
    let filtered = [...rides];
    
    // Filter by date range
    if (filterOptions.dateRange !== 'all') {
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      const monthAgo = new Date();
      monthAgo.setMonth(today.getMonth() - 1);
      
      filtered = filtered.filter(ride => {
        const rideDate = new Date(ride.date);
        switch (filterOptions.dateRange) {
          case 'week':
            return rideDate >= weekAgo;
          case 'month':
            return rideDate >= monthAgo;
          case 'upcoming':
            return rideDate >= today;
          case 'past':
            return rideDate < today;
          default:
            return true;
        }
      });
    }
    
    // Filter by price range
    if (filterOptions.minPrice) {
      filtered = filtered.filter(ride => ride.pricePerSeat >= parseInt(filterOptions.minPrice));
    }
    
    if (filterOptions.maxPrice) {
      filtered = filtered.filter(ride => ride.pricePerSeat <= parseInt(filterOptions.maxPrice));
    }
    
    // Sort rides
    switch (filterOptions.sortBy) {
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.pricePerSeat - b.pricePerSeat);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.pricePerSeat - a.pricePerSeat);
        break;
      default:
        break;
    }
    
    return filtered;
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    filterRidesByTab(rides, tab);
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Filter rides based on search term
    const filtered = rides.filter(ride => 
      ride.pickupPoint?.city?.toLowerCase().includes(value.toLowerCase()) ||
      ride.dropoffPoint?.city?.toLowerCase().includes(value.toLowerCase())
    );
    
    setFilteredRides(filtered);
  };

  // Handle filter change
  const handleFilterChange = (name, value) => {
    const updatedFilters = { ...filterOptions, [name]: value };
    setFilterOptions(updatedFilters);
    
    // Apply filters
    const filtered = applyFilters(
      rides.filter(ride => {
        if (activeTab === 'favorites') {
          return favoriteRides.includes(ride.id);
        }
        return true;
      })
    );
    
    setFilteredRides(filtered);
  };

  // Toggle favorite status
  const toggleFavorite = (rideId) => {
    let updatedFavorites = [...favoriteRides];
    
    if (favoriteRides.includes(rideId)) {
      updatedFavorites = updatedFavorites.filter(id => id !== rideId);
    } else {
      updatedFavorites.push(rideId);
    }
    
    setFavoriteRides(updatedFavorites);
    localStorage.setItem('favorite_rides', JSON.stringify(updatedFavorites));
    
    // If we're on the favorites tab, update the filtered rides
    if (activeTab === 'favorites') {
      filterRidesByTab(rides, 'favorites');
    }
  };

  // Handle ride deletion
  const handleDeleteRide = async () => {
    if (!rideToDelete) return;
    
    try {
      await deleteRide(rideToDelete);
      
      // Update rides list - handle both MongoDB _id and local id
      const updatedRides = rides.filter(ride => 
        (ride._id !== rideToDelete && ride.id !== rideToDelete)
      );
      
      setRides(updatedRides);
      filterRidesByTab(updatedRides, activeTab);
      
      // Recalculate stats with updated rides
      calculateStats(updatedRides);
      
      // Close modal
      setShowDeleteModal(false);
      setRideToDelete(null);
    } catch (error) {
      console.error('Error deleting ride:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Calculate arrival time based on departure time and duration
  const calculateArrivalTime = (departureTime, duration) => {
    if (!departureTime || !duration) return 'N/A';
    
    // Extract hours and minutes from duration string (e.g., "5 hours 30 min")
    const durationParts = duration.split(' ');
    let hours = 0;
    let minutes = 0;
    
    for (let i = 0; i < durationParts.length; i++) {
      if (durationParts[i] === 'hours' || durationParts[i] === 'hour') {
        hours = parseInt(durationParts[i-1]) || 0;
      } else if (durationParts[i] === 'min') {
        minutes = parseInt(durationParts[i-1]) || 0;
      }
    }
    
    // Parse departure time
    const [depHours, depMinutes] = departureTime.split(':').map(Number);
    
    // Calculate arrival time
    let arrHours = depHours + hours;
    let arrMinutes = depMinutes + minutes;
    
    // Adjust for overflow
    if (arrMinutes >= 60) {
      arrHours += Math.floor(arrMinutes / 60);
      arrMinutes %= 60;
    }
    
    arrHours %= 24;
    
    // Format as HH:MM
    return `${arrHours.toString().padStart(2, '0')}:${arrMinutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="your-rides-page">
      <Header />
      
      <div className="your-rides-container">
        <div className="rides-header">
          <h1>Your Rides</h1>
          <button className="publish-new-btn" onClick={() => navigate('/publish-ride')}>
            + Publish New Ride
          </button>
        </div>
        
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon published-icon">
              <FaCarSide />
            </div>
            <div className="stat-content">
              <h3>{stats.totalPublished}</h3>
              <p>Rides Published</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon bookings-icon">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>{stats.totalBookings}</h3>
              <p>Total Bookings</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon earnings-icon">
              <FaRupeeSign />
            </div>
            <div className="stat-content">
              <h3>₹{stats.totalEarnings}</h3>
              <p>Total Earnings</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon distance-icon">
              <FaMapMarkerAlt />
            </div>
            <div className="stat-content">
              <h3>{stats.totalDistance} km</h3>
              <p>Distance Covered</p>
            </div>
          </div>
        </div>
        
        <div className="rides-tabs">
          <button 
            className={`tab-btn ${activeTab === 'published' ? 'active' : ''}`}
            onClick={() => handleTabChange('published')}
          >
            All Rides
          </button>
          <button 
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => handleTabChange('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => handleTabChange('completed')}
          >
            Completed
          </button>
          <button 
            className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => handleTabChange('favorites')}
          >
            Favorites
          </button>
        </div>
        
        <div className="search-filter-container">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by city..." 
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        
        {showFilters && (
          <div className="filters-container">
            <div className="filter-group">
              <label>Date Range</label>
              <select 
                value={filterOptions.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Price Range (₹)</label>
              <div className="price-inputs">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={filterOptions.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <span>to</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={filterOptions.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Sort By</label>
              <select 
                value={filterOptions.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>
                <option value="price-desc">Price (Highest First)</option>
                <option value="price-asc">Price (Lowest First)</option>
              </select>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your rides...</p>
          </div>
        ) : filteredRides.length === 0 ? (
          <div className="no-rides-container">
            <div className="no-rides-icon">
              <FaCarSide />
            </div>
            <h2>No rides found</h2>
            <p>
              {activeTab === 'published' 
                ? "You haven't published any rides yet." 
                : activeTab === 'upcoming' 
                ? "You don't have any upcoming rides." 
                : activeTab === 'completed' 
                ? "You don't have any completed rides." 
                : "You don't have any favorite rides."}
            </p>
            {activeTab === 'published' && (
              <button 
                className="publish-ride-btn"
                onClick={() => navigate('/publish-ride')}
              >
                Publish Your First Ride
              </button>
            )}
          </div>
        ) : (
          <div className="rides-grid">
            {filteredRides.map(ride => (
              <div className="ride-card" key={ride.id}>
                <div className="ride-card-header">
                  <div className="ride-route">
                    <h3>{ride.pickupPoint?.city} → {ride.dropoffPoint?.city}</h3>
                  </div>
                  <button 
                    className="favorite-btn"
                    onClick={() => toggleFavorite(ride.id)}
                    aria-label={favoriteRides.includes(ride.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    {favoriteRides.includes(ride.id) ? <FaStar /> : <FaRegStar />}
                  </button>
                </div>
                
                <div className="ride-card-body">
                  <div className="ride-details">
                    <div className="ride-detail">
                      <FaCalendarAlt className="detail-icon" />
                      <span>{formatDate(ride.date)}</span>
                    </div>
                    
                    <div className="ride-detail">
                      <FaClock className="detail-icon" />
                      <span>{ride.time} - {calculateArrivalTime(ride.time, ride.selectedRoute?.time)}</span>
                    </div>
                    
                    <div className="ride-detail">
                      <FaUsers className="detail-icon" />
                      <span>{ride.passengerCount} seats</span>
                    </div>
                    
                    <div className="ride-detail">
                      <FaRupeeSign className="detail-icon" />
                      <span>₹{ride.pricePerSeat} per seat</span>
                    </div>
                  </div>
                  
                  <div className="ride-locations">
                    <div className="location-point">
                      <div className="point-marker pickup"></div>
                      <div className="location-details">
                        <span className="location-name">{ride.pickupPoint?.name}</span>
                        <span className="location-address">{ride.pickupPoint?.address}</span>
                      </div>
                    </div>
                    
                    <div className="route-line">
                      <div className="route-info">
                        <span>{ride.selectedRoute?.distance}</span>
                        <span>{ride.selectedRoute?.time}</span>
                      </div>
                    </div>
                    
                    <div className="location-point">
                      <div className="point-marker dropoff"></div>
                      <div className="location-details">
                        <span className="location-name">{ride.dropoffPoint?.name}</span>
                        <span className="location-address">{ride.dropoffPoint?.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="ride-status-bar">
                  <div className={`status-indicator ${new Date(ride.date) < new Date() ? 'completed' : 'active'}`}>
                    {new Date(ride.date) < new Date() ? 'Completed' : 'Active'}
                  </div>
                  
                  <div className="booking-info">
                    <span>{Math.floor(Math.random() * ride.passengerCount)} bookings</span>
                  </div>
                </div>
                
                <div className="ride-card-actions">
                  <button 
                    className="action-btn view-btn"
                    onClick={() => navigate(`/ride-details/${ride.id}`, { state: { ride } })}
                  >
                    <FaEye /> View
                  </button>
                  
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => navigate(`/edit-ride/${ride.id}`, { state: { ride } })}
                  >
                    <FaEdit /> Edit
                  </button>
                  
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => {
                      setRideToDelete(ride.id);
                      setShowDeleteModal(true);
                    }}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Delete Ride</h3>
            <p>Are you sure you want to delete this ride? This action cannot be undone.</p>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setRideToDelete(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="delete-btn"
                onClick={handleDeleteRide}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YourRidesPage;
