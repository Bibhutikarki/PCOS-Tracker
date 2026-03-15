import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Utensils, ChefHat, Check, Leaf } from 'lucide-react';

const SUGGESTIONS = [
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

export const Nutrition = () => {
    const [meals, setMeals] = useState<MealPlan>({
        breakfast: 'Oatmeal with berries',
        lunch: 'Grilled Chicken Salad',
        dinner: 'Baked Salmon with Quinoa'
    });
    const [editingMeal, setEditingMeal] = useState<keyof MealPlan | null>(null);
    const [editValue, setEditValue] = useState('');

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

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Nutrition Planner</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
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
                            {SUGGESTIONS.map((s, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <ChefHat className="h-5 w-5 text-gray-400 mt-0.5" />
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
        </div>
    );
};
