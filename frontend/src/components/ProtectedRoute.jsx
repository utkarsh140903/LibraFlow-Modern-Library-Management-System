import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ adminOnly = false }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>; // Replace with a spinner later
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" replace />; // Or unauthorized page
    }

    return <Outlet />;
};

export default ProtectedRoute;
