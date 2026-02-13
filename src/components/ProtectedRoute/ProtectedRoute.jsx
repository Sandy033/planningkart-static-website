import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (requiredRole && user?.role) {
        const userRole = user.role.toUpperCase();
        const reqRole = requiredRole.toUpperCase();

        // Check if roles match, treating SUPER_ADMIN as ADMIN
        const isAdmin = userRole === 'ADMIN' || userRole === 'ROLE_ADMIN' || userRole === 'SUPER_ADMIN';
        const requiresAdmin = reqRole === 'ADMIN' || reqRole === 'ROLE_ADMIN';

        const rolesMatch = (isAdmin && requiresAdmin) || (userRole === reqRole);

        if (!rolesMatch) {
            // Redirect to appropriate dashboard based on user role
            // Since we are only bringing organizer dashboard for now, redirect to home if not organizer
            // and maybe handle admin redirection later if we bring admin dashboard

            // For now, if role mismatch, just go home or show unauthorized
            // But following existing logic:
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
