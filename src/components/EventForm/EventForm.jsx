import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createEvent, updateEvent } from '../../store/slices/eventSlice';
import './EventForm.css';

const EventForm = ({ event, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        shortDescription: '',
        categoryId: '',
        durationMinutes: '',
        minParticipants: '',
        maxParticipants: '',
        ageRestrictionMin: '',
        ageRestrictionMax: '',
        difficultyLevel: '',
        status: 'DRAFT',
        featured: false,
        image: null,
    });

    const [imagePreview, setImagePreview] = useState(null);

    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { items: categories } = useSelector((state) => state.categories);
    const { loading } = useSelector((state) => state.events);

    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title || '',
                slug: event.slug || '',
                description: event.description || '',
                shortDescription: event.shortDescription || '',
                categoryId: event.category?.id || event.categoryId || '',
                durationMinutes: event.durationMinutes || '',
                minParticipants: event.minParticipants || '',
                maxParticipants: event.maxParticipants || '',
                ageRestrictionMin: event.ageRestriction?.min || '',
                ageRestrictionMax: event.ageRestriction?.max || '',
                difficultyLevel: event.difficultyLevel || '',
                status: event.status || 'DRAFT',
                featured: event.featured || false,
                image: null,
            });
        }
    }, [event]);

    // Auto-generate slug from title
    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'title') {
            setFormData({
                ...formData,
                title: value,
                slug: generateSlug(value),
            });
        } else if (type === 'checkbox') {
            setFormData({
                ...formData,
                [name]: checked,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                image: file,
            });

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate age restriction
        if (formData.ageRestrictionMin && formData.ageRestrictionMax) {
            if (parseInt(formData.ageRestrictionMin) >= parseInt(formData.ageRestrictionMax)) {
                alert('Minimum age must be less than maximum age');
                return;
            }
        }

        // Prepare event data
        const eventData = {
            title: formData.title,
            slug: formData.slug,
            description: formData.description,
            shortDescription: formData.shortDescription || null,
            categoryId: parseInt(formData.categoryId),
            durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : null,
            minParticipants: formData.minParticipants ? parseInt(formData.minParticipants) : null,
            maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
            difficultyLevel: formData.difficultyLevel || null,
            status: formData.status,
            featured: formData.featured,
        };

        // Add age restriction if both min and max are provided
        if (formData.ageRestrictionMin && formData.ageRestrictionMax) {
            eventData.ageRestriction = {
                min: parseInt(formData.ageRestrictionMin),
                max: parseInt(formData.ageRestrictionMax),
            };
        }

        // Add image if provided
        if (formData.image) {
            eventData.image = formData.image;
        }

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
                <label className="form-label">Event Title *</label>
                <input
                    type="text"
                    name="title"
                    className="form-input"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter event title"
                    maxLength="200"
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">Slug *</label>
                <input
                    type="text"
                    name="slug"
                    className="form-input"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="auto-generated-from-title"
                    maxLength="200"
                    required
                    readOnly
                />
                <small className="form-hint">Auto-generated from title</small>
            </div>

            <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                    name="description"
                    className="form-textarea"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your event in detail"
                    rows="6"
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">Short Description</label>
                <textarea
                    name="shortDescription"
                    className="form-textarea"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    placeholder="Brief summary (max 500 characters)"
                    rows="3"
                    maxLength="500"
                />
                <small className="form-hint">
                    {formData.shortDescription.length}/500 characters
                </small>
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
                    <label className="form-label">Duration (minutes)</label>
                    <input
                        type="number"
                        name="durationMinutes"
                        className="form-input"
                        value={formData.durationMinutes}
                        onChange={handleChange}
                        placeholder="e.g., 120"
                        min="1"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Min Participants</label>
                    <input
                        type="number"
                        name="minParticipants"
                        className="form-input"
                        value={formData.minParticipants}
                        onChange={handleChange}
                        placeholder="e.g., 5"
                        min="1"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Max Participants</label>
                    <input
                        type="number"
                        name="maxParticipants"
                        className="form-input"
                        value={formData.maxParticipants}
                        onChange={handleChange}
                        placeholder="e.g., 50"
                        min="1"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Age Restriction - Min</label>
                    <input
                        type="number"
                        name="ageRestrictionMin"
                        className="form-input"
                        value={formData.ageRestrictionMin}
                        onChange={handleChange}
                        placeholder="e.g., 18"
                        min="0"
                        max="120"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Age Restriction - Max</label>
                    <input
                        type="number"
                        name="ageRestrictionMax"
                        className="form-input"
                        value={formData.ageRestrictionMax}
                        onChange={handleChange}
                        placeholder="e.g., 65"
                        min="0"
                        max="120"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Difficulty Level</label>
                    <select
                        name="difficultyLevel"
                        className="form-select"
                        value={formData.difficultyLevel}
                        onChange={handleChange}
                    >
                        <option value="">Select difficulty</option>
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Status *</label>
                    <select
                        name="status"
                        className="form-select"
                        value={formData.status}
                        onChange={handleChange}
                        required
                    >
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="ARCHIVED">Archived</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Event Image</label>
                <input
                    type="file"
                    name="image"
                    className="form-input"
                    onChange={handleImageChange}
                    accept="image/*"
                />
                {imagePreview && (
                    <div className="image-preview">
                        <img src={imagePreview} alt="Event preview" />
                    </div>
                )}
            </div>

            <div className="form-group">
                <label className="form-checkbox">
                    <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleChange}
                    />
                    <span>Featured Event</span>
                </label>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
            </button>
        </form>
    );
};

export default EventForm;
