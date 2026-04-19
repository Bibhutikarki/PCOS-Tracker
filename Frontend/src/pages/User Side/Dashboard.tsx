import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { Calendar, Activity, Utensils, Dumbbell, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { useHealthData } from '../../hooks/useHealthData';
import { useCyclePhase } from '../../hooks/useCyclePhase';
import { useRiskAnalysis } from '../../hooks/useRiskAnalysis';
import { useReadinessScore } from '../../hooks/useReadinessScore';
import { cn } from '../../lib/utils';
import { format, parseISO } from 'date-fns';

export const Dashboard = () => {
    const { symptomsHistory, cycleHistory, profile, loading } = useHealthData();
    const { currentPhase, dayOfCycle, daysUntilNext } = useCyclePhase(cycleHistory);
    const riskAnalysis = useRiskAnalysis(symptomsHistory, profile);
    const { score: readinessScore, feedback: readinessFeedback } = useReadinessScore(
        symptomsHistory,
        currentPhase,
        riskAnalysis.diagnosticBreakdown?.consistencyScore || 0
    );

    const latestSymptom = symptomsHistory[0];

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading your health dashboard...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Health Dashboard</h1>
                    <p className="text-gray-500 font-medium italic">Empowering your PCOS journey with data</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/symptoms">
                        <Button className="bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200">
                            <Activity className="h-4 w-4 mr-2" />
                            Log Symptoms
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Readiness Highlight */}
            <Card className="bg-gradient-to-br from-primary-900 to-indigo-900 text-white border-none shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Zap className="h-32 w-32" />
                </div>
                <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative h-32 w-32 shrink-0">
                        <svg className="h-full w-full" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/10" strokeWidth="3" />
                            <circle
                                cx="18" cy="18" r="16" fill="none"
                                className="stroke-primary-400 transition-all duration-1000"
                                strokeWidth="3"
                                strokeDasharray={`${readinessScore}, 100`}
                                strokeLinecap="round"
                                transform="rotate(-90 18 18)"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-3xl font-black">{readinessScore}</span>
                            <span className="text-[10px] uppercase font-bold tracking-tighter">Readiness</span>
                        </div>
                    </div>
                    <div className="space-y-3 text-center md:text-left">
                        <h2 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                            Daily Health Readiness
                            {readinessScore >= 80 && <TrendingUp className="h-6 w-6 text-green-400" />}
                        </h2>
                        <p className="text-primary-100 text-lg leading-relaxed max-w-xl">
                            {readinessFeedback}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs uppercase font-black text-gray-400 tracking-widest">Cycle Status</CardTitle>
                        <Calendar className="h-4 w-4 text-primary-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-primary-600">Day {dayOfCycle || '--'}</div>
                        <p className="text-sm font-bold text-gray-700 mt-1 capitalize">{currentPhase || 'No data'} Phase</p>
                        <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-500 font-medium">
                            Next period in <span className="text-gray-900 font-bold">{daysUntilNext || '--'} days</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs uppercase font-black text-gray-400 tracking-widest">Last Symptom</CardTitle>
                        <Activity className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-gray-900 truncate">
                            {latestSymptom ? Object.keys(latestSymptom.severity)[0] : 'None Logged'}
                        </div>
                        <p className="text-sm text-gray-500 mt-1 italic">
                            {latestSymptom ? `Logged ${format(parseISO(latestSymptom.date), 'MMM d')}` : 'Start tracking today'}
                        </p>
                        <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400 font-bold flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Status: <span className="text-gray-900 capitalize">{riskAnalysis.level}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs uppercase font-black text-gray-400 tracking-widest">Nutrition Focus</CardTitle>
                        <Utensils className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-gray-900">{riskAnalysis.dominantType}</div>
                        <p className="text-sm text-gray-500 mt-1">Recommended diet type</p>
                        <Link to="/nutrition" className="mt-4 block pt-4 border-t border-gray-50 text-xs text-primary-600 font-bold hover:underline">
                            View meal plan →
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Link to="/insights" className="block p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Zap className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 text-lg">AI Performance Analysis</h4>
                            <p className="text-gray-500 text-sm">Deep dive into your Rotterdam criteria alignment.</p>
                        </div>
                    </div>
                </Link>
                <Link to="/cycle" className="block p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 text-lg">Cycle History Sync</h4>
                            <p className="text-gray-500 text-sm">Review variability and regularity trends.</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};
