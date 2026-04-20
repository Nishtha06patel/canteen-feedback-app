import React, { createContext, useState, useEffect, useContext } from 'react';
import { MENU_DATA, DAYS_OF_WEEK } from '../mockData';
import { format, parseISO } from 'date-fns';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const stored = localStorage.getItem('canteen_currentUser');
        return stored ? JSON.parse(stored) : null;
    });

    const [registeredUsers, setRegisteredUsers] = useState(() => {
        const stored = localStorage.getItem('canteen_registeredUsers');
        return stored ? JSON.parse(stored) : [];
    });

    const [feedbacks, setFeedbacks] = useState(() => {
        const stored = localStorage.getItem('canteen_feedbacks');
        return stored ? JSON.parse(stored) : [];
    });

    const [menuOverrides, setMenuOverrides] = useState(() => {
        const stored = localStorage.getItem('canteen_menu_overrides');
        return stored ? JSON.parse(stored) : {};
    });

    const [admins, setAdmins] = useState(() => {
        const stored = localStorage.getItem('canteen_admins');
        const legacyPwd = localStorage.getItem('canteen_admin_password') || 'IARcanteen';
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Convert legacy simple string databases to object models, ensuring proper extraction of old passwords
                const validAdmins = parsed.map(admin => {
                    if (typeof admin === 'string') {
                        return { email: admin.toLowerCase(), password: legacyPwd };
                    }
                    return admin;
                }).filter(a => a?.email?.toLowerCase().endsWith('@iar.ac.in'));
                
                if (validAdmins.length > 0) return validAdmins;
            } catch (e) {
                console.error("Failed to parse admins flag");
            }
        }
        return [{ email: 'admin@iar.ac.in', password: 'IARcanteen' }];
    });

    const [theme, setTheme] = useState(() => {
        const stored = localStorage.getItem('canteen_theme');
        return stored || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('canteen_currentUser', JSON.stringify(currentUser));
        localStorage.setItem('canteen_registeredUsers', JSON.stringify(registeredUsers));
        localStorage.setItem('canteen_feedbacks', JSON.stringify(feedbacks));
        localStorage.setItem('canteen_menu_overrides', JSON.stringify(menuOverrides));
        localStorage.setItem('canteen_theme', theme);
        localStorage.setItem('canteen_admins', JSON.stringify(admins));
        document.body.setAttribute('data-theme', theme);
    }, [currentUser, registeredUsers, feedbacks, menuOverrides, theme, admins]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const registerUser = (email, password) => {
        if (!email.toLowerCase().endsWith('@iar.ac.in')) throw new Error('Email must end with @iar.ac.in');
        if (registeredUsers.some(u => u.email === email.toLowerCase())) throw new Error('Email is already registered.');
        
        setRegisteredUsers(prev => [...prev, { email: email.toLowerCase(), password }]);
        return true;
    };

    const loginUser = (email, password) => {
        const lowerEmail = email.toLowerCase();
        if (!lowerEmail.endsWith('@iar.ac.in')) throw new Error('Invalid email domain. Must be @iar.ac.in');
        const user = registeredUsers.find(u => u.email === lowerEmail);
        if (!user) throw new Error('User not found. Please sign up first.');
        if (user.password !== password) throw new Error('Incorrect password.');
        
        setCurrentUser({ role: 'user', username: lowerEmail });
        return true;
    };

    const resetPassword = (email, newPassword) => {
        const lowerEmail = email.toLowerCase();
        const userIndex = registeredUsers.findIndex(u => u.email === lowerEmail);
        if (userIndex === -1) throw new Error('Unregistered Email.');
        
        const updatedUsers = [...registeredUsers];
        updatedUsers[userIndex] = { ...updatedUsers[userIndex], password: newPassword };
        setRegisteredUsers(updatedUsers);
        return true;
    };

    const deleteUser = (email) => {
        const lowerEmail = email.toLowerCase();
        setRegisteredUsers(prev => prev.filter(u => u.email !== lowerEmail));
        setFeedbacks(prev => prev.filter(f => f.username !== lowerEmail));
        return true;
    };

    const loginAdmin = (email, password) => {
        const lowerEmail = email.toLowerCase().trim();
        if (!lowerEmail.endsWith('@iar.ac.in')) throw new Error('Admin Email must end with @iar.ac.in');
        
        const adminUser = admins.find(a => a.email === lowerEmail);
        if (!adminUser) throw new Error('Invalid Admin Email ID');
        if (adminUser.password !== password) throw new Error('Incorrect Admin Password');
        
        setCurrentUser({ role: 'admin', username: lowerEmail });
        return true;
    };

    const addAdminAccount = (email, password) => {
        const lowerEmail = email?.toLowerCase().trim();
        if (!lowerEmail || lowerEmail === '') throw new Error('Email cannot be empty.');
        if (!lowerEmail.endsWith('@iar.ac.in')) throw new Error('Email must end with @iar.ac.in');
        if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');
        if (admins.some(a => a.email === lowerEmail)) throw new Error('Admin already exists.');
        
        setAdmins(prev => [...prev, { email: lowerEmail, password }]);
        return true;
    };

    const deleteAdminEmail = (email) => {
        const lowerEmail = email.toLowerCase();
        if (admins.length <= 1) throw new Error('Cannot delete the last admin.');
        setAdmins(prev => prev.filter(u => u.email !== lowerEmail));
        if (currentUser?.username === lowerEmail) {
            logout(); // Log out if they delete themselves
        }
        return true;
    };

    const resetAdminPassword = (email, newPassword) => {
        const lowerEmail = email.toLowerCase().trim();
        const adminIndex = admins.findIndex(a => a.email === lowerEmail);
        if (adminIndex === -1) throw new Error('Target email not found in Administrative permissions matrix.');
        if (!newPassword || newPassword.length < 6) throw new Error('Password must be at least 6 characters.');
        
        const updated = [...admins];
        updated[adminIndex] = { ...updated[adminIndex], password: newPassword };
        setAdmins(updated);
        return true;
    };

    const logout = () => setCurrentUser(null);

    const addFeedback = (mealItem, text, stars, mealType, type, selectedItemsList, photoId) => {
        const newFeedback = {
            id: Date.now(),
            username: currentUser?.username || 'Anonymous',
            dishName: mealItem,
            mealType, 
            type, // 'Overall' or 'Particular'
            selectedItems: selectedItemsList, // string of ingredients
            feedbackText: text,
            starRating: stars,
            photoId: photoId || null,
            timestamp: new Date().toISOString()
        };
        setFeedbacks((prev) => [newFeedback, ...prev]);
        return true;
    };

    const getMenuForDate = (dateOrStr) => {
        // Convert to Date object explicitly avoiding timezone offsets if string is just yyyy-mm-dd
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

    const updateMenuForDate = (dateStr, mealId, newItemsArray) => {
        setMenuOverrides(prev => {
            const currentOverridesForDate = prev[dateStr] || {};
            return {
                ...prev,
                [dateStr]: {
                    ...currentOverridesForDate,
                    [mealId]: newItemsArray
                }
            };
        });
        return true;
    };

    return (
        <AppContext.Provider value={{ 
            currentUser, registeredUsers, feedbacks, theme, menuOverrides, admins,
            toggleTheme, registerUser, loginUser, resetPassword, deleteUser, loginAdmin, logout, addFeedback,
            getMenuForDate, updateMenuForDate, addAdminAccount, deleteAdminEmail, resetAdminPassword
        }}>
            {children}
        </AppContext.Provider>
    );
};
export const useAppContext = () => useContext(AppContext);
