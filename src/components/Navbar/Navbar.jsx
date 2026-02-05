import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
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
