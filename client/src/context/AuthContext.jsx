import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const syncUserWithBackend = async (firebaseUser, name = '') => {
        try {
            await api.post('/auth/sync', { name });
            const res = await api.get('/auth/me');
            return res.data;
        } catch (error) {
            console.error('Failed to sync user with backend', error);
            return null;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // When auth state changes and user is logged in, sync to get role
                const dbUser = await syncUserWithBackend(currentUser);
                if (dbUser) {
                    setUser({ ...currentUser, ...dbUser });
                } else {
                    setUser(currentUser); // fallback
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const dbUser = await syncUserWithBackend(userCredential.user);
        setUser({ ...userCredential.user, ...dbUser });
        return dbUser;
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const name = userCredential.user.displayName;
        const dbUser = await syncUserWithBackend(userCredential.user, name);
        setUser({ ...userCredential.user, ...dbUser });
        return dbUser;
    };

    const loginWithToken = async (token) => {
        const userCredential = await signInWithCustomToken(auth, token);
        const dbUser = await syncUserWithBackend(userCredential.user);
        setUser({ ...userCredential.user, ...dbUser });
        return dbUser;
    };

    const register = async (userData) => {
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        const dbUser = await syncUserWithBackend(userCredential.user, userData.name);
        setUser({ ...userCredential.user, ...dbUser });
        return dbUser;
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, loginWithToken, register, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
