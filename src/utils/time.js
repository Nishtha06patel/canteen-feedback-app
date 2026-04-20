import { isWithinInterval, setHours, setMinutes, startOfDay } from 'date-fns';

export function getActiveMeals(currentTime) {
    const activeMeals = [];
    const now = new Date(currentTime);
    const startObj = startOfDay(now);

    const checkInterval = (startH, startM, endH, endM, mealKey) => {
        const start = setMinutes(setHours(startObj, startH), startM);
        const end = setMinutes(setHours(startObj, endH), endM);
        if (isWithinInterval(now, { start, end })) {
            activeMeals.push(mealKey);
        }
    };

    // Morning snack = 8 am to 10 am
    checkInterval(8, 0, 10, 0, 'breakfast');
    // Lunch = 12 pm to 2:30 pm
    checkInterval(12, 0, 14, 30, 'lunch');
    // Evening snack = 4 pm to 6 pm
    checkInterval(16, 0, 18, 0, 'evening_snack');
    // Dinner = 7 pm to 10 pm
    checkInterval(19, 0, 22, 0, 'dinner');
    // Full day = 10 am to 5 pm
    checkInterval(10, 0, 17, 0, 'full_day');

    return activeMeals;
}

export const MEAL_LABELS = {
    breakfast: 'Morning Snack',
    lunch: 'Lunch',
    evening_snack: 'Evening Snack',
    dinner: 'Dinner',
    full_day: 'Full Day Items'
};
