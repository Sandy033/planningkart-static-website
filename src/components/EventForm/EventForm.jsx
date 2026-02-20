import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
    createDraftEvent,
    updateDraftEvent,
    uploadEventImage,
    deleteEventImage,
    setPrimaryImage,
    validateEvent,
    markEventAsReady,
} from '../../services/eventService';
import './EventForm.css';

const MAX_IMAGES = 10;
const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

const generateSlug = (title) =>
    title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

const EventForm = ({ event, onSuccess }) => {
    const { user } = useSelector((state) => state.auth);
    const { items: categories } = useSelector((state) => state.categories);

    // Draft state
    const [eventId, setEventId] = useState(event?.id || null);
    const [draftInitializing, setDraftInitializing] = useState(!event);

    // Form data
    const [formData, setFormData] = useState({
        title: event?.title || '',
        slug: event?.slug || '',
        description: event?.description || '',
        shortDescription: event?.shortDescription || '',
        categoryId: event?.category?.id || event?.categoryId || '',
        durationMinutes: event?.durationMinutes || '',
        minParticipants: event?.minParticipants || '',
        maxParticipants: event?.maxParticipants || '',
        ageRestrictionMin: event?.ageRestriction?.min || '',
        ageRestrictionMax: event?.ageRestriction?.max || '',
        difficultyLevel: event?.difficultyLevel || '',
        featured: event?.featured || false,
    });

    // Image state
    const [uploadedImages, setUploadedImages] = useState([]);
    const [uploadQueue, setUploadQueue] = useState([]); // { id, file, progress, status, error }
    const [isDragOver, setIsDragOver] = useState(false);

    // Save state
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved'
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Submit state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [submitError, setSubmitError] = useState(null);

    const autoSaveTimerRef = useRef(null);
    const fileInputRef = useRef(null);

    // ─── Initialize draft on mount ───────────────────────────────────────────
    useEffect(() => {
        if (event) {
            // Editing existing event — load its images
            setDraftInitializing(false);
            return;
        }

        const initDraft = async () => {
            try {
                const firstCategoryId = categories[0]?.id;
                const draft = await createDraftEvent({
                    title: 'Untitled Event',
                    slug: `event-${Date.now()}`,
                    description: '',
                    category: firstCategoryId ? { id: firstCategoryId } : undefined,
                    organizer: user?.organizer ? user.organizer : undefined,
                });
                setEventId(draft.id);
            } catch (err) {
                console.error('Failed to create draft:', err);
                setSubmitError('Failed to initialize event draft. Please try again.');
            } finally {
                setDraftInitializing(false);
            }
        };

        initDraft();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Auto-save ───────────────────────────────────────────────────────────
    const buildEventPayload = useCallback(() => {
        const payload = {
            title: formData.title || 'Untitled Event',
            slug: formData.slug || `event-${Date.now()}`,
            description: formData.description,
            shortDescription: formData.shortDescription || null,
            category: formData.categoryId ? { id: parseInt(formData.categoryId) } : undefined,
            organizer: user?.organizer ? user.organizer : undefined,
            durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : null,
            minParticipants: formData.minParticipants ? parseInt(formData.minParticipants) : null,
            maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
            difficultyLevel: formData.difficultyLevel || null,
            featured: formData.featured,
        };
        if (formData.ageRestrictionMin && formData.ageRestrictionMax) {
            payload.ageRestriction = {
                min: parseInt(formData.ageRestrictionMin),
                max: parseInt(formData.ageRestrictionMax),
            };
        }
        return payload;
    }, [formData, user]);

    const saveDraft = useCallback(async () => {
        if (!eventId || !hasUnsavedChanges) return;
        setSaveStatus('saving');
        try {
            await updateDraftEvent(eventId, buildEventPayload());
            setSaveStatus('saved');
            setHasUnsavedChanges(false);
        } catch (err) {
            console.error('Auto-save failed:', err);
            setSaveStatus('unsaved');
        }
    }, [eventId, hasUnsavedChanges, buildEventPayload]);

    useEffect(() => {
        if (!hasUnsavedChanges) return;
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(saveDraft, AUTO_SAVE_INTERVAL);
        return () => clearTimeout(autoSaveTimerRef.current);
    }, [hasUnsavedChanges, saveDraft]);

    // ─── Form change handlers ─────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => {
            const updated = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            };
            if (name === 'title') {
                updated.slug = generateSlug(value);
            }
            return updated;
        });
        setHasUnsavedChanges(true);
        setSaveStatus('unsaved');
    };

    // ─── Image upload helpers ─────────────────────────────────────────────────
    const validateFile = (file) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
            return 'Only JPEG, PNG, and WebP images are allowed.';
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            return `File size must be under ${MAX_FILE_SIZE_MB} MB.`;
        }
        return null;
    };

    const processFiles = async (files) => {
        if (!eventId) return;
        const remaining = MAX_IMAGES - uploadedImages.length - uploadQueue.filter(q => q.status === 'uploading').length;
        const filesToProcess = Array.from(files).slice(0, remaining);

        for (const file of filesToProcess) {
            const fileError = validateFile(file);
            const queueId = `${Date.now()}-${Math.random()}`;

            if (fileError) {
                setUploadQueue((prev) => [
                    ...prev,
                    { id: queueId, file, progress: 0, status: 'error', error: fileError },
                ]);
                continue;
            }

            setUploadQueue((prev) => [
                ...prev,
                { id: queueId, file, progress: 0, status: 'uploading', error: null },
            ]);

            try {
                const isPrimary = uploadedImages.length === 0;
                const displayOrder = uploadedImages.length + 1;

                const uploaded = await uploadEventImage(
                    eventId,
                    file,
                    isPrimary,
                    displayOrder,
                    (progress) => {
                        setUploadQueue((prev) =>
                            prev.map((q) => (q.id === queueId ? { ...q, progress } : q))
                        );
                    }
                );

                setUploadedImages((prev) => [...prev, uploaded]);
                setUploadQueue((prev) =>
                    prev.map((q) => (q.id === queueId ? { ...q, status: 'done', progress: 100 } : q))
                );

                // Remove from queue after a short delay
                setTimeout(() => {
                    setUploadQueue((prev) => prev.filter((q) => q.id !== queueId));
                }, 1500);
            } catch (err) {
                setUploadQueue((prev) =>
                    prev.map((q) =>
                        q.id === queueId
                            ? { ...q, status: 'error', error: err.message || 'Upload failed' }
                            : q
                    )
                );
            }
        }
    };

    const handleFileInputChange = (e) => {
        processFiles(e.target.files);
        e.target.value = ''; // reset so same file can be re-selected
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        processFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleDeleteImage = async (imageId) => {
        try {
            await deleteEventImage(eventId, imageId);
            setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
        } catch (err) {
            console.error('Failed to delete image:', err);
        }
    };

    const handleSetPrimary = async (imageId) => {
        try {
            await setPrimaryImage(eventId, imageId);
            setUploadedImages((prev) =>
                prev.map((img) => ({ ...img, isPrimary: img.id === imageId }))
            );
        } catch (err) {
            console.error('Failed to set primary image:', err);
        }
    };

    const removeFromQueue = (queueId) => {
        setUploadQueue((prev) => prev.filter((q) => q.id !== queueId));
    };

    // ─── Submit for review ────────────────────────────────────────────────────
    const handleSubmitForReview = async () => {
        if (!eventId) return;
        setIsSubmitting(true);
        setValidationErrors([]);
        setSubmitError(null);

        try {
            // Save any pending changes first
            if (hasUnsavedChanges) {
                await updateDraftEvent(eventId, buildEventPayload());
                setHasUnsavedChanges(false);
            }

            // Validate
            const validation = await validateEvent(eventId);
            if (!validation.valid) {
                setValidationErrors(validation.errors || ['Event is not complete.']);
                setIsSubmitting(false);
                return;
            }

            // Mark as ready
            await markEventAsReady(eventId);
            onSuccess();
        } catch (err) {
            setSubmitError(err.message || 'Submission failed. Please try again.');
            setIsSubmitting(false);
        }
    };

    // ─── Save draft manually ──────────────────────────────────────────────────
    const handleSaveDraft = async () => {
        if (!eventId) return;
        setSaveStatus('saving');
        try {
            await updateDraftEvent(eventId, buildEventPayload());
            setSaveStatus('saved');
            setHasUnsavedChanges(false);
        } catch (err) {
            setSaveStatus('unsaved');
            setSubmitError(err.message || 'Save failed.');
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    if (draftInitializing) {
        return (
            <div className="event-form-loading">
                <div className="spinner" />
                <p>Initializing draft event…</p>
            </div>
        );
    }

    const totalImages = uploadedImages.length;
    const activeUploads = uploadQueue.filter((q) => q.status === 'uploading').length;
    const canAddMore = totalImages + activeUploads < MAX_IMAGES;

    return (
        <div className="event-form">
            {/* Save status */}
            <div className="save-status-bar">
                {saveStatus === 'saving' && <span className="save-status saving">⏳ Saving…</span>}
                {saveStatus === 'saved' && <span className="save-status saved">✅ All changes saved</span>}
                {saveStatus === 'unsaved' && <span className="save-status unsaved">● Unsaved changes</span>}
            </div>

            {/* Title */}
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

            {/* Slug */}
            <div className="form-group">
                <label className="form-label">Slug</label>
                <input
                    type="text"
                    name="slug"
                    className="form-input"
                    value={formData.slug}
                    readOnly
                    placeholder="auto-generated-from-title"
                />
                <small className="form-hint">Auto-generated from title</small>
            </div>

            {/* Description */}
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

            {/* Short Description */}
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
                <small className="form-hint">{formData.shortDescription.length}/500 characters</small>
            </div>

            {/* Category + Duration */}
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
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
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

            {/* Participants */}
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

            {/* Age Restriction */}
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Min Age</label>
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
                    <label className="form-label">Max Age</label>
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

            {/* Difficulty + Featured */}
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
                <div className="form-group form-group--center">
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
            </div>

            {/* ── Image Upload Section ── */}
            <div className="form-group">
                <label className="form-label">
                    Event Images
                    <span className="form-hint-inline"> ({totalImages}/{MAX_IMAGES} uploaded)</span>
                </label>

                {/* Drop zone */}
                {canAddMore && (
                    <div
                        className={`image-drop-zone ${isDragOver ? 'drag-over' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                        aria-label="Upload images"
                    >
                        <div className="drop-zone-icon">🖼️</div>
                        <p className="drop-zone-text">
                            Drag &amp; drop images here, or <span className="drop-zone-link">click to browse</span>
                        </p>
                        <p className="drop-zone-hint">JPEG, PNG, WebP · Max {MAX_FILE_SIZE_MB} MB each</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={handleFileInputChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                )}

                {/* Upload queue (in-progress / errors) */}
                {uploadQueue.length > 0 && (
                    <div className="upload-queue">
                        {uploadQueue.map((item) => (
                            <div key={item.id} className={`upload-item upload-item--${item.status}`}>
                                <div className="upload-item-info">
                                    <span className="upload-item-name">{item.file.name}</span>
                                    {item.status === 'error' && (
                                        <span className="upload-item-error">{item.error}</span>
                                    )}
                                </div>
                                {item.status === 'uploading' && (
                                    <div className="upload-progress-bar">
                                        <div
                                            className="upload-progress-fill"
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>
                                )}
                                {item.status === 'done' && <span className="upload-done-icon">✅</span>}
                                {item.status === 'error' && (
                                    <button
                                        type="button"
                                        className="upload-remove-btn"
                                        onClick={() => removeFromQueue(item.id)}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Uploaded images grid */}
                {uploadedImages.length > 0 && (
                    <div className="uploaded-images-grid">
                        {uploadedImages.map((img) => (
                            <div
                                key={img.id}
                                className={`uploaded-image-card ${img.isPrimary ? 'is-primary' : ''}`}
                            >
                                <img
                                    src={img.imageUrl || img.url}
                                    alt="Event"
                                    className="uploaded-image-thumb"
                                />
                                {img.isPrimary && (
                                    <span className="primary-badge">Primary</span>
                                )}
                                <div className="image-card-actions">
                                    {!img.isPrimary && (
                                        <button
                                            type="button"
                                            className="img-action-btn img-action-btn--primary"
                                            onClick={() => handleSetPrimary(img.id)}
                                            title="Set as primary"
                                        >
                                            ⭐
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="img-action-btn img-action-btn--delete"
                                        onClick={() => handleDeleteImage(img.id)}
                                        title="Delete image"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {uploadedImages.length === 0 && uploadQueue.length === 0 && (
                    <p className="form-hint">At least one image is required before submitting for review.</p>
                )}
            </div>

            {/* Validation errors */}
            {validationErrors.length > 0 && (
                <div className="validation-errors">
                    <strong>Please fix the following issues:</strong>
                    <ul>
                        {validationErrors.map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Submit error */}
            {submitError && (
                <div className="submit-error">{submitError}</div>
            )}

            {/* Form actions */}
            <div className="form-actions">
                <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleSaveDraft}
                    disabled={!hasUnsavedChanges || saveStatus === 'saving'}
                >
                    {saveStatus === 'saving' ? 'Saving…' : 'Save Draft'}
                </button>
                <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={handleSubmitForReview}
                    disabled={isSubmitting || uploadQueue.some((q) => q.status === 'uploading')}
                >
                    {isSubmitting ? 'Submitting…' : 'Submit for Review'}
                </button>
            </div>
        </div>
    );
};

export default EventForm;
