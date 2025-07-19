import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaCar, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaRupeeSign } from 'react-icons/fa';
import Header from '../components/Header';
import './RidePublishedPage.css';

const RidePublishedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const rideData = location.state || {};
  
  // Animation states
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [showRideDetails, setShowRideDetails] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Animation sequence
  useEffect(() => {
    // Start animation sequence
    const sequence = async () => {
      // Step 1: Show confetti
      setShowConfetti(true);
      
      // Step 2: Show checkmark after 500ms
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowCheckmark(true);
      
      // Step 3: Show ride details after 1000ms
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowRideDetails(true);
      
      // Step 4: Mark animation as complete after 2000ms
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAnimationComplete(true);
    };
    
    sequence();
    
    // Cleanup confetti after 5 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    
    return () => clearTimeout(confettiTimer);
  }, []);
  
  // Format date
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
  
  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };
  
  // Handle navigation to find rides page
  const handleGoToFindRides = () => {
    navigate('/find-ride');
  };
  
  // Generate ride ID
  const rideId = `CP${Math.floor(100000 + Math.random() * 900000)}`;
  
  return (
    <div className="ride-published-page">
      <Header />
      
      {/* Confetti animation */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div 
              key={`confetti-${i}`} 
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`
              }}
            />
          ))}
        </div>
      )}
      
      <div className="success-container">
        {/* Success checkmark */}
        <div className={`success-checkmark ${showCheckmark ? 'animate' : ''}`}>
          <FaCheckCircle />
        </div>
        
        {/* Success message */}
        <h1 className={`success-title ${showCheckmark ? 'animate' : ''}`}>
          Ride Published Successfully!
        </h1>
        
        <p className={`success-subtitle ${showCheckmark ? 'animate' : ''}`}>
          Your ride has been published and is now visible to potential passengers
        </p>
        
        {/* Ride ID */}
        <div className={`ride-id ${showRideDetails ? 'animate' : ''}`}>
          Ride ID: <span>{rideId}</span>
        </div>
        
        {/* Ride details card */}
        <div className={`ride-details-card ${showRideDetails ? 'animate' : ''}`}>
          <h2>Ride Details</h2>
          
          <div className="ride-detail-item">
            <div className="ride-detail-icon">
              <FaMapMarkerAlt />
            </div>
            <div className="ride-detail-content">
              <div className="ride-detail-label">From</div>
              <div className="ride-detail-value">{rideData.pickupPoint?.name || 'Not specified'}</div>
            </div>
          </div>
          
          <div className="ride-detail-item">
            <div className="ride-detail-icon">
              <FaMapMarkerAlt />
            </div>
            <div className="ride-detail-content">
              <div className="ride-detail-label">To</div>
              <div className="ride-detail-value">{rideData.dropoffPoint?.name || 'Not specified'}</div>
            </div>
          </div>
          
          <div className="ride-detail-item">
            <div className="ride-detail-icon">
              <FaCalendarAlt />
            </div>
            <div className="ride-detail-content">
              <div className="ride-detail-label">Date & Time</div>
              <div className="ride-detail-value">
                {formatDate(rideData.date)} at {formatTime(rideData.time)}
              </div>
            </div>
          </div>
          
          <div className="ride-detail-item">
            <div className="ride-detail-icon">
              <FaUsers />
            </div>
            <div className="ride-detail-content">
              <div className="ride-detail-label">Passengers</div>
              <div className="ride-detail-value">{rideData.passengerCount || 0} seats available</div>
            </div>
          </div>
          
          <div className="ride-detail-item">
            <div className="ride-detail-icon">
              <FaRupeeSign />
            </div>
            <div className="ride-detail-content">
              <div className="ride-detail-label">Price per seat</div>
              <div className="ride-detail-value">₹{rideData.pricePerSeat || 0}</div>
            </div>
          </div>
          
          <div className="ride-detail-item">
            <div className="ride-detail-icon">
              <FaCar />
            </div>
            <div className="ride-detail-content">
              <div className="ride-detail-label">Route</div>
              <div className="ride-detail-value">
                {rideData.selectedRoute?.distance || '0 km'} • {rideData.selectedRoute?.time || '0 min'}
                {rideData.selectedRoute?.toll && ' • Toll road'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className={`action-buttons ${animationComplete ? 'animate' : ''}`}>
          <button 
            className="primary-button"
            onClick={handleGoToFindRides}
          >
            Find Rides
          </button>
          
          <button 
            className="secondary-button"
            onClick={() => navigate('/publish-another-ride')}
          >
            Publish Another Ride
          </button>
        </div>
      </div>
    </div>
  );
};

export default RidePublishedPage;
