import React, { useState } from 'react';
import './EditModal.css';

const EditModal = ({ field, label, currentValue, onSave, onClose, isFile = false }) => {
  const [value, setValue] = useState(currentValue || '');
  const [error, setError] = useState('');

  // Determine input type based on field
  const getInputType = () => {
    if (field === 'email') return 'email';
    if (field === 'phone') return 'tel';
    return 'text';
  };

  const validateInput = () => {
    setError('');
    
    // Basic validation
    if (!value.trim()) {
      setError(`${label} cannot be empty`);
      return false;
    }
    
    // Email validation
    if (field === 'email' && !/^\S+@\S+\.\S+$/.test(value)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Phone validation
    if (field === 'phone' && !/^[0-9\-\+\s()]{7,15}$/.test(value)) {
      setError('Please enter a valid phone number');
      return false;
    }
    
    return true;
  };

  const handleSave = () => {
    if (validateInput()) {
      onSave(value);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG or PNG)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      
      onSave(file);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Edit {label}</h3>
        
        {isFile ? (
          <div className="file-input-container">
            <label className="file-input-label">
              <span>Choose Profile Picture</span>
              <input 
                type="file" 
                accept="image/jpeg, image/png" 
                onChange={handleFileChange} 
                className="file-input"
              />
            </label>
            <p className="file-hint">JPEG or PNG, max 5MB</p>
          </div>
        ) : field === 'bio' || field === 'preferences' ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Enter your ${label.toLowerCase()}`}
            rows={5}
            className="textarea-input"
          />
        ) : (
          <input
            type={getInputType()}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Enter your ${label.toLowerCase()}`}
            className="text-input"
          />
        )}
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="modal-buttons">
          {!isFile && <button className="save-btn" onClick={handleSave}>Save Changes</button>}
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
