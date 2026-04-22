import { useMemo } from 'react';
import { useRiskAnalysis } from './useRiskAnalysis';
import { SymptomEntry, CycleEntry } from '../lib/types';
import { HealthProfile } from './useHealthData';
import { differenceInDays, parseISO, subDays } from 'date-fns';

export interface InsightAlert {
    type: 'warning' | 'info';
    title: string;
    description: string;
}

export const useInsights = (
    symptomsHistory: SymptomEntry[],
    cycleHistory: CycleEntry[],
    profile: HealthProfile
) => {
    const riskAnalysis = useRiskAnalysis(symptomsHistory, profile);

    const insights = useMemo(() => {
        const alerts: InsightAlert[] = [];
        const recommendations: string[] = [];
        let primaryInsight = "Start logging your symptoms and cycle to get personalized insights.";

        if (symptomsHistory.length === 0) {
            return { alerts, recommendations, primaryInsight, riskAnalysis };
        }

        // 1. Dominant Type Recommendations
        const { dominantType } = riskAnalysis;
        if (dominantType === 'Anti-inflammatory') {
            recommendations.push("Increase Omega-3 intake (fatty fish, chia seeds)", "Minimize processed sugars", "Prioritize 8 hours of quality sleep");
        } else if (dominantType === 'Low Glycemic') {
            recommendations.push("Switch to whole grains", "Pair carbs with protein/fats", "Try post-meal walks");
        } else if (dominantType === 'Hormone Balance') {
            recommendations.push("Increase fiber (cruciferous vegetables)", "Limit caffeine intake", "Practice stress management/meditation");
        } else if (dominantType === 'Gut Health') {
            recommendations.push("Add fermented foods (kimchi, yogurt)", "Identify food sensitivities", "Increase hydration");
        } else {
            recommendations.push("Maintain a balanced diet", "Regular consistent movement", "Stay hydrated");
        }

        // 2. Correlation Analysis (Simplified)
        const symptomsByDay: Record<number, number> = {};
        symptomsHistory.forEach(entry => {
            const date = parseISO(entry.date);
            // Find which cycle this date belongs to
            const cycle = cycleHistory.find(c => {
                const start = parseISO(c.startDate);
                const end = parseISO(c.endDate);
                return date >= start && date <= end;
            });

            if (cycle) {
                const day = differenceInDays(date, parseISO(cycle.startDate)) + 1;
                const severityValues = Object.values(entry.severity || {});
                const avgSev = severityValues.length > 0 ? severityValues.reduce((a, b) => a + b, 0) / severityValues.length : 0;
                symptomsByDay[day] = (symptomsByDay[day] || 0) + avgSev;
            }
        });

        // Find peak symptom day
        let peakDay = -1;
        let maxSev = 0;
        Object.entries(symptomsByDay).forEach(([day, sev]) => {
            if (sev > maxSev) {
                maxSev = sev;
                peakDay = parseInt(day);
            }
        });

        if (peakDay !== -1) {
            primaryInsight = `Your symptoms typically peak around Day ${peakDay} of your cycle. Proactively adjusting your activities during this time could help.`;
        } else {
            primaryInsight = "Based on your data, your health markers are being tracked. Log more consistently for day-specific correlations.";
        }

        // 3. Alerts
        if (profile.isIrregular) {
            alerts.push({
                type: 'info',
                title: 'Irregular Cycle Pattern',
                description: 'Your profile indicates irregular cycles. Cycle-based insights may be less predictable.'
            });
        }

        const recentSeverity = symptomsHistory[0]?.severity ? Object.values(symptomsHistory[0].severity).reduce((a, b) => Math.max(a, b), 0) : 0;
        if (recentSeverity >= 4) {
            alerts.push({
                type: 'warning',
                title: 'High Symptom Alert',
                description: 'You reported high severity symptoms recently. Consider resting and increasing hydration.'
            });
        }

        return { alerts, recommendations, primaryInsight, riskAnalysis };
    }, [symptomsHistory, cycleHistory, riskAnalysis, profile.isIrregular]);

    return insights;
};
