import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Modal from '../Modal/Modal';
import { signupUser, signupOrganizer, clearError } from '../../store/slices/authSlice';
import { closeModal, switchToLogin } from '../../store/slices/modalSlice';
import './Auth.css';

const SignupModal = () => {
    const dispatch = useDispatch();
    const { loading, error: apiError } = useSelector((state) => state.auth);
    const { isSignupModalOpen, isTransitioning } = useSelector((state) => state.modal);
    const navigate = useNavigate();

    const [isOrganizer, setIsOrganizer] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        dateOfBirth: '',
        // Organization fields
        organizationName: '',
        contactEmail: '',
        contactPhone: '',
        websiteUrl: '',
        description: '',
    });
    const [errors, setErrors] = useState({});

    // Clear errors when modal opens
    useEffect(() => {
        if (isSignupModalOpen) {
            dispatch(clearError());
            setErrors({});
        }
    }, [isSignupModalOpen, dispatch]);

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

        // First Name validation
        if (!formData.firstName) {
            newErrors.firstName = 'First name is required';
        } else if (formData.firstName.length > 50) {
            newErrors.firstName = 'First name must be less than 50 characters';
        }

        // Last Name validation
        if (!formData.lastName) {
            newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.length > 50) {
            newErrors.lastName = 'Last name must be less than 50 characters';
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        } else if (formData.email.length > 100) {
            newErrors.email = 'Email must be less than 100 characters';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (formData.password.length > 100) {
            newErrors.password = 'Password must be less than 100 characters';
        }

        // Phone Number validation (optional)
        if (formData.phoneNumber && formData.phoneNumber.length > 15) {
            newErrors.phoneNumber = 'Phone number must be less than 15 characters';
        }

        setErrors(newErrors);
        if (isOrganizer) {
            if (!formData.organizationName) {
                newErrors.organizationName = 'Organization Name is required';
            }
            if (!formData.contactEmail) {
                newErrors.contactEmail = 'Contact Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
                newErrors.contactEmail = 'Please enter a valid email';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        let result;
        if (isOrganizer) {
            const organizerData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber,
                dateOfBirth: formData.dateOfBirth,
                organizationName: formData.organizationName,
                contactEmail: formData.contactEmail,
                contactPhone: formData.contactPhone,
                websiteUrl: formData.websiteUrl,
                description: formData.description,
            };
            result = await dispatch(signupOrganizer(organizerData));
        } else {
            // Prepare data for API (only send non-empty optional fields)
            const signupData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
            };

            if (formData.phoneNumber) {
                signupData.phoneNumber = formData.phoneNumber;
            }

            if (formData.dateOfBirth) {
                signupData.dateOfBirth = formData.dateOfBirth;
            }
            result = await dispatch(signupUser(signupData));
        }

        if (signupUser.fulfilled.match(result) || signupOrganizer.fulfilled.match(result)) {
            // Reset form and close modal on success
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                phoneNumber: '',
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                phoneNumber: '',
                dateOfBirth: '',
                organizationName: '',
                contactEmail: '',
                contactPhone: '',
                websiteUrl: '',
                description: '',
            });
            setIsOrganizer(false);
            setErrors({});
            dispatch(closeModal());

            if (signupOrganizer.fulfilled.match(result)) {
                navigate('/organizer');
            }
        }
    };

    const handleSwitchToLogin = () => {
        dispatch(switchToLogin());
    };

    const handleClose = () => {
        dispatch(closeModal());
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            phoneNumber: '',
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            phoneNumber: '',
            dateOfBirth: '',
            organizationName: '',
            contactEmail: '',
            contactPhone: '',
            websiteUrl: '',
            description: '',
        });
        setIsOrganizer(false);
        setErrors({});
        dispatch(clearError());
    };

    return (
        <Modal
            isOpen={isSignupModalOpen}
            onClose={handleClose}
            title="Create Account"
            isTransitioning={isTransitioning}
        >
            <form className="auth-form" onSubmit={handleSubmit}>
                {apiError && (
                    <div className="error-message">
                        {apiError}
                    </div>
                )}

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="firstName" className="form-label">First Name *</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            className={`form-input ${errors.firstName ? 'error' : ''}`}
                            placeholder="First name"
                            value={formData.firstName}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        {errors.firstName && <span className="form-error">{errors.firstName}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastName" className="form-label">Last Name *</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            className={`form-input ${errors.lastName ? 'error' : ''}`}
                            placeholder="Last name"
                            value={formData.lastName}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        {errors.lastName && <span className="form-error">{errors.lastName}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="email" className="form-label">Email *</label>
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
                    <label htmlFor="password" className="form-label">Password *</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className={`form-input ${errors.password ? 'error' : ''}`}
                        placeholder="Create a password (min 8 characters)"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                    />
                    {errors.password && <span className="form-error">{errors.password}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                        placeholder="+1 (555) 123-4567"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        disabled={loading}
                    />
                    {errors.phoneNumber && <span className="form-error">{errors.phoneNumber}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                    <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
                        placeholder="dd/mm/yyyy"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        disabled={loading}
                    />
                    {errors.dateOfBirth && <span className="form-error">{errors.dateOfBirth}</span>}
                </div>

                <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={isOrganizer}
                            onChange={(e) => setIsOrganizer(e.target.checked)}
                        />
                        Register as Event Organizer
                    </label>
                </div>

                {isOrganizer && (
                    <div className="organizer-fields">
                        <h4>Organization Details</h4>
                        <div className="form-group">
                            <label htmlFor="organizationName" className="form-label">Organization Name *</label>
                            <input
                                type="text"
                                id="organizationName"
                                name="organizationName"
                                className={`form-input ${errors.organizationName ? 'error' : ''}`}
                                placeholder="Organization Name"
                                value={formData.organizationName}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errors.organizationName && <span className="form-error">{errors.organizationName}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="contactEmail" className="form-label">Contact Email *</label>
                                <input
                                    type="email"
                                    id="contactEmail"
                                    name="contactEmail"
                                    className={`form-input ${errors.contactEmail ? 'error' : ''}`}
                                    placeholder="Contact Email"
                                    value={formData.contactEmail}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                {errors.contactEmail && <span className="form-error">{errors.contactEmail}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="contactPhone" className="form-label">Contact Phone</label>
                                <input
                                    type="tel"
                                    id="contactPhone"
                                    name="contactPhone"
                                    className="form-input"
                                    placeholder="Contact Phone"
                                    value={formData.contactPhone}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="websiteUrl" className="form-label">Website URL</label>
                            <input
                                type="url"
                                id="websiteUrl"
                                name="websiteUrl"
                                className="form-input"
                                placeholder="https://example.com"
                                value={formData.websiteUrl}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                className="form-input"
                                placeholder="Tell us about your organization"
                                value={formData.description}
                                onChange={handleChange}
                                disabled={loading}
                                rows="3"
                            />
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary btn-lg form-submit"
                    disabled={loading}
                >
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>

                <div className="form-footer">
                    <p>
                        Already have an account?{' '}
                        <span className="form-link" onClick={handleSwitchToLogin}>
                            Sign in
                        </span>
                    </p>
                </div>
            </form>
        </Modal>
    );
};

export default SignupModal;
