const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKey',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourTestSecret'
});

// @route   POST api/payments/create-order
// @desc    Create a new Razorpay order
// @access  Private
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency, paymentMethod } = req.body;
    
    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: 'Invalid amount' });
    }
    
    // Create Razorpay order
    const options = {
      amount: amount, // amount in the smallest currency unit (paise for INR)
      currency: currency || 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1 // Auto-capture payment
    };
    
    const order = await razorpay.orders.create(options);
    
    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   POST api/payments/verify-payment
// @desc    Verify Razorpay payment
// @access  Private
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ msg: 'Missing payment verification parameters' });
    }
    
    // Create signature hash
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YourTestSecret');
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');
    
    // Verify signature
    if (digest !== razorpay_signature) {
      return res.status(400).json({ msg: 'Invalid payment signature' });
    }
    
    // Payment is verified, store in database (in a real app)
    // ...
    
    res.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   POST api/payments/wallet/add
// @desc    Add money to wallet
// @access  Private
router.post('/wallet/add', async (req, res) => {
  try {
    const { amount, paymentId } = req.body;
    
    // Validate input
    if (!amount || amount <= 0 || !paymentId) {
      return res.status(400).json({ msg: 'Invalid wallet transaction data' });
    }
    
    // In a real app, update user's wallet balance in database
    // For demo, just return success
    
    res.json({
      success: true,
      transaction: {
        id: `txn_${Date.now()}`,
        type: 'wallet_add',
        amount,
        status: 'completed',
        paymentId,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Add to wallet error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   GET api/payments/wallet/balance
// @desc    Get wallet balance
// @access  Private
router.get('/wallet/balance', async (req, res) => {
  try {
    // In a real app, get user's wallet balance from database
    // For demo, return a fixed balance
    
    res.json({
      balance: 1250
    });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   GET api/payments/methods
// @desc    Get user's payment methods
// @access  Private
router.get('/methods', async (req, res) => {
  try {
    // In a real app, get user's payment methods from database
    // For demo, return sample payment methods
    
    res.json([
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
    ]);
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   POST api/payments/methods
// @desc    Add a new payment method
// @access  Private
router.post('/methods', async (req, res) => {
  try {
    const methodData = req.body;
    
    // Validate input
    if (!methodData.type || (methodData.type === 'card' && (!methodData.number || !methodData.expiry)) || 
        (methodData.type === 'upi' && !methodData.id)) {
      return res.status(400).json({ msg: 'Invalid payment method data' });
    }
    
    // In a real app, store payment method in database
    // For demo, just return success with mock ID
    
    const newMethod = {
      id: Date.now(),
      ...methodData,
      isDefault: methodData.isDefault || false
    };
    
    res.json({
      success: true,
      method: newMethod
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT api/payments/methods/:id/default
// @desc    Set payment method as default
// @access  Private
router.put('/methods/:id/default', async (req, res) => {
  try {
    const methodId = req.params.id;
    
    // In a real app, update database to set this method as default
    // For demo, just return success
    
    res.json({
      success: true,
      methodId
    });
  } catch (error) {
    console.error('Set default payment method error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE api/payments/methods/:id
// @desc    Remove payment method
// @access  Private
router.delete('/methods/:id', async (req, res) => {
  try {
    const methodId = req.params.id;
    
    // In a real app, remove payment method from database
    // For demo, just return success
    
    res.json({
      success: true,
      methodId
    });
  } catch (error) {
    console.error('Remove payment method error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   GET api/payments/transactions
// @desc    Get transaction history
// @access  Private
router.get('/transactions', async (req, res) => {
  try {
    // In a real app, get user's transactions from database
    // For demo, return sample transactions
    
    res.json([
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
    ]);
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
