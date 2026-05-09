import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

const ProtectedRoute = ({ children, roles = [] }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return <div className="page">Загрузка...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (roles.length > 0 && !roles.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
