import { useState } from 'react';
import { categories } from '../../data/events';
import './CategoryTabs.css';

const CategoryTabs = ({ activeCategory, onCategoryChange }) => {
    const [scrollPosition, setScrollPosition] = useState(0);

    const allCategories = [{ id: 'all', name: 'All Events', icon: '✨' }, ...categories];

    return (
        <div className="category-tabs-wrapper">
            <div className="category-tabs-container">
                <div className="category-tabs">
                    {allCategories.map((category) => (
                        <button
                            key={category.id}
                            className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                            onClick={() => onCategoryChange(category.id)}
                        >
                            <span className="category-icon">{category.icon}</span>
                            <span className="category-name">{category.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryTabs;
