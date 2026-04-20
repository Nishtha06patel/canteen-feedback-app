// Full Day Items exactly as extracted from the provided image
export const FULL_DAY_ITEMS = [
    { name: "Tea", price: 10 },
    { name: "Coffee", price: 15 },
    { name: "Samosa 2 pc", price: 30 },
    { name: "Poha", price: 30 },
    { name: "Kachori", price: 30 },
    { name: "Noodles", price: 50 },
    { name: "Manchurian dry", price: 50 },
    { name: "Pasta", price: 50 },
    { name: "Medu vada", price: 50 },
    { name: "Masala Maggi", price: 50 },
    { name: "Bhel", price: 30 },
    { name: "Vd pav", price: 50 },
    { name: "dabeli", price: 50 },
    { name: "Paneer chili", price: 60 },
    { name: "Potato chili", price: 50 },
    { name: "Bread Butter Jam", price: 50 },
    { name: "veg Sandwich", price: 30 },
    { name: "Plane Maggi", price: 40 },
    { name: "Pulav", price: 70 },
    { name: "Bhaji Pav", price: 50 }
];

const getBreakfast = (items) => items.map(name => {
    let price = 30;
    const lower = name.toLowerCase();
    if (lower === 'tea') price = 10;
    if (lower === 'coffee') price = 10;
    if (lower === 'milk') price = 10;
    return { name: name.trim(), price };
});

const getEveningSnack = (items) => items.map(name => {
    let price = 30;
    const lower = name.toLowerCase();
    if (lower === 'tea') price = 10;
    else if (lower === 'coffee') price = 10;
    else if (lower === 'juice') price = 30;
    else if (lower.includes('samosa') || lower.includes('chaat')) price = 30;
    else if (lower.includes('pasta')) price = 50;
    else if (lower.includes('dabeli')) price = 50;
    return { name: name.trim(), price };
});

const getLunch = (desc) => [{ name: `Full Lunch (${desc})`, price: 60, isCombo: true, subItems: desc.split(',').map(s => s.trim()) }];
const getDinner = (desc) => [{ name: `Full Dinner (${desc})`, price: 60, isCombo: true, subItems: desc.split(',').map(s => s.trim()) }];

export const MENU_DATA = {
    "Monday": {
        breakfast: getBreakfast(["Aloo", "Poha", "Sprouts", "Tea", "Coffee", "Milk"]),
        lunch: getLunch("Flower Matar, White peas, Gujarati Dal, Rice, Roti, Salad, Buttermilk"),
        evening_snack: getEveningSnack(["Tea", "Coffee", "Juice", "Papdi chaat"]),
        dinner: getDinner("Chole Bhature, Sliced Onion, Jeera Rice, Buttermilk"),
        full_day: FULL_DAY_ITEMS
    },
    "Tuesday": {
        breakfast: getBreakfast(["Idli + Sambar + Chutney", "Tea", "Coffee", "Milk"]),
        lunch: getLunch("Shahi Paneer, Mix Pulse, Dal Fry, Jeera Rice, Roti, Salad, Buttermilk"),
        evening_snack: getEveningSnack(["Tea", "Coffee", "Juice", "Bataka Vada + Red & Green Chutney"]),
        dinner: getDinner("Dal Baati, Rice, Onion, Lehsun ki Chutney, Buttermilk"),
        full_day: FULL_DAY_ITEMS
    },
    "Wednesday": {
        breakfast: getBreakfast(["Dhokla + Green Chutney", "Bread Butter/Jam", "Tea", "Coffee", "Milk"]),
        lunch: getLunch("Cabbage Matar, Moong, Gujarati Dal, Rice, Roti, Salad, Buttermilk"),
        evening_snack: getEveningSnack(["Tea", "Coffee", "Juice", "Pasta"]),
        dinner: getDinner("Pav Bhaji, Pulav, Salad, Papad, Buttermilk"),
        full_day: FULL_DAY_ITEMS
    },
    "Thursday": {
        breakfast: getBreakfast(["Samosa", "Bread Jam/Butter", "Tea", "Coffee", "Milk"]),
        lunch: getLunch("Chole Puri, Biryani, Raita, Sliced Onion, Sweets, Buttermilk"),
        evening_snack: getEveningSnack(["Tea", "Coffee", "Juice", "Dabeli"]),
        dinner: getDinner("Rajma Chawal, Roti, Papad, Buttermilk"),
        full_day: FULL_DAY_ITEMS
    },
    "Friday": {
        breakfast: getBreakfast(["Aloo Paratha + Dahi", "Tea", "Coffee", "Milk"]),
        lunch: getLunch("Bhindi Masala, Chana Masala, Dal, White Pulav, Roti, Salad, Buttermilk"),
        evening_snack: getEveningSnack(["Tea", "Coffee", "Juice", "Samosa Chaat"]),
        dinner: getDinner("Corn Capsicum, Roti, Dal, Rice, Buttermilk"),
        full_day: FULL_DAY_ITEMS
    },
    "Saturday": {
        breakfast: getBreakfast(["Uttapam + Sambar + Coconut Chutney", "Tea", "Coffee", "Milk", "Fruits"]),
        lunch: getLunch("Veg Jaipuri, White Peas, Dal, Rice, Roti, Salad, Buttermilk"),
        evening_snack: getEveningSnack(["Tea", "Coffee", "Juice", "Dal Pakwan"]),
        dinner: getDinner("Dum Aloo, Roti, Dal Fry, Jeera Rice, Salad, Buttermilk"),
        full_day: FULL_DAY_ITEMS
    },
    "Sunday": {
        breakfast: getBreakfast(["Masala Dosa + Sambar + Chutney", "Tea", "Coffee", "Milk"]),
        lunch: getLunch("Lasaniya Bataka, Dal, Rice, Roti, Salad, Buttermilk"),
        evening_snack: getEveningSnack(["Tea", "Coffee", "Juice", "Misal Pav"]),
        dinner: getDinner("Paneer ki Sabji, Roti, Dal Fry, Jeera Rice, Papad, Salad, Buttermilk, Ice Cream/Gulab Jamun"),
        full_day: FULL_DAY_ITEMS
    }
};

export const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
