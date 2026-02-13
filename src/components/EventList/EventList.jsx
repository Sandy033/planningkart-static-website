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
            {events.map((event) => (
                <div key={event.id} className="event-card card-glass">
                    <div className="event-card-header">
                        <div>
                            <h4>{event.name}</h4>
                            <p className="event-meta">
                                <span className="category-badge">{getCategoryName(event.categoryId)}</span>
                                <span className={`status-badge ${event.isActive ? 'active' : 'inactive'}`}>
                                    {event.isActive ? '✅ Active' : '⏸️ Pending Approval'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="event-details">
                        <p className="event-description">{event.description}</p>
                        <div className="event-info">
                            <p>📅 {formatDate(event.date)} at {event.time}</p>
                            <p>📍 {event.location}</p>
                        </div>
                    </div>

                    <div className="event-actions">
                        <button className="btn btn-sm btn-outline" onClick={() => onEdit(event)}>
                            ✏️ Edit
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(event.id)}>
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EventList;
