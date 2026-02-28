import { useDispatch, useSelector } from 'react-redux';
import { deleteEvent } from '../../store/slices/eventSlice';
import './EventCard.css';

// Inline SVG fallback — no external network call
const makeFallbackSvg = (text) => {
    const label = encodeURIComponent(text.slice(0, 24));
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%238b5cf6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23fff'%3E${label}%3C/text%3E%3C/svg%3E`;
};

const EventCard = ({ event }) => {
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const handleBookNow = () => {
        alert(`Booking feature coming soon! Event: ${event.title}`);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            await dispatch(deleteEvent(event.id));
        }
    };

    // Determine if the current user is the organizer of the event
    const isOwner = isAuthenticated &&
        user?.role === 'ORGANIZER' &&
        user?.organizer?.id === event?.organizer?.id;

    const primaryImage = event.media?.find(img => img.isPrimary) || event.media?.[0];
    const imageUrl = primaryImage?.url || makeFallbackSvg(event.title || 'Event');

    return (
        <div className="event-card">
            <div className="event-image-wrapper">
                <img
                    src={imageUrl}
                    alt={event.title}
                    className="event-image"
                    onError={(e) => {
                        // Guard against infinite error loop
                        if (!e.target.dataset.fallback) {
                            e.target.dataset.fallback = 'true';
                            e.target.src = makeFallbackSvg(event.title || 'Event');
                        }
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
                    <div className="event-duration">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{event.durationMinutes ? `${event.durationMinutes} mins` : 'TBD'}</span>
                    </div>
                    <div className="event-location" style={{ marginLeft: '12px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span>{event.minParticipants || 0} - {event.maxParticipants || 'Unl'} participants</span>
                    </div>
                </div>
                <div className="event-footer">
                    <div className="event-actions">
                        {isOwner && (
                            <button className="btn btn-sm btn-danger" style={{ marginRight: '10px' }} onClick={handleDelete}>
                                Delete
                            </button>
                        )}
                        <button className="btn btn-primary btn-sm" onClick={handleBookNow}>
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
