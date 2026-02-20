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

// Upload an image to an event with progress tracking
export const uploadEventImage = (eventId, file, isPrimary, displayOrder, onProgress) => {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        if (isPrimary !== undefined) formData.append('isPrimary', isPrimary);
        if (displayOrder !== undefined) formData.append('displayOrder', displayOrder);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${BASE_URL}/events/${eventId}/images`);

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

// Get all images for an event
export const getEventImages = async (eventId) => {
    const response = await fetch(`${BASE_URL}/events/${eventId}/images`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

// Delete an image from an event
export const deleteEventImage = async (eventId, imageId) => {
    const response = await fetch(`${BASE_URL}/events/${eventId}/images/${imageId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Delete failed' }));
        throw new Error(error.message || 'Delete failed');
    }
    return true;
};

// Set an image as the primary image for an event
export const setPrimaryImage = async (eventId, imageId) => {
    const response = await fetch(`${BASE_URL}/events/${eventId}/images/${imageId}/primary`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({}),
    });
    return handleResponse(response);
};

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
