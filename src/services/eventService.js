const BASE_URL = '/v1';

const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }
    // Some endpoints return 204 No Content
    if (response.status === 204) return null;
    return response.json();
};

// Create a draft event
export const createDraftEvent = async (eventData) => {
    const response = await fetch(`${BASE_URL}/events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(eventData),
    });
    return handleResponse(response);
};

// Update a draft event
export const updateDraftEvent = async (eventId, eventData) => {
    const response = await fetch(`${BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(eventData),
    });
    return handleResponse(response);
};

// ── Event Media (images/videos) ──────────────────────────────────────────────

// Upload media (image or video) to an event with progress tracking
export const uploadEventMedia = (eventId, file, isPrimary, displayOrder, onProgress) => {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        if (isPrimary !== undefined) formData.append('isPrimary', isPrimary);
        if (displayOrder !== undefined) formData.append('displayOrder', displayOrder);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${BASE_URL}/events/${eventId}/media`);

        const token = localStorage.getItem('authToken');
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        if (onProgress) {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    onProgress(Math.round((e.loaded / e.total) * 100));
                }
            });
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch {
                    resolve(null);
                }
            } else {
                try {
                    const err = JSON.parse(xhr.responseText);
                    reject(new Error(err.message || 'Upload failed'));
                } catch {
                    reject(new Error('Upload failed'));
                }
            }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
    });
};

// Keep legacy alias so any other callers don't break immediately
export const uploadEventImage = uploadEventMedia;

// Get all media for an event
export const getEventMedia = async (eventId) => {
    const response = await fetch(`${BASE_URL}/events/${eventId}/media`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

// Delete media from an event
export const deleteEventMedia = async (eventId, mediaId) => {
    const response = await fetch(`${BASE_URL}/events/${eventId}/media/${mediaId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Delete failed' }));
        throw new Error(error.message || 'Delete failed');
    }
    return true;
};

// Keep legacy alias
export const deleteEventImage = deleteEventMedia;

// Set a media item as the primary for an event
export const setPrimaryMedia = async (eventId, mediaId) => {
    const response = await fetch(`${BASE_URL}/events/${eventId}/media/${mediaId}/primary`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({}),
    });
    return handleResponse(response);
};

// Keep legacy alias
export const setPrimaryImage = setPrimaryMedia;

// ── Event Plans ───────────────────────────────────────────────────────────────

// Create an EventPlan linked to an event
export const createEventPlan = async (eventId, planData) => {
    const response = await fetch(`${BASE_URL}/event-plans`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({
            ...planData,
            event: { id: eventId },
        }),
    });
    return handleResponse(response);
};

// Delete an EventPlan by ID
export const deleteEventPlan = async (planId) => {
    const response = await fetch(`${BASE_URL}/event-plans/${planId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Delete failed' }));
        throw new Error(error.message || 'Delete plan failed');
    }
    return true;
};

// ── Event lifecycle ───────────────────────────────────────────────────────────

// Validate event completeness before submission
export const validateEvent = async (eventId) => {
    const response = await fetch(`${BASE_URL}/events/${eventId}/validate`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

// Mark event as ready for admin review
export const markEventAsReady = async (eventId) => {
    const response = await fetch(`${BASE_URL}/events/${eventId}/ready`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({}),
    });
    return handleResponse(response);
};

// Fetch organizer's own events
export const fetchOrganizerEvents = async () => {
    const response = await fetch(`${BASE_URL}/events`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

// Publish event (Admin only)
export const publishEvent = async (eventId) => {
    const response = await fetch(`${BASE_URL}/events/${eventId}/publish`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({}),
    });
    return handleResponse(response);
};

// Unpublish event (Admin only)
export const unpublishEvent = async (eventId) => {
    const response = await fetch(`${BASE_URL}/events/${eventId}/unpublish`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({}),
    });
    return handleResponse(response);
};
