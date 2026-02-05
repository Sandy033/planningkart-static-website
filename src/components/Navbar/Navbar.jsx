import { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const scrollToSection = (sectionId) => {
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

                <button
                    className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <li><a onClick={() => scrollToSection('events')}>Events</a></li>
                    <li><a onClick={() => scrollToSection('gallery')}>Gallery</a></li>
                    <li><a onClick={() => scrollToSection('about')}>About Us</a></li>
                    <li><a onClick={() => scrollToSection('how-it-works')}>How It Works</a></li>
                    <li><a onClick={() => scrollToSection('contact')}>Contact</a></li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
