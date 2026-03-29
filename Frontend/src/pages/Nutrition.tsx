import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Utensils, ChefHat, Leaf, Activity, Settings2 } from 'lucide-react';
import api from '../lib/api';

const DEFAULT_SUGGESTIONS = [
    'High-Fiber Breakfast: Oatmeal with berries',
    'Lean Protein: Grilled chicken Salad',
    'Anti-inflammatory: Salmon with asparagus',
    'Low Glycemic: Quinoa bowl with veggies',
    'Snack: Apple slices with almond butter'
];

interface MealPlan {
    breakfast: string;
    lunch: string;
    dinner: string;
}

interface SymptomEntry {
    _id: string;
    date: string;
    selectedSymptoms: string[];
    severity: Record<string, number>;
    notes: string;
}

const WEIGHTS: Record<string, number> = {
    'Acne': 8,
    'Fatigue': 5,
    'Mood': 4,
    'Pain': 4,
    'Bloating': 3,
    'Irregular Periods': 12,
    'Weight Gain': 8,
    'Hair Loss': 6,
    'Facial Hair': 10
};

export const Nutrition = () => {
    const [meals, setMeals] = useState<MealPlan>({
        breakfast: 'Oatmeal with berries',
        lunch: 'Grilled Chicken Salad',
        dinner: 'Baked Salmon with Quinoa'
    });
    const [editingMeal, setEditingMeal] = useState<keyof MealPlan | null>(null);
    const [editValue, setEditValue] = useState('');

    // Health Profile State
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [cycleLength, setCycleLength] = useState('');
    const [isIrregular, setIsIrregular] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const [symptomsHistory, setSymptomsHistory] = useState<SymptomEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSymptoms = async () => {
            try {
                const response = await api.get('/symptoms');
                setSymptomsHistory(response.data);
            } catch (error) {
                console.error("Error fetching symptoms:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSymptoms();
    }, []);

    const openEdit = (meal: keyof MealPlan) => {
        setEditingMeal(meal);
        setEditValue(meals[meal]);
    };

    const saveEdit = () => {
        if (editingMeal) {
            setMeals({ ...meals, [editingMeal]: editValue });
            setEditingMeal(null);
        }
    };

    const riskAnalysis = useMemo(() => {
        if (!symptomsHistory || symptomsHistory.length === 0) {
            return { score: 0, level: 'Low Risk', confidence: 'Low (Not enough data)', symptomStats: {} };
        }

        let score = 0;
        const symptomStats: Record<string, { count: number, maxSev: number, sumSev: number }> = {};
        let totalSymptomsLogged = 0;

        symptomsHistory.forEach(entry => {
            Object.entries(entry.severity).forEach(([sym, sev]) => {
                totalSymptomsLogged++;
                if (!symptomStats[sym]) symptomStats[sym] = { count: 0, maxSev: 0, sumSev: 0 };

                symptomStats[sym].sumSev += sev;
                symptomStats[sym].maxSev = Math.max(symptomStats[sym].maxSev, sev);

                if (sev >= 3) {
                    symptomStats[sym].count += 1;
                }
            });
        });

        // Calculate weighted severity and persistence
        Object.entries(symptomStats).forEach(([sym, stats]) => {
            const weightValue = WEIGHTS[sym] || 0;
            if (weightValue > 0) {
                // Base score off average severity contribution
                const avgSev = stats.sumSev / symptomsHistory.length;
                score += weightValue * (avgSev / 5);

                // Persistence Extra Points: if appears sufficiently with severity >= 3
                if (stats.count >= 2) {
                    score += weightValue * 0.5;
                }
            }
        });

        // Cycle Check
        if (cycleLength && parseInt(cycleLength) > 35) score += 20;
        if (isIrregular) score += 15;

        // BMI Factor
        if (weight && height) {
            const w = parseFloat(weight);
            const h = parseFloat(height) / 100; // convert cm to m
            if (w > 0 && h > 0) {
                const bmi = w / (h * h);
                if (bmi > 30) score += 15;
                else if (bmi > 25) score += 8;
            }
        }

        const finalScore = Math.min(Math.round(score), 100);

        // Risk Level
        let level = 'Low Risk';
        if (finalScore >= 70) level = 'High Risk';
        else if (finalScore >= 40) level = 'Moderate Risk';

        // Confidence Level
        const historyLen = symptomsHistory.length;
        let confidence = 'Low';
        if (historyLen >= 10 && totalSymptomsLogged >= 8) confidence = 'High';
        else if (historyLen >= 3 && totalSymptomsLogged >= 3) confidence = 'Medium';
        else if (historyLen > 0) confidence = 'Low (Needs more tracking)';

        return { score: finalScore, level, confidence, symptomStats };
    }, [symptomsHistory, weight, height, cycleLength, isIrregular]);

    const dynamicSuggestions = useMemo(() => {
        if (!riskAnalysis.symptomStats || Object.keys(riskAnalysis.symptomStats).length === 0) return DEFAULT_SUGGESTIONS;

        const suggestions: string[] = [];
        const stats = riskAnalysis.symptomStats;
        const getAvg = (sym: string) => stats[sym] ? stats[sym].sumSev / symptomsHistory.length : 0;

        if (getAvg('Acne') >= 3) suggestions.push('Reduce sugar, add leafy greens and berries');
        if (getAvg('Fatigue') >= 3) suggestions.push('Eat iron rich foods (spinach, lentils), nuts and seeds');
        if (getAvg('Bloating') >= 3) suggestions.push('Add probiotic foods like yogurt, increase water');
        if (getAvg('Mood') >= 3) suggestions.push('Add omega-3 foods like salmon and walnuts');
        if (getAvg('Pain') >= 4) suggestions.push('Add anti-inflammatory foods like turmeric and ginger');
        if (getAvg('Weight Gain') >= 3) suggestions.push('Focus on protein-rich foods and complex carbs to stabilize blood sugar');
        if (getAvg('Hair Loss') >= 3) suggestions.push('Incorporate foods high in Zinc and Biotin (eggs, nuts, seeds)');

        let i = 0;
        while (suggestions.length < 5 && i < DEFAULT_SUGGESTIONS.length) {
            if (!suggestions.includes(DEFAULT_SUGGESTIONS[i])) {
                suggestions.push(DEFAULT_SUGGESTIONS[i]);
            }
            i++;
        }

        return suggestions.slice(0, 5);
    }, [riskAnalysis.symptomStats, symptomsHistory]);

    const getRiskColor = (level: string) => {
        if (level === 'Low Risk') return 'text-green-600 bg-green-100';
        if (level === 'Moderate Risk') return 'text-orange-600 bg-orange-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Nutrition Planner</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {!isLoading && (
                        <Card className="border-primary-100 bg-primary-50/50">
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-primary-900">
                                    <Activity className="h-5 w-5 text-primary-600" />
                                    AI PCOS Risk Analysis
                                </CardTitle>
                                <Button variant="outline" size="sm" onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-2">
                                    <Settings2 className="h-4 w-4" />
                                    Health Profile
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {weight && height && cycleLength ? (
                                    <>
                                        <div className="p-4 bg-white rounded-lg border border-primary-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-500">Predicted Risk Score</p>
                                                <div className="flex items-end gap-2">
                                                    <span className="text-4xl font-extrabold text-gray-900">{riskAnalysis.score}</span>
                                                    <span className="text-lg text-gray-500 mb-1">/ 100</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-start sm:items-end gap-2">
                                                <div className={`px-4 py-2 rounded-full font-bold text-base shadow-sm ${getRiskColor(riskAnalysis.level)}`}>
                                                    {riskAnalysis.level}
                                                </div>
                                                <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                                                    Confidence: <span className="font-semibold">{riskAnalysis.confidence}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-4 italic bg-blue-50/50 p-2 rounded border border-blue-100">
                                            This AI system estimates PCOS risk based on symptoms and does not replace professional medical diagnosis.
                                        </p>
                                    </>
                                ) : (
                                    <div className="py-8 px-4 text-center bg-gray-50 border-2 border-dashed border-primary-200 rounded-lg">
                                        <Activity className="h-8 w-8 text-primary-400 mx-auto mb-3 opacity-50" />
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Health Profile Required</h3>
                                        <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
                                            To calculate a medically-informed PCOS risk score, please enter your weight, height, and average cycle length.
                                        </p>
                                        <Button onClick={() => setIsProfileModalOpen(true)} className="px-6 font-semibold shadow-sm hover:shadow-md transition-shadow">
                                            Complete Profile
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                        <Card key={meal} className="overflow-visible">
                            <CardHeader className="flex flex-row items-center justify-between py-3">
                                <CardTitle className="capitalize flex items-center gap-2">
                                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                        <Utensils className="h-4 w-4" />
                                    </div>
                                    {meal}
                                </CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => openEdit(meal)}>
                                    Customize
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">{meals[meal]}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Leaf className="h-5 w-5 text-green-500" />
                            PCOS-Friendly Suggestions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {dynamicSuggestions.map((s, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <ChefHat className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{s}</span>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-4">
                            View More Suggestions
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Meal Customization Modal */}
            <Modal
                isOpen={!!editingMeal}
                onClose={() => setEditingMeal(null)}
                title={`Customize ${editingMeal}`}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meal Description</label>
                        <input
                            type="text"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setEditingMeal(null)}>Cancel</Button>
                        <Button onClick={saveEdit}>Save Changes</Button>
                    </div>
                </div>
            </Modal>

            {/* Health Profile Modal */}
            <Modal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                title="Update Health Profile"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                            <input
                                type="number"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="e.g. 68"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                            <input
                                type="number"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                placeholder="e.g. 165"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Average Cycle Length (days)</label>
                        <input
                            type="number"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            value={cycleLength}
                            onChange={(e) => setCycleLength(e.target.value)}
                            placeholder="e.g. 28"
                        />
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                        <input
                            type="checkbox"
                            id="irregular"
                            checked={isIrregular}
                            onChange={(e) => setIsIrregular(e.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="irregular" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                            My periods are frequently irregular or absent
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button onClick={() => setIsProfileModalOpen(false)}>Save Profile</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

