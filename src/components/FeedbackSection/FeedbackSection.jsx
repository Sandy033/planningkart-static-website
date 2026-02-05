import { useState } from 'react';
import { testimonials } from '../../data/testimonials';
import './FeedbackSection.css';

const FeedbackSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
                ★
            </span>
        ));
    };

    // Show 3 testimonials at a time on desktop, 1 on mobile
    const getVisibleTestimonials = () => {
        const visible = [];
        for (let i = 0; i < 3; i++) {
            const index = (currentIndex + i) % testimonials.length;
            visible.push(testimonials[index]);
        }
        return visible;
    };

    return (
        <section id="feedback" className="feedback-section section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">What Our Customers Say</h2>
                    <p className="section-description">
                        Real experiences from real people who discovered amazing events through PlanningKart
                    </p>
                </div>

                <div className="testimonials-wrapper">
                    <button
                        className="testimonial-nav prev"
                        onClick={prevTestimonial}
                        aria-label="Previous testimonial"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>

                    <div className="testimonials-container">
                        {getVisibleTestimonials().map((testimonial, idx) => (
                            <div
                                key={testimonial.id}
                                className={`testimonial-card ${idx === 0 ? 'active' : ''} ${idx > 0 ? 'desktop-only' : ''}`}
                            >
                                <div className="testimonial-header">
                                    <div className="customer-avatar">
                                        <img
                                            src={`/images/${testimonial.image}`}
                                            alt={testimonial.name}
                                            onError={(e) => {
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=00a8a8&color=fff&size=80`;
                                            }}
                                        />
                                    </div>
                                    <div className="customer-info">
                                        <h4 className="customer-name">{testimonial.name}</h4>
                                        <p className="customer-event">{testimonial.event}</p>
                                    </div>
                                </div>
                                <div className="testimonial-rating">
                                    {renderStars(testimonial.rating)}
                                </div>
                                <p className="testimonial-comment">"{testimonial.comment}"</p>
                            </div>
                        ))}
                    </div>

                    <button
                        className="testimonial-nav next"
                        onClick={nextTestimonial}
                        aria-label="Next testimonial"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>

                <div className="testimonial-dots">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            className={`dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(index)}
                            aria-label={`Go to testimonial ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeedbackSection;
