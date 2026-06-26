import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [authError, setAuthError] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);

    // Sync Firebase user → server session
    const syncToBackend = async (firebaseUser) => {
        try {
            const idToken = await firebaseUser.getIdToken();
            const res = await fetch('/api/auth/firebase-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
                credentials: 'include',
            });
            if (res.ok) {
                const { user: serverUser } = await res.json();
                return serverUser;
            }
        } catch (err) {
            console.error('Firebase backend sync failed:', err);
        }
        return null;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const serverUser = await syncToBackend(firebaseUser);
                const merged = serverUser || {
                    id: firebaseUser.uid,
                    email: firebaseUser.email,
                    full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                    avatar_url: firebaseUser.photoURL,
                    role: 'customer',
                };
                setUser(merged);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            setIsLoadingAuth(false);
            setAuthChecked(true);
        });
        return unsubscribe;
    }, []);

    // Kept for manual re-check if needed by other components
    const checkUserAuth = async () => {
        try {
            const res = await fetch('/api/auth/user', { credentials: 'include' });
            const data = await res.json();
            if (data.user) {
                setUser(data.user);
                setIsAuthenticated(true);
            }
        } catch (err) {
            setAuthError({ type: 'auth_error', message: err.message });
        }
    };

    const logout = async (shouldRedirect = true) => {
        try {
            await auth.signOut();
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        } catch (err) {
            console.error('Logout failed:', err);
        }
        setUser(null);
        setIsAuthenticated(false);
        if (shouldRedirect) window.location.href = '/login';
    };

    const navigateToLogin = () => { window.location.href = '/login'; };

    return (
        <AuthContext.Provider value={{
            user, setUser,
            isAuthenticated, setIsAuthenticated,
            isLoadingAuth,
            authError,
            authChecked,
            logout,
            navigateToLogin,
            checkUserAuth,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider');
    return context;
};
