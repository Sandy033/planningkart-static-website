import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../../components/Navbar/Navbar';
import { api } from '../../utils/api';
import './BookingPage.css';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (date) =>
    new Date(date).toLocaleString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

const genRef = () => `BK-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

// ── BookingPage ────────────────────────────────────────────────────────────────
const BookingPage = () => {
    const { eventId, planId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const [event, setEvent] = useState(null);
    const [plan, setPlan] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    // ── Form state ─────────────────────────────────────────────────────────────
    const [selectedScheduleId, setSelectedScheduleId] = useState('');
    const [numberOfParticipants, setNumberOfParticipants] = useState(1);
    const [specialRequests, setSpecialRequests] = useState('');

    // ── Fetch event + schedules ────────────────────────────────────────────────
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [eventData, allSchedules] = await Promise.all([
                api.get(`/events/${eventId}`),
                api.get(`/event-schedules`),
            ]);
            setEvent(eventData);

            // filter schedules that belong to this event and are still available
            const relevant = (allSchedules || []).filter(
                (s) =>
                    String(s.event?.id || s.eventId) === String(eventId) &&
                    s.status === 'SCHEDULED' &&
                    s.availableSlots > 0,
            );
            setSchedules(relevant);

            // find the selected plan
            const plans = eventData.eventPlan || eventData.plans || [];
            const found = plans.find((p) => String(p.id) === String(planId));
            setPlan(found || null);
        } catch (err) {
            setError(err.message || 'Failed to load booking details.');
        } finally {
            setLoading(false);
        }
    }, [eventId, planId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ── Derived values ─────────────────────────────────────────────────────────
    const pricePerPerson = plan?.pricePerPerson || 0;
    const currency = plan?.currency || 'INR';
    const totalAmount = pricePerPerson * numberOfParticipants;

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setError('You must be logged in to make a booking.');
            return;
        }
        if (!selectedScheduleId) {
            setError('Please select a date/time slot.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const payload = {
                user: { id: user.id },
                eventSchedule: { id: Number(selectedScheduleId) },
                eventPlan: { id: Number(planId) },
                bookingReference: genRef(),
                numberOfParticipants,
                totalAmount,
                currency,
                specialRequests: specialRequests || null,
            };
            const created = await api.post('/bookings', payload);
            setSuccess(created);
        } catch (err) {
            setError(err.message || 'Booking failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Success screen ─────────────────────────────────────────────────────────
    if (success) {
        return (
            <div className="bp-page">
                <Navbar />
                <div className="bp-success">
                    <div className="bp-success-icon">🎉</div>
                    <h1>Booking Confirmed!</h1>
                    <p className="bp-success-ref">Reference: <strong>{success.bookingReference}</strong></p>
                    <p>We've received your booking for <strong>{event?.title}</strong>.</p>
                    <p>Plan: <strong>{plan?.title}</strong> — {currency} {totalAmount.toLocaleString('en-IN')} for {numberOfParticipants} {numberOfParticipants === 1 ? 'person' : 'people'}</p>
                    <div className="bp-success-actions">
                        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Home</button>
                        <button className="btn btn-outline" onClick={() => navigate(`/events/${eventId}`)}>View Event</button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="bp-page">
                <Navbar />
                <div className="bp-loading">
                    <div className="bp-spinner" />
                    <p>Loading booking details…</p>
                </div>
            </div>
        );
    }

    // ── Summary ────────────────────────────────────────────────────────────────
    const selectedSchedule = schedules.find((s) => String(s.id) === String(selectedScheduleId));

    return (
        <div className="bp-page">
            <Navbar />
            <div className="bp-container">

                {/* ── Left: Form ── */}
                <form className="bp-form" onSubmit={handleSubmit} noValidate>
                    <button type="button" className="bp-back" onClick={() => navigate(`/events/${eventId}`)}>
                        ← Back to event
                    </button>
                    <h1 className="bp-title">Complete Your Booking</h1>

                    {/* Plan display (read-only) */}
                    {plan ? (
                        <div className="bp-selected-plan">
                            <span className="bp-plan-badge">Selected Plan</span>
                            <div className="bp-plan-info">
                                <h3>{plan.title}</h3>
                                <span className="bp-plan-price">
                                    {currency} {pricePerPerson.toLocaleString('en-IN')} / person
                                </span>
                            </div>
                            {plan.shortDescription && <p className="bp-plan-desc">{plan.shortDescription}</p>}
                        </div>
                    ) : (
                        <div className="bp-warn">⚠️ Could not find the selected plan. Please go back and try again.</div>
                    )}

                    {/* Schedule picker */}
                    <div className="bp-field">
                        <label className="bp-label" htmlFor="bp-schedule">Choose a Date & Time Slot *</label>
                        {schedules.length === 0 ? (
                            <div className="bp-warn">No available schedule slots for this event yet. Please check back later.</div>
                        ) : (
                            <div className="bp-schedule-list">
                                {schedules.map((s) => (
                                    <label
                                        key={s.id}
                                        className={`bp-schedule-option ${String(selectedScheduleId) === String(s.id) ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="schedule"
                                            value={s.id}
                                            checked={String(selectedScheduleId) === String(s.id)}
                                            onChange={() => setSelectedScheduleId(s.id)}
                                        />
                                        <div className="bp-schedule-info">
                                            <span className="bp-schedule-date">{fmt(s.startDatetime)}</span>
                                            <span className="bp-schedule-meta">
                                                {s.availableSlots - (s.bookedSlots || 0)} slots left
                                                {s.specialInstructions && ` · ${s.specialInstructions}`}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Number of participants */}
                    <div className="bp-field">
                        <label className="bp-label" htmlFor="bp-pax">Number of Participants *</label>
                        <div className="bp-pax-row">
                            <button
                                type="button"
                                className="bp-counter-btn"
                                onClick={() => setNumberOfParticipants(n => Math.max(1, n - 1))}
                            >−</button>
                            <span className="bp-counter-val">{numberOfParticipants}</span>
                            <button
                                type="button"
                                className="bp-counter-btn"
                                onClick={() => setNumberOfParticipants(n => Math.min(event?.maxParticipants || 99, n + 1))}
                            >+</button>
                            {event?.maxParticipants && (
                                <span className="bp-pax-hint">max {event.maxParticipants}</span>
                            )}
                        </div>
                    </div>

                    {/* Special requests */}
                    <div className="bp-field">
                        <label className="bp-label" htmlFor="bp-notes">Special Requests <span className="bp-optional">(optional)</span></label>
                        <textarea
                            id="bp-notes"
                            className="bp-textarea"
                            rows={3}
                            value={specialRequests}
                            onChange={(e) => setSpecialRequests(e.target.value)}
                            placeholder="Dietary requirements, accessibility needs, anything else…"
                        />
                    </div>

                    {error && <div className="bp-error">{error}</div>}

                    {!isAuthenticated && (
                        <div className="bp-warn">You need to be logged in to complete a booking.</div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary bp-submit"
                        disabled={submitting || !plan || schedules.length === 0 || !isAuthenticated}
                    >
                        {submitting ? 'Confirming…' : `Confirm Booking · ${currency} ${totalAmount.toLocaleString('en-IN')}`}
                    </button>
                </form>

                {/* ── Right: Summary ── */}
                <aside className="bp-summary">
                    <div className="bp-summary-card">
                        <h2 className="bp-summary-title">Booking Summary</h2>

                        <div className="bp-summary-event">
                            <p className="bp-summary-label">Event</p>
                            <p className="bp-summary-value">{event?.title}</p>
                        </div>

                        {plan && (
                            <div className="bp-summary-row">
                                <span>Plan</span>
                                <span>{plan.title}</span>
                            </div>
                        )}

                        {selectedSchedule && (
                            <div className="bp-summary-row">
                                <span>Date</span>
                                <span>{fmt(selectedSchedule.startDatetime)}</span>
                            </div>
                        )}

                        <div className="bp-summary-row">
                            <span>Participants</span>
                            <span>{numberOfParticipants}</span>
                        </div>

                        {plan && (
                            <div className="bp-summary-row">
                                <span>Price / person</span>
                                <span>{currency} {pricePerPerson.toLocaleString('en-IN')}</span>
                            </div>
                        )}

                        <div className="bp-summary-divider" />

                        <div className="bp-summary-total">
                            <span>Total</span>
                            <span>{currency} {totalAmount.toLocaleString('en-IN')}</span>
                        </div>

                        {/* Venue */}
                        {(() => {
                            const venue = event?.organizer?.venue ?? event?.eventOrganizer?.venue;
                            if (!venue) return null;
                            const addr = [venue.name, venue.addressLine1, venue.city, venue.state]
                                .filter(Boolean).join(', ');
                            return (
                                <div className="bp-summary-venue">
                                    <p className="bp-summary-label">Venue</p>
                                    <p className="bp-summary-value">{addr}</p>
                                </div>
                            );
                        })()}
                    </div>
                </aside>

            </div>
        </div>
    );
};

export default BookingPage;
