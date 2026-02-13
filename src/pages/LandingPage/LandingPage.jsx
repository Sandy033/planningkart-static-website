import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar.jsx';
import Hero from '../../components/Hero/Hero.jsx';
import EventGallery from '../../components/EventGallery/EventGallery.jsx';
import EventSectionHeader from '../../components/EventSectionHeader/EventSectionHeader.jsx';
import CategoryTabs from '../../components/CategoryTabs/CategoryTabs.jsx';
import EventSection from '../../components/EventSection/EventSection.jsx';
import AboutSection from '../../components/AboutSection/AboutSection.jsx';
import HowItWorksSection from '../../components/HowItWorksSection/HowItWorksSection.jsx';
import FeedbackSection from '../../components/FeedbackSection/FeedbackSection.jsx';
import Footer from '../../components/Footer/Footer.jsx';

const LandingPage = () => {
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
            <div className="events-container" id="events">
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
        </div>
    );
};

export default LandingPage;
