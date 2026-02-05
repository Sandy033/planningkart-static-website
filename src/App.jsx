import { useState } from 'react';
import Navbar from './components/Navbar/Navbar.jsx';
import Hero from './components/Hero/Hero.jsx';
import EventGallery from './components/EventGallery/EventGallery.jsx';
import EventSectionHeader from './components/EventSectionHeader/EventSectionHeader.jsx';
import CategoryTabs from './components/CategoryTabs/CategoryTabs.jsx';
import EventSection from './components/EventSection/EventSection.jsx';
import FeedbackSection from './components/FeedbackSection/FeedbackSection.jsx';
import Footer from './components/Footer/Footer.jsx';
import './App.css';

function App() {
  const [activeCategory, setActiveCategory] = useState('all');

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  return (
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
      <section id="about" className="about-section section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">About PlanningKart</h2>
              <p>
                PlanningKart is Bangalore's premier event discovery platform, connecting people with unforgettable experiences. Whether you're looking for creative workshops, thrilling adventures, or cultural events, we bring the best of Bangalore right to your fingertips.
              </p>
              <p>
                Our mission is to make event discovery and booking seamless, helping you explore new hobbies, meet like-minded people, and create lasting memories. From solo adventurers to corporate teams, we have something for everyone.
              </p>
              <div className="about-features">
                <div className="feature-item">
                  <div className="feature-icon">✨</div>
                  <h4>Curated Events</h4>
                  <p>Handpicked experiences from trusted organizers</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🎯</div>
                  <h4>Easy Booking</h4>
                  <p>Simple and secure booking process</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">💯</div>
                  <h4>Quality Assured</h4>
                  <p>Verified reviews and ratings from real participants</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">
              Get started with PlanningKart in three simple steps
            </p>
          </div>
          <div className="steps-grid">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-icon">🔍</div>
              <h3>Discover Events</h3>
              <p>Browse through our curated collection of events across various categories. Filter by your interests and location.</p>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-icon">📅</div>
              <h3>Book Your Spot</h3>
              <p>Select your preferred event, choose a convenient time slot, and complete the secure booking process.</p>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-icon">🎉</div>
              <h3>Enjoy the Experience</h3>
              <p>Show up and have an amazing time! Share your experience and help others discover great events.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <FeedbackSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
