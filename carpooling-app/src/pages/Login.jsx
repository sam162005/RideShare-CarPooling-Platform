import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginUser } from '../api/auth';
import { FaEnvelope, FaLock, FaCar, FaUserCircle } from 'react-icons/fa';
import AuthHeader from '../components/AuthHeader';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user is already logged in
  useEffect(() => {
    // Check if this is a fresh login request (from Register page)
    const urlParams = new URLSearchParams(window.location.search);
    const isFreshLogin = urlParams.get('fresh') === 'true';
    
    // If it's a fresh login request, clear any existing tokens
    if (isFreshLogin) {
      console.log('Fresh login requested, clearing any existing tokens');
      localStorage.clear();
      sessionStorage.clear();
      // Remove the query parameter to avoid issues on refresh
      window.history.replaceState({}, document.title, '/login');
      return; // Skip the auto-redirect
    }
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      // If user is already logged in, redirect to the intended page or find-ride
      const from = location.state?.from || '/find-ride';
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const data = await loginUser(email, password);
      console.log('Logged in user:', data);

      // Clear any existing user data first
      localStorage.clear();
      sessionStorage.clear();
      
      // Store auth data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userId', data.user._id); // Store user ID separately for verification

      // Force direct navigation to find-ride page with page reload
      console.log('Redirecting to find-ride page...');
      window.location.href = '/find-ride';
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
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
              <h2>Welcome Back!</h2>
              <p>Login to find rides or offer your own.</p>
            </div>
            
            <div className="input-group">
              <div className="input-icon"><FaEnvelope /></div>
              <input
                type="email"
                placeholder="Enter Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="input-group">
              <div className="input-icon"><FaLock /></div>
              <input
                type="password"
                placeholder="Enter Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
            </div>
            
            <button type="submit" className="login-btn">Login</button>
            {error && <p className="error">{error}</p>}
            
            <p className="auth-switch">
              Don't have an account? <Link to="/register" className="register-link">Register</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
