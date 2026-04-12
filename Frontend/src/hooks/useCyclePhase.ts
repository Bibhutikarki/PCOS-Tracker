import { useMemo } from 'react';
import { CycleEntry } from '../lib/types';
import { differenceInDays, parseISO } from 'date-fns';

export type CyclePhase = 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal' | 'Unknown';

export const useCyclePhase = (cycleHistory: CycleEntry[]) => {
    const result = useMemo((): { currentPhase: CyclePhase; dayOfCycle: number | null; daysUntilNext: number | null } => {
        if (!cycleHistory || cycleHistory.length === 0) {
            return { currentPhase: 'Unknown', dayOfCycle: null, daysUntilNext: null };
        }

        // Sort descending to get the most recent cycle
        const lastCycle = [...cycleHistory].sort((a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        )[0];

        const today = new Date();
        const start = parseISO(lastCycle.startDate);
        const diff = differenceInDays(today, start);

        // Use 28-day cycle as baseline (common starting point)
        const CYCLE_LENGTH = 28;
        const cycleDay = (diff % CYCLE_LENGTH) + 1;

        let currentPhase: CyclePhase = 'Unknown';
        if (cycleDay >= 1 && cycleDay <= 5) currentPhase = 'Menstrual';
        else if (cycleDay >= 6 && cycleDay <= 13) currentPhase = 'Follicular';
        else if (cycleDay === 14) currentPhase = 'Ovulation';
        else if (cycleDay >= 15 && cycleDay <= CYCLE_LENGTH) currentPhase = 'Luteal';

        const daysUntilNext = CYCLE_LENGTH - cycleDay + 1;

        return { currentPhase, dayOfCycle: cycleDay, daysUntilNext };
    }, [cycleHistory]);

    return result;
};
