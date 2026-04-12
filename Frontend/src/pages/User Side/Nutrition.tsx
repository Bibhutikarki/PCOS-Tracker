import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Utensils, ChefHat, Leaf, Activity, CheckCircle2, XCircle, Coffee } from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../lib/api';

import { useHealthData } from '../../hooks/useHealthData';
import { useRiskAnalysis } from '../../hooks/useRiskAnalysis';
import { MealPlan } from '../../lib/types';

interface DetailedPlan extends MealPlan {
    snacks: string;
    hydration: string;
    avoid: string[];
    prioritize: string[];
}

const NUTRITION_PLANS: Record<string, DetailedPlan> = {
    'Anti-inflammatory': {
        breakfast: 'Chia pudding with walnuts and blueberries',
        lunch: 'Quinoa and kale salad with grilled salmon',
        dinner: 'Turmeric-spiced lentil soup with steamed broccoli',
        snacks: 'Apple slices with almond butter, handful of raw almonds',
        hydration: 'Green tea, lemon-infused water',
        prioritize: ['Omega-3s (Salmon, Walnuts)', 'Turmeric', 'Dark Leafy Greens'],
        avoid: ['Refined Sugar', 'Processed Meats', 'Dairy']
    },
    'Low Glycemic': {
        breakfast: 'Scallion and spinach omelette (2 eggs)',
        lunch: 'Chicken and avocado wrap with whole-grain tortilla',
        dinner: 'Tofu stir-fry with cauliflower rice and snap peas',
        snacks: 'Hummus with cucumber sticks, Greek yogurt (unsweetened)',
        hydration: 'Spearmint tea (helps with hirsutism), plain water',
        prioritize: ['Complex Carbs (Cauliflower rice, Quinoa)', 'Fiber', 'Lean Protein'],
        avoid: ['White Bread', 'Sugary Drinks', 'High-GI Fruits (Mango, Watermelon)']
    },
    'Hormone Balance': {
        breakfast: 'Greek yogurt with flax seeds and pumpkin seeds',
        lunch: 'Roasted chickpea and sweet potato bowl with tahini',
        dinner: 'Baked cod with sautéed spinach and brown rice',
        snacks: 'Seed cycling mix (flax/pumpkin in first half, sesame/sunflower in second)',
        hydration: 'Raspberry leaf tea, filtered water',
        prioritize: ['Flax Seeds', 'Cruciferous Veggies (Broccoli, Kale)', 'Zinc-rich foods'],
        avoid: ['Excessive Caffeine', 'Soy (in large amounts)', 'Alcohol']
    },
    'Gut Health': {
        breakfast: 'Sourdough toast with avocado and sauerkraut',
        lunch: 'Tempeh Buddha bowl with miso dressing',
        dinner: 'Grilled chicken with asparagus and kimchi side',
        snacks: 'Kefir (if tolerated), bone broth or miso soup',
        hydration: 'Ginger tea, kombucha (low sugar)',
        prioritize: ['Fermented Foods (Kimchi, Kraut)', 'Prebiotic Fiber', 'Bone Broth'],
        avoid: ['Artificial Sweeteners', 'Gum', 'Fried Foods']
    },
    'Balanced': {
        breakfast: 'Oatmeal with flax seeds and berries',
        lunch: 'Mixed green salad with chickpeas and olive oil',
        dinner: 'Roasted chicken with sweet potatoes and green beans',
        snacks: 'Fresh fruit and a few walnuts',
        hydration: 'Water, peppermint tea',
        prioritize: ['Fiber-rich grains', 'Diverse Veggies', 'Healthy Fats'],
        avoid: ['Trans Fats', 'High-Sodium Snacks', 'Added Sugars']
    }
};

const DEFAULT_SUGGESTIONS = [
    'High-Fiber Breakfast: Oatmeal with berries',
    'Lean Protein: Grilled chicken Salad',
    'Anti-inflammatory: Salmon with asparagus',
    'Low Glycemic: Quinoa bowl with veggies',
    'Snack: Apple slices with almond butter'
];

