import React from 'react';
import './ProfileSection.css';

const ProfileSection = ({ label, value, onEditClick }) => {
  return (
    <div className="profile-section">
      <div className="profile-label">{label}</div>
      <div className="profile-value">
        <span>{value || 'Not provided'}</span>
        <button className="edit-btn" onClick={onEditClick}>Edit</button>
      </div>
    </div>
  );
};

export default ProfileSection;
