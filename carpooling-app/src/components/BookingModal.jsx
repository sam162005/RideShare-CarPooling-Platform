import React, { useState } from 'react';
import { FaTimes, FaUser, FaPhone, FaEnvelope, FaCommentAlt, FaUsers } from 'react-icons/fa';
import { bookRide } from '../services/bookingService';
import './BookingModal.css';

const BookingModal = ({ ride, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    seats: 1,
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { name, phone, email, seats, message } = formData;

  const handleChange = e => {
    const { name, value } = e.target;
    
    // For seats, ensure it's between 1 and available seats
    if (name === 'seats') {
      const seatsValue = parseInt(value) || 1;
      const maxSeats = ride.passengerCount || 1;
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

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validate form
      if (!name.trim()) {
        throw new Error('Please enter your name');
      }
      
      if (!phone.trim()) {
        throw new Error('Please enter your phone number');
      }
      
      if (!email.trim()) {
        throw new Error('Please enter your email');
      }
      
      // Create booking data - only send what the backend expects
      const bookingData = {
        rideId: ride._id || ride.id,
        seats,
        message
      };
      
      console.log('Sending booking data:', bookingData);
      
      // Book the ride
      const result = await bookRide(bookingData);
      
      if (result) {
        setSuccess(true);
        // Call the success callback if provided
        if (onSuccess) {
          onSuccess(result);
        }
        
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to book ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    return (ride.pricePerSeat || 0) * seats;
  };

  return (
    <div className="booking-modal-overlay">
      <div className="booking-modal">
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="booking-modal-header">
          <h2>Book Your Ride</h2>
          <div className="ride-summary">
            <div className="route">
              <span className="city">{ride.pickupPoint?.city}</span>
              <span className="arrow">→</span>
              <span className="city">{ride.dropoffPoint?.city}</span>
            </div>
            <div className="details">
              <span className="date">{new Date(ride.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              <span className="time">{ride.time}</span>
              <span className="price">₹{ride.pricePerSeat} per seat</span>
            </div>
          </div>
        </div>
        
        {success ? (
          <div className="success-message">
            <h3>Booking Successful!</h3>
            <p>Your ride has been booked successfully. The ride details have been sent to your email.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="booking-form">
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
            
            <button 
              type="submit" 
              className="book-btn"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
