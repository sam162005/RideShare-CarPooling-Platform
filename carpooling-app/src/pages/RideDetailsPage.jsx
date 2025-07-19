import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FaMapMarkerAlt, FaArrowRight, FaCalendarAlt, FaUsers, FaArrowLeft, FaClock, FaCheck } from 'react-icons/fa';
import './RideDetailsPage.css';

const RideDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Log the received state for debugging
  console.log('RideDetailsPage received state:', location.state);
  
  // Destructure the state with fallback to empty object
  const rideData = location.state || {};
  const { pickupPoint, dropoffPoint } = rideData;
  
  // State for ride details
  const [rideDate, setRideDate] = useState(new Date().toISOString().slice(0, 16));
  const [passengers, setPassengers] = useState(1);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleConfirmRide = () => {
    // Here you would typically submit the ride data to your backend
    const updatedRideData = {
      ...rideData,
      rideDate,
      passengers
    };
    
    console.log('Confirming ride with data:', updatedRideData);
    
    // Navigate to the route selection page
    navigate('/route-selection', { 
      state: updatedRideData 
    });
  };

  return (
    <div className="ride-details-page">
      <Header />
      <div className="ride-details-container">
        <div className="ride-details-section">
          <h2>Ride Details</h2>
          <div className="progress-indicator">
            <div className="progress-step completed">
              <div className="step-icon"><FaMapMarkerAlt /></div>
              <div className="step-label">Pickup</div>
            </div>
            <div className="progress-line completed"></div>
            <div className="progress-step completed">
              <div className="step-icon"><FaMapMarkerAlt /></div>
              <div className="step-label">Dropoff</div>
            </div>
            <div className="progress-line active"></div>
            <div className="progress-step active">
              <div className="step-icon"><FaCalendarAlt /></div>
              <div className="step-label">Details</div>
            </div>
            <div className="progress-line"></div>
            <div className="progress-step">
              <div className="step-icon"><FaCheck /></div>
              <div className="step-label">Confirm</div>
            </div>
          </div>
          
          {pickupPoint && dropoffPoint ? (
            <div className="locations-summary">
              <div className="location-item">
                <div className="location-icon pickup">
                  <FaMapMarkerAlt />
                </div>
                <div className="location-text">
                  <span className="location-label">From</span>
                  <span className="location-name">{pickupPoint.name}</span>
                </div>
              </div>
              
              <div className="route-arrow">
                <FaArrowRight />
              </div>
              
              <div className="location-item">
                <div className="location-icon dropoff">
                  <FaMapMarkerAlt />
                </div>
                <div className="location-text">
                  <span className="location-label">To</span>
                  <span className="location-name">{dropoffPoint.name}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="error-message">
              <p>Missing pickup or dropoff information. Please go back and select your locations.</p>
            </div>
          )}
          
          <div className="ride-options">
            <div className="option-item">
              <FaCalendarAlt />
              <div className="option-details">
                <h4>Date</h4>
                <input 
                  type="date" 
                  value={rideDate.split('T')[0]}
                  onChange={(e) => setRideDate(`${e.target.value}T${rideDate.split('T')[1]}`)} 
                />
              </div>
            </div>
            
            <div className="option-item">
              <FaClock />
              <div className="option-details">
                <h4>Time</h4>
                <input 
                  type="time" 
                  value={rideDate.split('T')[1]}
                  onChange={(e) => setRideDate(`${rideDate.split('T')[0]}T${e.target.value}`)} 
                />
              </div>
            </div>
            
            <div className="option-item">
              <FaUsers />
              <div className="option-details">
                <h4>Number of Passengers</h4>
                <select 
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                >
                  <option value="1">1 Passenger</option>
                  <option value="2">2 Passengers</option>
                  <option value="3">3 Passengers</option>
                  <option value="4">4 Passengers</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="ride-summary">
            <h3>Ride Summary</h3>
            <div className="summary-details">
              <div className="summary-item">
                <span className="summary-label">From:</span>
                <span className="summary-value">{pickupPoint?.name}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">To:</span>
                <span className="summary-value">{dropoffPoint?.name}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Date:</span>
                <span className="summary-value">{new Date(rideDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Time:</span>
                <span className="summary-value">{new Date(rideDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Passengers:</span>
                <span className="summary-value">{passengers} {passengers === 1 ? 'Person' : 'People'}</span>
              </div>
            </div>
          </div>
          
          <div className="navigation-buttons">
            <button className="back-button" onClick={handleBackClick}>
              <FaArrowLeft /> Back
            </button>
            <button className="confirm-button" onClick={handleConfirmRide}>
              Confirm Ride
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideDetailsPage;
