import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import EditModal from './EditModal';
import { getUserProfile, updateUserProfile, uploadProfilePicture } from '../api/user';
import { FaUser, FaEdit, FaCheck, FaEnvelope, FaPhone, FaIdCard, FaCar, FaCog, FaStar, FaCalendarAlt, FaTaxi } from 'react-icons/fa';
import './ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editField, setEditField] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const labelMap = {
    name: 'Name',
    email: 'Email',
    phone: 'Phone Number',
    bio: 'Mini Bio',
    preferences: 'Travel Preferences',
    vehicle: 'Vehicle Info',
    profilePicture: 'Profile Picture',
  };

  // Fetch user data on page load
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        // Check if we have authentication data
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const storedUserId = localStorage.getItem('userId');
        
        if (!token) {
          console.log('No authentication token found');
          navigate('/login', { state: { from: '/profile' } });
          return;
        }

        // First try to get user profile from API
        try {
          console.log('Fetching user data from server...');
          const userData = await getUserProfile();
          console.log('User data loaded from server:', userData);
          
          if (userData) {
            // Verify user ID matches
            if (storedUserId && userData._id && storedUserId !== userData._id) {
              console.error('User ID mismatch in profile page! Expected:', storedUserId, 'Got:', userData._id);
              // Clear storage and redirect to login
              localStorage.clear();
              sessionStorage.clear();
              navigate('/login', { state: { from: '/profile' } });
              return;
            }
            
            // Store the user ID if not already stored
            if (!storedUserId && userData._id) {
              localStorage.setItem('userId', userData._id);
            }
            
            // Update the state with the server data
            setUser(userData);
            console.log('Profile updated with server data for user ID:', userData._id);
          } else {
            throw new Error('No user data returned from server');
          }
          
          setLoading(false);
        } catch (apiError) {
          console.error('API error, falling back to localStorage data:', apiError);
          
          // Fallback to localStorage data if API fails
          if (userStr) {
            try {
              const parsedUser = JSON.parse(userStr);
              
              // Verify the stored user data matches the expected user ID
              if (storedUserId && parsedUser._id && storedUserId !== parsedUser._id) {
                console.error('User ID mismatch in cached data! Expected:', storedUserId, 'Got:', parsedUser._id);
                // Clear storage and redirect to login
                localStorage.clear();
                sessionStorage.clear();
                navigate('/login', { state: { from: '/profile' } });
                return;
              }
              
              console.log('Using cached user data for ID:', parsedUser._id);
              setUser(parsedUser);
              setLoading(false);
              
              // Try to refetch in the background after a delay
              setTimeout(() => {
                getUserProfile()
                  .then(freshData => {
                    if (freshData) {
                      console.log('Background refresh successful:', freshData);
                      // Verify user ID matches before updating
                      if (storedUserId && freshData._id && storedUserId !== freshData._id) {
                        console.error('User ID mismatch in background refresh! Expected:', storedUserId, 'Got:', freshData._id);
                        return;
                      }
                      setUser(freshData);
                    }
                  })
                  .catch(e => console.error('Background refresh failed:', e));
              }, 3000);
            } catch (parseError) {
              console.error('Error parsing user data:', parseError);
              setLoading(false);
              setUser({ 
                error: 'Failed to load profile data. Please try again later.',
                name: 'User',
                email: 'user@example.com'
              });
            }
          } else {
            // No local data available
            console.error('No local user data available');
            navigate('/login', { state: { from: '/profile' } });
          }
        }
      } catch (error) {
        console.error('Error in profile page:', error);
        // Show error state but don't redirect
        setLoading(false);
        setUser({ 
          error: 'Failed to load profile data. Please try again later.',
          name: 'User',
          email: 'user@example.com'
        });
      }
    };

    fetchUser();
    
    // Set up periodic refresh to keep data in sync
    const refreshInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      const storedUserId = localStorage.getItem('userId');
      
      if (token && storedUserId) {
        console.log('Performing background refresh for user ID:', storedUserId);
        getUserProfile()
          .then(freshData => {
            if (freshData) {
              // Verify user ID matches before updating
              if (freshData._id && storedUserId !== freshData._id) {
                console.error('User ID mismatch in refresh! Expected:', storedUserId, 'Got:', freshData._id);
                return;
              }
              
              console.log('Background refresh successful');
              // Only update if we got valid data
              setUser(prev => {
                // Compare with previous data to see if there are changes
                const hasChanges = JSON.stringify(prev) !== JSON.stringify(freshData);
                if (hasChanges) {
                  console.log('User data updated from server for ID:', freshData._id);
                  return freshData;
                }
                return prev;
              });
            }
          })
          .catch(e => console.error('Background refresh failed:', e));
      }
    }, 30000); // Refresh every 30 seconds for better sync
    
    return () => clearInterval(refreshInterval);
  }, [navigate]);

  const openEditModal = (field) => {
    setEditField(field);
    setModalOpen(true);
  };

  const handleSave = async (newValue) => {
    try {
      setLoading(true);
      let updatedUser;
      
      // Create an update object with the new value
      const updateData = { [editField]: newValue };
      console.log(`Saving ${editField} with value:`, newValue);
      
      if (editField === 'profilePicture') {
        // For profile picture, we need to handle file upload differently
        if (newValue instanceof File) {
          try {
            // Try to upload to server
            const formData = new FormData();
            formData.append('profilePic', newValue);
            console.log('Uploading profile picture to server...');
            updatedUser = await uploadProfilePicture(formData);
            
            // Make sure we got a valid response
            if (!updatedUser || !updatedUser.profilePicture) {
              console.error('Invalid server response for profile picture upload');
              throw new Error('Invalid response from server');
            }
            
            console.log('Profile picture uploaded successfully:', updatedUser.profilePicture);
          } catch (uploadError) {
            console.error('Server upload failed, using local storage fallback:', uploadError);
            
            // If server upload fails, use FileReader to convert to base64 for localStorage
            const reader = new FileReader();
            reader.onloadend = () => {
              // Create a data URL from the file
              const base64String = reader.result;
              console.log('Converted image to base64 for local storage');
              
              // Update local state and localStorage
              setUser(prev => {
                const updated = { ...prev, profilePicture: base64String };
                saveUserToLocalStorage({ profilePicture: base64String });
                return updated;
              });
              
              // Try to sync with server again in the background
              setTimeout(() => {
                console.log('Attempting to retry profile picture upload...');
                const retryFormData = new FormData();
                const blob = dataURLtoBlob(base64String);
                retryFormData.append('profilePic', blob, 'profile.jpg');
                uploadProfilePicture(retryFormData)
                  .then(data => {
                    console.log('Retry upload successful:', data);
                    // Update user state with server data
                    if (data && data.profilePicture) {
                      setUser(prev => ({
                        ...prev,
                        profilePicture: data.profilePicture
                      }));
                      saveUserToLocalStorage({ profilePicture: data.profilePicture });
                    }
                  })
                  .catch(e => console.error('Retry upload failed:', e));
              }, 5000);
              
              setLoading(false);
            };
            reader.readAsDataURL(newValue);
            setModalOpen(false);
            return; // Exit early since we're handling this asynchronously
          }
        }
      } else {
        try {
          // Try to update on server
          console.log(`Updating ${editField} on server...`);
          updatedUser = await updateUserProfile(updateData);
          
          // Make sure we got a valid response
          if (!updatedUser) {
            console.error('Invalid server response for profile update');
            throw new Error('Invalid response from server');
          }
          
          console.log('Server update successful:', updatedUser);
        } catch (updateError) {
          console.error('Server update failed, using local storage fallback:', updateError);
          
          // If server update fails, update localStorage and state directly
          setUser(prev => {
            const updated = { ...prev, ...updateData };
            saveUserToLocalStorage(updateData);
            return updated;
          });
          
          // Try to sync with server again in the background
          setTimeout(() => {
            console.log('Attempting to retry profile update...');
            updateUserProfile(updateData)
              .then(data => {
                console.log('Retry update successful:', data);
                // Update user state with server data
                if (data) {
                  setUser(prev => ({
                    ...prev,
                    ...data
                  }));
                  saveUserToLocalStorage(data);
                }
              })
              .catch(e => console.error('Retry update failed:', e));
          }, 5000);
          
          setLoading(false);
          alert(`${labelMap[editField]} updated successfully (saved locally)!`);
          setModalOpen(false);
          return; // Exit early
        }
      }

      // If we got here, server update was successful
      // Update the user state with the new data from server
      console.log('Updating state with server data:', updatedUser);
      setUser(prev => {
        const merged = { ...prev, ...updatedUser };
        return merged;
      });
      
      // Also update localStorage for redundancy
      saveUserToLocalStorage(updatedUser);
      
      setLoading(false);
      alert(`${labelMap[editField]} updated successfully!`);
    } catch (error) {
      console.error('Update error:', error);
      setLoading(false);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { state: { from: '/profile' } });
      } else {
        // Show error message for other errors
        alert(`Failed to update ${labelMap[editField]}: ${error.message}`);
      }
    }
    setModalOpen(false);
  };
  
  // Helper function to convert data URL to Blob for retrying uploads
  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  };

  if (loading) return (
    <>
      <Header />
      <div className="loading">Loading profile data...</div>
    </>
  );
  
  // Handle error state
  if (user?.error) {
    return (
      <>
        <Header />
        <div className="profile-page error-state">
          <div className="error-message">{user.error}</div>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </>
    );
  }

  // Function to save user data to localStorage
  const saveUserToLocalStorage = (userData) => {
    try {
      // Get existing user data from localStorage
      const existingUserStr = localStorage.getItem('user');
      let existingUser = {};
      
      if (existingUserStr) {
        existingUser = JSON.parse(existingUserStr);
      }
      
      // Merge existing user data with new data
      const updatedUser = { ...existingUser, ...userData };
      
      // Save back to localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('User data saved to localStorage:', updatedUser);
    } catch (error) {
      console.error('Error saving user data to localStorage:', error);
    }
  };

  // Function to handle profile picture display
  const renderProfilePicture = () => {
    if (user.profilePicture) {
      return <img src={user.profilePicture} alt="Profile" className="profile-pic" />;
    } else {
      return (
        <div className="profile-pic">
          <FaUser />
        </div>
      );
    }
  };
  
  // Function to calculate user membership duration
  const getMembershipDuration = () => {
    // If user has a createdAt field, use it to calculate membership duration
    if (user.createdAt) {
      const joinDate = new Date(user.createdAt);
      const currentYear = new Date().getFullYear();
      const joinYear = joinDate.getFullYear();
      
      if (currentYear > joinYear) {
        return `${joinYear} · ${currentYear - joinYear} ${currentYear - joinYear === 1 ? 'year' : 'years'}`;
      } else {
        return joinYear.toString();
      }
    }
    // Fallback to current year if no join date is available
    return new Date().getFullYear();
  };

  return (
    <>
      <Header />
      <div className="profile-page">
        {/* Profile Header with Picture */}
        <div className="profile-header">
          <FaTaxi className="header-decoration" />
          <FaCar className="header-decoration-left" />
          <div className="user-info">
            <div className="profile-pic-container">
              {renderProfilePicture()}
              <div className="edit-profile-pic" onClick={() => openEditModal('profilePicture')}>
                <FaEdit />
              </div>
            </div>
            <h3>{user.name || 'User'}</h3>
            <p><FaCalendarAlt /> Rider since {getMembershipDuration()}</p>
            <div className="user-rating">
              <FaStar className="star-icon" /> 
              <span>{user.rating ? user.rating.toFixed(1) : '5.0'} · {user.rideCount || 0} rides</span>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="section-title">Personal Information</div>
        
        <div className="profile-section">
          <div className="section-content">
            <span className="section-label">Full Name</span>
            <span className="section-value">{user.name || 'Not set'}</span>
          </div>
          <button className="edit-btn" onClick={() => openEditModal('name')}>
            <FaEdit className="edit-icon" /> Edit
          </button>
        </div>

        <div className="profile-section">
          <div className="section-content">
            <span className="section-label">Email</span>
            <span className="section-value">
              {user.email || 'Not set'}
              {user.email && <span className="verification-badge"><FaCheck className="badge-icon" /> Verified</span>}
            </span>
          </div>
          <button className="edit-btn" onClick={() => openEditModal('email')}>
            <FaEdit className="edit-icon" /> Edit
          </button>
        </div>

        <div className="profile-section">
          <div className="section-content">
            <span className="section-label">Phone Number</span>
            <span className="section-value">{user.phone || 'Not added'}</span>
          </div>
          <button className="edit-btn" onClick={() => openEditModal('phone')}>
            <FaEdit className="edit-icon" /> Edit
          </button>
        </div>

        {/* Verification */}
        <div className="section-title">Verification</div>
        
        <div className="profile-section">
          <div className="section-content">
            <span className="section-label">Government ID</span>
            <span className="section-value">Not verified</span>
          </div>
          <button className="edit-btn" onClick={() => alert('Govt. ID upload feature coming soon!')}>
            <FaIdCard className="edit-icon" /> Verify
          </button>
        </div>

        {/* Preferences */}
        <div className="section-title">Ride Preferences</div>
        
        <div className="profile-section">
          <div className="section-content">
            <span className="section-label">Bio</span>
            <span className="section-value">{user.bio || 'Tell others about yourself'}</span>
          </div>
          <button className="edit-btn" onClick={() => openEditModal('bio')}>
            <FaEdit className="edit-icon" /> Edit
          </button>
        </div>

        <div className="profile-section">
          <div className="section-content">
            <span className="section-label">Travel Preferences</span>
            <span className="section-value">{user.preferences || 'Set your preferences'}</span>
          </div>
          <button className="edit-btn" onClick={() => openEditModal('preferences')}>
            <FaCog className="edit-icon" /> Set
          </button>
        </div>

        {/* Vehicle Information */}
        <div className="section-title">Vehicle Information</div>
        
        <div className="profile-section">
          <div className="section-content">
            <span className="section-label">Vehicle Details</span>
            <span className="section-value">{user.vehicle || 'No vehicle added'}</span>
          </div>
          <button className="edit-btn" onClick={() => openEditModal('vehicle')}>
            <FaCar className="edit-icon" /> {user.vehicle ? 'Edit' : 'Add'}
          </button>
        </div>
      </div>

      {modalOpen && (
        <EditModal
          field={editField}
          label={labelMap[editField]}
          currentValue={user[editField]}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
          isFile={editField === 'profilePicture'}
        />
      )}
    </>
  );
};

export default ProfilePage;
