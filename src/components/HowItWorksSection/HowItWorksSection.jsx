import './HowItWorksSection.css';

const HowItWorksSection = () => {
    return (
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
    );
};

export default HowItWorksSection;
