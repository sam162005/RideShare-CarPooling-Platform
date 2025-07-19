import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FaMinus, FaPlus, FaRobot } from 'react-icons/fa';
import './PriceSelectionPage.css';

const PriceSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const rideData = location.state || {};
  
  // State for price and recommendations
  const [price, setPrice] = useState(10);
  const [recommendedMin, setRecommendedMin] = useState(10);
  const [recommendedMax, setRecommendedMax] = useState(20);
  const [isAIRecommendation, setIsAIRecommendation] = useState(false);
  
  // Calculate recommended price based on distance and other factors
  useEffect(() => {
    if (rideData.selectedRoute) {
      // Extract distance from the selected route
      const distanceStr = rideData.selectedRoute.distance;
      const distance = parseFloat(distanceStr.replace(/[^0-9.]/g, ''));
      
      // Advanced AI-based price calculation algorithm
      const calculateRecommendedPrice = (distance) => {
        // Base price calculation with progressive scaling
        // - Short trips (0-10km): Higher per-km rate
        // - Medium trips (10-50km): Medium per-km rate
        // - Long trips (50km+): Lower per-km rate for economy of scale
        let basePricePerKm;
        if (distance <= 10) {
          basePricePerKm = 7; // Higher rate for short distances
        } else if (distance <= 50) {
          basePricePerKm = 5; // Medium rate for medium distances
        } else {
          basePricePerKm = 4; // Lower rate for long distances
        }
        
        // Calculate base price with minimum threshold
        let baseRecommendedPrice = Math.max(10, Math.round(distance * basePricePerKm / 5) * 5);
        
        // Apply intelligent pricing factors
        const pricingFactors = {
          // Route characteristics
          toll: rideData.selectedRoute.toll ? 1.15 : 1, // 15% premium for toll routes
          
          // Time-based factors
          timeOfDay: getTimeOfDayFactor(new Date().getHours()),
          weekday: getWeekdayFactor(new Date().getDay()),
          
          // Location factors
          cityPair: getCityFactor(rideData.pickupPoint?.city, rideData.dropoffPoint?.city),
          
          // Market dynamics
          demand: getSimulatedDemandFactor(distance, rideData.pickupPoint?.city),
          competition: 0.95 + (Math.random() * 0.1), // Simulated competition factor
          
          // Passenger count factor - more passengers = slightly lower per-seat price
          passengerCount: rideData.passengerCount ? (1 - (rideData.passengerCount - 1) * 0.02) : 1
        };
        
        // Log factors for debugging
        console.log('AI Price Factors:', pricingFactors);
        
        // Apply all factors to the base price
        let adjustedPrice = baseRecommendedPrice;
        Object.values(pricingFactors).forEach(factor => {
          adjustedPrice *= factor;
        });
        
        // Round to nearest 5
        const roundedPrice = Math.round(adjustedPrice / 5) * 5;
        
        // Set min and max range (±20% from the calculated price)
        const min = Math.max(5, Math.floor(roundedPrice * 0.8 / 5) * 5);
        const max = Math.ceil(roundedPrice * 1.2 / 5) * 5;
        
        return {
          min,
          recommended: roundedPrice,
          max
        };
      };
      
      // Get time of day factor - prices vary by time of day
      const getTimeOfDayFactor = (hour) => {
        // Early morning (5-8 AM): +10% (commute hours)
        if (hour >= 5 && hour < 8) return 1.1;
        // Morning rush (8-10 AM): +20% (peak demand)
        if (hour >= 8 && hour < 10) return 1.2;
        // Daytime (10 AM-4 PM): normal pricing
        if (hour >= 10 && hour < 16) return 1.0;
        // Evening rush (4-7 PM): +20% (peak demand)
        if (hour >= 16 && hour < 19) return 1.2;
        // Evening (7-11 PM): +10% (moderate demand)
        if (hour >= 19 && hour < 23) return 1.1;
        // Late night (11 PM-5 AM): +25% (limited availability)
        return 1.25;
      };
      
      // Get weekday factor - weekends vs weekdays
      const getWeekdayFactor = (day) => {
        // Weekend (Saturday, Sunday): +15%
        if (day === 0 || day === 6) return 1.15;
        // Friday: +10%
        if (day === 5) return 1.1;
        // Weekdays: normal pricing
        return 1.0;
      };
      
      // Get city factor based on city tier and popularity
      const getCityFactor = (pickupCity, dropoffCity) => {
        // City tiers based on size and demand
        const cityTiers = {
          'Mumbai': 1.3,      // Tier 1+
          'New Delhi': 1.3,   // Tier 1+
          'Bangalore': 1.25,  // Tier 1+
          'Chennai': 1.2,     // Tier 1
          'Hyderabad': 1.2,   // Tier 1
          'Coimbatore': 1.1,  // Tier 2
          'Pune': 1.15,       // Tier 2
          'Jaipur': 1.1,      // Tier 2
          'Ahmedabad': 1.1,   // Tier 2
          'Kolkata': 1.2      // Tier 1
        };
        
        // Get city factors or default to 1.0 for smaller cities
        const pickupFactor = cityTiers[pickupCity] || 1.0;
        const dropoffFactor = cityTiers[dropoffCity] || 1.0;
        
        // Calculate combined factor
        return (pickupFactor + dropoffFactor) / 2;
      };
      
      // Simulate demand based on distance and city
      const getSimulatedDemandFactor = (distance, city) => {
        // Base demand factor
        let demandFactor = 1.0;
        
        // Popular distance ranges have higher demand
        if (distance >= 5 && distance <= 15) {
          demandFactor *= 1.15; // Short commute distances are popular
        } else if (distance >= 50 && distance <= 150) {
          demandFactor *= 1.1; // Intercity medium distances are popular
        }
        
        // Add some randomness to simulate market fluctuations
        demandFactor *= (0.95 + (Math.random() * 0.1));
        
        return demandFactor;
      };
      
      // Calculate price recommendation
      const recommendation = calculateRecommendedPrice(distance);
      
      // Update state with AI recommendation
      setRecommendedMin(recommendation.min);
      setRecommendedMax(recommendation.max);
      setPrice(recommendation.recommended);
      setIsAIRecommendation(true);
    }
  }, [rideData.selectedRoute, rideData.pickupPoint, rideData.dropoffPoint]);
  
  const handleDecrement = () => {
    if (price > 5) {
      setPrice(price - 5);
    }
  };
  
  const handleIncrement = () => {
    if (price < 100) {
      setPrice(price + 5);
    }
  };
  
  const handleContinue = () => {
    // Navigate to the ride summary page with updated ride data
    navigate('/ride-summary', {
      state: {
        ...rideData,
        pricePerSeat: price
      }
    });
  };
  
  return (
    <div className="price-selection-page">
      <Header />
      <div className="price-selection-container">
        <div className="price-selection-card">
          <h1 className="price-selection-title">
            Set your price per seat
          </h1>
          
          <div className="price-counter">
            <button 
              className="counter-button"
              onClick={handleDecrement}
              disabled={price <= 5}
            >
              <FaMinus />
            </button>
            <div className="price-amount">
              <span className="rupee-symbol">₹</span>
              <span className="price-value">{price}</span>
            </div>
            <button 
              className="counter-button"
              onClick={handleIncrement}
              disabled={price >= 100}
            >
              <FaPlus />
            </button>
          </div>
          
          <div className="price-recommendation">
            <div className="recommendation-badge">
              {isAIRecommendation ? (
                <span className="ai-recommendation">
                  <FaRobot className="ai-icon" /> AI Recommended price: ₹{recommendedMin} - ₹{recommendedMax}
                </span>
              ) : (
                <span>Recommended price: ₹{recommendedMin} - ₹{recommendedMax}</span>
              )}
            </div>
            <p className="recommendation-text">
              {price >= recommendedMin && price <= recommendedMax
                ? "Perfect price for this ride! You'll get passengers in no time."
                : price < recommendedMin
                  ? "This price is lower than recommended. You might earn less than optimal."
                  : "This price is higher than recommended. It might take longer to find passengers."}
            </p>
          </div>
          
          <button 
            className="continue-button"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceSelectionPage;
