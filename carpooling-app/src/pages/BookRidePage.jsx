import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaRupeeSign, FaClock, FaArrowLeft, 
  FaUser, FaPhone, FaEnvelope, FaCommentAlt, FaCreditCard, FaCheckCircle, FaLock,
  FaShieldAlt, FaCar, FaRoute, FaMoneyBillWave, FaStar } from 'react-icons/fa';
import { bookRide } from '../services/bookingService';
import Header from '../components/Header';
import './BookRidePage.css';

const BookRidePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Default ride data with fallbacks
  const defaultRide = {
    id: Date.now().toString(),
    pickupPoint: { city: 'Unknown', name: 'Unknown Location' },
    dropoffPoint: { city: 'Unknown', name: 'Unknown Destination' },
    selectedRoute: { distance: 'N/A', time: 'N/A' },
    passengerCount: 1,
    pricePerSeat: 0,
    date: new Date().toISOString().split('T')[0],
    time: '12:00'
  };
  
  // Get ride data from location state or use default
  const [ride, setRide] = useState(() => {
    return location.state?.ride || defaultRide;
  });
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    seats: 1,
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [confetti, setConfetti] = useState([]);

  const { name, phone, email, seats, message } = formData;

  // Generate confetti elements
  useEffect(() => {
    if (bookingComplete) {
      const confettiCount = 50;
      const newConfetti = Array.from({ length: confettiCount }, (_, i) => ({
        id: i,
        x: Math.random(),
        y: -0.1,
        rotation: Math.random() * 360,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 3,
        size: 8 + Math.random() * 10,
        offset: (Math.random() - 0.5) * 100,
        rotationSpeed: 2 + Math.random() * 3
      }));
      setConfetti(newConfetti);
    }
  }, [bookingComplete]);

  useEffect(() => {
    // If no ride data in state, try to get it from localStorage as fallback
    if (!ride || Object.keys(ride).length === 0) {
      const savedRide = localStorage.getItem('selectedRide');
      if (savedRide) {
        try {
          setRide(JSON.parse(savedRide));
        } catch (e) {
          console.error('Error parsing saved ride data:', e);
          navigate('/find-ride', { state: { error: 'Invalid ride data' } });
        }
      } else {
        // If no ride data is available, redirect to find ride page
        navigate('/find-ride', { state: { error: 'Please select a ride first' } });
      }
    } else {
      // Save ride data to localStorage as a fallback
      localStorage.setItem('selectedRide', JSON.stringify(ride));
    }
    
    // Cleanup function to remove the saved ride when component unmounts
    return () => {
      localStorage.removeItem('selectedRide');
    };
  }, [ride, navigate]);

  const handleChange = e => {
    const { name, value } = e.target;
    
    // For seats, ensure it's between 1 and available seats
    if (name === 'seats') {
      const seatsValue = parseInt(value) || 1;
      const maxSeats = ride?.passengerCount || 1;
      setFormData({
        ...formData,
        [name]: Math.min(Math.max(1, seatsValue), maxSeats)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!name.trim()) {
        setError('Please enter your name');
        return false;
      }
      if (!phone.trim()) {
        setError('Please enter your phone number');
        return false;
      }
      if (!email.trim()) {
        setError('Please enter your email');
        return false;
      }
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setError('');
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!name || !phone || !email) {
        throw new Error('Please fill in all required fields');
      }

      // Format phone number (remove any non-digit characters)
      const formattedPhone = phone.replace(/\D/g, '');
      
      // Validate seat count
      const seatCount = parseInt(seats) || 1;
      if (seatCount < 1) {
        throw new Error('Please select at least 1 seat');
      }
      
      // Create booking data - only send what the backend expects
      const bookingData = {
        rideId: ride._id || ride.id,
        seats: seatCount,
        message
      };

      console.log('Sending booking data from page:', bookingData);
      console.log('Ride ID type:', typeof bookingData.rideId);
      console.log('Token from localStorage:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      // Call booking service
      const result = await bookRide(bookingData);
      console.log('Booking successful:', result);
      
      // Set booking ID and complete booking
      setBookingId(result._id);
      setBookingComplete(true);
      
      // Update local ride data to reflect seat reduction
      if (ride.passengerCount) {
        setRide(prev => ({
          ...prev,
          passengerCount: prev.passengerCount - seatCount
        }));
      }
      
      // Show success message
      setError('');
      
      // Show completion for 5 seconds then redirect
      setTimeout(() => {
        navigate('/your-rides', { 
          state: { 
            bookingSuccess: true,
            message: 'Your ride has been booked successfully!',
            bookingId: result._id
          } 
        });
      }, 5000);
      
    } catch (err) {
      console.error('Booking failed:', err);
      console.error('Error message:', err.message);
      
      // Display more detailed error message
      let errorMessage = err.message || 'Failed to book ride. Please try again.';
      
      // Check for specific error conditions
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (errorMessage.includes('Authentication required') || errorMessage.includes('Session expired')) {
        errorMessage = 'Authentication required. Please log in again.';
        
        // Clear token and redirect to login
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/login', { 
            state: { 
              from: window.location.pathname,
              message: 'Please log in to continue with your booking.'
            } 
          });
        }, 2000);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    return (ride?.pricePerSeat || 0) * seats;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
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

  if (!ride) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="book-ride-page">
      <Header />
      
      <div className="book-ride-container">
        <div className="back-button" onClick={() => navigate('/find-ride')}>
          <FaArrowLeft /> <span>Back to Find Rides</span>
        </div>
        
        <div className="page-title-container">
          <h1 className="page-title">Book Your Ride</h1>
          <p className="page-subtitle">Complete your booking in just a few steps</p>
        </div>
        
        {bookingComplete ? (
          <div className="booking-success">
            <div className="confetti-container">
              {confetti.map((item) => (
                <div 
                  key={item.id}
                  className="confetti"
                  style={{
                    '--x': item.x,
                    '--y': item.y,
                    '--rotation': `${item.rotation}deg`,
                    '--delay': `${item.delay}s`,
                    '--duration': `${item.duration}s`,
                    '--offset': `${item.offset}px`,
                    '--size': `${item.size}px`,
                    '--rotation-speed': `${item.rotationSpeed}s`
                  }}
                />
              ))}
            </div>
            <div className="success-icon">
              <FaCheckCircle />
            </div>
            <h2>Booking Confirmed!</h2>
            <div className="booking-reference">
              <span>Booking Reference:</span>
              <span className="reference-number">#{bookingId || 'BK' + Math.floor(Math.random() * 10000)}</span>
            </div>
            <div className="success-details">
              <div className="success-detail-item">
                <FaEnvelope />
                <p>Confirmation sent to: <strong>{email}</strong></p>
              </div>
              <div className="success-detail-item">
                <FaClock />
                <p>You'll be redirected to Your Rides page in a few seconds...</p>
              </div>
            </div>
            <div className="success-actions">
              <button 
                className="view-bookings-btn"
                onClick={() => navigate('/your-rides')}
              >
                View My Bookings
              </button>
              <button 
                className="find-more-btn"
                onClick={() => navigate('/find-ride')}
              >
                Find More Rides
              </button>
            </div>
          </div>
        ) : (
          <div className="booking-content">
            <div className="booking-header">
              <div className="booking-progress">
                <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
                  <div className="step-number">1</div>
                  <div className="step-label">Passenger Details</div>
                </div>
                <div className="progress-connector"></div>
                <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
                  <div className="step-number">2</div>
                  <div className="step-label">Review & Confirm</div>
                </div>
              </div>
            </div>
            
            <div className="booking-main">
              <div className="simple-ride-card">
                <div className="simple-route">
                  <div className="route-line">
                    <div className="route-dot start"></div>
                    <div className="route-line-connector"></div>
                    <div className="route-dot end"></div>
                  </div>
                  <div className="route-cities">
                    <div className="city">
                      <div className="city-name">{ride.pickupPoint?.city}</div>
                      <div className="city-time">{ride.time}</div>
                    </div>
                    <div className="city">
                      <div className="city-name">{ride.dropoffPoint?.city}</div>
                      <div className="city-time">{calculateArrivalTime(ride.time, ride.selectedRoute?.time)}</div>
                    </div>
                  </div>
                </div>
                <div className="ride-meta">
                  <div className="meta-item">
                    <span className="meta-label">Date</span>
                    <span className="meta-value">{formatDate(ride.date)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Seats</span>
                    <span className="meta-value">{ride.passengerCount} available</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Price</span>
                    <span className="meta-value">₹{ride.pricePerSeat} per seat</span>
                  </div>
                </div>
              </div>
              
              <div className="booking-form-container">
                {currentStep === 1 && (
                  <div className="booking-step passenger-details">
                    <h2><FaUser className="section-icon" /> Passenger Details</h2>
                    <form className="passenger-form">
                      <div className="form-group">
                        <label>
                          <FaUser />
                          <span>Your Name</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>
                          <FaPhone />
                          <span>Phone Number</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={phone}
                          onChange={handleChange}
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>
                          <FaEnvelope />
                          <span>Email</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>
                          <FaUsers />
                          <span>Number of Seats</span>
                        </label>
                        <div className="seats-selector">
                          <button 
                            type="button" 
                            onClick={() => handleChange({ target: { name: 'seats', value: seats - 1 } })}
                            disabled={seats <= 1}
                          >-</button>
                          <span>{seats}</span>
                          <button 
                            type="button" 
                            onClick={() => handleChange({ target: { name: 'seats', value: seats + 1 } })}
                            disabled={seats >= ride.passengerCount}
                          >+</button>
                        </div>
                        <span className="seats-info">
                          {ride.passengerCount} seats available
                        </span>
                      </div>
                      
                      <div className="form-group">
                        <label>
                          <FaCommentAlt />
                          <span>Message to Driver (Optional)</span>
                        </label>
                        <textarea
                          name="message"
                          value={message}
                          onChange={handleChange}
                          placeholder="Any special requests or information for the driver"
                          rows="3"
                        ></textarea>
                      </div>
                      
                      {error && <div className="error-message">{error}</div>}
                      
                      <div className="form-actions">
                        <button 
                          type="button" 
                          className="next-btn"
                          onClick={nextStep}
                        >
                          Continue to Review
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {currentStep === 2 && (
                  <div className="booking-step review-booking">
                    <h2><FaCheckCircle className="section-icon" /> Review & Confirm</h2>
                    
                    <div className="review-sections">
                      <div className="review-section">
                        <h3><FaUser className="section-icon-sm" /> Passenger Information</h3>
                        <div className="review-item">
                          <span className="item-label">Name:</span>
                          <span className="item-value">{name}</span>
                        </div>
                        <div className="review-item">
                          <span className="item-label">Phone:</span>
                          <span className="item-value">{phone}</span>
                        </div>
                        <div className="review-item">
                          <span className="item-label">Email:</span>
                          <span className="item-value">{email}</span>
                        </div>
                        <div className="review-item">
                          <span className="item-label">Seats:</span>
                          <span className="item-value">{seats}</span>
                        </div>
                        {message && (
                          <div className="review-item">
                            <span className="item-label">Message:</span>
                            <span className="item-value message">{message}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="review-section">
                        <h3><FaMoneyBillWave className="section-icon-sm" /> Price Details</h3>
                        <div className="price-summary">
                          <div className="price-row">
                            <span>Price per seat:</span>
                            <span>₹{ride.pricePerSeat}</span>
                          </div>
                          <div className="price-row">
                            <span>Number of seats:</span>
                            <span>{seats}</span>
                          </div>
                          <div className="price-row total">
                            <span>Total price:</span>
                            <span>₹{calculateTotalPrice()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="review-section payment-info">
                        <h3><FaCreditCard className="section-icon-sm" /> Payment Information</h3>
                        <div className="payment-method">
                          <div className="payment-option selected">
                            <FaCreditCard />
                            <span>Pay on Pickup (Cash)</span>
                            <div className="selected-indicator"></div>
                          </div>
                        </div>
                        <div className="payment-note">
                          <FaLock />
                          <span>Your booking is secure. Payment will be collected by the driver at pickup.</span>
                        </div>
                      </div>
                    </div>
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="back-btn"
                        onClick={prevStep}
                      >
                        Back
                      </button>
                      <button 
                        type="button" 
                        className="confirm-btn"
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Confirm Booking'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookRidePage;
