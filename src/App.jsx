import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import LandingPage from './pages/LandingPage/LandingPage';
import OrganizerDashboard from './pages/OrganizerDashboard/OrganizerDashboard';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import LoginModal from './components/Auth/LoginModal';
import SignupModal from './components/Auth/SignupModal';
import LogoutConfirmationModal from './components/Auth/LogoutConfirmationModal';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/organizer"
            element={
              <ProtectedRoute requiredRole="organizer">
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        <LoginModal />
        <SignupModal />
        <LogoutConfirmationModal />
      </Router>
    </Provider>
  );
}

export default App;
