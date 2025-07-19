import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import './styles/global.css';
import FindRidePage from './pages/FindRidePage';
import ProfilePage from './pages/ProfilePages';
import PublishRidePage from './pages/PublishRidePage';
import PickupAddressPage from './pages/PickupAddressPage';
import DropoffAddressPage from './pages/DropoffAddressPage';
import RouteSelectionPage from './pages/RouteSelectionPage';
import RideDetailsPage from './pages/RideDetailsPage';
import PassengerSelectionPage from './pages/PassengerSelectionPage';
import PriceSelectionPage from './pages/PriceSelectionPage';
import RideSummaryPage from './pages/RideSummaryPage';
import RidePublishedPage from './pages/RidePublishedPage';
import InboxPage from './pages/InboxPage';
import YourRidesPage from './pages/YourRidesPage';
import PaymentsPage from './pages/PaymentsPage';
import BookRidePage from './pages/BookRidePage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Redirect for empty path */}
        <Route path="" element={<Home />} />
        
        {/* Protected Routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/find-ride" element={
          <ProtectedRoute>
            <FindRidePage />
          </ProtectedRoute>
        } />
        
        {/* Add other protected routes */}
        <Route path="/your-rides" element={
          <ProtectedRoute>
            <YourRidesPage />
          </ProtectedRoute>
        } />
        <Route path="/inbox" element={
          <ProtectedRoute>
            <InboxPage />
          </ProtectedRoute>
        } />
        <Route path="/payments" element={
          <ProtectedRoute>
            <PaymentsPage />
          </ProtectedRoute>
        } />
        <Route path="/publish-ride" element={
          <ProtectedRoute>
            <PublishRidePage />
          </ProtectedRoute>
        } />
        <Route path="/publish-ride/pickup" element={
          <ProtectedRoute>
            <PickupAddressPage />
          </ProtectedRoute>
        } />
        <Route path="/publish-ride/dropoff" element={
          <ProtectedRoute>
            <DropoffAddressPage />
          </ProtectedRoute>
        } />
        <Route path="/route-selection" element={
          <ProtectedRoute>
            <RouteSelectionPage />
          </ProtectedRoute>
        } />
        <Route path="/ride-details" element={
          <ProtectedRoute>
            <RideDetailsPage />
          </ProtectedRoute>
        } />
        <Route path="/passenger-selection" element={
          <ProtectedRoute>
            <PassengerSelectionPage />
          </ProtectedRoute>
        } />
        <Route path="/price-selection" element={
          <ProtectedRoute>
            <PriceSelectionPage />
          </ProtectedRoute>
        } />
        <Route path="/ride-summary" element={
          <ProtectedRoute>
            <RideSummaryPage />
          </ProtectedRoute>
        } />
        <Route path="/ride-published" element={
          <ProtectedRoute>
            <RidePublishedPage />
          </ProtectedRoute>
        } />
        <Route path="/book-ride" element={
          <ProtectedRoute>
            <BookRidePage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
