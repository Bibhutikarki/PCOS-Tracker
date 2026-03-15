import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Check, Clock, Flame } from 'lucide-react';
import { cn } from '../lib/utils';

const ROUTINES = [
    {
        id: 1,
        title: 'Low Impact Yoga',
        condition: 'Fatigue / Cramps',
        warmup: '5 min breathing',
        main: '20 min gentle flow',
        cooldown: '5 min savasana',
        duration: '30 min',
        intensity: 'Low'
    },
    {
        id: 2,
        title: 'HIIT Cardio',
        condition: 'Energy Boost',
        warmup: '5 min dynamic stretch',
        main: '15 min tabata intervals',
        cooldown: '5 min stretch',
        duration: '25 min',
        intensity: 'High'
    },
    {
        id: 3,
        title: 'Strength Training',
        condition: 'Muscle Building',
        warmup: '5 min cardio',
        main: '30 min weights',
        cooldown: '5 min foam roll',
        duration: '40 min',
        intensity: 'Medium'
    }
];

export const Workouts = () => {
    const [completedInfo, setCompletedInfo] = useState<{ id: number, date: string } | null>(() => {
        const saved = localStorage.getItem('pcos_last_workout');
        return saved ? JSON.parse(saved) : null;
    });

    const handleComplete = (id: number) => {
        const info = { id, date: new Date().toDateString() };
        setCompletedInfo(info);
        localStorage.setItem('pcos_last_workout', JSON.stringify(info));
    };

    const isCompletedToday = (id: number) => {
        return completedInfo?.id === id && completedInfo.date === new Date().toDateString();
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">Workout Planner</h1>
                <p className="text-gray-500">Exercise Routines Based on Health Conditions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ROUTINES.map(routine => {
                    const completed = isCompletedToday(routine.id);

                    return (
                        <Card key={routine.id} className={cn("relative transition-all", completed && "bg-green-50 border-green-200")}>
                            {completed && (
                                <div className="absolute top-4 right-4 text-green-600 bg-white rounded-full p-1 shadow-sm">
                                    <Check className="h-4 w-4" />
                                </div>
                            )}
                            <CardHeader>
                                <div className="text-sm font-medium text-primary-600 mb-1">{routine.condition}</div>
                                <CardTitle className="text-xl">{routine.title}</CardTitle>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {routine.duration}</span>
                                    <span className="flex items-center gap-1"><Flame className="h-3 w-3" /> {routine.intensity}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p><span className="font-semibold text-gray-900">Warm-up:</span> {routine.warmup}</p>
                                    <p><span className="font-semibold text-gray-900">Main:</span> {routine.main}</p>
                                    <p><span className="font-semibold text-gray-900">Cool-down:</span> {routine.cooldown}</p>
                                </div>

                                <div className="pt-4">
                                    {completed ? (
                                        <Button className="w-full bg-green-600 hover:bg-green-700 pointer-events-none">
                                            Completed Today
                                        </Button>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button variant="outline">Start</Button>
                                            <Button onClick={() => handleComplete(routine.id)}>Complete</Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