export const Nutrition = () => {
    const { symptomsHistory, profile, loading: dataLoading } = useHealthData();
    const riskAnalysis = useRiskAnalysis(symptomsHistory, profile);

    const [meals, setMeals] = useState<DetailedPlan>(NUTRITION_PLANS.Balanced);
    const [editingMeal, setEditingMeal] = useState<keyof MealPlan | null>(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        if (!dataLoading) {
            const type = riskAnalysis.dominantType;
            setMeals(NUTRITION_PLANS[type] || NUTRITION_PLANS.Balanced);
        }
    }, [riskAnalysis.dominantType, dataLoading]);

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

    const dynamicSuggestions = useMemo(() => {
        if (!riskAnalysis.symptomStats || Object.keys(riskAnalysis.symptomStats).length === 0) return DEFAULT_SUGGESTIONS;

        const suggestions: string[] = [];
        const stats = riskAnalysis.symptomStats;
        const historyLen = symptomsHistory.length || 1;
        const getAvg = (sym: string) => stats[sym] ? stats[sym].sumSev / historyLen : 0;

        if (getAvg('Acne') >= 3) suggestions.push('Reduce sugar, add leafy greens and berries');
        if (getAvg('Fatigue') >= 3) suggestions.push('Eat iron-rich foods (spinach, lentils)');
        if (getAvg('Bloating') >= 3) suggestions.push('Add probiotic foods, increase water');
        if (getAvg('Mood') >= 3) suggestions.push('Add omega-3 (salmon, walnuts)');
        if (getAvg('Pain') >= 4) suggestions.push('Add turmeric and ginger');

        return [...suggestions, ...DEFAULT_SUGGESTIONS].slice(0, 5);
    }, [riskAnalysis.symptomStats, symptomsHistory]);

    if (dataLoading) {
        return <div className="p-8 text-center text-gray-500">Curating your personalized nutrition plan...</div>;
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Nutrition Planner</h1>
                    <p className="text-primary-600 font-bold uppercase text-xs tracking-widest mt-1">
                        Tailored for: {riskAnalysis.dominantType} PCOS
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Core Meals */}
                    <div className="grid grid-cols-1 gap-4">
                        {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                            <Card key={meal} className="group hover:shadow-md transition-shadow cursor-default">
                                <CardHeader className="flex flex-row items-center justify-between py-4">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-2.5 rounded-xl text-white shadow-sm",
                                            meal === 'breakfast' ? "bg-amber-400" : meal === 'lunch' ? "bg-emerald-500" : "bg-indigo-500"
                                        )}>
                                            <Utensils className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="capitalize text-lg font-black">{meal}</CardTitle>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => openEdit(meal)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        Customize
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 font-medium leading-relaxed">{meals[meal]}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Snack & Hydration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-amber-50/50 border-amber-100">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-black text-amber-700 uppercase tracking-wider flex items-center gap-2">
                                    <ChefHat className="h-4 w-4" /> Recommended Snacks
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-amber-900 font-medium">{meals.snacks}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-sky-50/50 border-sky-100">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-black text-sky-700 uppercase tracking-wider flex items-center gap-2">
                                    <Coffee className="h-4 w-4" /> Hydration Guide
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-sky-900 font-medium">{meals.hydration}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Prioritize / Avoid */}
                    <Card className="border-primary-100 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Leaf className="h-4 w-4 text-emerald-500" /> Clinical Food Focus
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div>
                                <h4 className="text-[10px] font-black text-emerald-600 uppercase mb-3 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Prioritize these
                                </h4>
                                <div className="space-y-2">
                                    {meals.prioritize.map((food, i) => (
                                        <div key={i} className="px-3 py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-100 italic">
                                            {food}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-rose-600 uppercase mb-3 flex items-center gap-1.5">
                                    <XCircle className="h-3.5 w-3.5" /> Limit these
                                </h4>
                                <div className="space-y-2">
                                    {meals.avoid.map((food, i) => (
                                        <div key={i} className="px-3 py-2 bg-rose-50 text-rose-800 text-xs font-bold rounded-lg border border-rose-100 italic">
                                            {food}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Suggestions */}
                    <Card className="bg-gray-50 border-none">
                        <CardHeader>
                            <CardTitle className="text-xs font-black text-gray-500 uppercase tracking-widest">Symptom-Specific Tips</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {dynamicSuggestions.map((s, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl shadow-xs border border-gray-100">
                                    <Activity className="h-4 w-4 text-primary-400 mt-0.5" />
                                    <span className="text-xs text-gray-600 font-medium">{s}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Modal
                isOpen={!!editingMeal}
                onClose={() => setEditingMeal(null)}
                title={`Customize ${editingMeal}`}
            >
                <div className="space-y-4">
                    <textarea
                        className="w-full rounded-xl border border-gray-200 p-4 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none min-h-[100px]"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setEditingMeal(null)}>Cancel</Button>
                        <Button onClick={saveEdit} className="bg-primary-600 hover:bg-primary-700">Save Changes</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
