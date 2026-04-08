import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// CRITICAL PATH: Safely extract the shared global database configuration
// We use a typeof check to prevent local Vite crashes during compilation
let firebaseConfig;

try {
    if (typeof __firebase_config !== 'undefined') {
        firebaseConfig = JSON.parse(__firebase_config);
    } else {
        console.warn("Global __firebase_config not found. Waiting for environment injection...");
        // Failsafe configuration to prevent Vite from crashing before variables are injected
        firebaseConfig = {
            apiKey: "pending-environment-injection",
            projectId: "parbet-shared-network"
        };
    }
} catch (error) {
    console.error("Failed to parse Firebase configuration:", error);
    firebaseConfig = {};
}

// Initialize the core services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };