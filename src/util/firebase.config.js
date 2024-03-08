const { initializeApp } = require("firebase/app");
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
};

//Initialize a firebase application
initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage();

const uploadFile = async (file, type) => {
    const folder = type === 'product' ? 'auction-product' : 'avatar';
    const storageRef = ref(storage, `${folder}/${uuidv4()}`);

    const metadata = {
        contentType: file.mimetype,
    };

    const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return {
        url: downloadURL
    }
}

const uploadMultipleFile = async (files, type) => {
    const folder = type === 'product' ? 'auction-product' : 'avatar';

    const uploadTasks = files.map(async (file) => {
        const storageRef = ref(storage, `${folder}/${uuidv4()}`);
        const metadata = { contentType: file.mimetype };
        const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
        return getDownloadURL(snapshot.ref);
    });

    return await Promise.all(uploadTasks);
}

module.exports = {
    uploadFile,
    uploadMultipleFile
}