import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import { openLoginModal, openLogoutModal } from '../../store/slices/modalSlice';
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    // Disable body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup function to ensure scroll is re-enabled
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isUserMenuOpen && !e.target.closest('.user-menu-container')) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isUserMenuOpen]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    const handleLogoutConfirm = () => {
        dispatch(openLogoutModal());
        setIsUserMenuOpen(false);
        setIsMenuOpen(false);
    };

    const handleLoginClick = () => {
        dispatch(openLoginModal());
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
    };

    const scrollToSection = (sectionId) => {
        // If not on home page, navigate to home first then scroll
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    const navbarHeight = 73;
                    const categoryTabsHeight = sectionId === 'events' ? 60 : 0;
                    const offset = navbarHeight + categoryTabsHeight;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100);
            setIsMenuOpen(false);
            return;
        }

        const element = document.getElementById(sectionId);
        if (element) {
            // Calculate offset for sticky navbar and category tabs
            const navbarHeight = 73; // Navbar height on mobile (65px) + some padding
            const categoryTabsHeight = sectionId === 'events' ? 60 : 0; // Category tabs only for events section
            const offset = navbarHeight + categoryTabsHeight;

            // Get element position
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            // Scroll to position with offset
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            setIsMenuOpen(false);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo" onClick={() => scrollToSection('hero')}>
                    <img src="/planningkart-icon.svg" alt="PlanningKart" className="logo-icon" />
                    Planning<span>Kart</span>
                </div>

                <div className="navbar-right">
                    <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                        {/* Mobile-only auth section */}
                        <li className="mobile-auth-item">
                            {isAuthenticated ? (
                                <div className="mobile-user-greeting">
                                    <span className="greeting-text">Hello, {user.firstName || user.email?.split('@')[0]}</span>
                                </div>
                            ) : (
                                <a onClick={handleLoginClick} className="mobile-login-link">
                                    Login
                                </a>
                            )}
                        </li>

                        <li><a onClick={() => scrollToSection('events')}>Events</a></li>
                        <li><a onClick={() => scrollToSection('gallery')}>Gallery</a></li>
                        <li><a onClick={() => scrollToSection('about')}>About Us</a></li>
                        <li><a onClick={() => scrollToSection('how-it-works')}>How It Works</a></li>
                        <li><a onClick={() => scrollToSection('contact')}>Contact</a></li>

                        {isAuthenticated && (user?.role?.toLowerCase() === 'organizer' || user?.role?.toLowerCase() === 'role_organizer') && (
                            <li><a onClick={() => { navigate('/organizer'); setIsMenuOpen(false); }}>Organizer Dashboard</a></li>
                        )}

                        {isAuthenticated && (
                            <li className="mobile-auth-item mobile-logout-item">
                                <button className="mobile-logout-button" onClick={handleLogoutConfirm}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                    Logout
                                </button>
                            </li>
                        )}
                    </ul>

                    {/* Desktop user menu - hidden on mobile */}
                    <div className="user-menu-container desktop-only">
                        {isAuthenticated ? (
                            <>
                                <button
                                    className="user-icon-button"
                                    onClick={toggleUserMenu}
                                    aria-label="User menu"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </button>
                                {isUserMenuOpen && (
                                    <div className="user-dropdown">
                                        <div className="user-info">
                                            <p className="user-email">{user.firstName || user.email}</p>
                                            <p className="user-role">{user.role}</p>
                                        </div>
                                        <button className="dropdown-item logout-button" onClick={handleLogoutConfirm}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                                <polyline points="16 17 21 12 16 7"></polyline>
                                                <line x1="21" y1="12" x2="9" y2="12"></line>
                                            </svg>
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <button
                                className="user-icon-button"
                                onClick={handleLoginClick}
                                aria-label="Login"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </button>
                        )}
                    </div>

                    <button
                        className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </button>
                </div>
            </div>
        </nav >
    );
};

export default Navbar;
