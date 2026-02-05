import { useState, useEffect } from 'react';
import EventCard from './EventCard';
import { getEventsByCategory } from '../data/events';
import './EventSection.css';

const EventSection = ({ activeCategory }) => {
    const [displayedEvents, setDisplayedEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        // Simulate loading for smooth transition
        setTimeout(() => {
            const events = getEventsByCategory(activeCategory);
            setDisplayedEvents(events);
            setIsLoading(false);
        }, 300);
    }, [activeCategory]);

    return (
        <section id="events" className="event-section section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Discover Amazing Events</h2>
                    <p className="section-description">
                        Browse through our curated collection of events and experiences in Bangalore
                    </p>
                </div>

                {isLoading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading events...</p>
                    </div>
                ) : (
                    <>
                        <div className="events-grid">
                            {displayedEvents.map((event, index) => (
                                <div
                                    key={event.id}
                                    className="event-grid-item fade-in"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <EventCard event={event} />
                                </div>
                            ))}
                        </div>

                        {displayedEvents.length === 0 && (
                            <div className="no-events">
                                <p>No events found in this category.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default EventSection;
