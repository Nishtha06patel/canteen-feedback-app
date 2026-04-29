import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
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
        return stored || 'dark';
    });

    // Fallbacks for UI components using legacy arrays not yet supported by backend
    const [registeredUsers] = useState([]);
    const [admins] = useState([]);


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
        }
    }, [currentUser]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const fetchFeedbacks = async () => {
        if (currentUser?.role !== 'admin') return;
        try {
            const { data } = await api.get('/feedback');
            setFeedbacks(data);
        } catch (error) {
            console.error("Failed to fetch feedbacks", error);
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

    const registerUser = async (email, password) => {
        try {
            const { data } = await api.post('/auth/register', { email, password });
            localStorage.setItem('canteen_token', data.token);
            setCurrentUser({ role: data.role, username: data.email, id: data.id });
            return true;
        } catch (error) {
            console.error("Registration error:", error);
            throw new Error(error.response?.data?.message || error.message || 'Registration failed');
        }
    };

    const loginUser = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
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

    const addFeedback = async (mealItem, text, stars, mealType, type, selectedItemsList, photoId) => {
        try {
            const payload = {
                message: `[${mealType}] ${mealItem} - ${stars} Stars: ${text}`
            };
            await api.post('/feedback', payload);
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to submit feedback');
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

    // Dummy functions for legacy components
    const deleteUser = () => true;
    const addAdminAccount = () => true;
    const deleteAdminEmail = () => true;
    const resetPassword = () => true;
    const resetAdminPassword = () => true;

    return (
        <AppContext.Provider value={{ 
            currentUser, feedbacks, theme, menuOverrides, registeredUsers, admins,
            toggleTheme, registerUser, loginUser, loginAdmin, logout, addFeedback,
            getMenuForDate, updateMenuForDate, deleteUser, addAdminAccount, deleteAdminEmail,
            resetPassword, resetAdminPassword
        }}>
            {children}
        </AppContext.Provider>
    );
};
export const useAppContext = () => useContext(AppContext);
