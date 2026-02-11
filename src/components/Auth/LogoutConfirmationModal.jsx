import { useDispatch, useSelector } from 'react-redux';
import Modal from '../Modal/Modal';
import { logout } from '../../store/slices/authSlice';
import { closeModal } from '../../store/slices/modalSlice';
import './Auth.css';

const LogoutConfirmationModal = () => {
    const dispatch = useDispatch();
    const { isLogoutModalOpen, isTransitioning } = useSelector((state) => state.modal);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(closeModal());
    };

    const handleClose = () => {
        dispatch(closeModal());
    };

    return (
        <Modal
            isOpen={isLogoutModalOpen}
            onClose={handleClose}
            title="Confirm Logout"
            isTransitioning={isTransitioning}
        >
            <div className="logout-confirmation-content">
                <p>Are you sure you want to log out?</p>
                <div className="logout-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary btn-danger"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default LogoutConfirmationModal;
