import { useState, useEffect, useCallback, useRef } from 'react';

const DEFAULT_LOCATION = [40.7128, -74.0060];

export default function useGeolocation(fallback = DEFAULT_LOCATION) {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [permissionDenied, setPermissionDenied] = useState(false);

    const lastSentLocation = useRef(null);
    const lastSentTime = useRef(0);
    const sendInProgress = useRef(false);
    // Keep latest location in a ref so the sync interval can read it without being a dep
    const locationRef = useRef(null);

    const sendLocationToServer = useCallback(async (lat, lng) => {
        if (sendInProgress.current) return null;

        const now = Date.now();
        const locationChanged = !lastSentLocation.current ||
            Math.abs(lastSentLocation.current.lat - lat) > 0.002 ||
            Math.abs(lastSentLocation.current.lng - lng) > 0.002;

        if (!locationChanged && now - lastSentTime.current < 2 * 60 * 1000) return null;

        sendInProgress.current = true;
        try {
            const response = await fetch('/api/location/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lng }),
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                lastSentLocation.current = { lat, lng };
                lastSentTime.current = now;
                return data;
            }
        } catch (err) {
            console.error('Failed to send location to server:', err);
        } finally {
            sendInProgress.current = false;
        }
        return null;
    }, []); // stable — no deps

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            setLocation(fallback);
            setLoading(false);
            return;
        }

        const onSuccess = async (pos) => {
            const coords = [pos.coords.latitude, pos.coords.longitude];
            locationRef.current = coords;
            setLocation(coords);
            setLoading(false);
            setError(null);
            await sendLocationToServer(pos.coords.latitude, pos.coords.longitude);
        };

        const onError = (err) => {
            if (err.code === 1) {
                setPermissionDenied(true);
                setError('Location permission denied. Please allow location access in your browser settings.');
            } else if (err.code === 2) {
                navigator.geolocation.getCurrentPosition(onSuccess, () => {
                    setError('Could not get your location. Showing default location.');
                    setLocation(fallback);
                }, { timeout: 10000, maximumAge: 60000 });
                return;
            } else {
                navigator.geolocation.getCurrentPosition(onSuccess, () => {
                    setError('Could not get your location. Showing default location.');
                    setLocation(fallback);
                }, { timeout: 15000, maximumAge: 60000 });
                return;
            }
            locationRef.current = fallback;
            setLocation(fallback);
            setLoading(false);
        };

        navigator.geolocation.getCurrentPosition(onSuccess, onError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        });

        const watchId = navigator.geolocation.watchPosition(
            async (pos) => {
                const coords = [pos.coords.latitude, pos.coords.longitude];
                locationRef.current = coords;
                setLocation(coords);
                await sendLocationToServer(pos.coords.latitude, pos.coords.longitude);
            },
            () => {},
            {
                enableHighAccuracy: false,
                timeout: 20000,
                maximumAge: 120000,
            }
        );

        // Periodic sync every 3 minutes — uses ref, NOT location state
        const syncInterval = setInterval(async () => {
            if (locationRef.current?.length === 2) {
                await sendLocationToServer(locationRef.current[0], locationRef.current[1]);
            }
        }, 3 * 60 * 1000);

        return () => {
            navigator.geolocation.clearWatch(watchId);
            clearInterval(syncInterval);
        };
    }, [sendLocationToServer, fallback]); // ← `location` removed: prevents watchPosition re-registration on every GPS update

    return { location, error, loading, permissionDenied, sendLocationToServer };
}
