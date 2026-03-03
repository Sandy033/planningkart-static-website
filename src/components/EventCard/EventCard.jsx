import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteEvent } from '../../store/slices/eventSlice';
import './EventCard.css';

// Inline SVG fallback — no external network call
const makeFallbackSvg = (text) => {
    const label = encodeURIComponent(text.slice(0, 24));
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%238b5cf6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23fff'%3E${label}%3C/text%3E%3C/svg%3E`;
};

const buildGoogleMapsUrl = (lat, lng) =>
    `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

const DIFFICULTY_CONFIG = {
    BEGINNER: { label: 'Beginner', color: '#10b981' },
    INTERMEDIATE: { label: 'Intermediate', color: '#f59e0b' },
    ADVANCED: { label: 'Advanced', color: '#ef4444' },
};

const EventCard = ({ event }) => {
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [activeImg, setActiveImg] = useState(0);

    const handleBookNow = () => {
        alert(`Booking feature coming soon! Event: ${event.title}`);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            await dispatch(deleteEvent(event.id));
        }
    };

    // Backend DTO uses 'medias'; legacy/organizer list uses 'media'
    const mediaList = event.medias || event.media || [];
    // Sort so primary image is always first
    const sortedMedia = [...mediaList].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
    const imageUrl = sortedMedia[activeImg]?.url || makeFallbackSvg(event.title || 'Event');

    // Description
    const descriptionText = event.shortDescription || event.description || '';

    // Organizer ownership
    const organizerId = event.eventOrganizer?.id ?? event.organizer?.id;
    const isOwner = isAuthenticated &&
        user?.role === 'ORGANIZER' &&
        user?.organizer?.id === organizerId;

    // Difficulty
    const difficulty = event.difficultyLevel ? DIFFICULTY_CONFIG[event.difficultyLevel] : null;

    // Participants & age restriction
    const hasParticipants = event.minParticipants || event.maxParticipants;
    const ageRestriction = event.ageRestriction;

    return (
        <div className="event-card">
            {/* ── Image section ── */}
            <div className="event-image-wrapper">
                <img
                    src={imageUrl}
                    alt={event.title}
                    className="event-image"
                    onError={(e) => {
                        if (!e.target.dataset.fallback) {
                            e.target.dataset.fallback = 'true';
                            e.target.src = makeFallbackSvg(event.title || 'Event');
                        }
                    }}
                />

                {/* Difficulty badge — top right */}
                {difficulty && (
                    <span
                        className="event-difficulty-badge"
                        style={{ background: difficulty.color }}
                    >
                        {difficulty.label}
                    </span>
                )}

                {/* Media navigation — only if multiple images */}
                {sortedMedia.length > 1 && (
                    <>
                        <button
                            className="event-img-nav event-img-nav--prev"
                            onClick={(e) => { e.stopPropagation(); setActiveImg(i => (i - 1 + sortedMedia.length) % sortedMedia.length); }}
                            aria-label="Previous image"
                        >
                            ‹
                        </button>
                        <button
                            className="event-img-nav event-img-nav--next"
                            onClick={(e) => { e.stopPropagation(); setActiveImg(i => (i + 1) % sortedMedia.length); }}
                            aria-label="Next image"
                        >
                            ›
                        </button>
                        <div className="event-media-dots">
                            {sortedMedia.map((_, i) => (
                                <button
                                    key={i}
                                    className={`event-media-dot ${i === activeImg ? 'active' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); setActiveImg(i); }}
                                    aria-label={`Image ${i + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* ── Content section ── */}
            <div className="event-content">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">
                    {descriptionText.length > 120
                        ? `${descriptionText.substring(0, 120)}...`
                        : descriptionText}
                </p>

                {/* ── Meta chips ── */}
                <div className="event-meta">
                    {/* Duration */}
                    <div className="event-meta-chip">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{event.durationMinutes ? `${event.durationMinutes} mins` : 'TBD'}</span>
                    </div>

                    {/* Participants */}
                    {hasParticipants && (
                        <div className="event-meta-chip">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span>
                                {event.minParticipants || 1}–{event.maxParticipants || '∞'} people
                            </span>
                        </div>
                    )}

                    {/* Age restriction */}
                    {ageRestriction && (
                        <div className="event-meta-chip">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <span>Age {ageRestriction.min}–{ageRestriction.max}</span>
                        </div>
                    )}

                    {/* Venue / location */}
                    {(() => {
                        const venue = event.eventOrganizer?.venue ?? event.organizer?.venue;
                        if (venue?.latitude && venue?.longitude) {
                            const mapsUrl = buildGoogleMapsUrl(venue.latitude, venue.longitude);
                            // Show: name, addressLine1, addressLine2
                            const label = [venue.name, venue.addressLine1, venue.addressLine2]
                                .filter(Boolean).join(', ');
                            return (
                                <div className="event-location">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    <a
                                        href={mapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="event-location-link"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        {label}
                                    </a>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>

                {/* ── Footer ── */}
                <div className="event-footer">
                    <div className="event-actions">
                        {isOwner && (
                            <button className="btn btn-sm btn-danger" style={{ marginRight: '10px' }} onClick={handleDelete}>
                                Delete
                            </button>
                        )}
                        <button className="btn btn-primary btn-sm" onClick={handleBookNow}>
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
