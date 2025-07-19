import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FaMinus, FaPlus, FaTimes, FaInfoCircle } from 'react-icons/fa';
import './PassengerSelectionPage.css';

const PassengerSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const rideData = location.state || {};
  
  // State for passenger count and options
  const [passengerCount, setPassengerCount] = useState(3);
  const [maxBackSeat, setMaxBackSeat] = useState(true);
  const [showNotification, setShowNotification] = useState(true);
  
  const handleDecrement = () => {
    if (passengerCount > 1) {
      setPassengerCount(passengerCount - 1);
    }
  };
  
  const handleIncrement = () => {
    if (passengerCount < 8) {
      setPassengerCount(passengerCount + 1);
    }
  };
  
  const handleContinue = () => {
    // Navigate to the next page with updated ride data
    navigate('/price-selection', {
      state: {
        ...rideData,
        passengerCount,
        passengerOptions: {
          maxBackSeat
        }
      }
    });
  };
  
  return (
    <div className="passenger-selection-page">
      <Header />
      <div className="passenger-selection-container">
        <div className="passenger-selection-card">
          <h1 className="passenger-selection-title">
            So how many BlaBlaCar passengers can you take?
          </h1>
          
          <div className="passenger-counter">
            <button 
              className="counter-button"
              onClick={handleDecrement}
              disabled={passengerCount <= 1}
            >
              <FaMinus />
            </button>
            <div className="passenger-count">{passengerCount}</div>
            <button 
              className="counter-button"
              onClick={handleIncrement}
              disabled={passengerCount >= 8}
            >
              <FaPlus />
            </button>
          </div>
          
          <div className="passenger-options">
            <h3>Passenger options</h3>
            <div className="passenger-option">
              <input 
                type="checkbox"
                id="max-back-seat"
                className="passenger-option-checkbox"
                checked={maxBackSeat}
                onChange={() => setMaxBackSeat(!maxBackSeat)}
              />
              <div className="passenger-option-text">
                <div className="passenger-option-title">Max. 2 in the back</div>
                <div className="passenger-option-description">
                  Think comfort, keep the middle seat empty
                </div>
              </div>
              <div className="passenger-option-icon">
                <FaInfoCircle />
              </div>
            </div>
          </div>
          
          <button 
            className="continue-button"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
      
      {showNotification && (
        <div className="notification-bar">
          <div className="notification-bar-content">
            <div className="notification-text">
              Make sure your ride is only passing through a location once.
            </div>
            <div 
              className="notification-close"
              onClick={() => setShowNotification(false)}
            >
              <FaTimes />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerSelectionPage;
