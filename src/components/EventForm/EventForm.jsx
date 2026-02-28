import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
    createDraftEvent,
    updateDraftEvent,
    uploadEventMedia,
    deleteEventMedia,
    setPrimaryMedia,
    validateEvent,
    markEventAsReady,
    createEventPlan,
    deleteEventPlan,
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

const BLANK_PLAN = {
    title: '',
    shortDescription: '',
    description: '',
    pricePerPerson: '',
    currency: 'INR',
    items: [], // EventPlanItems
};

const BLANK_ITEM = { title: '', description: '' };

const EventForm = ({ event, onSuccess }) => {
    const { user } = useSelector((state) => state.auth);
    const { items: categories } = useSelector((state) => state.categories);

    // Draft state
    const [eventId, setEventId] = useState(event?.id || null);
    const [draftInitializing, setDraftInitializing] = useState(!event);

    // Form data — support both raw Event model fields and EventResponse DTO field names
    const [formData, setFormData] = useState({
        title: event?.title || '',
        slug: event?.slug || '',
        description: event?.description || '',
        shortDescription: event?.shortDescription || '',
        // EventResponse uses 'eventCategory'; raw Event model uses 'category'
        categoryId: event?.eventCategory?.id || event?.category?.id || event?.categoryId || '',
        durationMinutes: event?.durationMinutes || '',
        minParticipants: event?.minParticipants || '',
        maxParticipants: event?.maxParticipants || '',
        ageRestrictionMin: event?.ageRestriction?.min || '',
        ageRestrictionMax: event?.ageRestriction?.max || '',
        difficultyLevel: event?.difficultyLevel || '',
        featured: event?.featured || false,
    });

    // Media state — EventResponse uses 'medias'; raw Event model uses 'media'
    const [uploadedImages, setUploadedImages] = useState(
        (event?.medias || event?.media || []).map(m => ({ ...m }))
    );
    const [uploadQueue, setUploadQueue] = useState([]); // { id, file, progress, status, error }
    const [isDragOver, setIsDragOver] = useState(false);

    // Plan state — EventResponse uses 'eventPlan'; raw Event model uses 'plans'
    const [savedPlans, setSavedPlans] = useState(
        (event?.eventPlan || event?.plans || []).map((p) => ({
            id: p.id,
            title: p.title,
            shortDescription: p.shortDescription,
            description: p.description,
            pricePerPerson: p.pricePerPerson,
            currency: p.currency || 'INR',
            items: p.items || [],
        }))
    );
    const [planFormOpen, setPlanFormOpen] = useState(false);
    const [planFormData, setPlanFormData] = useState(BLANK_PLAN);
    const [itemDraft, setItemDraft] = useState(BLANK_ITEM); // current item being typed
    const [expandedPlanId, setExpandedPlanId] = useState(null); // for expand/collapse
    const [savingPlan, setSavingPlan] = useState(false);
    const [planError, setPlanError] = useState(null);

    // Save state
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved'
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Submit state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [submitError, setSubmitError] = useState(null);

    const autoSaveTimerRef = useRef(null);
    const fileInputRef = useRef(null);
    const hasInitializedRef = useRef(false);

    // ─── Initialize draft on mount ───────────────────────────────────────────
    useEffect(() => {
        if (event) {
            setDraftInitializing(false);
            return;
        }

        if (hasInitializedRef.current) return;
        hasInitializedRef.current = true;

        const initDraft = async () => {
            try {
                const firstCategoryId = categories[0]?.id;
                const organizerId = user?.organizer?.id;
                const draft = await createDraftEvent({
                    title: 'Untitled Event',
                    slug: `event-${Date.now()}`,
                    description: ' ',
                    category: firstCategoryId ? { id: firstCategoryId } : undefined,
                    organizer: organizerId ? { id: organizerId } : undefined,
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
        const organizerId = user?.organizer?.id;
        const payload = {
            title: formData.title || 'Untitled Event',
            slug: formData.slug || `event-${Date.now()}`,
            description: formData.description || ' ',
            shortDescription: formData.shortDescription || null,
            category: formData.categoryId
                ? { id: parseInt(formData.categoryId) }
                // fallback: read from the event prop whichever DTO field exists
                : (event?.eventCategory?.id || event?.category?.id)
                    ? { id: event?.eventCategory?.id || event?.category?.id }
                    : undefined,
            organizer: organizerId ? { id: organizerId } : undefined,
            durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : null,
            minParticipants: formData.minParticipants ? parseInt(formData.minParticipants) : null,
            maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
            difficultyLevel: formData.difficultyLevel || null,
            featured: formData.featured,
            // status must be sent to satisfy @Column(nullable=false)
            status: event?.status || 'DRAFT',
            // Pass saved plan IDs so the backend associates them with the event
            plans: savedPlans.map((p) => ({ id: p.id })),
        };
        if (formData.ageRestrictionMin && formData.ageRestrictionMax) {
            payload.ageRestriction = {
                min: parseInt(formData.ageRestrictionMin),
                max: parseInt(formData.ageRestrictionMax),
            };
        }
        return payload;
    }, [formData, user, event]);

    // ─── Frontend validation ───────────────────────────────────────────────────
    const validateForm = useCallback(() => {
        const errors = [];
        if (!formData.title?.trim()) errors.push('Title is required.');
        if (!formData.shortDescription?.trim()) errors.push('Short description is required.');
        if (!formData.categoryId) errors.push('Category is required.');
        if (!formData.durationMinutes) errors.push('Duration is required.');
        if (!formData.difficultyLevel) errors.push('Difficulty level is required.');
        if (uploadedImages.length === 0) errors.push('At least one image is required.');
        if (savedPlans.length === 0) errors.push('At least one event plan is required.');
        return errors;
    }, [formData, uploadedImages, savedPlans]);

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
        // Don't auto-save while the plan form is open — avoid spurious PUTs
        if (!hasUnsavedChanges || planFormOpen) return;
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(saveDraft, AUTO_SAVE_INTERVAL);
        return () => clearTimeout(autoSaveTimerRef.current);
    }, [hasUnsavedChanges, planFormOpen, saveDraft]);

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

    // ─── Media upload helpers ─────────────────────────────────────────────────
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

                const uploaded = await uploadEventMedia(
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
        e.target.value = '';
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

    const handleDeleteImage = async (mediaId) => {
        try {
            await deleteEventMedia(eventId, mediaId);
            setUploadedImages((prev) => prev.filter((img) => img.id !== mediaId));
        } catch (err) {
            console.error('Failed to delete media:', err);
        }
    };

    const handleSetPrimary = async (mediaId) => {
        try {
            await setPrimaryMedia(eventId, mediaId);
            setUploadedImages((prev) =>
                prev.map((img) => ({ ...img, isPrimary: img.id === mediaId }))
            );
        } catch (err) {
            console.error('Failed to set primary media:', err);
        }
    };

    const removeFromQueue = (queueId) => {
        setUploadQueue((prev) => prev.filter((q) => q.id !== queueId));
    };

    // ─── Plan handlers ────────────────────────────────────────────────────────
    const handlePlanChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPlanFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleTogglePlanForm = () => {
        setPlanFormOpen((prev) => !prev);
        setPlanError(null);
        setPlanFormData(BLANK_PLAN);
        setItemDraft(BLANK_ITEM);
    };

    const handleItemDraftChange = (e) => {
        const { name, value } = e.target;
        setItemDraft((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddItem = () => {
        if (!itemDraft.title.trim()) return;
        setPlanFormData((prev) => ({
            ...prev,
            items: [...prev.items, { title: itemDraft.title.trim(), description: itemDraft.description.trim() }],
        }));
        setItemDraft(BLANK_ITEM);
    };

    const handleRemoveItem = (index) => {
        setPlanFormData((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const handleSavePlan = async () => {
        if (!eventId) return;
        const planErrors = [];
        if (!planFormData.title.trim()) planErrors.push('Plan title is required.');
        if (!planFormData.shortDescription?.trim()) planErrors.push('Plan short description is required.');
        if (!planFormData.pricePerPerson) planErrors.push('Price per person is required.');
        if (!planFormData.currency) planErrors.push('Currency is required.');
        if (planErrors.length > 0) {
            setPlanError(planErrors.join(' '));
            return;
        }

        setSavingPlan(true);
        setPlanError(null);
        try {
            const created = await createEventPlan(eventId, {
                title: planFormData.title.trim(),
                shortDescription: planFormData.shortDescription || null,
                description: planFormData.description || null,
                pricePerPerson: parseFloat(planFormData.pricePerPerson),
                currency: planFormData.currency || 'INR',
                items: planFormData.items,
            });
            setSavedPlans((prev) => [
                ...prev,
                {
                    id: created.id,
                    title: created.title,
                    shortDescription: created.shortDescription,
                    description: created.description,
                    pricePerPerson: created.pricePerPerson,
                    currency: created.currency || 'INR',
                    items: created.items || planFormData.items,
                },
            ]);
            setPlanFormOpen(false);
            setPlanFormData(BLANK_PLAN);
            setItemDraft(BLANK_ITEM);
        } catch (err) {
            setPlanError(err.message || 'Failed to save plan.');
        } finally {
            setSavingPlan(false);
        }
    };

    const handleRemovePlan = async (planId) => {
        try {
            await deleteEventPlan(planId);
            setSavedPlans((prev) => prev.filter((p) => p.id !== planId));
            setHasUnsavedChanges(true);
        } catch (err) {
            console.error('Failed to delete plan:', err);
        }
    };

    // ─── Submit for review ────────────────────────────────────────────────────
    const handleSubmitForReview = async () => {
        if (!eventId) return;
        setIsSubmitting(true);
        setValidationErrors([]);
        setSubmitError(null);

        try {
            // Save any pending changes first (includes plan IDs)
            await updateDraftEvent(eventId, buildEventPayload());
            setHasUnsavedChanges(false);

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
        const errors = validateForm();
        if (errors.length > 0) {
            setSubmitError(errors.join(' '));
            return;
        }
        setSaveStatus('saving');
        setSubmitError(null);
        try {
            await updateDraftEvent(eventId, buildEventPayload());
            setSaveStatus('saved');
            setHasUnsavedChanges(false);
            // Close the form and return to the organizer dashboard
            onSuccess();
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
                <label className="form-label">Short Description *</label>
                <textarea
                    name="shortDescription"
                    className="form-textarea"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    placeholder="Brief summary (max 500 characters)"
                    rows="3"
                    maxLength="500"
                    required
                />
                <small className="form-hint">{(formData.shortDescription || '').length}/500 characters</small>
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
                    <label className="form-label">Duration (minutes) *</label>
                    <input
                        type="number"
                        name="durationMinutes"
                        className="form-input"
                        value={formData.durationMinutes}
                        onChange={handleChange}
                        placeholder="e.g., 120"
                        min="1"
                        required
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
                    <label className="form-label">Difficulty Level *</label>
                    <select
                        name="difficultyLevel"
                        className="form-select"
                        value={formData.difficultyLevel}
                        onChange={handleChange}
                        required
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

            {/* ── Media Upload Section ── */}
            <div className="form-group">
                <label className="form-label">
                    Event Images *
                    <span className="form-hint-inline">({totalImages}/{MAX_IMAGES} uploaded)</span>
                </label>
                {uploadedImages.length === 0 && uploadQueue.length === 0 && (
                    <p className="form-field-error">At least one image is required.</p>
                )}

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

                {/* Upload queue */}
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
                                    src={img.url}
                                    alt={img.altText || 'Event'}
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

            {/* ── Event Plans Section ── */}
            <div className="plan-section">
                <div className="plan-section-header">
                    <div>
                        <span className="form-label">Event Plans</span>
                        {savedPlans.length > 0 && (
                            <span className="form-hint-inline">({savedPlans.length} plan{savedPlans.length !== 1 ? 's' : ''} added)</span>
                        )}
                    </div>
                    <button
                        type="button"
                        className={`plan-add-btn ${planFormOpen ? 'plan-add-btn--active' : ''}`}
                        onClick={handleTogglePlanForm}
                    >
                        {planFormOpen ? '✕ Cancel' : '+ Add Plan'}
                    </button>
                </div>

                {/* Saved plan cards */}
                {savedPlans.length > 0 && (
                    <div className="plan-cards">
                        {savedPlans.map((plan) => {
                            const isExpanded = expandedPlanId === plan.id;
                            return (
                                <div key={plan.id} className={`plan-card ${isExpanded ? 'plan-card--expanded' : ''}`}>
                                    <div className="plan-card-info">
                                        <span className="plan-card-title">{plan.title}</span>
                                        <span className="plan-card-price">
                                            {plan.currency} {Number(plan.pricePerPerson).toFixed(2)} / person
                                        </span>
                                    </div>
                                    <div className="plan-card-actions">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline"
                                            onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                                            title={isExpanded ? 'Collapse' : 'View details'}
                                        >
                                            {isExpanded ? '▲ Hide' : '▼ View'}
                                        </button>
                                        <button
                                            type="button"
                                            className="plan-card-remove-btn"
                                            onClick={() => handleRemovePlan(plan.id)}
                                            title="Remove plan"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    {isExpanded && (
                                        <div className="plan-card-details">
                                            {plan.shortDescription && (
                                                <p className="plan-detail-short">{plan.shortDescription}</p>
                                            )}
                                            {plan.description && (
                                                <p className="plan-detail-desc">{plan.description}</p>
                                            )}
                                            {plan.items && plan.items.length > 0 && (
                                                <ul className="plan-detail-items">
                                                    {plan.items.map((item, i) => (
                                                        <li key={i} className="plan-detail-item">
                                                            <span className="plan-detail-item-title">{item.title}</span>
                                                            {item.description && (
                                                                <span className="plan-detail-item-desc">{item.description}</span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {(!plan.items || plan.items.length === 0) && !plan.shortDescription && !plan.description && (
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>No additional details.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Collapsible plan form */}
                {planFormOpen && (
                    <div className="plan-form-panel">
                        <h4 className="plan-form-title">New Plan</h4>

                        <div className="form-group">
                            <label className="form-label">Plan Title *</label>
                            <input
                                type="text"
                                name="title"
                                className="form-input"
                                value={planFormData.title}
                                onChange={handlePlanChange}
                                placeholder="e.g., Standard Package"
                                maxLength="100"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Short Description</label>
                            <input
                                type="text"
                                name="shortDescription"
                                className="form-input"
                                value={planFormData.shortDescription}
                                onChange={handlePlanChange}
                                placeholder="One-liner summary"
                                maxLength="500"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                className="form-textarea"
                                value={planFormData.description}
                                onChange={handlePlanChange}
                                placeholder="Full details of what this plan includes"
                                rows="3"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Price Per Person *</label>
                                <input
                                    type="number"
                                    name="pricePerPerson"
                                    className="form-input"
                                    value={planFormData.pricePerPerson}
                                    onChange={handlePlanChange}
                                    placeholder="e.g., 1999.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Currency</label>
                                <input
                                    type="text"
                                    name="currency"
                                    className="form-input"
                                    value={planFormData.currency}
                                    onChange={handlePlanChange}
                                    placeholder="INR"
                                    maxLength="3"
                                />
                            </div>
                        </div>

                        {/* ── Plan Items ── */}
                        <div className="form-group">
                            <label className="form-label">Plan Items</label>

                            {/* Existing items list */}
                            {planFormData.items.length > 0 && (
                                <ul className="plan-items-list">
                                    {planFormData.items.map((item, idx) => (
                                        <li key={idx} className="plan-item-row">
                                            <div className="plan-item-info">
                                                <span className="plan-item-title">{item.title}</span>
                                                {item.description && (
                                                    <span className="plan-item-desc">{item.description}</span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                className="plan-item-remove-btn"
                                                onClick={() => handleRemoveItem(idx)}
                                                title="Remove item"
                                            >
                                                ✕
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* New item input */}
                            <div className="plan-item-add-row">
                                <input
                                    type="text"
                                    name="title"
                                    className="form-input"
                                    value={itemDraft.title}
                                    onChange={handleItemDraftChange}
                                    placeholder="Item title *"
                                    maxLength="200"
                                />
                                <input
                                    type="text"
                                    name="description"
                                    className="form-input"
                                    value={itemDraft.description}
                                    onChange={handleItemDraftChange}
                                    placeholder="Item description (optional)"
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={handleAddItem}
                                    disabled={!itemDraft.title.trim()}
                                >
                                    + Add
                                </button>
                            </div>
                        </div>

                        {planError && <div className="submit-error">{planError}</div>}

                        <div className="plan-form-actions">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={handleTogglePlanForm}
                                disabled={savingPlan}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSavePlan}
                                disabled={savingPlan}
                            >
                                {savingPlan ? 'Saving…' : 'Save Plan'}
                            </button>
                        </div>
                    </div>
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
