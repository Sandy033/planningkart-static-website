import './AboutSection.css';

const AboutSection = () => {
    return (
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
    );
};

export default AboutSection;
