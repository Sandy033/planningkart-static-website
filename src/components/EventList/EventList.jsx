import { useDispatch, useSelector } from 'react-redux';
import { deleteEvent } from '../../store/slices/eventSlice';
import './EventList.css';

const EventList = ({ events, onEdit }) => {
    const dispatch = useDispatch();
    const { items: categories } = useSelector((state) => state.categories);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            await dispatch(deleteEvent(id));
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category?.name || 'Unknown';
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (events.length === 0) {
        return (
            <div className="empty-state">
                <p>No events yet. Create your first event!</p>
            </div>
        );
    }

    return (
        <div className="event-list">
            {events.map((event) => {
                // Backend sends `status` (DRAFT, READY, PUBLISHED)
                const isPublished = event.status === 'PUBLISHED';
                const isReady = event.status === 'READY';

                let statusText = '📝 Draft';
                let statusClass = 'inactive';
                if (isPublished) {
                    statusText = '✅ Active';
                    statusClass = 'active';
                } else if (isReady) {
                    statusText = '⏳ Pending Approval';
                    statusClass = 'inactive';
                }

                // Get primary image or first image
                const primaryImage = event.images?.find(img => img.isPrimary) || event.images?.[0];
                const imageUrl = event.imageUrl || event.image || (primaryImage ? primaryImage.imageUrl || primaryImage.url : `https://via.placeholder.com/400x300/8b5cf6/ffffff?text=${encodeURIComponent(event.title || 'Event')}`);

                return (
                    <div key={event.id} className="event-card card-glass" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        <div style={{ flexShrink: 0, width: '150px', height: '100px', borderRadius: '8px', overflow: 'hidden' }}>
                            <img src={imageUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div className="event-card-header" style={{ marginBottom: '12px' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>{event.title || 'Untitled Event'}</h4>
                                    <p className="event-meta" style={{ margin: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span className="category-badge">{event.category?.name || 'Unknown'}</span>
                                        <span className={`status-badge ${statusClass}`}>
                                            {statusText}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="event-details">
                                <p className="event-description" style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)' }}>
                                    {event.shortDescription || (event.description?.length > 100 ? `${event.description.substring(0, 100)}...` : event.description)}
                                </p>
                                <div className="event-info" style={{ display: 'flex', gap: '16px', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                                    {event.durationMinutes && <p style={{ margin: 0 }}>⏱️ {event.durationMinutes} mins</p>}
                                    {(event.minParticipants || event.maxParticipants) && (
                                        <p style={{ margin: 0 }}>
                                            👥 {event.minParticipants || 0} - {event.maxParticipants || 'Unlimited'} participants
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="event-actions" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                                <button className="btn btn-sm btn-outline" onClick={() => onEdit(event)}>
                                    ✏️ Edit
                                </button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(event.id)}>
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default EventList;
