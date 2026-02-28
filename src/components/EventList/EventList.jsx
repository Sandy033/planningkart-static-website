import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { deleteEvent } from '../../store/slices/eventSlice';
import './EventList.css';

const makeFallbackSvg = (text) => {
    const label = encodeURIComponent((text || 'Event').slice(0, 24));
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='280'%3E%3Crect width='400' height='280' fill='%238b5cf6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23fff'%3E${label}%3C/text%3E%3C/svg%3E`;
};

const DIFFICULTY_LABELS = {
    BEGINNER: { label: 'Beginner', color: '#10b981' },
    INTERMEDIATE: { label: 'Intermediate', color: '#f59e0b' },
    ADVANCED: { label: 'Advanced', color: '#ef4444' },
};

const STATUS_CONFIG = {
    DRAFT: { label: 'Draft', color: '#6b7280' },
    READY: { label: 'Ready', color: '#f59e0b' },
    PUBLISHED: { label: 'Published', color: '#10b981' },
    ARCHIVED: { label: 'Archived', color: '#8b5cf6' },
    CANCELLED: { label: 'Cancelled', color: '#ef4444' },
};

// ─── Image Carousel ───────────────────────────────────────────────────────────
const ImageCarousel = ({ images, title }) => {
    const [idx, setIdx] = useState(0);

    const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); };
    const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); };

    const src = images[idx]?.url || makeFallbackSvg(title);

    return (
        <div className="el-image-wrapper">
            <img
                src={src}
                alt={title}
                className="el-image"
                onError={(e) => {
                    if (!e.target.dataset.fallback) {
                        e.target.dataset.fallback = 'true';
                        e.target.src = makeFallbackSvg(title);
                    }
                }}
            />
            {images.length > 1 && (
                <>
                    <button className="el-carousel-btn el-carousel-prev" onClick={prev} aria-label="Previous image">‹</button>
                    <button className="el-carousel-btn el-carousel-next" onClick={next} aria-label="Next image">›</button>
                    <div className="el-carousel-dots">
                        {images.map((_, i) => (
                            <span
                                key={i}
                                className={`el-dot ${i === idx ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// ─── Single Event Card ────────────────────────────────────────────────────────
const EventListCard = ({ event, onEdit, onDelete, onMoveToDraft, categoryName }) => {
    const navigate = useNavigate();
    const mediaList = event.medias || event.media || [];
    const images = mediaList.length > 0 ? mediaList : [];

    const difficulty = event.difficultyLevel ? DIFFICULTY_LABELS[event.difficultyLevel] : null;
    const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.DRAFT;
    const plans = event.eventPlan || event.plans || [];

    return (
        <div className="el-card">
            {/* Image / Carousel */}
            {images.length > 0
                ? <ImageCarousel images={images} title={event.title} />
                : <div className="el-image-wrapper el-image-placeholder">
                    <span>{event.title?.slice(0, 1)?.toUpperCase()}</span>
                </div>
            }

            {/* Status pill — top-right overlay */}
            <span
                className="el-status-badge"
                style={{ background: statusCfg.color }}
            >
                {statusCfg.label}
            </span>

            {/* Card body */}
            <div className="el-body">
                <h4 className="el-title">{event.title || 'Untitled Event'}</h4>

                {event.shortDescription && (
                    <p className="el-short-desc">{event.shortDescription}</p>
                )}

                {/* Meta row */}
                <div className="el-meta">
                    {categoryName && (
                        <span className="el-tag el-tag-category">{categoryName}</span>
                    )}
                    {difficulty && (
                        <span className="el-tag" style={{ background: difficulty.color + '22', color: difficulty.color }}>
                            {difficulty.label}
                        </span>
                    )}
                    {event.durationMinutes && (
                        <span className="el-tag el-tag-neutral">{event.durationMinutes} min</span>
                    )}
                </div>

                {/* Plans */}
                {plans.length > 0 && (
                    <div className="el-plans">
                        <p className="el-plans-label">Plans</p>
                        <div className="el-plans-list">
                            {plans.map((plan) => (
                                <div key={plan.id} className="el-plan-chip">
                                    <span className="el-plan-title">{plan.title}</span>
                                    {plan.pricePerPerson != null && (
                                        <span className="el-plan-price">₹{plan.pricePerPerson}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="el-actions">
                    <button
                        className="el-btn el-btn-primary"
                        onClick={() => navigate(`/events/${event.id}`)}
                    >
                        View Details
                    </button>
                    {event.status === 'READY' ? (
                        <button className="el-btn el-btn-outline" onClick={() => onMoveToDraft(event.id)}>Move to Draft</button>
                    ) : (
                        <button className="el-btn el-btn-outline" onClick={() => onEdit(event)}>Edit</button>
                    )}
                    <button className="el-btn el-btn-danger" onClick={() => onDelete(event.id)}>Delete</button>
                </div>
            </div>
        </div>
    );
};

// ─── Event List ───────────────────────────────────────────────────────────────
const EventList = ({ events, onEdit, onMoveToDraft }) => {
    const dispatch = useDispatch();
    const { items: categories } = useSelector((state) => state.categories);

    const getCategoryName = (event) => {
        const catId = event.eventCategory?.id || event.category?.id;
        if (!catId) return null;
        return categories.find(c => c.id === catId)?.name || null;
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            await dispatch(deleteEvent(id));
        }
    };

    if (!events || events.length === 0) {
        return (
            <div className="el-empty">
                <p>No events in this category yet.</p>
            </div>
        );
    }

    return (
        <div className="el-grid">
            {events.map((event) => (
                <EventListCard
                    key={event.id}
                    event={event}
                    onEdit={onEdit}
                    onDelete={handleDelete}
                    onMoveToDraft={onMoveToDraft}
                    categoryName={getCategoryName(event)}
                />
            ))}
        </div>
    );
};

export default EventList;
