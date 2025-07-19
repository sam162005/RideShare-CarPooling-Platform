import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaWallet, FaHistory, FaMoneyBillWave, FaPlus, FaChevronRight, FaDownload, FaExclamationCircle, FaCheckCircle, FaTimesCircle, FaRupeeSign } from 'react-icons/fa';
import { SiGooglepay, SiPaytm, SiPhonepe } from 'react-icons/si';
import Header from '../components/Header';
import { getWalletBalance, getPaymentMethods, addPaymentMethod, setDefaultPaymentMethod as setDefaultMethod, removePaymentMethod as removeMethod, getTransactionHistory, addMoneyToWallet, processPayment } from '../services/paymentService';
import './PaymentsPage.css';

const PaymentsPage = () => {
  const [activeTab, setActiveTab] = useState('payment-methods');
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddUPIModal, setShowAddUPIModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addMoneyAmount, setAddMoneyAmount] = useState(500);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  
  // Form states for adding payment methods
  const [cardForm, setCardForm] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
    isDefault: false
  });
  
  const [upiForm, setUpiForm] = useState({
    name: 'Google Pay',
    id: '',
    isDefault: false
  });
  
  // Load data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch wallet balance
        const balanceData = await getWalletBalance();
        setWalletBalance(balanceData.balance);
        
        // Fetch payment methods
        const methodsData = await getPaymentMethods();
        setPaymentMethods(methodsData);
        
        // Fetch transaction history
        const transactionsData = await getTransactionHistory();
        setTransactions(transactionsData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching payment data:', err);
        setError('Failed to load payment data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handle card form input changes
  const handleCardFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCardForm({
      ...cardForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle UPI form input changes
  const handleUpiFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUpiForm({
      ...upiForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle adding a new card
  const handleAddCard = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Format card number for display
      const lastFour = cardForm.number.slice(-4);
      const maskedNumber = `•••• •••• •••• ${lastFour}`;
      
      const cardData = {
        type: 'card',
        name: cardForm.name,
        number: maskedNumber,
        expiry: cardForm.expiry,
        isDefault: cardForm.isDefault
      };
      
      // Call API to add payment method
      const result = await addPaymentMethod(cardData);
      
      if (result.success) {
        // Add new card to state
        setPaymentMethods([...paymentMethods, result.method]);
        
        // Reset form
        setCardForm({
          name: '',
          number: '',
          expiry: '',
          cvv: '',
          isDefault: false
        });
        
        setShowAddCardModal(false);
      }
    } catch (err) {
      console.error('Error adding card:', err);
      setError('Failed to add card. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle adding a new UPI ID
  const handleAddUPI = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const upiData = {
        type: 'upi',
        name: upiForm.name,
        id: upiForm.id,
        isDefault: upiForm.isDefault
      };
      
      // Call API to add payment method
      const result = await addPaymentMethod(upiData);
      
      if (result.success) {
        // Add new UPI to state
        setPaymentMethods([...paymentMethods, result.method]);
        
        // Reset form
        setUpiForm({
          name: 'Google Pay',
          id: '',
          isDefault: false
        });
        
        setShowAddUPIModal(false);
      }
    } catch (err) {
      console.error('Error adding UPI:', err);
      setError('Failed to add UPI. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle adding money to wallet
  const handleAddMoney = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Process payment using Razorpay
      const result = await addMoneyToWallet(addMoneyAmount);
      
      if (result.success) {
        // Update wallet balance
        setWalletBalance(prevBalance => prevBalance + addMoneyAmount);
        
        // Fetch updated transaction history
        const transactionsData = await getTransactionHistory();
        setTransactions(transactionsData);
        
        setShowAddMoneyModal(false);
        setAddMoneyAmount(500); // Reset to default amount
      }
    } catch (err) {
      console.error('Error adding money to wallet:', err);
      setError('Failed to add money to wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Set a payment method as default
  const handleSetDefaultPaymentMethod = async (id) => {
    setLoading(true);
    
    try {
      // Call API to set default payment method
      const result = await setDefaultMethod(id);
      
      if (result.success) {
        // Update payment methods in state
        const updatedMethods = paymentMethods.map(method => ({
          ...method,
          isDefault: method.id === id
        }));
        
        setPaymentMethods(updatedMethods);
      }
    } catch (err) {
      console.error('Error setting default payment method:', err);
      setError('Failed to set default payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Remove a payment method
  const handleRemovePaymentMethod = async (id) => {
    setLoading(true);
    
    try {
      // Call API to remove payment method
      const result = await removeMethod(id);
      
      if (result.success) {
        // Remove payment method from state
        const updatedMethods = paymentMethods.filter(method => method.id !== id);
        setPaymentMethods(updatedMethods);
      }
    } catch (err) {
      console.error('Error removing payment method:', err);
      setError('Failed to remove payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Get transaction status icon
  const getTransactionStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="status-icon completed" />;
      case 'pending':
        return <FaExclamationCircle className="status-icon pending" />;
      case 'failed':
        return <FaTimesCircle className="status-icon failed" />;
      default:
        return null;
    }
  };
  
  // Get transaction type icon
  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case 'payment':
        return <FaMoneyBillWave className="transaction-icon payment" />;
      case 'refund':
        return <FaMoneyBillWave className="transaction-icon refund" />;
      case 'wallet_add':
        return <FaWallet className="transaction-icon wallet" />;
      default:
        return <FaHistory className="transaction-icon" />;
    }
  };
  
  return (
    <div className="payments-page">
      <Header />
      
      <div className="payments-container">
        <h1 className="page-title">Payments & Refunds</h1>
        
        <div className="wallet-card">
          <div className="wallet-balance">
            <div className="balance-label">Wallet Balance</div>
            <div className="balance-amount">₹{walletBalance.toFixed(2)}</div>
          </div>
          <button className="add-money-btn" onClick={() => setShowAddMoneyModal(true)}>
            <FaPlus /> Add Money
          </button>
        </div>
        
        <div className="tabs-container">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'payment-methods' ? 'active' : ''}`}
              onClick={() => setActiveTab('payment-methods')}
            >
              <FaCreditCard /> Payment Methods
            </button>
            <button 
              className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              <FaHistory /> Transaction History
            </button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'payment-methods' ? (
              <div className="payment-methods-container">
                <div className="section-header">
                  <h2>Your Payment Methods</h2>
                  <div className="action-buttons">
                    <button 
                      className="add-method-btn"
                      onClick={() => setShowAddCardModal(true)}
                    >
                      <FaPlus /> Add Card
                    </button>
                    <button 
                      className="add-method-btn"
                      onClick={() => setShowAddUPIModal(true)}
                    >
                      <FaPlus /> Add UPI
                    </button>
                  </div>
                </div>
                
                {loading ? (
                  <div className="loading-indicator">Loading payment methods...</div>
                ) : error ? (
                  <div className="error-message">{error}</div>
                ) : (
                  <div className="payment-methods-list">
                    {paymentMethods.length === 0 ? (
                      <div className="empty-state">
                        <p>No payment methods added yet. Add a card or UPI ID to get started.</p>
                      </div>
                    ) : (
                      paymentMethods.map(method => (
                        <div key={method.id} className={`payment-method-card ${method.isDefault ? 'default' : ''}`}>
                          <div className="payment-method-icon">
                            {method.type === 'card' ? <FaCreditCard /> : 
                             method.name === 'Google Pay' ? <SiGooglepay /> :
                             method.name === 'PhonePe' ? <SiPhonepe /> :
                             method.name === 'Paytm' ? <SiPaytm /> : <FaWallet />}
                          </div>
                          <div className="payment-method-details">
                            <div className="payment-method-name">
                              {method.name}
                              {method.isDefault && <span className="default-badge">Default</span>}
                            </div>
                            <div className="payment-method-info">
                              {method.type === 'card' ? (
                                <>
                                  <span>{method.number}</span>
                                  <span>Expires: {method.expiry}</span>
                                </>
                              ) : (
                                <span>ID: {method.id}</span>
                              )}
                            </div>
                          </div>
                          <div className="payment-method-actions">
                            {!method.isDefault && (
                              <button 
                                className="set-default-btn"
                                onClick={() => handleSetDefaultPaymentMethod(method.id)}
                              >
                                Set as Default
                              </button>
                            )}
                            <button 
                              className="remove-btn"
                              onClick={() => handleRemovePaymentMethod(method.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="transactions-container">
                <div className="section-header">
                  <h2>Transaction History</h2>
                  <div className="action-buttons">
                    <button className="download-btn">
                      <FaDownload /> Download
                    </button>
                  </div>
                </div>
                
                {loading ? (
                  <div className="loading-indicator">Loading transactions...</div>
                ) : error ? (
                  <div className="error-message">{error}</div>
                ) : (
                  <div className="transactions-list">
                    {transactions.length === 0 ? (
                      <div className="empty-state">
                        <p>No transactions yet. Your payment history will appear here.</p>
                      </div>
                    ) : (
                      transactions.map(transaction => (
                        <div key={transaction.id} className="transaction-card">
                          <div className="transaction-icon-container">
                            {getTransactionTypeIcon(transaction.type)}
                          </div>
                          <div className="transaction-details">
                            <div className="transaction-title">
                              {transaction.description}
                              {getTransactionStatusIcon(transaction.status)}
                            </div>
                            <div className="transaction-info">
                              <span>{formatDate(transaction.date)} at {formatTime(transaction.date)}</span>
                              <span>{transaction.paymentMethod}</span>
                            </div>
                          </div>
                          <div className="transaction-amount">
                            <div className={`amount ${transaction.type === 'refund' || transaction.type === 'wallet_add' ? 'credit' : 'debit'}`}>
                              {transaction.type === 'refund' || transaction.type === 'wallet_add' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                            </div>
                            {transaction.rideId && (
                              <button className="view-ride-btn">
                                View Ride <FaChevronRight />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Money to Wallet</h3>
              <button className="close-btn" onClick={() => setShowAddMoneyModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddMoney}>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input 
                  type="number" 
                  min="100" 
                  max="10000" 
                  step="100" 
                  value={addMoneyAmount} 
                  onChange={(e) => setAddMoneyAmount(Number(e.target.value))}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Payment Method</label>
                <div className="payment-method-selection">
                  <div 
                    className={`payment-option ${selectedPaymentMethod === 'card' ? 'selected' : ''}`}
                    onClick={() => setSelectedPaymentMethod('card')}
                  >
                    <FaCreditCard />
                    <span>Card</span>
                  </div>
                  <div 
                    className={`payment-option ${selectedPaymentMethod === 'upi' ? 'selected' : ''}`}
                    onClick={() => setSelectedPaymentMethod('upi')}
                  >
                    <div className="upi-icons">
                      <SiGooglepay />
                      <SiPhonepe />
                      <SiPaytm />
                    </div>
                    <span>UPI</span>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddMoneyModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? 'Processing...' : 'Add Money'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Card</h3>
              <button className="close-btn" onClick={() => setShowAddCardModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddCard}>
              <div className="form-group">
                <label>Card Name</label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="e.g. HDFC Bank Credit Card" 
                  value={cardForm.name} 
                  onChange={handleCardFormChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Card Number</label>
                <input 
                  type="text" 
                  name="number" 
                  placeholder="1234 5678 9012 3456" 
                  value={cardForm.number} 
                  onChange={handleCardFormChange}
                  pattern="[0-9]{16}" 
                  maxLength="16"
                  required 
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input 
                    type="text" 
                    name="expiry" 
                    placeholder="MM/YY" 
                    value={cardForm.expiry} 
                    onChange={handleCardFormChange}
                    pattern="(0[1-9]|1[0-2])/[0-9]{2}" 
                    maxLength="5"
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>CVV</label>
                  <input 
                    type="password" 
                    name="cvv" 
                    placeholder="123" 
                    value={cardForm.cvv} 
                    onChange={handleCardFormChange}
                    pattern="[0-9]{3,4}" 
                    maxLength="4"
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group checkbox">
                <input 
                  type="checkbox" 
                  name="isDefault" 
                  checked={cardForm.isDefault} 
                  onChange={handleCardFormChange} 
                />
                <label>Set as default payment method</label>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddCardModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add UPI Modal */}
      {showAddUPIModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add UPI ID</h3>
              <button className="close-btn" onClick={() => setShowAddUPIModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddUPI}>
              <div className="form-group">
                <label>UPI App</label>
                <select 
                  name="name" 
                  value={upiForm.name} 
                  onChange={handleUpiFormChange}
                  required
                >
                  <option value="Google Pay">Google Pay</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Paytm">Paytm</option>
                  <option value="Other UPI">Other UPI</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>UPI ID</label>
                <input 
                  type="text" 
                  name="id" 
                  placeholder="username@upi" 
                  value={upiForm.id} 
                  onChange={handleUpiFormChange}
                  required 
                />
              </div>
              
              <div className="form-group checkbox">
                <input 
                  type="checkbox" 
                  name="isDefault" 
                  checked={upiForm.isDefault} 
                  onChange={handleUpiFormChange} 
                />
                <label>Set as default payment method</label>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddUPIModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? 'Adding...' : 'Add UPI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
