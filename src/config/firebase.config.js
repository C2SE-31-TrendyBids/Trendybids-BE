const { initializeApp } = require("firebase/app");
const {
    getStorage,
    collection,
    query,
    where,
    getDocs,
    ref,
    getDownloadURL,
    uploadBytesResumable,
    deleteObject,
    getMetadata
} = require("firebase/storage");
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require("dotenv").config();

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID,
};

//Initialize a firebase application
initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage();

function getFolderByType(type) {
    const typeToFolderMap = {
        product: "auction-product",
        censor: "censor-avatar",
        user: "user-avatar",
        avatar: "user-avatar",
        message: "message-image",
    };
    return typeToFolderMap[type] || "default-folder";
}

const imageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
const convertStorageRef = (file, folder, type) => {
    const extension = path.extname(file.originalname);
    let storageRef;
    if (!imageTypes.includes(file.mimetype)) {
        storageRef = ref(storage, `${folder}/${file.originalname}`);
    } else {
        const name = type === 'message' ? `${uuidv4()}${extension}` : uuidv4();
        storageRef = ref(storage, `${folder}/${name}`);
    }
    return storageRef;
}


const uploadFile = async (file, type, userId) => {
    const folder = getFolderByType(type);
    const id =
        type === "product" || type === "censor" || type === "message" || type === "avatar"
            ? uuidv4()
            : userId;
    const storageRef = ref(storage, `${folder}/${id}`);

    const metadata = {
        contentType: file.mimetype,
    };

    const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return {
        url: downloadURL,
    };
};

const uploadMultipleFile = async (files, type) => {
    const folder = getFolderByType(type);
    const uploadTasks = files.map(async (file) => {
        const storageRef = convertStorageRef(file, folder, type);
        const metadata = { contentType: file.mimetype };
        const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
        const [id, url] = await Promise.all([
            (await getMetadata(snapshot.ref)).name,
            getDownloadURL(snapshot.ref),
        ]);
        return {
            id,
            type: file.mimetype,
            name: file.originalname,
            url,
        };
    });

    return await Promise.all(uploadTasks);
};

const deleteFile = async (imageId, type) => {
    const folder = getFolderByType(type);
    // Create a reference to the file to delete
    const desertRef = ref(storage, `${folder}/${imageId}`);

    // Delete the file
    try {
        return await deleteObject(desertRef);
    } catch (error) {
        if (error.code !== "storage/object-not-found") {
            throw error;
        }
    }
};

const deleteMultipleFile = async (imageIds, type) => {
    const folder = getFolderByType(type);
    // Create a reference to the file to delete
    const uploadTasks = imageIds.map(async (imageId) => {
        // Query Firestore to get the full file name
        const q = query(collection(storage, folder), where("id", "==", imageId));
        const querySnapshot = await getDocs(q);

        const desertRef = ref(storage, `${folder}/${imageId}`);
        return deleteObject(desertRef)
    });

    // Delete the file
    try {
        return await Promise.all(uploadTasks);
    } catch (error) {
        if (error.code !== "storage/object-not-found") {
            throw error;
        }
    }
};

module.exports = {
    uploadFile,
    uploadMultipleFile,
    deleteFile,
    deleteMultipleFile,
};