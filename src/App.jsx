import { useState } from 'react';
import { Provider } from 'react-redux';
import store from './store/store';
import Navbar from './components/Navbar/Navbar.jsx';
import Hero from './components/Hero/Hero.jsx';
import EventGallery from './components/EventGallery/EventGallery.jsx';
import EventSectionHeader from './components/EventSectionHeader/EventSectionHeader.jsx';
import CategoryTabs from './components/CategoryTabs/CategoryTabs.jsx';
import EventSection from './components/EventSection/EventSection.jsx';
import AboutSection from './components/AboutSection/AboutSection.jsx';
import HowItWorksSection from './components/HowItWorksSection/HowItWorksSection.jsx';
import FeedbackSection from './components/FeedbackSection/FeedbackSection.jsx';
import Footer from './components/Footer/Footer.jsx';
import LoginModal from './components/Auth/LoginModal.jsx';
import SignupModal from './components/Auth/SignupModal.jsx';
import LogoutConfirmationModal from './components/Auth/LogoutConfirmationModal.jsx';
import './App.css';

function App() {
  const [activeCategory, setActiveCategory] = useState('all');

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  return (
    <Provider store={store}>
      <div className="app">
        <Navbar />
        <Hero />

        {/* Gallery Section */}
        <EventGallery />

        {/* Events Section with Mobile Reordering */}
        <div className="events-container">
          {/* Header - appears first on mobile */}
          <div className="event-header-wrapper">
            <EventSectionHeader />
          </div>

          {/* Category Tabs - appears second on mobile */}
          <div className="category-tabs-wrapper">
            <CategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* Event Grid - appears third on mobile */}
          <div className="event-grid-wrapper">
            <EventSection activeCategory={activeCategory} showHeader={false} />
          </div>
        </div>


        {/* About Us Section */}
        <AboutSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Feedback Section */}
        <FeedbackSection />

        {/* Footer */}
        <Footer />

        {/* Auth Modals - now managed by Redux */}
        <LoginModal />
        <SignupModal />
        <LogoutConfirmationModal />
      </div>
    </Provider>
  );
}

export default App;
