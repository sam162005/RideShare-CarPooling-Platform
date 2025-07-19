import React, { useState } from 'react';
import { registerUser } from '../api/auth';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser, FaCar, FaUserCircle } from 'react-icons/fa';
import AuthHeader from '../components/AuthHeader';
import './Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clear any existing user data first to prevent data leakage between accounts
      localStorage.clear();
      sessionStorage.clear();
      
      const data = await registerUser(name, email, password);
      console.log('Registered user:', data);
      
      // Show success message
      alert('Registration successful! Please login with your new account.');
      
      // After registration, redirect to login
      window.location.href = '/login';
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="login-page">
      {/* Use our reusable AuthHeader component */}
      <AuthHeader />

      <div className="auth-container">
        <div className="auth-content">
          <div className="auth-banner">
            <div className="banner-content">
              <FaCar className="banner-icon" />
              <h1>RideShare</h1>
              <p>Your journey, our priority</p>
              <div className="banner-features">
                <div className="feature"><span>✓</span> Save on travel costs</div>
                <div className="feature"><span>✓</span> Reduce carbon footprint</div>
                <div className="feature"><span>✓</span> Connect with travelers</div>
              </div>
            </div>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-header">
              <FaUserCircle className="user-icon" />
              <h2>Create an Account</h2>
              <p>Join and start your carpooling journey today!</p>
            </div>
            
            <div className="input-group">
              <div className="input-icon"><FaUser /></div>
              <input
                type="text"
                placeholder="Enter Your Name"
                required
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="input-group">
              <div className="input-icon"><FaEnvelope /></div>
              <input
                type="email"
                placeholder="Enter Email Address"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="input-group">
              <div className="input-icon"><FaLock /></div>
              <input
                type="password"
                placeholder="Create Password"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button type="submit" className="submit-btn">Create Account</button>
            
            {error && <p className="error-message">{error}</p>}
            
            <div className="auth-footer">
              <p>Already have an account? <a href="/login" onClick={(e) => {
                e.preventDefault();
                // Clear any existing user data before redirecting to login
                localStorage.clear();
                sessionStorage.clear();
                // Add a special parameter to indicate a fresh login is needed
                window.location.href = '/login?fresh=true';
              }}>Login</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
