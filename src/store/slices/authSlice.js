import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for user signup
export const signupUser = createAsyncThunk(
    'auth/signup',
    async (signupData, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupData),
            });

            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error.message || 'Signup failed');
            }

            const data = await response.json();

            // Store token and user data in localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('authUser', JSON.stringify({
                id: data.id,
                email: data.email,
                role: data.role,
                firstName: data.firstName || signupData.firstName,
                lastName: data.lastName || signupData.lastName,
            }));

            return {
                token: data.token,
                user: {
                    id: data.id,
                    email: data.email,
                    role: data.role,
                    firstName: data.firstName || signupData.firstName,
                    lastName: data.lastName || signupData.lastName,
                },
            };
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunk for user login
export const loginUser = createAsyncThunk(
    'auth/login',
    async (loginData, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });

            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error.message || 'Login failed');
            }

            const data = await response.json();

            // Store token and user data in localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('authUser', JSON.stringify({
                id: data.id,
                email: data.email,
                role: data.role,
                firstName: data.firstName,
                lastName: data.lastName,
            }));

            return {
                token: data.token,
                user: {
                    id: data.id,
                    email: data.email,
                    role: data.role,
                    firstName: data.firstName,
                    lastName: data.lastName,
                },
            };
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Initial state
const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

// Load user from localStorage on initialization
const loadUserFromStorage = () => {
    try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');

        if (storedToken && storedUser) {
            return {
                token: storedToken,
                user: JSON.parse(storedUser),
                isAuthenticated: true,
            };
        }
    } catch (error) {
        console.error('Error loading user from storage:', error);
    }
    return {};
};

// Auth slice
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        ...initialState,
        ...loadUserFromStorage(),
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Signup reducers
        builder
            .addCase(signupUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Login reducers
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
