import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchEvents = createAsyncThunk(
    'events/fetchEvents',
    async (_, { rejectWithValue }) => {
        try {
            const data = await api.get('/events');
            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch events');
        }
    }
);

export const createEvent = createAsyncThunk(
    'events/createEvent',
    async (eventData, { rejectWithValue }) => {
        try {
            // If eventData contains an image file, use FormData
            if (eventData.image) {
                const formData = new FormData();
                Object.keys(eventData).forEach(key => {
                    if (key === 'ageRestriction') {
                        formData.append(key, JSON.stringify(eventData[key]));
                    } else if (key === 'image') {
                        formData.append(key, eventData[key]);
                    } else if (eventData[key] !== null && eventData[key] !== undefined) {
                        formData.append(key, eventData[key]);
                    }
                });
                const data = await api.postFormData('/events', formData);
                return data;
            } else {
                const data = await api.post('/events', eventData);
                return data;
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create event');
        }
    }
);

export const updateEvent = createAsyncThunk(
    'events/updateEvent',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            // If data contains an image file, use FormData
            if (data.image) {
                const formData = new FormData();
                Object.keys(data).forEach(key => {
                    if (key === 'ageRestriction') {
                        formData.append(key, JSON.stringify(data[key]));
                    } else if (key === 'image') {
                        formData.append(key, data[key]);
                    } else if (data[key] !== null && data[key] !== undefined) {
                        formData.append(key, data[key]);
                    }
                });
                const response = await api.postFormData(`/events/${id}`, formData);
                return response;
            } else {
                const response = await api.put(`/events/${id}`, data);
                return response;
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update event');
        }
    }
);

export const deleteEvent = createAsyncThunk(
    'events/deleteEvent',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/events/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete event');
        }
    }
);

export const toggleEventStatus = createAsyncThunk(
    'events/toggleEventStatus',
    async ({ id, isActive }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/events/${id}/status`, { isActive });
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update event status');
        }
    }
);

const eventSlice = createSlice({
    name: 'events',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch events
            .addCase(fetchEvents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEvents.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create event
            .addCase(createEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createEvent.fulfilled, (state, action) => {
                state.loading = false;
                state.items.push(action.payload);
            })
            .addCase(createEvent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update event
            .addCase(updateEvent.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            // Delete event
            .addCase(deleteEvent.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
            })
            // Toggle event status
            .addCase(toggleEventStatus.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            });
    },
});

export const { clearError } = eventSlice.actions;
export default eventSlice.reducer;
