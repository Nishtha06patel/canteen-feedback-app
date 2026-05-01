import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import AdminForgotPassword from './pages/AdminForgotPassword';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminMenuUpdate from './pages/AdminMenuUpdate';
import AppAdmin from './pages/AppAdmin';
import StaffDashboard from './pages/StaffDashboard';
import NavBar from './components/NavBar';
import Sidebar from './components/Sidebar';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { currentUser } = useAppContext();
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        if (currentUser.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (currentUser.role === 'staff') return <Navigate to="/admin/dashboard" replace />;
        return <Navigate to="/user/dashboard" replace />;
    }
    return children;
};

const AppContent = () => {
    const { currentUser } = useAppContext();
    const isStaffOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'staff';

    return (
        <Router>
            <div className="app-container">
                <NavBar />
                <div className="main-content">
                    {isStaffOrAdmin && <Sidebar />}
                    <main className="page-content">
                        <Routes>
                            <Route path="/" element={
                                currentUser 
                                    ? <Navigate to={isStaffOrAdmin ? "/admin/dashboard" : "/user/dashboard"} replace /> 
                                    : <Landing />
                            } />
                            <Route path="/login" element={
                                currentUser 
                                    ? <Navigate to={isStaffOrAdmin ? "/admin/dashboard" : "/user/dashboard"} replace /> 
                                    : <Login />
                            } />
                            <Route path="/forgot-password" element={currentUser ? <Navigate to={isStaffOrAdmin ? "/admin/dashboard" : "/user/dashboard"} replace /> : <ForgotPassword />} />
                            <Route path="/signup" element={currentUser ? <Navigate to={isStaffOrAdmin ? "/admin/dashboard" : "/user/dashboard"} replace /> : <Signup />} />
                            <Route path="/admin/forgot-password" element={currentUser ? <Navigate to={isStaffOrAdmin ? "/admin/dashboard" : "/user/dashboard"} replace /> : <AdminForgotPassword />} />
                            
                            <Route path="/user/dashboard" element={
                                <ProtectedRoute allowedRoles={['user']}>
                                    <UserDashboard />
                                </ProtectedRoute>
                            } />
                            
                            <Route path="/staff/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                            
                            <Route path="/admin/dashboard" element={
                                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/users" element={
                                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                                    <AdminUsers />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/menu-update" element={
                                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                                    <AdminMenuUpdate />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/app-admin" element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AppAdmin />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </main>
                </div>
            </div>
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
