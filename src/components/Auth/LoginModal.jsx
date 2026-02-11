import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../Modal/Modal';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { closeModal, switchToSignup } from '../../store/slices/modalSlice';
import './Auth.css';

const LoginModal = () => {
    const dispatch = useDispatch();
    const { loading, error: apiError } = useSelector((state) => state.auth);
    const { isLoginModalOpen, isTransitioning } = useSelector((state) => state.modal);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});

    // Clear errors when modal opens
    useEffect(() => {
        if (isLoginModalOpen) {
            dispatch(clearError());
            setErrors({});
        }
    }, [isLoginModalOpen, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (apiError) {
            dispatch(clearError());
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const result = await dispatch(loginUser(formData));

        if (loginUser.fulfilled.match(result)) {
            // Reset form and close modal on success
            setFormData({ email: '', password: '' });
            setErrors({});
            dispatch(closeModal());
        }
    };

    const handleSwitchToSignup = () => {
        dispatch(switchToSignup());
    };

    const handleClose = () => {
        dispatch(closeModal());
        setFormData({ email: '', password: '' });
        setErrors({});
        dispatch(clearError());
    };

    return (
        <Modal
            isOpen={isLoginModalOpen}
            onClose={handleClose}
            title="Welcome Back"
            isTransitioning={isTransitioning}
        >
            <form className="auth-form" onSubmit={handleSubmit}>
                {apiError && (
                    <div className="error-message">
                        {apiError}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className={`form-input ${errors.email ? 'error' : ''}`}
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                    />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className={`form-input ${errors.password ? 'error' : ''}`}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                    />
                    {errors.password && <span className="form-error">{errors.password}</span>}
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-lg form-submit"
                    disabled={loading}
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="form-footer">
                    <p>
                        Don't have an account?{' '}
                        <span className="form-link" onClick={handleSwitchToSignup}>
                            Sign up
                        </span>
                    </p>
                </div>
            </form>
        </Modal>
    );
};

export default LoginModal;
