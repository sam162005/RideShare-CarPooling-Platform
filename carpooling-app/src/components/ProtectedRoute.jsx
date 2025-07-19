import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const verifyAuth = async () => {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      let user = localStorage.getItem('user');
      
      if (!token) {
        console.log('No token found, redirecting to login');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      // If we have a token but no user data, try to fetch it
      if (!user && token) {
        try {
          console.log('Token found but no user data, fetching from server...');
          const response = await fetch('http://localhost:5000/api/users/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          const data = await response.json();
          
          if (response.ok && data) {
            console.log('User data fetched successfully');
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('userId', data._id);
            setIsAuthenticated(true);
          } else {
            console.log('Failed to fetch user data, invalid token');
            localStorage.clear();
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setIsAuthenticated(false);
        }
      } else if (user && token) {
        // We have both token and user data
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    };
    
    verifyAuth();
  }, []);
  
  if (isLoading) {
    // Show loading indicator while checking authentication
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading...</p>
    </div>;
  }
  
  if (!isAuthenticated) {
    // If not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
