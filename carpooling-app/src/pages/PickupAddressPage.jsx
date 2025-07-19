import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FaSearch, FaMapMarkerAlt, FaClock, FaHistory } from 'react-icons/fa';
import { cityPickupPoints } from '../data/pickupPoints';
import './PickupAddressPage.css';

const PickupAddressPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { rideData } = location.state || {};
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [recentLocations] = useState([
    { name: 'Connaught Place', address: 'Central Delhi', city: 'New Delhi' },
    { name: 'Dadar Station', address: 'Dadar West', city: 'Mumbai' },
    { name: 'MG Road Metro', address: 'MG Road', city: 'Bangalore' },
    { name: 'Gandhipuram Bus Stand', address: 'Gandhipuram', city: 'Coimbatore' }
  ]);

  // Get list of available cities
  const availableCities = Object.keys(cityPickupPoints);

  useEffect(() => {
    if (selectedCity) {
      const points = cityPickupPoints[selectedCity] || [];
      setFilteredPoints(
        points.filter(point =>
          point.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          point.address.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [selectedCity, searchQuery]);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setSearchQuery('');
  };

  const handlePointSelect = (point) => {
    // Add a console log to debug the navigation
    console.log('Navigating to dropoff page with pickup point:', point);
    
    // Ensure we're passing the correct data
    const updatedRideData = {
      ...rideData,
      pickupPoint: {
        ...point,
        city: selectedCity || point.city // Use point.city as fallback for recent locations
      }
    };
    
    // Navigate to the dropoff page
    navigate('/publish-ride/dropoff', {
      state: updatedRideData
    });
  };

  return (
    <div className="pickup-address-page">
      <Header />
      <div className="pickup-address-container">
        <div className="search-section">
          <div className="city-select">
            <h3>Select City</h3>
            <div className="city-grid">
              {availableCities.map(city => (
                <button
                  key={city}
                  className={`city-button ${selectedCity === city ? 'selected' : ''}`}
                  onClick={() => handleCitySelect(city)}
                >
                  <FaMapMarkerAlt />
                  {city}
                </button>
              ))}
            </div>
          </div>

          {selectedCity && (
            <div className="pickup-points">
              <div className="search-bar">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search pickup points"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="points-grid">
                {filteredPoints.map((point, index) => (
                  <div
                    key={index}
                    className="point-card"
                    onClick={() => handlePointSelect(point)}
                  >
                    <div className="point-icon">
                      <FaMapMarkerAlt />
                    </div>
                    <div className="point-info">
                      <h4>{point.name}</h4>
                      <p>{point.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!selectedCity && (
            <div className="recent-locations">
              <h3>
                <FaHistory /> Recent Locations
              </h3>
              <div className="recent-grid">
                {recentLocations.map((location, index) => (
                  <div
                    key={index}
                    className="recent-card"
                    onClick={() => {
                      handleCitySelect(location.city);
                      handlePointSelect(location);
                    }}
                  >
                    <div className="recent-icon">
                      <FaClock />
                    </div>
                    <div className="recent-info">
                      <h4>{location.name}</h4>
                      <p>{location.city}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PickupAddressPage;
