import './Hero.css';

const Hero = () => {
    const scrollToEvents = () => {
        const element = document.getElementById('events');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section id="hero" className="hero">
            <div className="hero-content">
                <div className="hero-badge fade-in">
                    <span>🎉</span> Discover Bangalore's Best Events
                </div>
                <h1 className="hero-title fade-in">
                    Your Gateway to <br />
                    <span className="gradient-text">Unforgettable Experiences</span>
                </h1>
                <p className="hero-description fade-in">
                    From creative workshops to thrilling adventures, discover and book the perfect event for every occasion. PlanningKart brings Bangalore's vibrant culture right to your fingertips.
                </p>
                <div className="hero-cta fade-in">
                    <button className="btn btn-primary btn-lg" onClick={scrollToEvents}>
                        Explore Events
                    </button>
                    <button className="btn btn-outline btn-lg" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                        How It Works
                    </button>
                </div>
                <div className="hero-stats fade-in">
                    <div className="stat">
                        <div className="stat-number">42+</div>
                        <div className="stat-label">Events</div>
                    </div>
                    <div className="stat">
                        <div className="stat-number">14</div>
                        <div className="stat-label">Categories</div>
                    </div>
                    <div className="stat">
                        <div className="stat-number">4.8★</div>
                        <div className="stat-label">Rating</div>
                    </div>
                </div>
            </div>
            <div className="hero-decoration">
                <div className="decoration-circle circle-1"></div>
                <div className="decoration-circle circle-2"></div>
                <div className="decoration-circle circle-3"></div>
            </div>
        </section>
    );
};

export default Hero;
