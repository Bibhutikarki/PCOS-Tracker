import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Brain, AlertCircle, Lightbulb, TrendingUp, Activity, Info } from 'lucide-react';
import { useHealthData } from '../../hooks/useHealthData';
import { useInsights } from '../../hooks/useInsights';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { cn } from '../../lib/utils';
import { format, parseISO } from 'date-fns';

export const Insights = () => {
    const { symptomsHistory, cycleHistory, profile, loading } = useHealthData();
    const { alerts, recommendations, primaryInsight, riskAnalysis } = useInsights(symptomsHistory, cycleHistory, profile);

    // Prepare chart data
    const chartData = [...symptomsHistory]
        .slice(0, 10)
        .reverse()
        .map(entry => {
            const avgSev = Object.values(entry.severity).reduce((a, b) => a + b, 0) / (Object.keys(entry.severity).length || 1);
            return {
                date: format(parseISO(entry.date), 'MMM d'),
                severity: parseFloat(avgSev.toFixed(1))
            };
        });

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Analyzing your health data...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-100 rounded-2xl text-primary-600 shadow-sm border border-primary-200">
                    <Brain className="h-7 w-7" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI Health Insights</h1>
                    <p className="text-gray-500 font-medium">Personalized analysis based on your tracking patterns</p>
                </div>
            </div>

            {/* Risk & Primary Insight Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-gradient-to-br from-primary-50 to-white border-primary-100 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-primary-900 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary-600" />
                            Key Discovery
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-gray-800 leading-relaxed text-xl font-medium">
                            {primaryInsight}
                        </p>

                        {chartData.length > 0 && (
                            <div className="h-[250px] w-full mt-6 bg-white/40 p-2 rounded-xl border border-primary-100/50">
                                <ResponsiveContainer width="99%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorSev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#9ca3af"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                        />
                                        <YAxis domain={[0, 5]} hide />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ stroke: '#8b5cf6', strokeWidth: 2 }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="severity"
                                            stroke="#8b5cf6"
                                            fillOpacity={1}
                                            fill="url(#colorSev)"
                                            strokeWidth={4}
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                                <p className="text-[10px] text-center text-gray-400 mt-2 uppercase tracking-widest font-bold">Recent Symptom Severity Trend</p>
                            </div>
                        )}

                        <div className="p-5 bg-white/90 rounded-2xl border border-primary-200 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-2 text-primary-700 font-bold mb-2">
                                <Activity className="h-5 w-5" />
                                Predicted Health Profile:
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                                Your dominant pattern aligns with <span className="text-primary-600 font-extrabold">{riskAnalysis.dominantType} PCOS</span>.
                                We recommend prioritizing the nutrition and lifestyle habits specific to this profile for optimal results.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Risk Score Summary */}
                <Card className="bg-white border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className={cn("h-2 w-full",
                        riskAnalysis.level === 'High Risk' ? "bg-red-500" :
                            riskAnalysis.level === 'Moderate Risk' ? "bg-orange-500" : "bg-green-500"
                    )} />
                    <CardHeader className="pb-0">
                        <CardTitle className="text-xs uppercase tracking-widest text-gray-400 font-black">Risk Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col items-center justify-center space-y-8 py-10">
                        <div className="relative">
                            <div className="text-7xl font-black text-gray-900 tabular-nums">
                                {riskAnalysis.score}
                            </div>
                            <div className="absolute -right-6 bottom-2 text-xl text-gray-300 font-bold">
                                %
                            </div>
                        </div>

                        <div className="space-y-3 w-full text-center">
                            <div className={cn("px-6 py-2 rounded-full font-black text-sm shadow-sm inline-block tracking-wide uppercase",
                                riskAnalysis.level === 'High Risk' ? "bg-red-50 text-red-600 border border-red-100" :
                                    riskAnalysis.level === 'Moderate Risk' ? "bg-orange-50 text-orange-600 border border-orange-100" : "bg-green-50 text-green-600 border border-green-100"
                            )}>
                                {riskAnalysis.level}
                            </div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter">
                                Confidence: <span className="text-gray-600">{riskAnalysis.confidence}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Diagnostic Alignment & Consistency */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Rotterdam Alignment */}
                <Card className="lg:col-span-2 border-primary-100 bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-black text-primary-600 flex items-center gap-2 uppercase tracking-wide">
                            <Activity className="h-4 w-4" />
                            Clinical Alignment (Rotterdam Criteria)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {riskAnalysis.diagnosticBreakdown?.criteriaMet.length === 0 ? (
                                <span className="text-xs text-gray-400 italic">No major clinical markers detected yet.</span>
                            ) : (
                                riskAnalysis.diagnosticBreakdown?.criteriaMet.map((c, i) => (
                                    <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-black rounded-full border border-primary-100 uppercase">
                                        {c}
                                    </span>
                                ))
                            )}
                        </div>
                        <div className="space-y-2">
                            {riskAnalysis.diagnosticBreakdown?.reasons.map((r, i) => (
                                <div key={i} className="flex gap-3 text-sm text-gray-600 items-start">
                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                                    <p>{r}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Logging Consistency */}
                <Card className="border-gray-100 bg-gray-50/50">
                    <CardHeader className="pb-2 text-center">
                        <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">Data Consistency</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
                        <div className="relative h-24 w-24">
                            <svg className="h-full w-full" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-200" strokeWidth="3" />
                                <circle
                                    cx="18" cy="18" r="16" fill="none"
                                    className="stroke-primary-500 transition-all duration-1000"
                                    strokeWidth="3"
                                    strokeDasharray={`${riskAnalysis.diagnosticBreakdown?.consistencyScore}, 100`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 18 18)"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-xl font-black text-gray-900">{riskAnalysis.diagnosticBreakdown?.consistencyScore}%</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold text-center px-4 leading-tight">
                            Reliability factor based on your 14-day logging activity.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Alerts Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        Critical Alerts
                    </h2>
                    <div className="space-y-4">
                        {alerts.length === 0 ? (
                            <div className="p-6 text-center bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 italic">
                                No critical alerts at this time.
                            </div>
                        ) : (
                            alerts.map((alert, idx) => (
                                <Card key={idx} className={cn(
                                    "border-l-4 transition-all hover:translate-x-1 shadow-sm",
                                    alert.type === 'warning' ? "border-amber-500 bg-amber-50/30" : "border-blue-500 bg-blue-50/30"
                                )}>
                                    <CardContent className="p-4 flex gap-4">
                                        <div className={cn("p-2 rounded-full h-fit",
                                            alert.type === 'warning' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                                        )}>
                                            {alert.type === 'warning' ? <AlertCircle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{alert.title}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </section>

                {/* Recommendations Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-green-500" />
                        Targeted Advice
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                        {recommendations.map((rec, idx) => (
                            <div key={idx} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold text-sm group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    {idx + 1}
                                </div>
                                <p className="text-gray-700 font-medium pt-1">{rec}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Disclaimer */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-500 text-center shadow-inner">
                <span className="font-bold text-gray-600">Health Disclaimer:</span> AI Health Insights are generated based on mathematical data patterns
                and general wellness literature. These insights are not medical diagnoses or professional advice. Always consult with a qualified
                healthcare provider for medical decisions.
            </div>
        </div>
    );
};
