import React from 'react';
import './Home.css';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import safetyImg from '../assets/safety-illustration.jpg';
import heroimg from '../assets/herobg.png';

import {
  FaUserCircle,
  FaSearch,
  FaPlus,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaCar,
  FaUserCheck,
  FaBolt
} from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Directly navigate to find ride page
    navigate('/find-ride');
  };

  return (
    <div className="home-wrapper">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <img src= {logoImg} alt="Logo" className="logo-img" />
          <span>RideShare</span>
        </div>
        <nav className="nav">
          <a href="#">Search</a>
          <a href="#">Publish a ride <FaPlus /></a>
          <Link to="/register">
            <FaUserCircle className="profile-icon" />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
{/* Hero Section */}
<section className="hero">
  <div className="hero-image">
    <img src={heroimg} alt="Ride sharing illustration" />
  </div>
  <div className="ride-search-bar">
    <div className="input-group"> 
      <FaMapMarkerAlt />
      <input type="text" placeholder="Leaving from" />
    </div>
    <div className="input-group">
      <FaMapMarkerAlt />
      <input type="text" placeholder="Going to" />
    </div>
    <div className="input-group">
      <FaCalendarAlt />
      <input type="date" />
    </div>
    <div className="input-group">
      <FaUser />
      <select>
        <option>1 passenger</option>
        <option>2 passengers</option>
        <option>3 passengers</option>
      </select>
    </div>
    <button onClick={handleSearch}>
      <FaSearch /> Search
    </button>
  </div>
</section>



      {/* Info Boxes */}
      <section className="info-section">
        <div className="info-box">
          <FaCar className="info-icon" />
          <h3>Your pick of rides at low prices</h3>
          <p>No matter where you're going, find the perfect ride from a wide range of destinations and low prices.</p>
        </div>
        <div className="info-box">
          <FaUserCheck className="info-icon" />
          <h3>Trust who you travel with</h3>
          <p>We verify each member and partner so you know who you're travelling with.</p>
        </div>
        <div className="info-box">
          <FaBolt className="info-icon" />
          <h3>Scroll, click, tap and go!</h3>
          <p>Thanks to great tech, you can book a ride close to you in just minutes.</p>
        </div>
      </section>

      <section className="safety-section">
  <div className="safety-content">
    <div className="safety-image">
      <img src={safetyImg} alt="Safety illustration" />
    </div>
    <div className="safety-text">
      <h2>Help us keep you safe from scams</h2>
      <p>
        At BlaBlaCar, we're working hard to make our platform as secure as it can be.
        But when scams do happen, we want you to know exactly how to avoid and report them.
        Follow our tips to help us keep you safe.
      </p>
      <form>
        <button className="learn-more-btn">Learn more</button>
      </form>
    </div>
  </div>
</section>


      {/* Help Centre Section */}
      <section className="help-centre">
        <h2 className="help-heading">Carpool Help Centre</h2>
        <div className="help-columns">
          <div className="help-col">
            <div className="help-item">
              <h4>How do I book a carpool ride?</h4>
              <p>You can book a carpool ride on our mobile app, or on blablacar.in. Simply search for your destination, choose the date you want to travel and pick the carpool that suits you best! </p>
            </div>
            <div className="help-item">
              <h4>How do I cancel my carpool ride?</h4>
              <p>If you have a change of plans, you can always cancel your carpool ride from the 'Your rides' section of our app. The sooner you cancel, the better. That way the driver has time to accept new passengers. </p>
            </div>
            <div className="help-item">
              <h4>How much does a carpool ride cost?</h4>
              <p>The costs of a carpool ride can vary greatly, and depend on factors like distance, time of departure, the demand of that ride and more. It is also up to the driver to decide how much to charge.</p>
            </div>
          </div>
          <div className="help-col">
            <div className="help-item">
              <h4>How do I publish a carpool ride?</h4>
              <p>Offering a carpool ride on BlaBlaCar is easy. To publish your ride, use our mobile app or blablacar.in. Indicate your departure and arrival points, the date and time of your departure, how many seats you want to offer. </p>
            </div>
            <div className="help-item">
              <h4>What are the benefits of travelling by carpool?</h4>
              <p>There are multiple advantages to carpooling, over other means of transport. Travelling by carpool is usually more affordable, especially for longer distances. Carpooling is also more eco-friendly. </p>
            </div>
            <div className="help-item">
              <h4>How do I start carpooling?</h4>
              <p>Carpooling with BlaBlaCar is super easy, and free! Simply sign up for an account and tell us some basic details about yourself. Once you have a BlaBlaCar account, you can start booking or publishing rides. </p>
            </div>
          </div>
        </div>
        <div className="help-button-centered">
          <button className="help-button">Read our Help Centre</button>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-column">
            <h4>Top carpool routes</h4>
            <ul>
              <li>Delhi → Chandigarh</li>
              <li>Mumbai → Pune</li>
              <li>Kanpur → Lucknow</li>
              <li>Bengaluru → Chennai</li>
              <li>Pune → Mumbai</li>
              <li>All carpool routes</li>
              <li>All carpool destinations</li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>About</h4>
            <ul>
              <li>How It Works</li>
              <li>About Us</li>
              <li>Help Centre</li>
              <li>Press</li>
              <li>We're Hiring!</li>
            </ul>
          </div>
          <div className="footer-column">
            <button className="lang-btn">Language - English (India)</button>
            <div className="social-icons">
              <FaFacebookF />
              <FaTwitter />
              <FaYoutube />
              <FaInstagram />
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <a href="#">Terms and Conditions</a>
          <div className="footer-brand">
            <img src= {logoImg} alt="Logo" className="logo-img" />
            <span>RideShare, 2025 ©</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
