import { useMemo } from 'react';
import { CycleEntry } from '../lib/types';
import { differenceInDays, parseISO } from 'date-fns';

export type CyclePhase = 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal' | 'Unknown';

export const useCyclePhase = (cycleHistory: CycleEntry[]) => {
    const result = useMemo(() => {
        if (!cycleHistory || cycleHistory.length === 0) {
            return { currentPhase: 'Unknown', dayOfCycle: null, daysUntilNext: null, avgCycleLength: 28 };
        }

        // Calculate Average Cycle Length from history
        const totalDuration = cycleHistory.reduce((acc, curr) => {
            const length = curr.length || (differenceInDays(parseISO(curr.endDate), parseISO(curr.startDate)) + 1);
            return acc + length;
        }, 0);
        const calculatedAvg = Math.round(totalDuration / cycleHistory.length);
        
        // Use personal average if we have enough data (at least 2 cycles), otherwise fallback to 28
        const CYCLE_LENGTH = cycleHistory.length >= 2 ? calculatedAvg : 28;

        const sortedCycles = [...cycleHistory].sort((a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        const lastCycle = sortedCycles[0];

        const today = new Date();
        const start = parseISO(lastCycle.startDate);
        const diff = differenceInDays(today, start);

        // Normalize cycle day to be within the 1-CYCLE_LENGTH range
        const cycleDay = (diff % CYCLE_LENGTH) + 1;

        // Phase boundaries adjusted for personal cycle length
        // Medically, the Luteal phase (Ovulation to Period) is fairly constant at ~14 days
        // while the Follicular phase varies.
        let currentPhase: CyclePhase = 'Unknown';
        
        if (cycleDay >= 1 && cycleDay <= 5) {
            currentPhase = 'Menstrual';
        } else if (cycleDay > 5 && cycleDay <= (CYCLE_LENGTH - 15)) {
            currentPhase = 'Follicular';
        } else if (cycleDay === (CYCLE_LENGTH - 14)) {
            currentPhase = 'Ovulation';
        } else if (cycleDay >= (CYCLE_LENGTH - 13) && cycleDay <= CYCLE_LENGTH) {
            currentPhase = 'Luteal';
        }

        const daysUntilNext = Math.max(0, CYCLE_LENGTH - cycleDay + 1);

        return { 
            currentPhase, 
            dayOfCycle: cycleDay, 
            daysUntilNext, 
            avgCycleLength: calculatedAvg 
        };
    }, [cycleHistory]);

    return result;
};
