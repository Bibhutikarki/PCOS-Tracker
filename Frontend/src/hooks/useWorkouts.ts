import { useState, useEffect } from 'react';
import api from '../lib/api';
import { WorkoutLog } from '../lib/types';

export const useWorkouts = () => {
    const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkouts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/workout/history');
            setWorkouts(response.data);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching workouts:', err);
            setError(err.response?.data?.message || 'Failed to fetch workouts');
        } finally {
            setLoading(false);
        }
    };

    const logWorkout = async (workoutData: Omit<WorkoutLog, '_id' | 'date'>) => {
        try {
            const response = await api.post('/workout/log', workoutData);
            setWorkouts(prev => [response.data.workout, ...prev]);
            return response.data;
        } catch (err: any) {
            console.error('Error logging workout:', err);
            throw new Error(err.response?.data?.message || 'Failed to log workout');
        }
    };

    useEffect(() => {
        fetchWorkouts();
    }, []);

    return { workouts, loading, error, logWorkout, refreshWorkouts: fetchWorkouts };
};
