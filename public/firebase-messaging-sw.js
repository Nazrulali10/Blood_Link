// Give the service worker access to Firebase Messaging.
// Note: You must ensure these versions match the version of your main app or are compatible.
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
// IMPORTANT: Replace with your actual strings if env vars don't work in SW directly (they usually don't without build step).
// However, for a simple SW we can hardcode or attempt to peek from query params if we were dynamic.
// Since User gave us the config, I will hardcode the necessary parts for the SW here to ensure it works.
// "messagingSenderId": "596720302330"

firebase.initializeApp({
    apiKey: "AIzaSyBPsxz0NBD9XpNXMsw8RQTRgOQNb_BIMdQ",
    authDomain: "bloodlink123-554e8.firebaseapp.com",
    projectId: "bloodlink123-554e8",
    storageBucket: "bloodlink123-554e8.firebasestorage.app",
    messagingSenderId: "596720302330",
    appId: "1:596720302330:web:5b80a6c64133c16ccb7143",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
        '[firebase-messaging-sw.js] Received background message ',
        payload
    );
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.ico' // Ensure you have an icon
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
