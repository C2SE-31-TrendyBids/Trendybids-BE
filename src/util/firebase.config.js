const { initializeApp } = require("firebase/app");
const { getStorage, ref, getDownloadURL, uploadBytesResumable, deleteObject, getMetadata  } = require("firebase/storage");
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
        const [id, url] = await Promise.all([
            (await getMetadata(snapshot.ref)).name,
            getDownloadURL(snapshot.ref)
        ])
        return {
            id,
            url
        }
    });

    return await Promise.all(uploadTasks);
}

const deleteFile = async (imageId, type) => {
    const folder = type === 'product' ? 'auction-product' : 'avatar';
    // Create a reference to the file to delete
    const desertRef = ref(storage, `${folder}/${imageId}`);
    // Delete the file
    return await deleteObject(desertRef)
}

const deleteMultipleFile = async (imageIds, type) => {
    const folder = type === 'product' ? 'auction-product' : 'avatar';

    // Create a reference to the file to delete
    const uploadTasks = imageIds.map(async (imageId) => {
        const desertRef = ref(storage, `${folder}/${imageId}`);
        return deleteObject(desertRef)
    });

    // Delete the file
    return await Promise.all(uploadTasks);
}

module.exports = {
    uploadFile,
    uploadMultipleFile,
    deleteFile,
    deleteMultipleFile
}