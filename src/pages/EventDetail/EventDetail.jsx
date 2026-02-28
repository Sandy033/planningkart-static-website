import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { api } from '../../utils/api';
import './EventDetail.css';

const makeFallbackSvg = (text) => {
    const label = encodeURIComponent((text || 'Event').slice(0, 24));
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500'%3E%3Crect width='800' height='500' fill='%238b5cf6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23fff'%3E${label}%3C/text%3E%3C/svg%3E`;
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

// ── Image Gallery ─────────────────────────────────────────────────────────────
const ImageGallery = ({ images, title }) => {
    const [activeIdx, setActiveIdx] = useState(0);

    const handlePrev = () => setActiveIdx(i => (i - 1 + images.length) % images.length);
    const handleNext = () => setActiveIdx(i => (i + 1) % images.length);

    const src = images[activeIdx]?.url || makeFallbackSvg(title);

    return (
        <div className="ed-gallery">
            <div className="ed-gallery-main">
                <img
                    src={src}
                    alt={title}
                    className="ed-gallery-img"
                    onError={e => {
                        if (!e.target.dataset.fallback) {
                            e.target.dataset.fallback = 'true';
                            e.target.src = makeFallbackSvg(title);
                        }
                    }}
                />
                {images.length > 1 && (
                    <>
                        <button className="ed-gal-btn ed-gal-prev" onClick={handlePrev}>‹</button>
                        <button className="ed-gal-btn ed-gal-next" onClick={handleNext}>›</button>
                    </>
                )}
                <span className="ed-gal-counter">{activeIdx + 1} / {images.length}</span>
            </div>

            {images.length > 1 && (
                <div className="ed-gallery-thumbs">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            className={`ed-thumb ${i === activeIdx ? 'active' : ''}`}
                            onClick={() => setActiveIdx(i)}
                        >
                            <img src={img.url} alt={`thumb-${i}`} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const EventDetail = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEvent = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.get(`/events/${id}`);
            setEvent(data);
        } catch (err) {
            setError(err.message || 'Failed to load event.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchEvent();
    }, [fetchEvent]);

    if (loading) {
        return (
            <div className="ed-page">
                <Navbar />
                <div className="ed-loading">
                    <div className="ed-spinner" />
                    <p>Loading event details…</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="ed-page">
                <Navbar />
                <div className="ed-error">
                    <h2>Event not found</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    const mediaList = event.medias || event.media || [];
    const plans = event.eventPlan || event.plans || [];
    const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.DRAFT;
    const difficulty = event.difficultyLevel ? DIFFICULTY_LABELS[event.difficultyLevel] : null;
    const category = event.eventCategory || event.category;

    return (
        <div className="ed-page">
            <Navbar />
            <div className="ed-container">

                {/* Hero: image gallery */}
                {mediaList.length > 0
                    ? <ImageGallery images={mediaList} title={event.title} />
                    : <div className="ed-gallery-placeholder">
                        <span>{event.title?.slice(0, 1)?.toUpperCase()}</span>
                    </div>
                }

                {/* Top metadata row */}
                <div className="ed-meta-row">
                    <span className="ed-status-pill" style={{ background: statusCfg.color }}>
                        {statusCfg.label}
                    </span>
                    {category?.name && (
                        <span className="ed-cat-pill">{category.name}</span>
                    )}
                    {difficulty && (
                        <span className="ed-diff-pill" style={{ background: difficulty.color + '22', color: difficulty.color }}>
                            {difficulty.label}
                        </span>
                    )}
                </div>

                {/* Title + short desc */}
                <h1 className="ed-title">{event.title}</h1>
                {event.shortDescription && (
                    <p className="ed-short-desc">{event.shortDescription}</p>
                )}

                {/* Quick info grid */}
                <div className="ed-quick-info">
                    {event.durationMinutes && (
                        <div className="ed-info-chip">
                            <span className="ed-info-icon">⏱</span>
                            <div>
                                <p className="ed-info-label">Duration</p>
                                <p className="ed-info-value">{event.durationMinutes} minutes</p>
                            </div>
                        </div>
                    )}
                    {(event.minParticipants || event.maxParticipants) && (
                        <div className="ed-info-chip">
                            <span className="ed-info-icon">👥</span>
                            <div>
                                <p className="ed-info-label">Participants</p>
                                <p className="ed-info-value">
                                    {event.minParticipants || 1} – {event.maxParticipants || '∞'}
                                </p>
                            </div>
                        </div>
                    )}
                    {event.ageRestriction && (
                        <div className="ed-info-chip">
                            <span className="ed-info-icon">🎂</span>
                            <div>
                                <p className="ed-info-label">Age Restriction</p>
                                <p className="ed-info-value">
                                    {event.ageRestriction.min} – {event.ageRestriction.max} yrs
                                </p>
                            </div>
                        </div>
                    )}
                    {event.featured && (
                        <div className="ed-info-chip ed-info-chip--featured">
                            <span className="ed-info-icon">⭐</span>
                            <div>
                                <p className="ed-info-label">Featured</p>
                                <p className="ed-info-value">Yes</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Full description */}
                {event.description && (
                    <section className="ed-section">
                        <h2 className="ed-section-title">About this Event</h2>
                        <p className="ed-description">{event.description}</p>
                    </section>
                )}

                {/* Event Plans */}
                {plans.length > 0 && (
                    <section className="ed-section">
                        <h2 className="ed-section-title">Event Plans</h2>
                        <div className="ed-plans-grid">
                            {plans.map(plan => (
                                <div key={plan.id} className="ed-plan-card">
                                    <div className="ed-plan-header">
                                        <h3 className="ed-plan-title">{plan.title}</h3>
                                        <span className="ed-plan-price">
                                            {plan.currency || 'INR'} {plan.pricePerPerson?.toLocaleString('en-IN')}
                                            <small> / person</small>
                                        </span>
                                    </div>
                                    {plan.shortDescription && (
                                        <p className="ed-plan-short">{plan.shortDescription}</p>
                                    )}
                                    {plan.description && (
                                        <p className="ed-plan-desc">{plan.description}</p>
                                    )}
                                    {plan.items?.length > 0 && (
                                        <ul className="ed-plan-items">
                                            {plan.items.map(item => (
                                                <li key={item.id} className="ed-plan-item">
                                                    <span className="ed-item-check">✓</span>
                                                    <div>
                                                        <strong>{item.title}</strong>
                                                        {item.description && <span> — {item.description}</span>}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default EventDetail;
