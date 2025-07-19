import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css'; // You can create styles based on your design

const Header = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left" onClick={() => navigate('/')}>
        <img src="/logo.png" alt="Logo" className="logo" /> {/* replace with your logo */}
        <h2>RideShare</h2> {/* Updated title */}
      </div>

      <div className="header-right">
        <button className="publish-btn" onClick={() => navigate('/publish-ride')}>
          + Publish a ride
        </button>
        <div className="profile-section">
          <img
            src="/profile-icon.png" // use your own profile icon
            alt="Profile"
            className="profile-icon"
            onClick={() => setDropdownVisible(!dropdownVisible)}
          />
          {dropdownVisible && (
            <div className="dropdown">
              <p onClick={() => navigate('/your-rides')}>Your rides</p>
              <p onClick={() => navigate('/inbox')}>Inbox</p>
              <p onClick={() => navigate('/profile')}>Profile</p>
              <p onClick={() => navigate('/payments')}>Payments & refunds</p>
              <p onClick={handleLogout}>Log out</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
