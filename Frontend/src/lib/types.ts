export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    workoutReminderTime?: string;
    workoutReminderEnabled?: boolean;
    height?: number;
    weight?: number;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
}

export interface SymptomEntry {
    _id?: string;
    id?: string;
    date: string;
    selectedSymptoms: string[];
    severity: Record<string, number>;
    notes: string;
}

export interface MealPlan {
    breakfast: string;
    lunch: string;
    dinner: string;
}

export interface RiskAnalysisResult {
    score: number;
    level: string;
    confidence: string;
    symptomStats: Record<string, any>;
    dominantType: string;
    diagnosticBreakdown?: {
        criteriaMet: string[];
        reasons: string[];
        consistencyScore: number;
    };
}

export interface WorkoutLog {
    _id: string;
    type: string;
    duration: string;
    intensity: 'Low' | 'Medium' | 'High';
    date: string;
    notes?: string;
    cyclePhase?: string;
}

export interface CycleEntry {
    _id: string;
    startDate: string;
    endDate: string;
    length?: number;
}
