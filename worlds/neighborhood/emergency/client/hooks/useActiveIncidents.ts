/**
 * useActiveIncidents hook
 * Fetches and manages active emergency incidents
 */

import { useState, useEffect, useCallback } from 'react';
import { emergencyApi } from '../api/emergency.api';

interface Incident {
  id: string;
  customer_id: string;
  zone_id: string;
  category: string;
  urgency: string;
  description: string;
  lat: number | null;
  lng: number | null;
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled';
  assigned_provider_id: string | null;
  created_at: string;
  updated_at: string;
}

interface UseActiveIncidentsOptions {
  zoneId?: string;
  lat?: number;
  lng?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useActiveIncidents(options: UseActiveIncidentsOptions = {}) {
  const { zoneId, lat, lng, autoRefresh = true, refreshInterval = 30000 } = options;

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (zoneId) params.zone_id = zoneId;
      if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
      }

      const { data } = await emergencyApi.getActive(params);
      setIncidents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  }, [zoneId, lat, lng]);

  // Initial fetch
  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchIncidents, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchIncidents]);

  const acceptIncident = useCallback(async (incidentId: string) => {
    try {
      await emergencyApi.acceptDispatch(incidentId);
      await fetchIncidents();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept incident');
      return false;
    }
  }, [fetchIncidents]);

  const updateIncident = useCallback(async (incidentId: string, action: string) => {
    try {
      await emergencyApi.updateDispatch(incidentId, action);
      await fetchIncidents();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update incident');
      return false;
    }
  }, [fetchIncidents]);

  return {
    incidents,
    loading,
    error,
    refresh: fetchIncidents,
    acceptIncident,
    updateIncident,
  };
}