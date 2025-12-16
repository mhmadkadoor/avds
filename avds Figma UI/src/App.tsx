import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { SearchResultsPage } from './components/SearchResultsPage';
import { VehicleDetailsPage } from './components/VehicleDetailsPage';
import { AuthPage } from './components/AuthPage';
import { AccountManagementPage } from './components/AccountManagementPage';
import { SupportPage } from './components/SupportPage';
import { AdminPage } from './components/AdminPage';
import { AIAssistant } from './components/AIAssistant';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { FeaturesProvider } from './contexts/FeaturesContext';
import { Toaster } from './components/ui/sonner';

import { ResetPasswordPage } from './components/ResetPasswordPage';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();


  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleVehicleClick = (vehicleId: string) => {
    navigate(`/vehicles/${vehicleId}`);
  };

  const handleNavigate = (page: string) => {
    if (page === 'home') navigate('/');
    else if (page === 'auth') navigate('/auth');
    else if (page === 'account') navigate('/account');
    else if (page === 'support') navigate('/support');
    else if (page === 'admin') navigate('/admin');
    else navigate('/');
  };

  const handleAuthSuccess = () => {
    navigate('/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const showNavbar = location.pathname !== '/auth';

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" richColors closeButton />

      {showNavbar && (
        <Navbar
          onSearch={handleSearch}
          onVehicleClick={handleVehicleClick}
          searchQuery={new URLSearchParams(location.search).get('q') || ''}
        />
      )}

      <Routes>
        <Route path="/" element={
          <>
            <HomePage />
            <AIAssistant />
          </>
        } />
        <Route path="/search" element={
          <>
            <SearchResultsPage />
            <AIAssistant />
          </>
        } />
        <Route path="/vehicles/:id" element={
          <VehicleDetailsPage />
        } />
        <Route path="/auth" element={
          <AuthPage onSuccess={handleAuthSuccess} />
        } />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
        <Route path="/account" element={
          <>
            <AccountManagementPage />
            <AIAssistant />
          </>
        } />
        <Route path="/support" element={
          <>
            <SupportPage />
            <AIAssistant />
          </>
        } />
        <Route path="/admin" element={
          <>
            <AdminPage />
            <AIAssistant />
          </>
        } />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <FeaturesProvider>
            <Router>
              <AppContent />
            </Router>
          </FeaturesProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
