import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { io } from 'socket.io-client';
import { MENU_DATA, DAYS_OF_WEEK } from '../mockData';
import { format } from 'date-fns';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const stored = localStorage.getItem('canteen_currentUser');
        return stored ? JSON.parse(stored) : null;
    });

    const [feedbacks, setFeedbacks] = useState([]);
    const [menuOverrides, setMenuOverrides] = useState([]);

    const [theme, setTheme] = useState(() => {
        const stored = localStorage.getItem('canteen_theme');
        return stored || 'light';
    });

    // Fallbacks for UI components using legacy arrays not yet supported by backend
    const [registeredUsers, setRegisteredUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [feedbackStats, setFeedbackStats] = useState(null);

    useEffect(() => {
        localStorage.setItem('canteen_currentUser', JSON.stringify(currentUser));
        localStorage.setItem('canteen_theme', theme);
        document.body.setAttribute('data-theme', theme);
    }, [currentUser, theme]);

    // Fetch initial data if logged in
    useEffect(() => {
        if (currentUser) {
            fetchFeedbacks();
            fetchMenus();
            fetchStats();
            if (currentUser.role === 'admin' || currentUser.role === 'staff') {
                fetchUsers();
            }

            // Socket.io initialization
            const token = localStorage.getItem('token');
            const newSocket = io(window.location.origin, {
                auth: { token }
            });

            newSocket.on('newMessage', (msg) => {
                setMessages(prev => [msg, ...prev]);
                // Highlight or sound alert if needed
                if (msg.type === 'emergency') {
                    // Alert logic
                }
            });

            setSocket(newSocket);
            fetchMessages();

            return () => {
                newSocket.disconnect();
            };
        }

        // Response interceptor to handle blocked users or expired tokens
        const interceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    // If blocked message is returned, or unauthorized
                    if (error.response.data?.message?.includes('blocked') || error.response.status === 401) {
                        logout();
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => api.interceptors.response.eject(interceptor);
    }, [currentUser]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const fetchUsers = async () => {
        try {
            const { data: usersData } = await api.get('/users');
            setRegisteredUsers(usersData);
            
            if (currentUser && currentUser.role === 'admin') {
                const { data: adminsData } = await api.get('/users/admins');
                setAdmins(adminsData);
            }
        } catch (error) {
            console.error("Failed to fetch users or admins", error);
        }
    };

    const fetchFeedbacks = async () => {
        if (currentUser?.role !== 'admin' && currentUser?.role !== 'staff') return;
        try {
            const { data } = await api.get('/feedback');
            setFeedbacks(data);
        } catch (error) {
            console.error("Failed to fetch feedbacks", error);
        }
    };

    const fetchStats = async () => {
        if (currentUser?.role !== 'admin' && currentUser?.role !== 'staff') return;
        try {
            const { data } = await api.get('/feedback/stats');
            setFeedbackStats(data);
        } catch (error) {
            console.error("Failed to fetch feedback stats", error);
        }
    };

    const fetchMenus = async () => {
        try {
            const { data } = await api.get('/menu');
            // Convert array of objects to map for easier access
            const overridesMap = {};
            data.forEach(item => {
                // postgres returns date as string, format it to yyyy-MM-dd
                const dateKey = new Date(item.date).toISOString().split('T')[0];
                overridesMap[dateKey] = item.items;
            });
            setMenuOverrides(overridesMap);
        } catch (error) {
            console.error("Failed to fetch menus", error);
        }
    };

    const registerUser = async (email, password, role = 'user', secretCode = '', fullName = '') => {
        try {
            const { data } = await api.post('/auth/register', { email, password, role, secretCode, fullName });
            localStorage.setItem('canteen_token', data.token);
            setCurrentUser({ role: data.role, username: data.full_name || data.email, id: data.id });
            return true;
        } catch (error) {
            console.error("Registration error:", error);
            throw new Error(error.response?.data?.message || error.message || 'Registration failed');
        }
    };

    const loginUser = async (email, password, role = 'user', secretCode = '') => {
        try {
            const { data } = await api.post('/auth/login', { email, password, role, secretCode });
            localStorage.setItem('canteen_token', data.token);
            setCurrentUser({ role: data.role, username: data.email, id: data.id });
            return true;
        } catch (error) {
            console.error("Login error:", error);
            throw new Error(error.response?.data?.message || error.message || 'Login failed');
        }
    };

    const loginAdmin = async (email, password) => {
        return await loginUser(email, password);
    };

    const logout = () => {
        localStorage.removeItem('canteen_token');
        setCurrentUser(null);
    };

    const fetchMessages = async () => {
        if (!currentUser) return;
        try {
            const { data } = await api.get('/messages');
            setMessages(data);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    const sendBroadcastMessage = async (content, type, recipientRole) => {
        try {
            const { data } = await api.post('/messages', { content, type, recipient_role: recipientRole });
            // The socket emission is handled by backend, but we might want to update local state if we are the sender
            // But usually the backend emits to the sender's room too if they belong to it, or we manually add it.
            // In our case, admin sends to staff, so admin won't see it in their "student" or "staff" room.
            // So we add it manually to our list.
            setMessages(prev => [data, ...prev]);
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to send message');
        }
    };

    const addFeedback = async (mealItem, text, stars, mealType, type, selectedItemsList, photoBase64) => {
        try {
            const payload = {
                message: JSON.stringify({ mealItem, text, stars, mealType, type, photoBase64 })
            };
            await api.post('/feedback', payload);
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to submit feedback');
        }
    };

    const updateFeedbackStatus = async (id, status) => {
        try {
            await api.put(`/feedback/${id}/status`, { status });
            await fetchFeedbacks(); // Refresh the feedbacks list
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const getMenuForDate = (dateOrStr) => {
        let dateObj;
        if (typeof dateOrStr === 'string') {
            const [y, m, d] = dateOrStr.split('-');
            dateObj = new Date(y, m - 1, d);
        } else {
            dateObj = dateOrStr;
        }
        
        const dateKey = format(dateObj, 'yyyy-MM-dd');
        const dayOfWeek = DAYS_OF_WEEK[dateObj.getDay()];
        
        const baseMenu = MENU_DATA[dayOfWeek] || {};
        const overrides = menuOverrides[dateKey] || {};
        
        return {
            ...baseMenu,
            ...overrides
        };
    };

    const updateMenuForDate = async (dateStr, mealId, newItemsArray) => {
        try {
            // Merge with existing overrides
            const currentOverrides = menuOverrides[dateStr] || {};
            const newOverrides = { ...currentOverrides, [mealId]: newItemsArray };
            
            await api.post('/menu', {
                date: dateStr,
                items: newOverrides
            });
            await fetchMenus(); // Refresh menu data
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update menu');
        }
    };

    const addUser = async (email, password, role = 'user') => {
        try {
            await api.post('/users', { email, password, role });
            await fetchUsers(); // Refresh user list
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to add user');
        }
    };

    const deleteUser = async (email) => {
        try {
            await api.delete(`/users/${email}`);
            await fetchUsers(); // Refresh the list
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const blockUser = async (email) => {
        try {
            await api.post('/users/block', { email });
            await fetchUsers(); // Refresh the list
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to block user');
        }
    };

    const unblockUser = async (email) => {
        try {
            await api.post('/users/unblock', { email });
            await fetchUsers(); // Refresh the list
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to unblock user');
        }
    };
    
    const addAdminAccount = async (email, password) => {
        try {
            await api.post('/users/admins', { email, password });
            await fetchUsers();
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to add admin');
        }
    };

    const deleteAdminEmail = async (email) => {
        try {
            await api.delete(`/users/admins/${email}`);
            await fetchUsers();
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete admin');
        }
    };
    
    const resetPassword = async (email, newPassword) => {
        try {
            await api.post('/auth/reset-password', { email, newPassword });
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to reset password');
        }
    };
    
    const resetAdminPassword = async (email, newPassword) => {
        return await resetPassword(email, newPassword);
    };

    return (
        <AppContext.Provider value={{ 
            currentUser, feedbacks, theme, menuOverrides, registeredUsers, admins, feedbackStats,
            toggleTheme, registerUser, loginUser, loginAdmin, logout, addFeedback, updateFeedbackStatus,
            getMenuForDate, updateMenuForDate, addUser, deleteUser, blockUser, unblockUser, addAdminAccount, deleteAdminEmail,
            resetPassword, resetAdminPassword, fetchStats,
            messages, sendBroadcastMessage, fetchMessages
        }}>
            {children}
        </AppContext.Provider>
    );
};
export const useAppContext = () => useContext(AppContext);
