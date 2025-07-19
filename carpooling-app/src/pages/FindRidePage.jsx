import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FindRidePage.css';
import Header from '../components/Header';
// Import for booking modal has been removed as we're using a dedicated page now
import { cityPickupPoints } from '../data/pickupPoints';
import { getAllRides, searchRides, initializeSampleRides } from '../services/ridesService';
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaRupeeSign, FaClock, FaRoad, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

const FindRidePage = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [maxPrice, setMaxPrice] = useState('');
  const [pickupPoints, setPickupPoints] = useState([]);
  const [selectedPickup, setSelectedPickup] = useState(null);
  
  // State for rides
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  const availableCities = Object.keys(cityPickupPoints);
  const navigate = useNavigate();

  // Initialize rides from storage and add sample rides if needed
  useEffect(() => {
    // Initialize sample rides if none exist and load all rides
    const loadRides = async () => {
      setIsLoading(true);
      try {
        await initializeSampleRides();
        const allRides = await getAllRides();
        setRides(allRides);
        setFilteredRides(allRides);
      } catch (error) {
        console.error('Error loading rides:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRides();
  }, []);
  
  // Update pickup points when 'from' city changes
  useEffect(() => {
    if (from && cityPickupPoints[from]) {
      setPickupPoints(cityPickupPoints[from]);
    } else {
      setPickupPoints([]);
    }
    setSelectedPickup(null);
  }, [from]);

  // Handle search with filters
  const handleSearch = async () => {
    setIsLoading(true);
    
    try {
      // Create search criteria object
      const searchCriteria = {};
      
      if (from) searchCriteria.pickupCity = from;
      if (to) searchCriteria.dropoffCity = to;
      if (date) searchCriteria.date = date;
      if (passengers > 0) searchCriteria.passengerCount = passengers;
      if (maxPrice) searchCriteria.maxPrice = parseInt(maxPrice);
      
      // Search rides with criteria
      const results = await searchRides(searchCriteria);
      setFilteredRides(results);
    } catch (error) {
      console.error('Error searching rides:', error);
    } finally {
      setIsLoading(false);
      setShowFilters(false);
    }
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setFrom('');
    setTo('');
    setDate('');
    setPassengers(1);
    setMaxPrice('');
    setSelectedPickup(null);
    setFilteredRides(rides);
    setShowFilters(false);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };
  
  // Handle booking a ride - navigates to the dedicated book ride page
  const handleBookRide = (ride) => {
    // Pass the entire ride object to the book ride page
    navigate('/book-ride', { 
      state: { 
        ride: {
          ...ride,
          // Ensure we have all necessary fields with fallbacks
          pickupPoint: ride.pickupPoint || { city: '', name: '' },
          dropoffPoint: ride.dropoffPoint || { city: '', name: '' },
          selectedRoute: ride.selectedRoute || { distance: '10 km', time: '1 hour' },
          passengerCount: ride.passengerCount || 1,
          pricePerSeat: ride.pricePerSeat || 0,
          date: ride.date || new Date().toISOString().split('T')[0],
          time: ride.time || '12:00'
        } 
      } 
    });
  };
  
  // Calculate estimated arrival time
  const calculateArrivalTime = (departureTime, durationStr) => {
    if (!departureTime || !durationStr) return '';
    
    // Extract hours from duration string (simplified)
    const hours = parseInt(durationStr) || 0;
    const minutes = 0;
    
    // Create departure date object
    const [hours24, minutes24] = departureTime.split(':').map(Number);
    const departure = new Date();
    departure.setHours(hours24, minutes24, 0);
    
    // Add duration
    const arrival = new Date(departure.getTime() + (hours * 60 + minutes) * 60 * 1000);
    
    // Format arrival time
    return arrival.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  return (
    <div className="find-ride-wrapper">
      <Header />

      <div className="find-ride-hero">
        <div className="hero-content">
          <h1>Find Your Perfect Ride</h1>
          <p className="subtitle">Travel together, save together. Join thousands of riders.</p>
          
          <div className="search-controls">
            <button 
              className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? <FaTimes /> : <FaFilter />} {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            <button className="clear-filters-btn" onClick={handleClearFilters}>
              Clear All Filters
            </button>
          </div>
        </div>
      </div>

      <div className="find-ride-page">
        {showFilters && (
          <div className="ride-search-bar fade-in-up">
            <div className="input-group">
              <label>From</label>
              <select 
                value={from} 
                onChange={(e) => setFrom(e.target.value)}
                className="select-input"
              >
                <option value="">Select city</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>To</label>
              <select 
                value={to} 
                onChange={(e) => setTo(e.target.value)}
                className="select-input"
              >
                <option value="">Select city</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="date-input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="input-group">
              <label>Passengers</label>
              <div className="passenger-input-wrapper">
                <FaUsers className="passenger-icon" />
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={passengers}
                  onChange={(e) => setPassengers(Math.min(8, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="passenger-input"
                  aria-label="Number of passengers"
                />
              </div>
            </div>
            
            <div className="input-group">
              <label>Max Price (₹)</label>
              <input 
                type="number" 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(e.target.value)}
                className="price-input"
                min="0"
                placeholder="Any price"
              />
            </div>

            <button className="search-btn" onClick={handleSearch}>
              <FaSearch /> Search
            </button>
          </div>
        )}

        <div className="ride-results">
          <div className="results-header">
            <h2>Available Rides ({filteredRides.length})</h2>
            {filteredRides.length > 0 && (
              <p className="results-summary">
                Showing rides {from ? `from ${from}` : ''} {to ? `to ${to}` : ''} 
                {date ? `on ${new Date(date).toLocaleDateString()}` : ''}
              </p>
            )}
          </div>
          
          {isLoading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Loading rides...</p>
            </div>
          ) : filteredRides.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No rides found</h3>
              <p>Try adjusting your search filters or publish a ride yourself!</p>
              <button 
                className="publish-ride-btn"
                onClick={() => navigate('/publish-ride')}
              >
                Publish a Ride
              </button>
            </div>
          ) : (
            <div className="results-grid">
              {filteredRides.map(ride => (
                <div className="ride-card" key={ride.id}>
                  <div className="ride-card-header">
                    <div className="ride-cities">
                      <h3>{ride.pickupPoint?.city} → {ride.dropoffPoint?.city}</h3>
                    </div>
                    <div className="ride-price">
                      <span>₹{ride.pricePerSeat}</span>
                      <small>per seat</small>
                    </div>
                  </div>
                  <div className="ride-card-body">
                    <div className="ride-details">
                      <div className="ride-detail">
                        <span className="detail-icon"><FaCalendarAlt /></span>
                        <span className="detail-text">{formatDate(ride.date)} at {ride.time}</span>
                      </div>
                      <div className="ride-detail">
                        <span className="detail-icon"><FaUsers /></span>
                        <span className="detail-text">{ride.passengerCount} seats available</span>
                      </div>
                      <div className="ride-detail">
                        <span className="detail-icon"><FaRoad /></span>
                        <span className="detail-text">{ride.selectedRoute?.distance || '10 km'} • {ride.selectedRoute?.time || '1 hour'}</span>
                      </div>
                    </div>
                    <div className="ride-locations">
                      <div className="location-point">
                        <div className="point-marker start"></div>
                        <div className="point-details">
                          <span className="point-time">{ride.time}</span>
                          <span className="point-name">{ride.pickupPoint?.name}</span>
                        </div>
                      </div>
                      <div className="location-connector"></div>
                      <div className="location-point">
                        <div className="point-marker end"></div>
                        <div className="point-details">
                          <span className="point-time">{calculateArrivalTime(ride.time, ride.selectedRoute?.time)}</span>
                          <span className="point-name">{ride.dropoffPoint?.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ride-card-footer">
                    <button 
                      className="view-details-btn"
                      onClick={() => navigate(`/ride-details/${ride.id}`, { state: { ride } })}
                    >
                      View Details
                    </button>
                    <button 
                      className="book-btn"
                      onClick={() => handleBookRide(ride)}
                    >
                      Book Seat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Booking Modal has been replaced with a dedicated page */}
    </div>
  );
};

export default FindRidePage;
