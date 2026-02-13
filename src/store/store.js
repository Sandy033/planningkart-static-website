import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import modalReducer from './slices/modalSlice';
import eventReducer from './slices/eventSlice';
import categoryReducer from './slices/categorySlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        modal: modalReducer,
        events: eventReducer,
        categories: categoryReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types for serializable check
                ignoredActions: ['modal/switchToLogin', 'modal/switchToSignup'],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;
