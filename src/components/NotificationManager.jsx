'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import { Bell } from 'lucide-react';

// Initialize Firebase Client (Use ENV vars in production!)
// For now, we'll try to use the public config if available, or ask user to provide it.
// Ideally, these are in NEXT_PUBLIC_FIREBASE_XXX
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export default function NotificationManager() {
    const { data: session } = useSession();
    const [permission, setPermission] = useState('default');
    const [tokenSent, setTokenSent] = useState(false);

    useEffect(() => {
        const checkPermission = async () => {
            if (typeof window !== 'undefined' && 'Notification' in window) {
                const currentPermission = Notification.permission;
                setPermission(currentPermission);

                if (currentPermission === 'granted') {
                    await retrieveToken();
                }
            }
        };
        checkPermission();
    }, [session]);

    const retrieveToken = async () => {
        if (!session) return;

        try {
            if (!firebaseConfig.apiKey) {
                console.error("[Notifications] Firebase config missing.");
                return;
            }

            const { isSupported } = await import('firebase/messaging');
            const supported = await isSupported();
            if (!supported) {
                console.warn("[Notifications] Messaging is not supported in this browser.");
                return;
            }

            const { getApps, getApp } = await import('firebase/app');
            const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
            const messaging = getMessaging(app);

            const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
            console.log(`[Notifications] Retrieving token with VAPID key: ${vapidKey ? 'PRESENT' : 'MISSING'}`);

            const currentToken = await getToken(messaging, {
                vapidKey: vapidKey || undefined
            });

            if (currentToken) {
                console.log('[Notifications] FCM Token received:', currentToken);
                await saveTokenToBackend(currentToken);
            } else {
                console.log('[Notifications] No registration token available. Request permission to generate one.');
            }
        } catch (error) {
            console.error('[Notifications] Error retrieving token:', error);
        }
    }

    const requestPermission = async () => {
        if (!session) return;

        if (typeof window === 'undefined' || !('Notification' in window)) {
            console.error("[Notifications] This browser does not support desktop notification");
            return;
        }

        try {
            console.log('[Notifications] Requesting permission...');
            const permissionResult = await Notification.requestPermission();
            setPermission(permissionResult);

            if (permissionResult === 'granted') {
                console.log('[Notifications] Permission granted.');
                await retrieveToken();
            } else {
                console.warn('[Notifications] Permission not granted:', permissionResult);
            }
        } catch (error) {
            console.error('[Notifications] Permission request failed:', error);
        }
    };

    const saveTokenToBackend = async (token) => {
        try {
            const res = await fetch('/api/user/fcm-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fcmToken: token })
            });
            if (res.ok) {
                console.log('FCM Token saved to database.');
                setTokenSent(true);
            }
        } catch (err) {
            console.error('Error saving token:', err);
        }
    };

    // If granted, we don't show the prompt.
    // If denied in BROWSER, we can't show the prompt (it won't work).
    // But we use a separate 'dismissed' state for the "Later" button.
    const [dismissed, setDismissed] = useState(false);

    if (!session || permission === 'granted' || permission === 'denied' || dismissed) return null;

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-white border-2 border-red-500 rounded-2xl shadow-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 shrink-0 animate-pulse">
                    <Bell className="w-8 h-8" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="text-lg font-bold text-gray-900">Enable Vital Alerts?</h4>
                    <p className="text-gray-600 text-sm mt-1">
                        Don&apos;t miss urgent blood requests near you. Enable notifications to save lives in real-time.
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setDismissed(true)}
                        className="flex-1 md:flex-none px-6 py-2.5 text-gray-500 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                    >
                        Later
                    </button>
                    <button
                        onClick={requestPermission}
                        className="flex-1 md:flex-none px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                        Allow Notifications
                    </button>
                </div>
            </div>
        </div>
    );
}
