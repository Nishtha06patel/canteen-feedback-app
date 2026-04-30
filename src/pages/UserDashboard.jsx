import React, { useState, useEffect } from 'react';
import { DAYS_OF_WEEK } from '../mockData';
import { useAppContext } from '../context/AppContext';
import { format, startOfWeek, addDays } from 'date-fns';
import { Camera, Paperclip, X, Image } from 'lucide-react';
import { fileToBase64, savePhotoRecord } from '../utils/db';

const UserDashboard = () => {
    const { addFeedback, getMenuForDate } = useAppContext();
    const [selectedDay, setSelectedDay] = useState('');
    const [currentDay, setCurrentDay] = useState('');
    const [expandedBlock, setExpandedBlock] = useState(null);

    // Ratings and Texts state per block
    const initialRatings = { breakfast: 0, lunch: 0, evening_snack: 0, dinner: 0, full_day: 0, cleanliness: 0, washroom: 0, hand_wash: 0 };
    const initialTexts = { breakfast: '', lunch: '', evening_snack: '', dinner: '', full_day: '', cleanliness: '', washroom: '', hand_wash: '' };
    const initialSelectedItems = { breakfast: '', lunch: '', evening_snack: '', dinner: '', full_day: '', cleanliness: '', washroom: '', hand_wash: '' };
    const initialPhotos = { breakfast: null, lunch: null, evening_snack: null, dinner: null, full_day: null, cleanliness: null, washroom: null, hand_wash: null };
    const initialShowPhotoOptions = { breakfast: false, lunch: false, evening_snack: false, dinner: false, full_day: false, cleanliness: false, washroom: false, hand_wash: false };

    const [ratings, setRatings] = useState(initialRatings);
    const [texts, setTexts] = useState(initialTexts);
    const [selectedItems, setSelectedItems] = useState(initialSelectedItems);
    const [photos, setPhotos] = useState(initialPhotos);
    const [showPhotoOptions, setShowPhotoOptions] = useState(initialShowPhotoOptions);

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        const today = new Date();
        const currentDayStr = DAYS_OF_WEEK[today.getDay()];
        setSelectedDay(currentDayStr);
        setCurrentDay(currentDayStr);
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
    const currentMenuData = selectedDay ? getMenuForDate(dateStrForSelected) : {};

    const MEAL_BLOCKS = [
        { id: 'breakfast', title: 'Morning Snack', time: '8AM-10AM', unlockHour: 0 },
        { id: 'lunch', title: 'Lunch', time: '12PM-2:30PM', unlockHour: 12 },
        { id: 'evening_snack', title: 'Evening Snack', time: '4PM-6PM', unlockHour: 16 },
        { id: 'dinner', title: 'Dinner', time: '7PM-10PM', unlockHour: 19 },
        { id: 'full_day', title: 'Full Day', time: '10AM-5PM', unlockHour: 10 },
        { id: 'cleanliness', title: 'Cleanliness of Canteen', time: 'Facility', unlockHour: 0, isFacility: true },
        { id: 'washroom', title: 'Washroom', time: 'Facility', unlockHour: 0, isFacility: true },
        { id: 'hand_wash', title: 'Hand Wash Area', time: 'Facility', unlockHour: 0, isFacility: true }
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
                'Overall',
                '',
                base64Data
            );
            showToast(`Thanks! Your feedback for ${targetItemName.length > 50 ? 'these items' : targetItemName} was submitted.`, 'success');
        } catch (error) {
            showToast(error.message || 'Failed to submit feedback', 'error');
            return;
        }
        setTexts(prev => ({ ...prev, [mealId]: '' }));
        setRatings(prev => ({ ...prev, [mealId]: 0 }));
        setSelectedItems(prev => ({ ...prev, [mealId]: '' }));
        setPhotos(prev => ({ ...prev, [mealId]: null }));
        setShowPhotoOptions(prev => ({ ...prev, [mealId]: false }));
        setExpandedBlock(null); // Close the form after submission
    };

    
    const renderModal = () => {
        if (!expandedBlock) return null;
        const block = MEAL_BLOCKS.find(b => b.id === expandedBlock);
                if (!block) return null;
                const isFacility = block.isFacility;
                const rawItems = isFacility ? [] : (currentMenuData[block.id] || []);
                
                return (
                    <div className="feedback-modal-wrapper">
                        <div className="feedback-modal animate-pop-in">

                             {/* Right Content Column */}
                             <div className="feedback-modal-content" style={{ position: 'relative' }}>



                                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', paddingRight: '0.5rem' }}>
                                      {/* Back button */}
                                      <button onClick={() => { setExpandedBlock(null); }} className="back-btn" style={{ marginBottom: '1.5rem', marginTop: '0.5rem' }}>
                                          <span style={{ fontSize: '1.2rem' }}>←</span> BACK
                                      </button>

                                      <h2 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                          {block.title}
                                      </h2>
                                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                          LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISICING ELIT. WE APPRECIATE YOUR FEEDBACK!
                                          <br/>
                                          <strong style={{ color: 'var(--highlight-cyan)' }}>{isFacility ? 'FACILITY RATING' : 'MEAL EXPERIENCE'}</strong>
                                      </p>

                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                          {/* Item Selector Dropdown */}
                                      {!isFacility && (
                                          <select
                                              className="input-field"
                                              value={selectedItems[block.id] || ''}
                                              onChange={(e) => setSelectedItems(prev => ({ ...prev, [block.id]: e.target.value }))}
                                          >
                                              {(block.id === 'lunch' || block.id === 'dinner') ? (
                                                  <option value="">OVERALL BLOCK (ALL ITEMS)</option>
                                              ) : (
                                                  <option value="" disabled hidden>SELECT AN ITEM...</option>
                                              )}
                                              {rawItems.map((item, idx) => (
                                                  item.isCombo && item.subItems ? (
                                                      item.subItems.map((sub, sIdx) => (
                                                          <option key={`sub-${idx}-${sIdx}`} value={sub}>{sub.toUpperCase()}</option>
                                                      ))
                                                  ) : (
                                                      <option key={idx} value={item.name}>{item.name.toUpperCase()}</option>
                                                  )
                                              ))}
                                          </select>
                                      )}

                                      {/* 5 Star Ratings Row */}
                                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                                          {[1, 2, 3, 4, 5].map(star => (
                                              <span
                                                  key={star}
                                                  onClick={() => setRatings(prev => ({ ...prev, [block.id]: star }))}
                                                  style={{
                                                      cursor: 'pointer', fontSize: '2rem', lineHeight: 1,
                                                      color: star <= (ratings[block.id] || 0) ? 'var(--highlight-cyan)' : 'transparent',
                                                      WebkitTextStroke: '1px var(--highlight-cyan)',
                                                      transition: 'all 0.2s'
                                                  }}
                                              >
                                                  ★
                                              </span>
                                          ))}
                                      </div>

                                      {/* Text Box */}
                                      <input
                                          type="text"
                                          className="input-field"
                                          placeholder={`WRITE YOUR FEEDBACK...`}
                                          value={texts[block.id] || ''}
                                          onChange={(e) => setTexts(prev => ({ ...prev, [block.id]: e.target.value }))}
                                      />

                                      {/* Photo Upload Options */}
                                      <div style={{ marginTop: '0.2rem' }}>
                                          {!photos[block.id] ? (
                                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                  <button 
                                                      type="button"
                                                      onClick={() => document.getElementById(`photo-camera-${block.id}`).click()} 
                                                      className="btn btn-outline hover-grow"
                                                      style={{ flex: 1, padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-main)', borderColor: 'var(--glass-border)', fontSize: '0.8rem' }}
                                                  >
                                                      <Camera size={16} /> Take Photo
                                                  </button>
                                                  <button 
                                                      type="button"
                                                      onClick={() => document.getElementById(`photo-gallery-${block.id}`).click()} 
                                                      className="btn btn-outline hover-grow"
                                                      style={{ flex: 1, padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-main)', borderColor: 'var(--glass-border)', fontSize: '0.8rem' }}
                                                  >
                                                      <Image size={16} /> Open Gallery
                                                  </button>
                                              </div>
                                          ) : (
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>
                                                  <Paperclip size={14} color="var(--highlight-cyan)" />
                                                  <span style={{ fontSize: '0.8rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{photos[block.id].name}</span>
                                                  <button type="button" onClick={() => setPhotos(prev => ({ ...prev, [block.id]: null }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex' }}><X size={16} /></button>
                                              </div>
                                          )}
                                          
                                          {/* Camera Input */}
                                          <input 
                                              type="file" 
                                              id={`photo-camera-${block.id}`} 
                                              accept="image/*" 
                                              capture="environment"
                                              style={{ display: 'none' }}
                                              onChange={(e) => {
                                                  if (e.target.files && e.target.files[0]) {
                                                      setPhotos(prev => ({ ...prev, [block.id]: e.target.files[0] }));
                                                  }
                                              }}
                                          />
                                          
                                          {/* Gallery Input */}
                                          <input 
                                              type="file" 
                                              id={`photo-gallery-${block.id}`} 
                                              accept="image/*" 
                                              style={{ display: 'none' }}
                                              onChange={(e) => {
                                                  if (e.target.files && e.target.files[0]) {
                                                      setPhotos(prev => ({ ...prev, [block.id]: e.target.files[0] }));
                                                  }
                                              }}
                                          />
                                      </div>
                                  </div>

                                  <button className="btn btn-primary" onClick={() => handleCardSubmit(block.id)} style={{
                                      width: '100%',
                                      marginTop: '1.5rem',
                                      textTransform: 'uppercase',
                                      letterSpacing: '1px'
                                  }}>
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
        <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

            {/* Top Day Selector Navbar */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}>
                {DAYS_OF_WEEK.map((day) => {
                    return day;
                }).sort((a, b) => {
                    const priority = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 7 };
                    return priority[a] - priority[b];
                }).map(day => (
                    <button
                        key={day}
                        onClick={() => { setSelectedDay(day); setExpandedBlock(null); setShowPhotoOptions(initialShowPhotoOptions); }}
                        style={{
                            background: day === selectedDay ? 'var(--tab-active-bg)' : 'transparent',
                            color: 'var(--text-main)',
                            border: '1px solid var(--glass-border)',
                            padding: '0.6rem 1.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '0.875rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        {day}
                    </button>
                ))}
            </div>

            {/* Grid Layout of Meal Blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                {MEAL_BLOCKS.map(block => {
                    const isFacility = block.isFacility;
                    const rawItems = isFacility ? [] : (currentMenuData[block.id] || []);
                    if (!isFacility && rawItems.length === 0) return null;

                    const isExpanded = expandedBlock === block.id;
                    const currentHour = new Date().getHours();
                    const isToday = selectedDay === currentDay;

                    let isDisabled = false;
                    let disabledReason = "";
                    let btnText = "Give Feedback";

                    if (!isToday) {
                        isDisabled = true;
                        disabledReason = "Feedback can only be given for today";
                        btnText = "Feedback Locked";
                    } else if (currentHour < block.unlockHour) {
                        isDisabled = true;
                        const displayTime = block.unlockHour <= 12
                            ? `${block.unlockHour === 0 ? 12 : block.unlockHour} AM`
                            : `${block.unlockHour - 12} PM`;
                        disabledReason = `Feedback unlocks at ${displayTime}`;
                        btnText = "Not Yet Available";
                    }

                    return (
                        <div key={block.id} className="glass-panel" style={{
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '16px',
                            position: 'relative'
                        }}>

                            {/* Title & Pill Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{block.title}</h2>
                                <span style={{
                                    background: '#00e5ff',
                                    color: '#000',
                                    fontSize: '0.75rem',
                                    padding: '0.3rem 0.8rem',
                                    borderRadius: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    {block.time}
                                </span>
                            </div>

                            {/* Menu String */}
                            <div style={{ textAlign: 'center', fontSize: '0.875rem', lineHeight: '1.6', minHeight: '3rem', color: 'var(--text-main)', opacity: 0.9, marginBottom: '2rem' }}>
                                {isFacility ? (
                                    <div style={{ fontSize: '0.95rem', marginTop: '1rem', color: '#00e5ff', opacity: 0.8 }}>
                                        General Facility Rating
                                    </div>
                                ) : (
                                    rawItems.map((item, idx) => (
                                        <React.Fragment key={idx}>
                                            {item.isCombo && item.subItems ? (
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <div style={{ fontWeight: '600', color: 'var(--highlight-cyan)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                                                        {item.name.split(' (')[0]} (₹{item.price})
                                                    </div>
                                                    {item.subItems.map((sub, sIdx) => (
                                                        <div key={sIdx} style={{ fontSize: '0.85rem', opacity: 0.8, padding: '0.1rem 0' }}>{sub}</div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{ marginBottom: '0.3rem' }}>{item.name} (₹{item.price})</div>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </div>

                            {/* Dynamic Action Area */}
                            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <button
                                        onClick={() => setExpandedBlock(block.id)}
                                        className="btn btn-primary hover-grow"
                                        disabled={isDisabled}
                                        style={{
                                            padding: '0.75rem 2.5rem',
                                            fontSize: '0.875rem',
                                            borderRadius: '8px',
                                            width: '100%',
                                            maxWidth: '250px',
                                            opacity: isDisabled ? 0.5 : 1,
                                            cursor: isDisabled ? 'not-allowed' : 'pointer'
                                        }}
                                        title={disabledReason}
                                    >
                                        {btnText}
                                    </button>
                                </div>
                            </div>

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
                    bottom: '2rem',
                    right: '2rem',
                    background: toast.type === 'error' ? 'var(--danger)' : 'var(--primary)',
                    color: '#fff',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    zIndex: 99999,
                    fontWeight: 'bold'
                }}>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
