import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoginModalOpen: false,
    isSignupModalOpen: false,
    isLogoutModalOpen: false,
    isTransitioning: false,
};

const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        openLoginModal: (state) => {
            state.isLoginModalOpen = true;
            state.isSignupModalOpen = false;
            state.isTransitioning = false;
        },
        openSignupModal: (state) => {
            state.isSignupModalOpen = true;
            state.isLoginModalOpen = false;
            state.isTransitioning = false;
        },
        openLogoutModal: (state) => {
            state.isLogoutModalOpen = true;
            state.isLoginModalOpen = false;
            state.isSignupModalOpen = false;
            state.isTransitioning = false;
        },
        closeModal: (state) => {
            state.isLoginModalOpen = false;
            state.isSignupModalOpen = false;
            state.isLogoutModalOpen = false;
            state.isTransitioning = false;
        },
        setTransitioning: (state, action) => {
            state.isTransitioning = action.payload;
        },
    },
});

export const {
    openLoginModal,
    openSignupModal,
    openLogoutModal,
    closeModal,
    setTransitioning,
} = modalSlice.actions;

// Thunks for handling delayed transitions
export const switchToLogin = () => (dispatch) => {
    dispatch(setTransitioning(true));
    setTimeout(() => {
        dispatch(openLoginModal());
    }, 200);
};

export const switchToSignup = () => (dispatch) => {
    dispatch(setTransitioning(true));
    setTimeout(() => {
        dispatch(openSignupModal());
    }, 200);
};

export default modalSlice.reducer;
