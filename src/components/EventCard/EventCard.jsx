import './EventCard.css';

const EventCard = ({ event }) => {
    const handleBookNow = () => {
        alert(`Booking feature coming soon! Event: ${event.title}`);
    };

    return (
        <div className="event-card">
            <div className="event-image-wrapper">
                <img
                    src={`/images/${event.image}`}
                    alt={event.title}
                    className="event-image"
                    onError={(e) => {
                        e.target.src = `https://via.placeholder.com/400x300/8b5cf6/ffffff?text=${encodeURIComponent(event.title)}`;
                    }}
                />
                <div className="event-price-badge">{event.price}</div>
            </div>
            <div className="event-content">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">
                    {event.description.length > 120
                        ? `${event.description.substring(0, 120)}...`
                        : event.description}
                </p>
                <div className="event-meta">
                    <div className="event-location">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>{event.location}</span>
                    </div>
                    <div className="event-duration">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{event.duration}</span>
                    </div>
                </div>
                <div className="event-footer">
                    <div className="event-rating">
                        <span className="rating-star">★</span>
                        <span className="rating-value">{event.rating}</span>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={handleBookNow}>
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
