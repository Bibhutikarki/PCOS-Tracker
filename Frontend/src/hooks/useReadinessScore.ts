import { useMemo } from 'react';
import { SymptomEntry, CycleEntry } from '../lib/types';
import { differenceInDays, parseISO, isToday, isYesterday } from 'date-fns';

export const useReadinessScore = (
    symptomsHistory: SymptomEntry[],
    cyclePhase: string | null,
    consistencyScore: number
) => {
    return useMemo(() => {
        let score = 85; // Base readiness

        // 1. Cycle Phase Impact
        if (cyclePhase === 'Menstrual') score -= 15;
        else if (cyclePhase === 'Luteal') score -= 10;
        else if (cyclePhase === 'Ovulation') score += 5; // Surge in energy
        else if (cyclePhase === 'Follicular') score += 10;

        // 2. Recent Symptom Impact (Last 48 hours)
        const recentLogs = symptomsHistory.filter(entry => {
            const date = parseISO(entry.date);
            return isToday(date) || isYesterday(date);
        });

        if (recentLogs.length > 0) {
            const maxSeverity = Math.max(...recentLogs.map(log => 
                Math.max(...Object.values(log.severity || {}), 0)
            ));
            
            if (maxSeverity >= 4) score -= 25;
            else if (maxSeverity >= 3) score -= 10;
        }

        // 3. Consistency Adjustment
        // High consistency (reliable data) confirms the score.
        // Low consistency makes it a "Guestimate".
        if (consistencyScore < 30) score -= 5;

        const finalScore = Math.max(0, Math.min(100, score));

        // Generate dynamic feedback
        let feedback = "Your profile is looking balanced. Great day for consistent habits.";
        if (finalScore < 50) feedback = "Listen to your body today. Prioritize rest and gentle movement.";
        else if (finalScore < 75) feedback = "Moderate energy levels. Focus on nourishing meals and steady pace.";
        else if (cyclePhase === 'Follicular' || cyclePhase === 'Ovulation') feedback = "Peak energy phase! Excellent time for challenging workouts and productivity.";

        return { score: finalScore, feedback };
    }, [symptomsHistory, cyclePhase, consistencyScore]);
};
