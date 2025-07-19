import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaHome, FaSearch, FaCar, FaInbox, FaMoneyBillWave, FaSignOutAlt } from 'react-icons/fa';
import logoimg from '../assets/logo.png';
import './Header.css';

const Header = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };
  
  const navigateToProfile = () => {
    // Use our redirect page to ensure proper navigation to profile
    window.location.href = '/redirect-to-profile.html';
  };
  
  // Determine active section based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/your-rides')) {
      setActiveSection('your-rides');
    } else if (path.includes('/find-ride')) {
      setActiveSection('find-rides');
    } else if (path.includes('/inbox')) {
      setActiveSection('inbox');
    } else if (path.includes('/profile')) {
      setActiveSection('profile');
    } else if (path.includes('/payments')) {
      setActiveSection('payments');
    } else {
      setActiveSection('');
    }
  }, [location.pathname]);
  
  // Navigate to a section and close dropdown
  const navigateToSection = (path, section) => {
    navigate(path);
    setActiveSection(section);
    setDropdownVisible(false);
  };

  return (
    <header className="header">
      <div className="header-left" onClick={() => navigate('/')}>
        <img src={logoimg} alt="Logo" className="logo" />
        <h2>RideShare</h2>
      </div>

      <div className="header-right">
        <button className="nav-btn" onClick={() => navigate('/')}>
          <FaHome size={20} />
          <span>Home</span>
        </button>
        <button className="publish-btn" onClick={() => navigate('/publish-ride')}>
          + Publish a ride
        </button>
        <div className="profile-section">
          <FaUserCircle
            className="profile-icon"
            size={36}
            onClick={() => {
              // Only toggle dropdown visibility when clicking the profile icon
              setDropdownVisible(!dropdownVisible);
            }}
            title="Toggle Menu"
          />
          {dropdownVisible && (
            <div className="dropdown">
              <p 
                onClick={() => navigateToSection('/your-rides', 'your-rides')} 
                className={activeSection === 'your-rides' ? 'active-section' : ''}
              >
                <FaCar style={{ marginRight: '8px' }} />
                Your rides
              </p>
              <p 
                onClick={() => navigateToSection('/find-ride', 'find-rides')}
                className={activeSection === 'find-rides' ? 'active-section' : ''}
              >
                <FaSearch style={{ marginRight: '8px' }} />
                Find Rides
              </p>
              <p 
                onClick={() => navigateToSection('/inbox', 'inbox')}
                className={activeSection === 'inbox' ? 'active-section' : ''}
              >
                <FaInbox style={{ marginRight: '8px' }} />
                Inbox
              </p>
              <p onClick={navigateToProfile}>
                <FaUserCircle style={{ marginRight: '8px' }} />
                Profile
              </p>
              <p 
                onClick={() => navigateToSection('/payments', 'payments')}
                className={activeSection === 'payments' ? 'active-section' : ''}
              >
                <FaMoneyBillWave style={{ marginRight: '8px' }} />
                Payments & refunds
              </p>
              <p onClick={handleLogout}>
                <FaSignOutAlt style={{ marginRight: '8px' }} />
                Log out
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
