import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../store/slices/categorySlice';
import './CategoryTabs.css';

const CategoryTabs = ({ activeCategory, onCategoryChange }) => {
    const dispatch = useDispatch();
    const { items: categories, loading } = useSelector((state) => state.categories);

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    // Build tab list: "All Events" first, then real categories from the backend
    const allCategories = [
        { id: 'all', name: 'All Events', icon: '✨' },
        ...categories.map((cat) => ({
            id: String(cat.id),   // use DB id for filtering
            name: cat.name,
            icon: cat.icon || '🎯',
            slug: cat.slug,
        })),
    ];

    return (
        <div className="category-tabs-wrapper">
            <div className="category-tabs-container">
                <div className="category-tabs">
                    {loading && categories.length === 0 ? (
                        <span style={{ color: 'var(--text-tertiary)', padding: '8px 16px', fontSize: '0.875rem' }}>
                            Loading categories…
                        </span>
                    ) : (
                        allCategories.map((category) => (
                            <button
                                key={category.id}
                                className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                                onClick={() => onCategoryChange(category.id)}
                            >
                                <span className="category-icon">{category.icon}</span>
                                <span className="category-name">{category.name}</span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryTabs;
