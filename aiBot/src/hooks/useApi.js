import { useState, useCallback } from 'react';
import api from '../api/axiosInstance';

/**
 * Custom hook for making API calls with loading / error / data state.
 *
 * Usage:
 *   const { data, loading, error, request } = useApi();
 *   await request(() => api.get('/bots'));
 */
export default function useApi() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const request = useCallback(async (apiCall) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiCall();
            setData(response.data);
            return response.data;
        } catch (err) {
            const message =
                err.response?.data?.message || err.message || 'Something went wrong';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return { data, loading, error, request, reset };
}
