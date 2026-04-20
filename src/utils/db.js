// Native IndexedDB wrapper for handling large PDF Binary blobs safely without crashing localStorage

const DB_NAME = 'CanteenFeedbackDB';
const STORE_NAME = 'pdfHistory';
const DB_VERSION = 2; // Version bump for photos

const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('photoHistory')) {
                db.createObjectStore('photoHistory', { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

export const savePdfRecord = async (record) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
};

export const getAllPdfRecords = async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        // Sort descending by timestamp natively usually requires an index, we'll sort in JS.
        req.onsuccess = () => {
            const results = req.result || [];
            results.sort((a, b) => b.timestamp - a.timestamp);
            resolve(results);
        };
        req.onerror = () => reject(req.error);
    });
};

export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

export const savePhotoRecord = async (record) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('photoHistory', 'readwrite');
        const store = tx.objectStore('photoHistory');
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
};

export const getPhotoRecord = async (id) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('photoHistory', 'readonly');
        const store = tx.objectStore('photoHistory');
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
};
