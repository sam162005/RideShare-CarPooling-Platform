// API URL for payments
const API_URL = 'http://localhost:5000/api/payments';

// Load Razorpay script dynamically
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Process payment with Razorpay
export const processPayment = async (amount, currency = 'INR', paymentMethod = 'card') => {
  try {
    // Step 1: Create order on the backend
    const orderResponse = await fetch(`${API_URL}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        paymentMethod
      }),
    });

    if (!orderResponse.ok) {
      throw new Error('Failed to create order');
    }

    const orderData = await orderResponse.json();
    
    // Step 2: Load Razorpay script
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      throw new Error('Razorpay SDK failed to load');
    }

    // Step 3: Open Razorpay payment form
    return new Promise((resolve, reject) => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourTestKey',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'RideShare',
        description: 'Payment for ride sharing services',
        order_id: orderData.id,
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
          contact: '9876543210'
        },
        theme: {
          color: '#1976d2'
        },
        modal: {
          ondismiss: () => {
            reject(new Error('Payment cancelled by user'));
          }
        },
        handler: (response) => {
          // Step 4: Verify payment on backend
          verifyPayment(response)
            .then(data => {
              resolve(data);
            })
            .catch(error => {
              reject(error);
            });
        }
      };

      // For UPI payments, add UPI specific options
      if (paymentMethod === 'upi') {
        options.method = {
          netbanking: false,
          card: false,
          wallet: false,
          upi: true,
          paylater: false
        };
      }

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
};

// Verify payment with backend
const verifyPayment = async (paymentData) => {
  try {
    const response = await fetch(`${API_URL}/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};

// Add money to wallet
export const addMoneyToWallet = async (amount) => {
  try {
    // Process payment first
    const paymentResult = await processPayment(amount);
    
    // If payment successful, update wallet balance on backend
    if (paymentResult.success) {
      const walletResponse = await fetch(`${API_URL}/wallet/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          paymentId: paymentResult.paymentId
        }),
      });

      if (!walletResponse.ok) {
        throw new Error('Failed to update wallet');
      }

      return await walletResponse.json();
    }
    
    return paymentResult;
  } catch (error) {
    console.error('Add money to wallet error:', error);
    throw error;
  }
};

// Get wallet balance
export const getWalletBalance = async () => {
  try {
    const response = await fetch(`${API_URL}/wallet/balance`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch wallet balance');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get wallet balance error:', error);
    // Return a default balance for demo purposes
    return { balance: 1250 };
  }
};

// Get payment methods
export const getPaymentMethods = async () => {
  try {
    const response = await fetch(`${API_URL}/methods`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch payment methods');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get payment methods error:', error);
    // Return sample payment methods for demo
    return [
      {
        id: 1,
        type: 'card',
        name: 'HDFC Bank Credit Card',
        number: '•••• •••• •••• 4567',
        expiry: '12/26',
        isDefault: true
      },
      {
        id: 2,
        type: 'upi',
        name: 'Google Pay',
        id: 'user@okicici',
        isDefault: false
      }
    ];
  }
};

// Add a new payment method
export const addPaymentMethod = async (methodData) => {
  try {
    const response = await fetch(`${API_URL}/methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(methodData),
    });

    if (!response.ok) {
      throw new Error('Failed to add payment method');
    }

    return await response.json();
  } catch (error) {
    console.error('Add payment method error:', error);
    // Return a mock response for demo
    return {
      success: true,
      method: {
        id: Math.floor(Math.random() * 1000) + 3,
        ...methodData,
        isDefault: methodData.isDefault || false
      }
    };
  }
};

// Set default payment method
export const setDefaultPaymentMethod = async (methodId) => {
  try {
    const response = await fetch(`${API_URL}/methods/${methodId}/default`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to set default payment method');
    }

    return await response.json();
  } catch (error) {
    console.error('Set default payment method error:', error);
    // Return a mock response for demo
    return {
      success: true,
      methodId
    };
  }
};

// Remove payment method
export const removePaymentMethod = async (methodId) => {
  try {
    const response = await fetch(`${API_URL}/methods/${methodId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to remove payment method');
    }

    return await response.json();
  } catch (error) {
    console.error('Remove payment method error:', error);
    // Return a mock response for demo
    return {
      success: true,
      methodId
    };
  }
};

// Get transaction history
export const getTransactionHistory = async () => {
  try {
    const response = await fetch(`${API_URL}/transactions`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch transaction history');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get transaction history error:', error);
    // Return sample transactions for demo
    return [
      {
        id: 'txn_1',
        date: '2025-05-18T14:30:00',
        amount: 450,
        type: 'payment',
        status: 'completed',
        description: 'Ride from Coimbatore to Chennai',
        paymentMethod: 'HDFC Bank Credit Card',
        rideId: 'ride_123'
      },
      {
        id: 'txn_2',
        date: '2025-05-15T09:15:00',
        amount: 350,
        type: 'refund',
        status: 'completed',
        description: 'Refund for cancelled ride to Bangalore',
        paymentMethod: 'Wallet',
        rideId: 'ride_456'
      },
      {
        id: 'txn_3',
        date: '2025-05-12T18:45:00',
        amount: 500,
        type: 'wallet_add',
        status: 'completed',
        description: 'Added money to wallet',
        paymentMethod: 'HDFC Bank Credit Card'
      },
      {
        id: 'txn_4',
        date: '2025-05-10T11:20:00',
        amount: 300,
        type: 'payment',
        status: 'completed',
        description: 'Ride from Coimbatore to Mysore',
        paymentMethod: 'Google Pay (UPI)',
        rideId: 'ride_789'
      },
      {
        id: 'txn_5',
        date: '2025-05-05T16:30:00',
        amount: 750,
        type: 'wallet_add',
        status: 'completed',
        description: 'Added money to wallet',
        paymentMethod: 'HDFC Bank Credit Card'
      },
      {
        id: 'txn_6',
        date: '2025-05-01T08:45:00',
        amount: 200,
        type: 'payment',
        status: 'pending',
        description: 'Payment processing for ride to Ooty',
        paymentMethod: 'Wallet',
        rideId: 'ride_101'
      }
    ];
  }
};
