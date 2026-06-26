
import React, { createContext, useState, useContext } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
    throw new Error(
        "Missing VITE_CLERK_PUBLISHABLE_KEY. Add it to your environment variables."
    );
}

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [authError, setAuthError] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);


    const checkUserAuth = async () => {
        try {
            setIsLoadingAuth(true);

            const res = await fetch('/api/auth/user', {
                credentials: 'include'
            });

            const data = await res.json();

            if (data.user) {
                setUser(data.user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }

        } catch (error) {

            console.error('Auth check failed:', error);

            setAuthError({
                type: 'auth_error',
                message: error.message
            });

            setUser(null);
            setIsAuthenticated(false);

        } finally {

            setIsLoadingAuth(false);
            setAuthChecked(true);

        }
    };


    const logout = async (shouldRedirect = true) => {

        try {

            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

        } catch (error) {

            console.error('Logout failed:', error);

        }


        setUser(null);
        setIsAuthenticated(false);


        if (shouldRedirect) {
            window.location.href = '/login';
        }

    };


    const navigateToLogin = () => {
        window.location.href = '/login';
    };


    return (

        <ClerkProvider publishableKey={clerkPubKey}>

            <AuthContext.Provider
                value={{
                    user,
                    setUser,

                    isAuthenticated,
                    setIsAuthenticated,

                    isLoadingAuth,

                    authError,

                    authChecked,

                    logout,

                    navigateToLogin,

                    checkUserAuth
                }}
            >

                {children}

            </AuthContext.Provider>

        </ClerkProvider>

    );

};



export const useAuth = () => {

    const context = useContext(AuthContext);


    if (!context) {

        throw new Error(
            'useAuth must be used inside AuthProvider'
        );

    }


    return context;

};
