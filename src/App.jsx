import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import AdminForgotPassword from './pages/AdminForgotPassword';
import AdminLogin from './pages/AdminLogin';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminMenuUpdate from './pages/AdminMenuUpdate';
import AppAdmin from './pages/AppAdmin';
import NavBar from './components/NavBar';

const ProtectedRoute = ({ children, roleRequired }) => {
    const { currentUser } = useAppContext();
    if (!currentUser) {
        return <Navigate to={roleRequired === 'admin' ? '/admin/login' : '/login'} replace />;
    }
    if (roleRequired && currentUser.role !== roleRequired) {
        return currentUser.role === 'admin'
            ? <Navigate to="/admin/dashboard" replace />
            : <Navigate to="/user/dashboard" replace />;
    }
    return children;
};

const AppContent = () => {
    const { currentUser } = useAppContext();
    return (
        <Router>
            <NavBar />
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Routes>
                    <Route path="/" element={<Navigate to={currentUser ? (currentUser.role === 'admin' ? "/admin/dashboard" : "/user/dashboard") : "/login"} replace />} />
                    <Route path="/login" element={currentUser ? <Navigate to={currentUser.role === 'admin' ? "/admin/dashboard" : "/user/dashboard"} replace /> : <Login />} />
                    <Route path="/forgot-password" element={currentUser ? <Navigate to={currentUser.role === 'admin' ? "/admin/dashboard" : "/user/dashboard"} replace /> : <ForgotPassword />} />
                    <Route path="/signup" element={currentUser ? <Navigate to={currentUser.role === 'admin' ? "/admin/dashboard" : "/user/dashboard"} replace /> : <Signup />} />
                    <Route path="/admin/login" element={currentUser ? <Navigate to={currentUser.role === 'admin' ? "/admin/dashboard" : "/user/dashboard"} replace /> : <AdminLogin />} />
                    <Route path="/admin/forgot-password" element={currentUser ? <Navigate to={currentUser.role === 'admin' ? "/admin/dashboard" : "/user/dashboard"} replace /> : <AdminForgotPassword />} />
                    <Route path="/user/dashboard" element={
                        <ProtectedRoute roleRequired="user">
                            <UserDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/dashboard" element={
                        <ProtectedRoute roleRequired="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/users" element={
                        <ProtectedRoute roleRequired="admin">
                            <AdminUsers />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/menu-update" element={
                        <ProtectedRoute roleRequired="admin">
                            <AdminMenuUpdate />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/app-admin" element={
                        <ProtectedRoute roleRequired="admin">
                            <AppAdmin />
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>
        </Router>
    );
};

function App() {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}

export default App;
