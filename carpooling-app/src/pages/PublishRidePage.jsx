import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FaExchangeAlt, FaUser, FaArrowRight, FaEnvelope, FaFacebook } from 'react-icons/fa';
import './PublishRidePage.css';

const PublishRidePage = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [passengers, setPassengers] = useState(2);
  const [activeSection, setActiveSection] = useState(0);
  const navigate = useNavigate();

  const handlePublish = () => {
    // Navigate to pickup address page with ride data
    navigate('/publish-ride/pickup', {
      state: {
        rideData: {
          from,
          to,
          passengers
        }
      }
    });
  };

  const swapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <div className="publish-ride-wrapper">
      <Header />

      <div className="publish-ride-container">
        {/* Top Banner Section */}
        <div className="publish-banner">
          <h1>Become a RideShare driver and save on travel costs by sharing your ride with passengers.</h1>
          
          <div className="ride-form-container">
            <div className="ride-form fade-in-up">
              <div className="location-inputs">
                <div className="input-group slide-in-left">
                  <input
                    type="text"
                    placeholder="Leaving from"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
                
                <button className="swap-btn" onClick={swapLocations}>
                  <FaExchangeAlt />
                </button>
                
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Going to"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="passenger-selector">
                <FaUser />
                <div className="passenger-input">
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={passengers}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) {
                        setPassengers(Math.min(8, Math.max(1, value)));
                      }
                    }}
                  />
                  <span>passengers</span>
                </div>
                <div className="passenger-controls">
                  <button onClick={() => setPassengers(Math.max(1, passengers - 1))}>−</button>
                  <button onClick={() => setPassengers(Math.min(8, passengers + 1))}>+</button>
                </div>
              </div>
              
              <div className="savings-info">
                <h3>Save up to ₹1,160 on your first ride.</h3>
              </div>
              
              <button className="publish-btn bounce-in" onClick={handlePublish}>
                Publish a ride
              </button>
            </div>
          </div>
        </div>
        
        {/* Drive Share Save Section */}
        <div className="drive-share-save">
          <h2>Drive. Share. Save.</h2>
          
          <div className="benefits-container">
            <div className="benefit-item">
              <h3>Drive.</h3>
              <p>Keep your plans! Hit the road just as you anticipated and make the most of your vehicle's empty seats.</p>
            </div>
            
            <div className="benefit-item">
              <h3>Share.</h3>
              <p>Travel with good company. Share a memorable ride with travellers from all walks of life.</p>
            </div>
            
            <div className="benefit-item">
              <h3>Save.</h3>
              <p>Tolls, petrol, electricity... Easily divvy up all the costs with other passengers.</p>
            </div>
          </div>
          
          <div className="stats-container">
            <div className="stat-item">
              <h3>Join 21 million</h3>
              <p>drivers already using RideShare</p>
            </div>
            
            <div className="stat-item">
              <h3>More than 100 million</h3>
              <p>RideShare members worldwide</p>
            </div>
            
            <div className="stat-item">
              <h3>Over 40 million</h3>
              <p>rides shared per year</p>
            </div>
          </div>
          
          <div className="testimonial-container">
            <div className="testimonial">
              <p>"5 years of using RideShare, dozens of journeys, as many meetings and exchanges, not a single disappointment. THANK YOU!"</p>
              <span className="testimonial-author">Simon</span>
            </div>
          </div>
        </div>
        
        {/* How It Works Section */}
        <div className="how-it-works">
          <h2>Publish your ride in just minutes</h2>
          
          <div className="steps-container">
            <div className="steps-illustration">
              <img src="/phone-illustration.png" alt="Phone with app" />
            </div>
            
            <div className="steps-list">
              <div className="step-item">
                <div className="step-icon">
                  <FaUser />
                </div>
                <div className="step-content">
                  <h3>Create a RideShare account</h3>
                  <p>Add your profile picture, a few words about you and your phone number to increase trust between members.</p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-icon">
                  <FaArrowRight />
                </div>
                <div className="step-content">
                  <h3>Publish your ride</h3>
                  <p>Indicate departure and arrival points, the date of the ride and check our recommended price to increase your chances of getting your first passengers and ratings.</p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-icon">
                  <FaEnvelope />
                </div>
                <div className="step-content">
                  <h3>Accept booking requests</h3>
                  <p>Review passenger profiles and accept their requests to ride with you. That's how easy it is to start saving on travel costs!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Support Section */}
        <div className="support-section">
          <h2>We're here every step of the way</h2>
          
          <div className="support-items">
            <div className="support-item">
              <div className="support-icon">
                <FaEnvelope />
              </div>
              <h3>At your service 24/7</h3>
            </div>
            
            <div className="support-item">
              <div className="support-icon">
                <FaUser />
              </div>
              <h3>RideShare at your side</h3>
            </div>
            
            <div className="support-item">
              <div className="support-icon">
                <FaFacebook />
              </div>
              <h3>100% secure information</h3>
            </div>
          </div>
        </div>
        
        {/* Help Centre Section */}
        <div className="help-centre">
          <h2>Everything you need as a driver, in our Help Centre</h2>
          
          <div className="faq-container">
            <div className="faq-column">
              <div className="faq-item">
                <h3>How do I set the passenger contribution for my ride?</h3>
                <p>We recommend a contribution per passenger on your rides. These suggestions help you set fair contributions for your rides (those most likely to get your seats filled), but can still be adjusted...</p>
                <a href="#" className="read-more">Read more</a>
              </div>
              
              <div className="faq-item">
                <h3>What should I do if there's an error with my ride?</h3>
                <p>You should edit your ride as soon as you spot the error.</p>
                <p>If you can't edit your ride because passengers have already...</p>
                <a href="#" className="read-more">Read more</a>
              </div>
            </div>
            
            <div className="faq-column">
              <div className="faq-item">
                <h3>When do I get my money?</h3>
                <p>You'll get your money 48 hours after the ride if you travelled as planned. You'll get your money 1 to 5 weekdays (not counting weekends and holidays) after we send it...</p>
                <a href="#" className="read-more">Read more</a>
              </div>
              
              <div className="faq-item">
                <h3>How do I cancel a carpool ride as a driver of a ride?</h3>
                <p>It only takes a minute to cancel a listed ride. However, if a driver cannot fulfill a ride that has been already booked, it is their responsibility to cancel in a timely manner to allow the passenge...</p>
                <a href="#" className="read-more">Read more</a>
              </div>
            </div>
          </div>
          
          <button className="see-more-btn">See more answers</button>
        </div>
        
        {/* Footer Publish Button */}
        <div className="footer-publish">
          <button className="publish-btn" onClick={handlePublish}>
            Publish a ride
          </button>
        </div>
        
        {/* Footer Links */}
        <div className="footer-links">
          <div className="footer-column">
            <h3>Top carpool routes</h3>
            <ul>
              <li><a href="#">Delhi → Chandigarh</a></li>
              <li><a href="#">Mumbai → Pune</a></li>
              <li><a href="#">Bangalore → Chennai</a></li>
              <li><a href="#">Hyderabad → Bangalore</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>About</h3>
            <ul>
              <li><a href="#">How It Works</a></li>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Help Centre</a></li>
              <li><a href="#">Press</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <div className="language-selector">
              <span>Language - English (India)</span>
            </div>
            <div className="social-links">
              <a href="#"><FaFacebook /></a>
              <a href="#">X</a>
              <a href="#">YT</a>
              <a href="#">IG</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishRidePage;
