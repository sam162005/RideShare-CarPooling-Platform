import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FaMapMarkerAlt, FaArrowLeft, FaArrowRight, FaClock, FaRoad } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './RouteSelectionPage.css';

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom marker icons
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to fit map bounds to markers
function FitBounds({ positions }) {
  const map = useMap();
  
  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, positions]);
  
  return null;
}

const RouteSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const rideData = location.state || {};
  const { pickupPoint, dropoffPoint } = rideData;
  
  // State for selected route
  const [selectedRoute, setSelectedRoute] = useState(0);
  
  // Map reference and state
  const mapRef = useRef(null);
  const [routeOptions, setRouteOptions] = useState([]);
  const [mapPositions, setMapPositions] = useState([]);
  
  // Default center position if coordinates are not available
  const defaultCenter = [12.9767, 77.5713]; // Bangalore
  
  useEffect(() => {
    // Log the received data
    console.log('RouteSelectionPage received data:', rideData);
    
    if (pickupPoint && dropoffPoint) {
      // Extract coordinates or use defaults
      const pickupCoords = pickupPoint.coordinates || [
        // Default coordinates based on city
        pickupPoint.city === 'New Delhi' ? 28.6139 : 
        pickupPoint.city === 'Mumbai' ? 19.0760 :
        pickupPoint.city === 'Chennai' ? 13.0827 :
        pickupPoint.city === 'Coimbatore' ? 11.0168 :
        pickupPoint.city === 'Hyderabad' ? 17.3850 : 12.9716, // Default to Bangalore
        
        pickupPoint.city === 'New Delhi' ? 77.2090 :
        pickupPoint.city === 'Mumbai' ? 72.8777 :
        pickupPoint.city === 'Chennai' ? 80.2707 :
        pickupPoint.city === 'Coimbatore' ? 76.9558 :
        pickupPoint.city === 'Hyderabad' ? 78.4867 : 77.5946
      ];
      
      const dropoffCoords = dropoffPoint.coordinates || [
        // Default coordinates based on city
        dropoffPoint.city === 'New Delhi' ? 28.6139 : 
        dropoffPoint.city === 'Mumbai' ? 19.0760 :
        dropoffPoint.city === 'Chennai' ? 13.0827 :
        dropoffPoint.city === 'Coimbatore' ? 11.0168 :
        dropoffPoint.city === 'Hyderabad' ? 17.3850 : 12.9716, // Default to Bangalore
        
        dropoffPoint.city === 'New Delhi' ? 77.2090 :
        dropoffPoint.city === 'Mumbai' ? 72.8777 :
        dropoffPoint.city === 'Chennai' ? 80.2707 :
        dropoffPoint.city === 'Coimbatore' ? 76.9558 :
        dropoffPoint.city === 'Hyderabad' ? 78.4867 : 77.5946
      ];
      
      // Set map positions for bounds
      setMapPositions([
        [pickupCoords[0], pickupCoords[1]],
        [dropoffCoords[0], dropoffCoords[1]]
      ]);
      
      // Generate route options based on pickup and dropoff points
      // We'll create 3 different routes with variations
      const generateRouteVariation = (variation) => {
        // Calculate a midpoint with some variation
        const midLat = (pickupCoords[0] + dropoffCoords[0]) / 2 + (Math.random() - 0.5) * 0.02 * variation;
        const midLng = (pickupCoords[1] + dropoffCoords[1]) / 2 + (Math.random() - 0.5) * 0.02 * variation;
        
        // Calculate distance (rough approximation)
        const R = 6371; // Earth's radius in km
        const dLat = (dropoffCoords[0] - pickupCoords[0]) * Math.PI / 180;
        const dLon = (dropoffCoords[1] - pickupCoords[1]) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                 Math.cos(pickupCoords[0] * Math.PI / 180) * Math.cos(dropoffCoords[0] * Math.PI / 180) * 
                 Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        // Add variation to distance
        const routeDistance = (distance * (1 + (Math.random() - 0.5) * 0.1 * variation)).toFixed(1);
        
        // Calculate time (assuming average speed of 30 km/h)
        const timeInMinutes = Math.round(routeDistance * 60 / 30);
        
        return {
          id: variation,
          time: `${timeInMinutes} min`,
          distance: `${routeDistance} km`,
          toll: variation === 3, // Third route has toll
          path: [
            [pickupCoords[0], pickupCoords[1]],
            [midLat, midLng],
            [dropoffCoords[0], dropoffCoords[1]]
          ]
        };
      };
      
      const routes = [
        generateRouteVariation(1),
        generateRouteVariation(2),
        generateRouteVariation(3)
      ];
      
      setRouteOptions(routes);
    }
  }, [pickupPoint, dropoffPoint, rideData]);
  
  const handleRouteSelect = (index) => {
    setSelectedRoute(index);
  };
  
  const handleBackClick = () => {
    navigate(-1);
  };
  
  const handleContinueClick = () => {
    navigate('/passenger-selection', {
      state: {
        ...rideData,
        selectedRoute: routeOptions[selectedRoute]
      }
    });
  };
  
  // Function to render the map with Leaflet
  const renderMap = () => {
    if (!pickupPoint || !dropoffPoint || routeOptions.length === 0) {
      return (
        <div className="map-loading">
          <p>Loading map...</p>
        </div>
      );
    }
    
    // Get the pickup and dropoff coordinates
    const pickupCoords = mapPositions[0];
    const dropoffCoords = mapPositions[1];
    
    // Get the center point between pickup and dropoff
    const centerLat = (pickupCoords[0] + dropoffCoords[0]) / 2;
    const centerLng = (pickupCoords[1] + dropoffCoords[1]) / 2;
    
    // Route colors for different options
    const routeColors = ['#007aff', '#34c759', '#ff9500'];
    
    return (
      <div className="map-wrapper">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Pickup marker */}
          <Marker 
            position={pickupCoords} 
            icon={pickupIcon}
          >
            <Popup>
              <strong>{pickupPoint.name}</strong><br />
              {pickupPoint.address}, {pickupPoint.city}
            </Popup>
          </Marker>
          
          {/* Dropoff marker */}
          <Marker 
            position={dropoffCoords} 
            icon={dropoffIcon}
          >
            <Popup>
              <strong>{dropoffPoint.name}</strong><br />
              {dropoffPoint.address}, {dropoffPoint.city}
            </Popup>
          </Marker>
          
          {/* Route lines */}
          {routeOptions.map((route, index) => (
            <Polyline
              key={route.id}
              positions={route.path}
              color={routeColors[index % routeColors.length]}
              weight={selectedRoute === index ? 6 : 3}
              opacity={selectedRoute === index ? 0.8 : 0.5}
            />
          ))}
          
          {/* Fit map to markers */}
          <FitBounds positions={mapPositions} />
        </MapContainer>
      </div>
    );
  };
  
  if (!pickupPoint || !dropoffPoint) {
    return (
      <div className="route-selection-page">
        <Header />
        <div className="route-selection-container">
          <div className="route-options-panel">
            <div className="route-options-header">
              <h2>Route Selection</h2>
              <p>Missing pickup or dropoff information. Please go back and select your locations.</p>
            </div>
            <div className="action-buttons">
              <button className="back-button" onClick={handleBackClick}>
                <FaArrowLeft /> Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="route-selection-page">
      <Header />
      <div className="route-selection-container">
        <div className="route-options-panel">
          <div className="route-options-header">
            <h2>What is your route?</h2>
            <p>Select the best route for your journey</p>
          </div>
          
          <div className="route-options-list">
            {routeOptions.map((route, index) => (
              <div 
                key={route.id}
                className={`route-option ${selectedRoute === index ? 'selected' : ''}`}
                onClick={() => handleRouteSelect(index)}
              >
                <div className="route-option-header">
                  <div className="route-option-time">
                    {route.time} {route.toll ? '' : '- No tolls'}
                  </div>
                  <div className="route-option-distance">
                    {route.distance}
                  </div>
                </div>
                
                <div className="route-option-details">
                  <div className="route-timeline">
                    <div className="route-point start"></div>
                    <div className="route-line"></div>
                    <div className="route-point end"></div>
                  </div>
                  
                  <div className="route-info">
                    <div className="route-location">
                      <div className="route-location-name">{pickupPoint.name}</div>
                      <div className="route-location-address">{pickupPoint.address}</div>
                    </div>
                    
                    <div className="route-location">
                      <div className="route-location-name">{dropoffPoint.name}</div>
                      <div className="route-location-address">{dropoffPoint.address}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="map-container">
          {renderMap()}
        </div>
      </div>
      
      {/* Fixed bottom action bar */}
      <div className="fixed-action-bar">
        <div className="action-buttons-container">
          <button className="back-button" onClick={handleBackClick}>
            <FaArrowLeft /> Back
          </button>
          <button className="continue-button" onClick={handleContinueClick}>
            Continue <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteSelectionPage;
