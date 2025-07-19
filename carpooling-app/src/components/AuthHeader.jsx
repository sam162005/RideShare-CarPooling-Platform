import React from 'react';
import { Link } from 'react-router-dom';
import { FaCar } from 'react-icons/fa';
import logoimg from '../assets/logo.png';
import './Header.css';

const AuthHeader = () => {
  return (
    <header className="header">
      <div className="header-left">
        <Link to="/">
          <div className="logo-container">
            <img src={logoimg} alt="Logo" className="logo" />
            <h2>RideShare</h2>
          </div>
        </Link>
      </div>

      <div className="header-right">
        <nav className="auth-nav">
          <Link to="/login" className={window.location.pathname === '/login' ? 'nav-link active' : 'nav-link'}>Login</Link>
          <Link to="/register" className={window.location.pathname === '/register' ? 'nav-link active' : 'nav-link'}>Register</Link>
        </nav>
      </div>
    </header>
  );
};

export default AuthHeader;
