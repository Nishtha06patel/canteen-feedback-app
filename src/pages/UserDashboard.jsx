import React, { useState, useEffect } from 'react';
import { DAYS_OF_WEEK } from '../mockData';
import { useAppContext } from '../context/AppContext';
import { format, startOfWeek, addDays, formatDistanceToNow } from 'date-fns';
import { Camera, Paperclip, X, Image as ImageIcon, Utensils, Sun, Moon, ArrowLeft, Star, Clock, Bell, AlertTriangle } from 'lucide-react';
import { fileToBase64 } from '../utils/db';
import MealSelection from '../components/MealSelection';

const UserDashboard = () => {
    const { addFeedback, getMenuForDate, messages } = useAppContext();
    const [selectedDay, setSelectedDay] = useState('');
    const [currentDay, setCurrentDay] = useState('');
    const [expandedBlock, setExpandedBlock] = useState(null);

    // Ratings and Texts state per block
    const initialRatings = { breakfast: 0, lunch: 0, evening_snack: 0, dinner: 0, full_day: 0, cleanliness: 0, washroom: 0, hand_wash: 0 };
    const initialTexts = { breakfast: '', lunch: '', evening_snack: '', dinner: '', full_day: '', cleanliness: '', washroom: '', hand_wash: '' };
    const initialSelectedItems = { breakfast: '', lunch: '', evening_snack: '', dinner: '', full_day: '', cleanliness: '', washroom: '', hand_wash: '' };
    const initialPhotos = { breakfast: null, lunch: null, evening_snack: null, dinner: null, full_day: null, cleanliness: null, washroom: null, hand_wash: null };

    const [ratings, setRatings] = useState(initialRatings);
    const [texts, setTexts] = useState(initialTexts);
    const [selectedItems, setSelectedItems] = useState(initialSelectedItems);
    const [feedbackTypes, setFeedbackTypes] = useState({ breakfast: 'suggestion', lunch: 'suggestion', evening_snack: 'suggestion', dinner: 'suggestion', full_day: 'suggestion', cleanliness: 'suggestion', washroom: 'suggestion', hand_wash: 'suggestion' });
    const [photos, setPhotos] = useState(initialPhotos);

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        const today = new Date();
        const currentDayStr = DAYS_OF_WEEK[today.getDay() === 0 ? 6 : today.getDay() - 1]; // Adjustment if needed
        const actualDayStr = DAYS_OF_WEEK[today.getDay()];
        setSelectedDay(actualDayStr);
        setCurrentDay(actualDayStr);
    }, []);

    const getDateForDayName = (dayName) => {
        if (!dayName) return new Date();
        const dayIdx = DAYS_OF_WEEK.indexOf(dayName);
        const today = new Date();
        const start = startOfWeek(today); 
        return addDays(start, dayIdx);
    };

    const targetDateObj = getDateForDayName(selectedDay);
    const dateStrForSelected = format(targetDateObj, 'yyyy-MM-dd');
    const displayDateStr = format(targetDateObj, 'EEEE, d MMMM yyyy');
    const currentMenuData = selectedDay ? getMenuForDate(dateStrForSelected) : {};

    const MEAL_BLOCKS = [
        { id: 'breakfast', title: 'Morning Snack', time: '8:00 AM - 10:00 AM', unlockHour: 8, icon: <Sun size={20} color="#f59e0b" /> },
        { id: 'lunch', title: 'Lunch', time: '12:00 PM - 2:30 PM', unlockHour: 12, icon: <Utensils size={20} color="#64748b" /> },
        { id: 'evening_snack', title: 'Evening Snack', time: '4:00 PM - 6:00 PM', unlockHour: 16, icon: <Moon size={20} color="#64748b" /> },
        { id: 'dinner', title: 'Dinner', time: '7:00 PM - 10:00 PM', unlockHour: 19, icon: <Moon size={20} color="#334155" /> },
        { id: 'full_day', title: 'Full Day', time: '10:00 AM - 5:00 PM', unlockHour: 10, icon: <Utensils size={20} color="#64748b" /> },
        { id: 'cleanliness', title: 'Cleanliness of Canteen', time: 'Facility', unlockHour: 0, isFacility: true, icon: <Utensils size={20} color="#10b981" /> },
        { id: 'washroom', title: 'Washroom', time: 'Facility', unlockHour: 0, isFacility: true, icon: <Utensils size={20} color="#10b981" /> },
        { id: 'hand_wash', title: 'Hand Wash Area', time: 'Facility', unlockHour: 0, isFacility: true, icon: <Utensils size={20} color="#10b981" /> }
    ];

    const handleCardSubmit = async (mealId) => {
        if (ratings[mealId] === 0) {
            showToast('Please select a star rating first.', 'error');
            return;
        }
        const mealTitleMap = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', evening_snack: 'Evening Snack', full_day: 'General Canteen Menu', cleanliness: 'Facility', washroom: 'Facility', hand_wash: 'Facility' };

        const isFacility = ['cleanliness', 'washroom', 'hand_wash'].includes(mealId);
        let rawItems = [];

        if (!isFacility) {
            rawItems = currentMenuData[mealId] || [];
            if (rawItems.length === 0) {
                showToast('No menu available for this block.', 'error');
                return;
            }
        }

        let targetItemName = selectedItems[mealId];
        if (isFacility) {
            targetItemName = mealId === 'cleanliness' ? 'Canteen Cleanliness' : mealId === 'washroom' ? 'Washroom' : 'Hand Wash Area';
        } else if (!targetItemName) {
            if (mealId === 'lunch' || mealId === 'dinner') {
                targetItemName = rawItems.map(i => i.name).join(', '); // fallback to all items
            } else {
                showToast('Please select an item from the dropdown.', 'error');
                return;
            }
        }

        let base64Data = null;
        if (photos[mealId]) {
            try {
                base64Data = await fileToBase64(photos[mealId]);
            } catch (error) {
                console.error(error);
                showToast('Failed to securely encode photo upload for storage.', 'error');
                return;
            }
        }

        try {
            await addFeedback(
                targetItemName,
                texts[mealId],
                ratings[mealId],
                mealTitleMap[mealId],
                feedbackTypes[mealId],
                '',
                base64Data
            );
            showToast(`Feedback submitted successfully!`, 'success');
        } catch (error) {
            showToast(error.message || 'Failed to submit feedback', 'error');
            return;
        }
        setTexts(prev => ({ ...prev, [mealId]: '' }));
        setRatings(prev => ({ ...prev, [mealId]: 0 }));
        setSelectedItems(prev => ({ ...prev, [mealId]: '' }));
        setPhotos(prev => ({ ...prev, [mealId]: null }));
        setExpandedBlock(null); 
    };

    
    const renderModal = () => {
        if (!expandedBlock) return null;
        const block = MEAL_BLOCKS.find(b => b.id === expandedBlock);
        if (!block) return null;
        const isFacility = block.isFacility;
        const rawItems = isFacility ? [] : (currentMenuData[block.id] || []);
        
        return (
            <div className="feedback-modal-wrapper animate-fade-in">
                <div className="feedback-modal animate-pop-in" style={{ padding: 0 }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => setExpandedBlock(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--primary)' }}>
                            <ArrowLeft size={24} />
                        </button>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: 'var(--primary)' }}>Rate This Item</h2>
                    </div>

                    <div className="desktop-grid" style={{ padding: '2rem' }}>
                        {/* Left Column: Item & Rating */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>{block.title}</div>
                            
                            {!isFacility && (
                                <div style={{ width: '100%', marginBottom: '1.5rem' }}>
                                    <label className="input-label" style={{ textAlign: 'left' }}>Select Item</label>
                                    <select
                                        className="input-field"
                                        value={selectedItems[block.id] || ''}
                                        onChange={(e) => setSelectedItems(prev => ({ ...prev, [block.id]: e.target.value }))}
                                    >
                                        {(block.id === 'lunch' || block.id === 'dinner') ? (
                                            <option value="">Rate Entire Meal (All Items)</option>
                                        ) : (
                                            <option value="" disabled hidden>Select an item to rate...</option>
                                        )}
                                        {rawItems.map((item, idx) => (
                                            item.isCombo && item.subItems ? (
                                                item.subItems.map((sub, sIdx) => (
                                                    <option key={`sub-${idx}-${sIdx}`} value={sub}>{sub}</option>
                                                ))
                                            ) : (
                                                <option key={idx} value={item.name}>{item.name}</option>
                                            )
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: '600', textAlign: 'left', width: '100%' }}>
                                Category
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', width: '100%' }}>
                                {['suggestion', 'praise', 'complaint'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setFeedbackTypes(prev => ({ ...prev, [block.id]: t }))}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            borderRadius: '8px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            textTransform: 'capitalize',
                                            cursor: 'pointer',
                                            border: `1px solid ${feedbackTypes[block.id] === t ? 'var(--primary)' : 'var(--border-light)'}`,
                                            background: feedbackTypes[block.id] === t ? 'var(--primary)' : 'white',
                                            color: feedbackTypes[block.id] === t ? 'white' : 'var(--text-muted)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>

                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: '600', textAlign: 'left', width: '100%' }}>
                                Star Rating
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', justifyContent: 'center' }}>
                                {[1, 2, 3, 4, 5].map(star => {
                                    const active = star <= (ratings[block.id] || 0);
                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRatings(prev => ({ ...prev, [block.id]: star }))}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem',
                                                color: active ? '#f59e0b' : '#cbd5e1',
                                                transition: 'transform 0.1s ease',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <Star size={32} fill={active ? '#f59e0b' : 'none'} strokeWidth={active ? 0 : 1.5} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Column: Text & Photos */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ width: '100%', textAlign: 'left', marginBottom: '1.25rem' }}>
                                <label className="input-label" style={{ fontWeight: '600', color: 'var(--text-main)' }}>Your Feedback</label>
                                <textarea
                                    className="input-field"
                                    placeholder="Tell us more about your experience..."
                                    value={texts[block.id] || ''}
                                    onChange={(e) => setTexts(prev => ({ ...prev, [block.id]: e.target.value }))}
                                    style={{ height: '120px', resize: 'none' }}
                                    maxLength={250}
                                />
                                <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    {(texts[block.id] || '').length}/250
                                </div>
                            </div>

                            <div style={{ width: '100%', marginBottom: '1.5rem' }}>
                                <label className="input-label" style={{ fontWeight: '600', color: 'var(--text-main)' }}>Add Evidence (Photo)</label>
                                {!photos[block.id] ? (
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button 
                                            type="button"
                                            onClick={() => document.getElementById(`photo-camera-${block.id}`).click()} 
                                            className="btn btn-outline"
                                            style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
                                        >
                                            <Camera size={16} /> Camera
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => document.getElementById(`photo-gallery-${block.id}`).click()} 
                                            className="btn btn-outline"
                                            style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
                                        >
                                            <ImageIcon size={16} /> Gallery
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-main)', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                                        <Paperclip size={14} color="var(--primary)" />
                                        <span style={{ fontSize: '0.8rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>{photos[block.id].name}</span>
                                        <button type="button" onClick={() => setPhotos(prev => ({ ...prev, [block.id]: null }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex' }}><X size={16} /></button>
                                    </div>
                                )}
                                <input type="file" id={`photo-camera-${block.id}`} accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => { if (e.target.files && e.target.files[0]) setPhotos(prev => ({ ...prev, [block.id]: e.target.files[0] })); }} />
                                <input type="file" id={`photo-gallery-${block.id}`} accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files && e.target.files[0]) setPhotos(prev => ({ ...prev, [block.id]: e.target.files[0] })); }} />
                            </div>

                            <button className="btn btn-primary" onClick={() => handleCardSubmit(block.id)} style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}>
                                Submit Feedback
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (!selectedDay) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Menu...</div>;

    return (
        <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Utensils size={28} color="var(--primary)" />
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>Today's Menu</h1>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', marginBottom: '2rem', fontWeight: '600' }}>
                <span style={{ display: 'inline-block', width: '18px', height: '18px', background: 'none', border: '1.5px solid var(--text-main)', borderRadius: '4px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '2px', left: '2px', right: '2px', height: '3px', background: 'var(--text-main)', borderRadius: '1px' }}></div>
                </span>
                {displayDateStr}
            </div>

            {/* Announcements Section */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '700' }}>
                    <Bell size={20} color="var(--primary)" /> Recent Announcements (Last 24 Hours)
                </div>
                
                {messages && messages.filter(msg => new Date(msg.expires_at) > new Date()).length > 0 ? (
                    <div className="no-scrollbar" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                        {messages.filter(msg => new Date(msg.expires_at) > new Date()).map(msg => (
                            <div key={msg.id} className="glass-card animate-pop-in" style={{ 
                                minWidth: '300px', 
                                maxWidth: '300px', 
                                padding: '1.25rem', 
                                borderLeft: `4px solid ${msg.type === 'emergency' ? '#ef4444' : msg.type === 'delay' ? '#f59e0b' : 'var(--primary)'}`,
                                position: 'relative',
                                background: msg.type === 'emergency' ? 'rgba(239, 68, 68, 0.03)' : 'var(--bg-card)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                                    <span style={{ 
                                        fontSize: '0.7rem', 
                                        fontWeight: '800', 
                                        textTransform: 'uppercase', 
                                        color: msg.type === 'emergency' ? '#ef4444' : msg.type === 'delay' ? '#f59e0b' : 'var(--primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem'
                                    }}>
                                        {msg.type === 'emergency' ? <AlertTriangle size={12} /> : msg.type === 'delay' ? <Clock size={12} /> : <Bell size={12} />}
                                        {msg.type}
                                    </span>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                        Expires in {formatDistanceToNow(new Date(msg.expires_at))}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.875rem', margin: 0, color: 'var(--text-main)', lineHeight: '1.5', fontWeight: '500' }}>{msg.content}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        No recent announcements at this time.
                    </div>
                )}
            </div>

            {/* Meal Selection Feature */}
            <MealSelection />

            {/* Top Day Selector Navbar (Styled as clean pills) */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                {DAYS_OF_WEEK.map((day) => {
                    return day;
                }).sort((a, b) => {
                    const priority = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 7 };
                    return priority[a] - priority[b];
                }).map(day => {
                    const isActive = day === selectedDay;
                    return (
                        <button
                            key={day}
                            onClick={() => { setSelectedDay(day); setExpandedBlock(null); }}
                            style={{
                                background: isActive ? 'var(--primary)' : 'var(--bg-card)',
                                color: isActive ? '#fff' : 'var(--text-muted)',
                                border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border-light)'}`,
                                padding: '0.5rem 1.25rem',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s',
                                boxShadow: isActive ? '0 4px 10px rgba(98, 54, 255, 0.2)' : 'none'
                            }}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            {/* Grid Layout of Meal Blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {MEAL_BLOCKS.map(block => {
                    const isFacility = block.isFacility;
                    const rawItems = isFacility ? [] : (currentMenuData[block.id] || []);
                    if (!isFacility && rawItems.length === 0) return null;

                    const currentHour = new Date().getHours();
                    const isToday = selectedDay === currentDay;

                    let isDisabled = false;
                    let disabledReason = "";
                    let btnText = "Rate Items";

                    if (!isToday) {
                        isDisabled = true;
                        disabledReason = "Feedback can only be given for today";
                        btnText = "Locked";
                    } else if (currentHour < block.unlockHour) {
                        isDisabled = true;
                        const displayTime = block.unlockHour <= 12
                            ? `${block.unlockHour === 0 ? 12 : block.unlockHour} AM`
                            : `${block.unlockHour - 12} PM`;
                        disabledReason = `Feedback unlocks at ${displayTime}`;
                        btnText = "Not Available";
                    }

                    return (
                        <div key={block.id} className="glass-card" style={{
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            minHeight: '350px'
                        }}>

                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                {block.icon}
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>{block.title}</h2>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500', marginBottom: '2rem' }}>
                                <Clock size={14} />
                                {block.time}
                            </div>

                            {/* Menu Items List */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                {isFacility ? (
                                    <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>
                                        General Facility Rating
                                    </div>
                                ) : (
                                    rawItems.map((item, idx) => (
                                        <React.Fragment key={idx}>
                                            {item.isCombo && item.subItems ? (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                                                        <span>{item.name.split(' (')[0]}</span>
                                                        <span style={{ color: 'var(--text-main)' }}>₹{item.price}</span>
                                                    </div>
                                                    {item.subItems.map((sub, sIdx) => (
                                                        <div key={sIdx} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{sub}</div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem', fontWeight: '500' }}>
                                                    <span style={{ color: 'var(--text-main)' }}>{item.name}</span>
                                                    <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>₹{item.price}</span>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => setExpandedBlock(block.id)}
                                className={`btn ${isDisabled ? 'btn-outline' : 'btn-primary'}`}
                                disabled={isDisabled}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    opacity: isDisabled ? 0.6 : 1,
                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                    background: isDisabled ? 'var(--bg-main)' : 'var(--primary)',
                                    color: isDisabled ? 'var(--text-muted)' : '#fff',
                                    border: isDisabled ? '1px solid var(--border-light)' : 'none'
                                }}
                                title={disabledReason}
                            >
                                {btnText}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Modal Overlay */}
            {renderModal()}

            {/* Custom Toast Notification */}
            {toast.show && (
                <div className="animate-slide-up" style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    background: toast.type === 'error' ? 'var(--danger)' : 'var(--success)',
                    color: '#fff',
                    padding: '1rem 1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    zIndex: 99999,
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
