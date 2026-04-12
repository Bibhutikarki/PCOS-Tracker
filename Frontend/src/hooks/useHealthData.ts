import { useState, useEffect, useMemo } from 'react';
import api from '../lib/api';
import { SymptomEntry, CycleEntry } from '../lib/types';

export interface HealthProfile {
    weight: string;
    height: string;
    cycleLength: string;
    isIrregular: boolean;
}

export const useHealthData = () => {
    const [symptomsHistory, setSymptomsHistory] = useState<SymptomEntry[]>([]);
    const [cycleHistory, setCycleHistory] = useState<CycleEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const profile: HealthProfile = useMemo(() => ({
        weight: localStorage.getItem('pcos_weight') || '',
        height: localStorage.getItem('pcos_height') || '',
        cycleLength: localStorage.getItem('pcos_cycleLength') || '',
        isIrregular: localStorage.getItem('pcos_isIrregular') === 'true'
    }), []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [symptomsRes, cycleRes] = await Promise.all([
                api.get('/symptoms'),
                api.get('/cycle')
            ]);
            setSymptomsHistory(symptomsRes.data);
            setCycleHistory(cycleRes.data);
        } catch (error) {
            console.error('Error fetching health data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { 
        symptomsHistory, 
        cycleHistory, 
        profile, 
        loading, 
        refresh: fetchData 
    };
};
