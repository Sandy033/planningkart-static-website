import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../../components/Navbar/Navbar';
import { fetchEvents } from '../../store/slices/eventSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import EventForm from '../../components/EventForm/EventForm';
import EventList from '../../components/EventList/EventList';
import './OrganizerDashboard.css';

const OrganizerDashboard = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { items: events } = useSelector((state) => state.events);

    useEffect(() => {
        dispatch(fetchEvents());
        dispatch(fetchCategories());
    }, [dispatch]);

    const myEvents = events.filter(event => event.organizerId === user?.id);

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

    return (
        <div className="dashboard">
            <Navbar />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div>
                        <h1>Organizer Dashboard</h1>
                        <p>Create and manage your events</p>
                    </div>
                    <button className="btn btn-primary" onClick={handleCreateNew}>
                        ➕ Create New Event
                    </button>
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
                            <EventForm event={editingEvent} onSuccess={handleFormClose} />
                        </div>
                    ) : (
                        <div className="events-section">
                            <h3>My Events ({myEvents.length})</h3>
                            <EventList events={myEvents} onEdit={handleEdit} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrganizerDashboard;
