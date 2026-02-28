import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../../components/Navbar/Navbar';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchOrganizerEvents } from '../../store/slices/eventSlice';
import EventForm from '../../components/EventForm/EventForm';
import EventList from '../../components/EventList/EventList';
import './OrganizerDashboard.css';

const TABS = ['ALL', 'DRAFT', 'READY', 'PUBLISHED', 'ARCHIVED', 'CANCELLED'];

const OrganizerDashboard = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [activeTab, setActiveTab] = useState('ALL');
    const dispatch = useDispatch();
    const { items: events, loading } = useSelector((state) => state.events);

    // Filter events based on active tab
    const filteredEvents = events.filter(event =>
        activeTab === 'ALL' ? true : event.status === activeTab
    );

    const loadData = useCallback(() => {
        dispatch(fetchOrganizerEvents());
        dispatch(fetchCategories());
    }, [dispatch]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreateNew = () => {
        setEditingEvent(null);
        setShowForm(true);
    };

    const handleEdit = (event) => {
        setEditingEvent(event);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingEvent(null);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingEvent(null);
        // Refresh the events list
        dispatch(fetchOrganizerEvents());
    };

    return (
        <div className="dashboard">
            <Navbar />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div>
                        <h1>Organizer Dashboard</h1>
                        <p>Create and manage your events</p>
                    </div>
                    {!showForm && (
                        <button className="btn btn-primary" onClick={handleCreateNew}>
                            ➕ Create New Event
                        </button>
                    )}
                </div>

                <div className="dashboard-content">
                    {showForm ? (
                        <div className="form-section">
                            <div className="form-header">
                                <h3>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
                                <button className="btn btn-outline btn-sm" onClick={handleFormClose}>
                                    Cancel
                                </button>
                            </div>
                            <EventForm event={editingEvent} onSuccess={handleFormSuccess} />
                        </div>
                    ) : (
                        <div className="events-section">
                            <div className="events-section-header">
                                <h3>My Events ({filteredEvents.length})</h3>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="events-tabs">
                                {TABS.map(tab => (
                                    <button
                                        key={tab}
                                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab}
                                        {tab !== 'ALL' && (
                                            <span className="tab-count">
                                                {events.filter(e => e.status === tab).length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <p style={{ color: 'var(--text-secondary)' }}>Loading events…</p>
                            ) : (
                                <EventList events={filteredEvents} onEdit={handleEdit} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrganizerDashboard;
