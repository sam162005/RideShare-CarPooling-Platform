import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaRupeeSign, FaCheck } from 'react-icons/fa';
import { publishRide } from '../services/ridesService';
import './RideSummaryPage.css';

const RideSummaryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const rideData = location.state || {};
  
  const handlePublishRide = async () => {
    try {
      console.log('Publishing ride with data:', rideData);
      
      // Wait for the ride to be published to MongoDB
      const publishedRide = await publishRide(rideData);
      console.log('Ride published successfully:', publishedRide);
      
      // Navigate to success page with the published ride data
      navigate('/ride-published', { state: publishedRide });
    } catch (error) {
      console.error('Error publishing ride:', error);
      
      // Create a fallback ride object in case of error
      const fallbackRide = {
        ...rideData,
        id: `fallback_${Date.now()}`,
        publishedAt: new Date().toISOString(),
        status: 'active'
      };
      
      // Store in localStorage as a backup
      const rides = JSON.parse(localStorage.getItem('carpooling_rides') || '[]');
      rides.unshift(fallbackRide);
      localStorage.setItem('carpooling_rides', JSON.stringify(rides));
      
      // Navigate with the fallback ride data
      navigate('/ride-published', { state: fallbackRide });
    }
  };
  
  return (
    <div className="ride-summary-page">
      <Header />
      <div className="ride-summary-container">
        <div className="ride-summary-card">
          <h1 className="ride-summary-title">Ride Summary</h1>
          
          <div className="summary-section">
            <div className="summary-item">
              <div className="summary-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="summary-content">
                <h3>Route</h3>
                <p>
                  <strong>From:</strong> {rideData.pickupPoint?.name}, {rideData.pickupPoint?.city}<br />
                  <strong>To:</strong> {rideData.dropoffPoint?.name}, {rideData.dropoffPoint?.city}
                </p>
                {rideData.selectedRoute && (
                  <p className="route-details">
                    {rideData.selectedRoute.distance} • {rideData.selectedRoute.time}
                    {rideData.selectedRoute.toll && ' • Toll road'}
                  </p>
                )}
              </div>
            </div>
            
            <div className="summary-item">
              <div className="summary-icon">
                <FaCalendarAlt />
              </div>
              <div className="summary-content">
                <h3>Date & Time</h3>
                <p>{new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>
            
            <div className="summary-item">
              <div className="summary-icon">
                <FaUsers />
              </div>
              <div className="summary-content">
                <h3>Passengers</h3>
                <p>{rideData.passengerCount || 3} seats available</p>
                {rideData.passengerOptions?.maxBackSeat && (
                  <p className="passenger-option">Max. 2 in the back</p>
                )}
              </div>
            </div>
            
            <div className="summary-item">
              <div className="summary-icon">
                <FaRupeeSign />
              </div>
              <div className="summary-content">
                <h3>Price</h3>
                <p>₹{rideData.pricePerSeat || 10} per seat</p>
                <p className="price-total">Total potential earnings: ₹{(rideData.pricePerSeat || 10) * (rideData.passengerCount || 3)}</p>
              </div>
            </div>
          </div>
          
          <button 
            className="publish-button"
            onClick={handlePublishRide}
          >
            Publish Ride
          </button>
        </div>
      </div>
    </div>
  );
};

export default RideSummaryPage;
