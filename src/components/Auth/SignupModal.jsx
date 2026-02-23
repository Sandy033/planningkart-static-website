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

    const emptyFormData = {
        // User fields
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        dateOfBirth: '',
        // Organizer fields
        organizationName: '',
        contactEmail: '',
        contactPhone: '',
        websiteUrl: '',
        logoUrl: '',
        description: '',
        // Venue fields
        venueName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        latitude: '',
        longitude: '',
    };

    const [formData, setFormData] = useState(emptyFormData);
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
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (apiError) {
            dispatch(clearError());
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName) {
            newErrors.firstName = 'First name is required';
        } else if (formData.firstName.length > 100) {
            newErrors.firstName = 'First name must be less than 100 characters';
        }

        if (!formData.lastName) {
            newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.length > 100) {
            newErrors.lastName = 'Last name must be less than 100 characters';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.phoneNumber && formData.phoneNumber.length > 20) {
            newErrors.phoneNumber = 'Phone number must not exceed 20 characters';
        }

        if (isOrganizer) {
            if (!formData.organizationName) {
                newErrors.organizationName = 'Organization name is required';
            } else if (formData.organizationName.length > 200) {
                newErrors.organizationName = 'Organization name must not exceed 200 characters';
            }

            if (!formData.contactEmail) {
                newErrors.contactEmail = 'Contact email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
                newErrors.contactEmail = 'Please enter a valid contact email';
            }

            if (formData.contactPhone && formData.contactPhone.length > 20) {
                newErrors.contactPhone = 'Contact phone must not exceed 20 characters';
            }

            if (formData.description && formData.description.length > 1000) {
                newErrors.description = 'Description must not exceed 1000 characters';
            }

            // Venue validations
            if (!formData.venueName) {
                newErrors.venueName = 'Venue name is required';
            }
            if (!formData.addressLine1) {
                newErrors.addressLine1 = 'Address Line 1 is required';
            }
            if (!formData.city) {
                newErrors.city = 'City is required';
            }
            if (!formData.country) {
                newErrors.country = 'Country is required';
            }

            if (formData.latitude && isNaN(parseFloat(formData.latitude))) {
                newErrors.latitude = 'Latitude must be a valid number';
            }
            if (formData.longitude && isNaN(parseFloat(formData.longitude))) {
                newErrors.longitude = 'Longitude must be a valid number';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        let result;
        if (isOrganizer) {
            const organizerData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                ...(formData.phoneNumber && { phoneNumber: formData.phoneNumber }),
                ...(formData.dateOfBirth && { dateOfBirth: formData.dateOfBirth }),
                organizationName: formData.organizationName,
                contactEmail: formData.contactEmail,
                ...(formData.contactPhone && { contactPhone: formData.contactPhone }),
                ...(formData.description && { description: formData.description }),
                ...(formData.logoUrl && { logoUrl: formData.logoUrl }),
                ...(formData.websiteUrl && { websiteUrl: formData.websiteUrl }),
                venue: {
                    name: formData.venueName,
                    addressLine1: formData.addressLine1,
                    ...(formData.addressLine2 && { addressLine2: formData.addressLine2 }),
                    city: formData.city,
                    ...(formData.state && { state: formData.state }),
                    ...(formData.postalCode && { postalCode: formData.postalCode }),
                    country: formData.country,
                    ...(formData.latitude && { latitude: parseFloat(formData.latitude) }),
                    ...(formData.longitude && { longitude: parseFloat(formData.longitude) }),
                },
            };
            result = await dispatch(signupOrganizer(organizerData));
        } else {
            const signupData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                ...(formData.phoneNumber && { phoneNumber: formData.phoneNumber }),
                ...(formData.dateOfBirth && { dateOfBirth: formData.dateOfBirth }),
            };
            result = await dispatch(signupUser(signupData));
        }

        if (signupUser.fulfilled.match(result) || signupOrganizer.fulfilled.match(result)) {
            setFormData(emptyFormData);
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
        setFormData(emptyFormData);
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

                {/* ── Personal Details ── */}
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

                <div className="form-row">
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
                            className="form-input"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* ── Organizer Toggle ── */}
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

                        {/* ── Organization Details ── */}
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
                                    className={`form-input ${errors.contactPhone ? 'error' : ''}`}
                                    placeholder="Contact Phone"
                                    value={formData.contactPhone}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                {errors.contactPhone && <span className="form-error">{errors.contactPhone}</span>}
                            </div>
                        </div>

                        <div className="form-row">
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
                                <label htmlFor="logoUrl" className="form-label">Logo URL</label>
                                <input
                                    type="url"
                                    id="logoUrl"
                                    name="logoUrl"
                                    className="form-input"
                                    placeholder="https://example.com/logo.png"
                                    value={formData.logoUrl}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                className={`form-input ${errors.description ? 'error' : ''}`}
                                placeholder="Tell us about your organization (max 1000 characters)"
                                value={formData.description}
                                onChange={handleChange}
                                disabled={loading}
                                rows="3"
                            />
                            {errors.description && <span className="form-error">{errors.description}</span>}
                        </div>

                        {/* ── Venue Details ── */}
                        <h4>Venue Details</h4>

                        <div className="form-group">
                            <label htmlFor="venueName" className="form-label">Venue Name *</label>
                            <input
                                type="text"
                                id="venueName"
                                name="venueName"
                                className={`form-input ${errors.venueName ? 'error' : ''}`}
                                placeholder="Venue Name"
                                value={formData.venueName}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errors.venueName && <span className="form-error">{errors.venueName}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="addressLine1" className="form-label">Address Line 1 *</label>
                            <input
                                type="text"
                                id="addressLine1"
                                name="addressLine1"
                                className={`form-input ${errors.addressLine1 ? 'error' : ''}`}
                                placeholder="Street address"
                                value={formData.addressLine1}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errors.addressLine1 && <span className="form-error">{errors.addressLine1}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="addressLine2" className="form-label">Address Line 2</label>
                            <input
                                type="text"
                                id="addressLine2"
                                name="addressLine2"
                                className="form-input"
                                placeholder="Apartment, suite, unit, etc. (optional)"
                                value={formData.addressLine2}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="city" className="form-label">City *</label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    className={`form-input ${errors.city ? 'error' : ''}`}
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                {errors.city && <span className="form-error">{errors.city}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="state" className="form-label">State / Province</label>
                                <input
                                    type="text"
                                    id="state"
                                    name="state"
                                    className="form-input"
                                    placeholder="State"
                                    value={formData.state}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="postalCode" className="form-label">Postal Code</label>
                                <input
                                    type="text"
                                    id="postalCode"
                                    name="postalCode"
                                    className="form-input"
                                    placeholder="Postal Code"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="country" className="form-label">Country *</label>
                                <input
                                    type="text"
                                    id="country"
                                    name="country"
                                    className={`form-input ${errors.country ? 'error' : ''}`}
                                    placeholder="Country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                {errors.country && <span className="form-error">{errors.country}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="latitude" className="form-label">Latitude</label>
                                <input
                                    type="number"
                                    id="latitude"
                                    name="latitude"
                                    className={`form-input ${errors.latitude ? 'error' : ''}`}
                                    placeholder="e.g. 28.6139"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    disabled={loading}
                                    step="any"
                                />
                                {errors.latitude && <span className="form-error">{errors.latitude}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="longitude" className="form-label">Longitude</label>
                                <input
                                    type="number"
                                    id="longitude"
                                    name="longitude"
                                    className={`form-input ${errors.longitude ? 'error' : ''}`}
                                    placeholder="e.g. 77.2090"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    disabled={loading}
                                    step="any"
                                />
                                {errors.longitude && <span className="form-error">{errors.longitude}</span>}
                            </div>
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
