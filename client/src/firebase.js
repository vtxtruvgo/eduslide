import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBdpMAyPbtPdKwtM7NnRFJJo5FERVraKh4",
    authDomain: "eduslide-yeahzz.firebaseapp.com",
    projectId: "eduslide-yeahzz",
    storageBucket: "eduslide-yeahzz.firebasestorage.app",
    messagingSenderId: "369532650302",
    appId: "1:369532650302:web:4e7bcd3db7c368c011626f",
    measurementId: "G-KY40MX2R1F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, analytics };
