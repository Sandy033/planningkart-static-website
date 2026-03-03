import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchEvents } from '../../store/slices/eventSlice';
import EventCard from '../EventCard';
import './EventSection.css';

const EventSection = ({ activeCategory, showHeader = true }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: allEvents, loading } = useSelector((state) => state.events);
    const eventSectionRef = useRef(null);

    // Fetch published events on mount
    useEffect(() => {
        dispatch(fetchEvents());
    }, [dispatch]);

    // Scroll to top of section when category changes
    useEffect(() => {
        if (eventSectionRef.current) {
            const eventsGrid = eventSectionRef.current.querySelector('.events-grid');
            if (eventsGrid) {
                eventsGrid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [activeCategory]);

    // Filter by category tab — 'all' shows everything
    const displayedEvents = activeCategory === 'all'
        ? allEvents
        : allEvents.filter((event) => {
            // The event DTO uses 'eventCategory' with an 'id' field
            const catId = event.eventCategory?.id ?? event.category?.id;
            return String(catId) === String(activeCategory);
        });

    const handleCardClick = (eventId) => {
        navigate(`/events/${eventId}`);
    };

    return (
        <section id="events" className="event-section section" ref={eventSectionRef}>
            <div className="container">
                {showHeader && (
                    <div className="section-header">
                        <h2 className="section-title">Discover Amazing Events</h2>
                        <p className="section-description">
                            Browse through our curated collection of events and experiences
                        </p>
                    </div>
                )}

                {loading ? (
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
                                    style={{ animationDelay: `${index * 0.05}s`, cursor: 'pointer' }}
                                    onClick={() => handleCardClick(event.id)}
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
