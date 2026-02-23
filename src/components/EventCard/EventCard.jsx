import { useDispatch, useSelector } from 'react-redux';
import { deleteEvent } from '../../store/slices/eventSlice';
import './EventCard.css';

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

    const primaryImage = event.images?.find(img => img.isPrimary) || event.images?.[0];
    const imageUrl = event.imageUrl || event.image || (primaryImage ? primaryImage.imageUrl || primaryImage.url : `https://via.placeholder.com/400x300/8b5cf6/ffffff?text=${encodeURIComponent(event.title || 'Event')}`);

    return (
        <div className="event-card">
            <div className="event-image-wrapper">
                <img
                    src={imageUrl}
                    alt={event.title}
                    className="event-image"
                    onError={(e) => {
                        e.target.src = `https://via.placeholder.com/400x300/8b5cf6/ffffff?text=${encodeURIComponent(event.title || 'Event')}`;
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
