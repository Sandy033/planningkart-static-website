import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createEvent, updateEvent } from '../../store/slices/eventSlice';
import './EventForm.css';

const EventForm = ({ event, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: '',
        date: '',
        time: '',
        location: '',
        imageUrl: '',
    });

    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { items: categories } = useSelector((state) => state.categories);
    const { loading } = useSelector((state) => state.events);

    useEffect(() => {
        if (event) {
            setFormData({
                name: event.name || '',
                description: event.description || '',
                categoryId: event.categoryId || '',
                date: event.date || '',
                time: event.time || '',
                location: event.location || '',
                imageUrl: event.imageUrl || '',
            });
        }
    }, [event]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const eventData = {
            ...formData,
            organizerId: user.id,
            isActive: false, // New events start as inactive
        };

        if (event) {
            await dispatch(updateEvent({ id: event.id, data: eventData }));
        } else {
            await dispatch(createEvent(eventData));
        }

        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="event-form">
            <div className="form-group">
                <label className="form-label">Event Name *</label>
                <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter event name"
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                    name="description"
                    className="form-textarea"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your event"
                    rows="4"
                    required
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                        name="categoryId"
                        className="form-select"
                        value={formData.categoryId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Location *</label>
                    <input
                        type="text"
                        name="location"
                        className="form-input"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Event location"
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                        type="date"
                        name="date"
                        className="form-input"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Time *</label>
                    <input
                        type="time"
                        name="time"
                        className="form-input"
                        value={formData.time}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Image URL (Optional)</label>
                <input
                    type="url"
                    name="imageUrl"
                    className="form-input"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
            </button>
        </form>
    );
};

export default EventForm;
