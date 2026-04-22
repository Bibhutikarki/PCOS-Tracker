import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
    Check,
    Clock,
    Flame,
    Play,
    Pause,
    RotateCcw,
    Calendar,
    Target,
    Zap,
    Heart,
    Wind,
    Dumbbell
} from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../lib/api';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useHealthData } from '../../hooks/useHealthData';
import { useCyclePhase, CyclePhase } from '../../hooks/useCyclePhase';
import { format } from 'date-fns';
import { authStore } from '../../lib/auth';

interface Routine {
    _id: string;
    title: string;
    description: string;
    duration: string;
    intensity: 'Low' | 'Medium' | 'High';
    category: string;
    phases: string[];
}

export const Workouts = () => {
    const { workouts, loading: workoutsLoading, logWorkout } = useWorkouts();
    const { cycleHistory, loading: dataLoading } = useHealthData();
    const { currentPhase: phase, dayOfCycle: day } = useCyclePhase(cycleHistory);
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
    const [isTimerOpen, setIsTimerOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [routinesLoading, setRoutinesLoading] = useState(true);

    const currentUser = authStore.getAuth().user;
    const [reminderTime, setReminderTime] = useState(currentUser?.workoutReminderTime || '08:00');
    const [reminderEnabled, setReminderEnabled] = useState(currentUser?.workoutReminderEnabled || false);
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        const fetchRoutines = async () => {
            try {
                const res = await api.get('/admin/workouts');
                setRoutines(res.data);
            } catch (error) {
                console.error('Error fetching routines:', error);
            } finally {
                setRoutinesLoading(false);
            }
        };
        fetchRoutines();
    }, []);

    // Filter routines based on phase
    const recommendedRoutines = routines.filter(r => r.phases.includes(phase));
    const otherRoutines = routines.filter(r => !r.phases.includes(phase));

    // Timer Logic
    useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const startWorkout = (routine: Routine) => {
        setSelectedRoutine(routine);
        const minutes = parseInt(routine.duration);
        setTimeLeft(minutes * 60);
        setIsTimerOpen(true);
        setIsActive(true);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleComplete = async (routine: Routine) => {
        try {
            await logWorkout({
                type: routine.title,
                duration: routine.duration,
                intensity: routine.intensity,
                notes: `Completed during ${phase} phase (Day ${day})`,
                cyclePhase: phase
            });
            setIsTimerOpen(false);
            setIsActive(false);
            alert('Workout successfully logged!');
        } catch (error) {
            alert('Failed to log workout. Please try again.');
        }
    };

    if (workoutsLoading || dataLoading || routinesLoading) {
        return <div className="p-8 text-center text-gray-500">Loading your personalized workout plan...</div>;
    }

    const handleSaveSettings = async () => {
        if (!currentUser) return;
        setSavingSettings(true);
        try {
            const userId = currentUser._id || currentUser.id;
            const res = await api.put(`/user/${userId}/settings`, {
                workoutReminderTime: reminderTime,
                workoutReminderEnabled: reminderEnabled
            });
            const { token } = authStore.getAuth();
            authStore.login({
                ...res.data.user,
                id: res.data.user._id || res.data.user.id
            }, token);
            alert('Settings saved successfully!');
            if (reminderEnabled && 'Notification' in window && Notification.permission !== 'granted') {
                await Notification.requestPermission();
            }
        } catch (e) {
            console.error(e);
            alert('Failed to save settings.');
        } finally {
            setSavingSettings(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
                        Workout Planner
                    </h1>
                    <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>Cycle Day {day} • </span>
                        <span className="font-semibold text-primary-600">{phase} Phase</span>
                    </div>
                </div>
            </div>

            {/* Reminder Settings Card */}
            <Card className="bg-gradient-to-r from-primary-50 to-white border-primary-100">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary-500" />
                            Daily Workout Reminder
                        </h3>
                        <p className="text-sm text-gray-500">Enable a daily reminder to stay consistent with your workout plan.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="time"
                            className="text-lg bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 outline-none focus:ring-2 focus:ring-primary-500"
                            value={reminderTime}
                            onChange={(e) => setReminderTime(e.target.value)}
                        />
                        <button
                            className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                reminderEnabled ? "bg-primary-500" : "bg-gray-200"
                            )}
                            onClick={() => setReminderEnabled(!reminderEnabled)}
                        >
                            <span
                                className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                    reminderEnabled ? "translate-x-6" : "translate-x-1"
                                )}
                            />
                        </button>
                        <Button
                            onClick={handleSaveSettings}
                            disabled={savingSettings}
                            size="sm"
                            className="bg-primary-600 hover:bg-primary-700 text-white"
                        >
                            {savingSettings ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Smart Recommendation */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                    <h2 className="text-xl font-semibold text-gray-800">Recommended for You</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendedRoutines.map(routine => (
                        <WorkoutCard
                            key={routine._id}
                            routine={routine}
                            onStart={() => startWorkout(routine)}
                            isRecommended
                        />
                    ))}
                </div>
            </section>

            {/* Other Routines */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">All Routines</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80 hover:opacity-100 transition-opacity">
                    {otherRoutines.map(routine => (
                        <WorkoutCard
                            key={routine._id}
                            routine={routine}
                            onStart={() => startWorkout(routine)}
                        />
                    ))}
                </div>
            </section>

            {/* Recent History */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                            {workouts.length === 0 ? (
                                <p className="p-6 text-center text-gray-500">No workouts logged yet. Start your journey today!</p>
                            ) : (
                                workouts.slice(0, 5).map((log) => (
                                    <div key={log._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                                <Check className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{log.type}</p>
                                                <p className="text-xs text-gray-500">
                                                    {format(new Date(log.date), 'MMM d, yyyy')} • {log.cyclePhase} phase
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-700">{log.duration}</p>
                                            <p className="text-xs text-gray-400">{log.intensity} intensity</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Timer Modal */}
            <Modal
                isOpen={isTimerOpen}
                onClose={() => setIsTimerOpen(false)}
                title={selectedRoutine?.title || 'Workout Timer'}
            >
                <div className="text-center space-y-6 py-4">
                    <div className="text-6xl font-mono font-bold text-primary-600 tracking-tighter">
                        {formatTime(timeLeft)}
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Current Focus</p>
                        <p className="text-lg text-gray-900">{selectedRoutine?.description}</p>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button
                            variant="outline"
                            size="lg"
                            className="rounded-full w-14 h-14 p-0"
                            onClick={() => {
                                setTimeLeft(parseInt(selectedRoutine?.duration || '0') * 60);
                                setIsActive(false);
                            }}
                        >
                            <RotateCcw className="h-6 w-6" />
                        </Button>
                        <Button
                            size="lg"
                            className="rounded-full w-20 h-20 p-0 shadow-lg"
                            onClick={() => setIsActive(!isActive)}
                        >
                            {isActive ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="rounded-full h-14 px-6 text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => selectedRoutine && handleComplete(selectedRoutine)}
                        >
                            Finish
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const WorkoutCard = ({ routine, onStart, isRecommended }: { routine: Routine, onStart: () => void, isRecommended?: boolean }) => {
    return (
        <Card className={cn(
            "group overflow-hidden border-2 transition-all hover:shadow-xl",
            isRecommended ? "border-primary-200 bg-white" : "border-gray-100 hover:border-gray-200"
        )}>
            <div className={cn("h-1", isRecommended ? "bg-primary-500" : "bg-gray-200")} />
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-gray-50 rounded-2xl text-primary-600 transition-transform group-hover:scale-110">
                        <Dumbbell className="h-6 w-6" />
                    </div>
                    <div className="flex gap-2">
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-500 bg-gray-50 px-2 py-1 rounded">
                            <Clock className="h-3 w-3" /> {routine.duration}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-500 bg-gray-50 px-2 py-1 rounded">
                            <Zap className="h-3 w-3" /> {routine.intensity}
                        </span>
                    </div>
                </div>
                <CardTitle className="text-xl mt-4 font-black text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">{routine.title}</CardTitle>
                <p className="text-[10px] text-primary-600 font-black uppercase tracking-widest mt-1">{routine.category}</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-gray-500 italic line-clamp-2 leading-relaxed">{routine.description}</p>
                <Button
                    className={cn(
                        "w-full gap-2 transition-all font-black italic",
                        isRecommended ? "bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-100" : "bg-gray-900 hover:bg-black"
                    )}
                    onClick={onStart}
                >
                    <Play className="h-4 w-4" /> Start Workout
                </Button>
            </CardContent>
        </Card>
    );
};
