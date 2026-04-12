import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { useHealthData } from '../../hooks/useHealthData';
import { useRiskAnalysis } from '../../hooks/useRiskAnalysis';
import { format, parseISO, subDays, startOfMonth, endOfMonth, eachDayOfInterval, differenceInDays } from 'date-fns';
import { Download, FileText, ClipboardCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Analytics = () => {
    const { symptomsHistory, cycleHistory, profile, loading } = useHealthData();
    const riskAnalysis = useRiskAnalysis(symptomsHistory, profile);

    // 1. Symptom Severity Trend (Last 30 Days)
    const trendData = useMemo(() => {
        const last30Days = eachDayOfInterval({
            start: subDays(new Date(), 29),
            end: new Date()
        });

        return last30Days.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const logs = symptomsHistory.filter(s => s.date.startsWith(dateStr));

            let avgSeverity = 0;
            if (logs.length > 0) {
                const total = logs.reduce((acc, log) =>
                    acc + Object.values(log.severity).reduce((s, v) => s + v, 0), 0
                );
                const count = logs.reduce((acc, log) => acc + Object.values(log.severity).length, 0);
                avgSeverity = total / count;
            }

            return {
                name: format(date, 'MMM d'),
                severity: parseFloat(avgSeverity.toFixed(1))
            };
        });
    }, [symptomsHistory]);

    // 2. Symptom Distribution (Severity-Weighted)
    const distributionData = useMemo(() => {
        const severities: Record<string, number> = {};
        symptomsHistory.forEach(log => {
            Object.entries(log.severity).forEach(([sym, sev]) => {
                severities[sym] = (severities[sym] || 0) + sev;
            });
        });

        return Object.entries(severities)
            .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(1)) }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [symptomsHistory]);

    // 3. Cycle Consistency
    const cycleData = useMemo(() => {
        return cycleHistory.map((c, i) => ({
            index: i + 1,
            length: c.length ?? differenceInDays(parseISO(c.endDate), parseISO(c.startDate)) + 1
        })).reverse();
    }, [cycleHistory]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Generating your clinical analytics...</div>;
    }

    const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analytics & Reports</h1>
                    <p className="text-gray-500 font-medium">Visualizing your health patterns over time</p>
                </div>
                <Button className="bg-primary-600 hover:bg-primary-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export Doctor's Report (PDF)
                </Button>
            </div>

            {/* Doctor's Summary Mini-Card */}
            <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="bg-amber-100 p-4 rounded-full text-amber-600">
                        <ClipboardCheck className="h-8 w-8" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                            Clinical Snapshot
                            <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded-full uppercase tracking-tighter text-amber-800">Verified Rotterdam Alignment</span>
                        </h3>
                        <p className="text-amber-800 text-sm leading-relaxed">
                            Your data suggests a {riskAnalysis.level} profile. We've detected {riskAnalysis.diagnosticBreakdown?.criteriaMet.length} major markers for PCOS.
                            This report is ready for clinical review to assist your healthcare provider in official diagnosis.
                        </p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="text-4xl font-black text-amber-900">{riskAnalysis.score}%</div>
                        <div className="text-[10px] font-black text-amber-600 uppercase">Risk Index</div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Symptom Intensity Over Time */}
                <Card className="shadow-sm border-gray-100">
                    <CardHeader>
                        <CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-indigo-500" /> Average Symptom Intensity (30d)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorSev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 5]} fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="severity" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Symptom Frequency */}
                <Card className="shadow-sm border-gray-100">
                    <CardHeader>
                        <CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-rose-500" /> Top Reported Symptoms
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distributionData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" fontSize={10} width={80} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Cycle Variability */}
                <Card className="shadow-sm border-gray-100">
                    <CardHeader>
                        <CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FileText className="h-4 w-4 text-emerald-500" /> Cycle Length History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={cycleData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="index" label={{ value: 'Cycle #', position: 'insideBottom', offset: -5 }} fontSize={10} />
                                <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} fontSize={10} />
                                <Tooltip />
                                <Line type="step" dataKey="length" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                                <Legend />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Profile Breakdown */}
                <Card className="shadow-sm border-gray-100 bg-gray-50/50">
                    <CardHeader>
                        <CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest">Diagnostic Detail</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-white rounded-xl border border-gray-100">
                            <h4 className="text-xs font-black text-gray-400 uppercase mb-2">Primary Diagnosis Markers</h4>
                            <div className="space-y-2">
                                {riskAnalysis.diagnosticBreakdown?.criteriaMet.map((c, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-primary-50 rounded-lg">
                                        <span className="text-xs font-bold text-primary-700">{c}</span>
                                        <span className="text-[10px] font-black text-primary-400 uppercase">Marker Found</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-gray-100">
                            <h4 className="text-xs font-black text-gray-400 uppercase mb-2">Dominant Syndrome Cluster</h4>
                            <div className="flex items-center gap-4">
                                <div className="text-2xl font-black text-gray-900">{riskAnalysis.dominantType}</div>
                                <div className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-tighter">PCOS Type</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
