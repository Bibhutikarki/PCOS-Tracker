import { useMemo } from 'react';
import { SymptomEntry, RiskAnalysisResult } from '../lib/types';
import { differenceInDays, parseISO } from 'date-fns';

const MAJOR_WEIGHTS: Record<string, number> = {
    'Irregular Periods': 15,
    'Facial Hair': 12,
    'Weight Gain': 10,
    'Acne': 10,
    'Hair Loss': 8
};

const MINOR_WEIGHTS: Record<string, number> = {
    'Fatigue': 6,
    'Pain': 5,
    'Mood': 5,
    'Bloating': 4
};

interface ProfileData {
    weight: string;
    height: string;
    cycleLength: string;
    isIrregular: boolean;
}

export const useRiskAnalysis = (
    symptomsHistory: SymptomEntry[],
    profile: ProfileData
): RiskAnalysisResult => {
    return useMemo(() => {
        const { weight, height, cycleLength, isIrregular } = profile;

        if (!symptomsHistory || symptomsHistory.length === 0) {
            let baseScore = 0;
            if (isIrregular) baseScore += 20;
            if (cycleLength && parseInt(cycleLength) > 35) baseScore += 15;
            
            return { 
                score: baseScore, 
                level: baseScore > 30 ? 'Moderate Risk' : 'Low Risk', 
                confidence: 'Low (Missing Symptom Data)', 
                symptomStats: {}, 
                dominantType: 'Default',
                diagnosticBreakdown: { criteriaMet: [], reasons: ["No symptom data available"], consistencyScore: 0 }
            };
        }

        let rawScore = 0;
        const symptomStats: Record<string, { count: number, maxSev: number, sumSev: number, weightedSum: number, consecutiveDays: number }> = {};
        const now = new Date();
        const reasons: string[] = [];
        const criteriaMet: string[] = [];

        // Track consecutive persistence
        const sortedHistory = [...symptomsHistory].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

        symptomsHistory.forEach(entry => {
            const logDate = parseISO(entry.date);
            const daysAgo = differenceInDays(now, logDate);
            
            let recencyFactor = 1.0;
            if (daysAgo > 7) {
                recencyFactor = Math.max(0.3, 1.0 - (daysAgo - 7) * 0.05);
            }

            Object.entries(entry.severity || {}).forEach(([sym, sev]) => {
                if (!symptomStats[sym]) {
                    symptomStats[sym] = { count: 0, maxSev: 0, sumSev: 0, weightedSum: 0, consecutiveDays: 0 };
                }

                symptomStats[sym].sumSev += sev;
                symptomStats[sym].maxSev = Math.max(symptomStats[sym].maxSev, sev);
                symptomStats[sym].weightedSum += (sev * recencyFactor);

                if (sev >= 3) {
                    symptomStats[sym].count += 1;
                }
            });
        });

        // persistence bonus check
        Object.keys(MAJOR_WEIGHTS).forEach(sym => {
            let consecutive = 0;
            for (const entry of sortedHistory) {
                if (entry.severity?.[sym] >= 3) consecutive++;
                else break;
            }
            if (symptomStats[sym]) symptomStats[sym].consecutiveDays = consecutive;
        });

        // 1. Rotterdam Criteria Logic
        let r_anovulation = false; // Criteria 1: Oligo/Anovulation
        let r_androgen = false;    // Criteria 2: Hyperandrogenism

        // Criteria 1 Check
        if (isIrregular || (cycleLength && parseInt(cycleLength) > 35) || (symptomStats['Irregular Periods']?.count >= 2)) {
            r_anovulation = true;
            criteriaMet.push("Oligo/Anovulation (Cycle Irregularity)");
            reasons.push("Menstrual irregularity detected via cycle history or symptom logs.");
        }

        // Criteria 2 Check
        const androgenSymptoms = ['Facial Hair', 'Acne', 'Hair Loss'];
        const highAndrogen = androgenSymptoms.some(s => (symptomStats[s]?.maxSev >= 4 && symptomStats[s]?.count >= 2) || (symptomStats[s]?.consecutiveDays >= 3));
        if (highAndrogen) {
            r_androgen = true;
            criteriaMet.push("Clinical Hyperandrogenism");
            reasons.push("Persistent physical markers of elevated androgen levels (Hirsutism/Acne/Hair Loss).");
        }

        // 2. Base Scoring (Weighted)
        Object.entries(symptomStats).forEach(([sym, stats]) => {
            const majorWeight = MAJOR_WEIGHTS[sym];
            const minorWeight = MINOR_WEIGHTS[sym];
            
            if (majorWeight) {
                rawScore += (stats.weightedSum / symptomsHistory.length) * (majorWeight / 5) * 1.5;
                if (stats.consecutiveDays >= 3) rawScore += majorWeight * 0.5; // Persistence bonus
            } else if (minorWeight) {
                rawScore += (stats.weightedSum / symptomsHistory.length) * (minorWeight / 5);
            }
        });

        // Rotterdam Multiplier
        if (r_anovulation && r_androgen) {
            rawScore *= 1.3; // High diagnostic alignment boost
            reasons.push("Aligned with 2/3 Rotterdam diagnostic criteria.");
        }

        // BMI & Cycle Factors
        if (weight && height) {
            const w = parseFloat(weight);
            const h = parseFloat(height) / 100;
            const bmi = w / (h * h);
            if (bmi >= 30) {
                rawScore += 15;
                reasons.push("Elevated BMI significantly increases metabolic risk factors.");
            }
        }

        const finalScore = Math.min(Math.round(rawScore), 100);

        // Consistency Score
        const daysTracked = new Set(symptomsHistory.map(s => s.date.split('T')[0])).size;
        const consistencyScore = Math.min(Math.round((daysTracked / 14) * 100), 100);

        // Type Detection
        const getAvg = (s: string) => symptomStats[s] ? symptomStats[s].weightedSum / symptomsHistory.length : 0;
        const clusterScores = {
            'Anti-inflammatory': (getAvg('Pain') * 1.5 + getAvg('Mood') + getAvg('Bloating') * 0.5) / 3,
            'Low Glycemic': (getAvg('Weight Gain') * 2 + getAvg('Acne') + getAvg('Fatigue')) / 4,
            'Hormone Balance': (getAvg('Irregular Periods') * 2 + getAvg('Facial Hair') * 1.5 + getAvg('Hair Loss')) / 4.5,
            'Gut Health': (getAvg('Bloating') * 2 + getAvg('Fatigue')) / 3
        };

        let dominantType = 'Balanced';
        let maxClusterScore = 1.5;
        Object.entries(clusterScores).forEach(([type, score]) => {
            if (score > maxClusterScore) {
                maxClusterScore = score;
                dominantType = type;
            }
        });

        let confidence = consistencyScore > 70 ? 'High' : consistencyScore > 30 ? 'Medium' : 'Low';

        return { 
            score: finalScore, 
            level: finalScore >= 75 ? 'High Risk' : finalScore >= 45 ? 'Moderate Risk' : 'Low Risk', 
            confidence, 
            symptomStats, 
            dominantType,
            diagnosticBreakdown: {
                criteriaMet,
                reasons: reasons.slice(0, 3), // Keep UI clean
                consistencyScore
            }
        };
    }, [symptomsHistory, profile.weight, profile.height, profile.cycleLength, profile.isIrregular]);
};
