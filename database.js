// Firebase configuration
// TODO: Replace these values with your Firebase project configuration
// You can find these values in your Firebase Console:
// 1. Go to Project Settings
// 2. Scroll down to "Your apps"
// 3. Click on the web app (</>)
// 4. Copy the configuration object
const firebaseConfig = {
    apiKey: "AIzaSyAkR4rQhTC9P9rIUpJzLUGLPDIxpYW0nrc",
    authDomain: "unspoken-journeys.firebaseapp.com",
    projectId: "unspoken-journeys",
    storageBucket: "unspoken-journeys.appspot.com",
    messagingSenderId: "1085239903802",
    appId: "1:1085239903802:web:1c8140e85ab72645f21703",
    measurementId: "G-CHFJNLYK08"
};

// Initialize Firebase
try {
    console.log('Initializing Firebase in database.js');
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully in database.js');
    } else {
        console.log('Firebase already initialized in database.js');
    }
    
    const db = firebase.firestore();
    const auth = firebase.auth();
    const storage = firebase.storage();
    console.log('Firebase services initialized: Firestore, Auth, Storage');
} catch (error) {
    console.error('Error initializing Firebase in database.js:', error);
}

// User Authentication Functions
async function signUp(email, password, fullName) {
    try {
        // First create the auth user
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Then create their profile document
        await db.collection('users').doc(user.uid).set({
            fullName: fullName,
            email: email,
            description: 'No description yet',
            profilePic: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fullName || 'User'),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return user;
    } catch (error) {
        console.error('Error signing up:', error);
        throw error;
    }
}

async function signIn(email, password) {
    try {
        console.log('Attempting to sign in with:', email);
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('Sign in successful:', userCredential.user.uid);
        return userCredential.user;
    } catch (error) {
        console.error('Error signing in:', error);
        throw error;
    }
}

async function signOut() {
    try {
        await auth.signOut();
        console.log('User signed out');
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
}

// User Profile Functions
async function updateUserProfile(userId, userData) {
    try {
        console.log('Updating user profile for:', userId);
        await db.collection('users').doc(userId).update({
            ...userData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Profile updated successfully');
        return true;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw new Error('Failed to update profile: ' + error.message);
    }
}

async function uploadProfilePicture(userId, file) {
    try {
        console.log('Uploading profile picture for:', userId);
        const storageRef = storage.ref();
        const fileRef = storageRef.child(`profile_pictures/${userId}`);
        await fileRef.put(file);
        const downloadURL = await fileRef.getDownloadURL();
        
        // Update the user profile with the new picture URL
        await updateUserProfile(userId, { profilePic: downloadURL });
        console.log('Profile picture uploaded successfully');
        return downloadURL;
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        throw new Error('Failed to upload profile picture: ' + error.message);
    }
}

async function getUserProfile(userId) {
    try {
        console.log('Getting user profile for:', userId);
        const doc = await db.collection('users').doc(userId).get();
        if (doc.exists) {
            console.log('User profile found');
            return { id: doc.id, ...doc.data() };
        } else {
            console.log('No user profile found, creating default profile');
            const defaultProfile = {
                fullName: 'User',
                description: 'No description yet',
                profilePic: 'https://ui-avatars.com/api/?name=User'
            };
            await db.collection('users').doc(userId).set({
                ...defaultProfile,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: userId, ...defaultProfile };
        }
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw new Error('Failed to get user profile: ' + error.message);
    }
}

// Story Management Functions
async function createStory(title, hashtags, description, story, userId) {
    try {
        console.log('Creating story for user:', userId);
        const storyRef = await db.collection('stories').add({
            title: title,
            hashtags: hashtags,
            description: description,
            story: story,
            userId: userId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            likes: 0,
            comments: []
        });
        console.log('Story created successfully');
        return storyRef.id;
    } catch (error) {
        console.error('Error creating story:', error);
        throw new Error('Failed to create story: ' + error.message);
    }
}

async function getStories() {
    try {
        console.log('Getting all stories');
        const snapshot = await db.collection('stories')
            .orderBy('createdAt', 'desc')
            .get();
        console.log('Stories retrieved successfully');
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting stories:', error);
        throw new Error('Failed to get stories: ' + error.message);
    }
}

async function getStoriesByCategory(category) {
    try {
        console.log('Getting stories for category:', category);
        const snapshot = await db.collection('stories')
            .where('hashtags', 'array-contains', category)
            .orderBy('createdAt', 'desc')
            .get();
        console.log('Category stories retrieved successfully');
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting category stories:', error);
        throw new Error('Failed to get category stories: ' + error.message);
    }
}

// Contact Form Function
async function submitContactForm(name, email, message) {
    try {
        await db.collection('contactSubmissions').add({
            name: name,
            email: email,
            message: message,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        });
    } catch (error) {
        throw error;
    }
}

// Category Management
async function getCategories() {
    try {
        const snapshot = await db.collection('categories').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw error;
    }
}

// Database Functions
const dbFunctions = {
    getUserProfile: async function(userId) {
        try {
            console.log('Getting user profile for:', userId);
            const doc = await firebase.firestore().collection('users').doc(userId).get();
            if (doc.exists) {
                console.log('User profile found');
                return { id: doc.id, ...doc.data() };
            } else {
                console.log('No user profile found, creating default profile');
                const defaultProfile = {
                    fullName: 'User',
                    description: 'No description yet',
                    profilePic: 'https://ui-avatars.com/api/?name=User'
                };
                await firebase.firestore().collection('users').doc(userId).set({
                    ...defaultProfile,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                return { id: userId, ...defaultProfile };
            }
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw new Error('Failed to get user profile: ' + error.message);
        }
    },

    updateUserProfile: async function(userId, userData) {
        try {
            await firebase.firestore().collection('users').doc(userId).update({
                ...userData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw new Error('Failed to update profile: ' + error.message);
        }
    },

    uploadProfilePicture: async function(userId, file) {
        try {
            const fileRef = firebase.storage().ref().child(`profile_pictures/${userId}`);
            await fileRef.put(file);
            const downloadURL = await fileRef.getDownloadURL();
            await this.updateUserProfile(userId, { profilePic: downloadURL });
            return downloadURL;
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            throw new Error('Failed to upload profile picture: ' + error.message);
        }
    },

    // Story Management Functions
    createStory,
    getStories,
    getStoriesByCategory,

    // Contact Form Function
    submitContactForm,

    // Category Management
    getCategories,

    // User Authentication Functions
    signUp,
    signIn,
    signOut
};

// Export functions to make them available to other scripts
window.dbFunctions = dbFunctions;
console.log('Database functions exported successfully'); 