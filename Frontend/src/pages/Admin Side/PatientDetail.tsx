import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import {
    ChevronLeft,
    UserCircle,
    Activity,
    Calendar,
    Dumbbell,
    Circle,
    Mail,
    Phone,
    TrendingUp,
    MoveVertical,
    Weight

} from 'lucide-react';
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
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PatientProfile {
    user: {
        name: string;
        email: string;
        createdAt: string;
        role: string;
        weight?: number;
        height?: number;
    };
    history: {
        symptoms: any[];
        cycles: any[];
        workouts: any[];
    };
}

export const PatientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<PatientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/admin/patient/${id}`);
                setProfile(res.data);
            } catch (error) {
                console.error('Error fetching patient profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    const handleDownloadPdf = async () => {
        const element = document.getElementById('patient-report-content');
        if (!element) return;

        setIsGeneratingPdf(true);
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = pdfHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();

            while (heightLeft >= 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }

            pdf.save(`${profile?.user.name.replace(/\s+/g, '_')}_Clinical_Report.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400 italic font-display">Parsing patient journey history...</div>;
    if (!profile) return <div className="p-8 text-center">Patient not found.</div>;

    const symptomTrend = [...profile.history.symptoms].reverse().map(s => {
        const avg = Object.values(s.severity).reduce((a: any, b: any) => a + b, 0) as number / Object.values(s.severity).length;
        return {
            date: format(new Date(s.date), 'MMM dd'),
            severity: parseFloat(avg.toFixed(1))
        };
    }).slice(-7);

    return (
        <div id="patient-report-content" className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 font-sans pb-12 px-4 bg-white min-h-screen">
            <div data-html2canvas-ignore className="flex items-center justify-between">
                <Button variant="ghost" className="font-black text-xs uppercase p-0 h-auto hover:bg-transparent text-gray-400 hover:text-gray-900" onClick={() => navigate('/admin')}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back to Registry
                </Button>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5">
                    <Circle className="h-2 w-2 fill-current animate-pulse" /> Active Session
                </div>
            </div>

            {/* Header / Demographic */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="h-24 w-24 rounded-3xl bg-gray-100 flex items-center justify-center text-gray-300 shadow-inner">
                    <UserCircle className="h-16 w-16" />
                </div>
                <div className="space-y-4 flex-1">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight font-display">{profile.user.name}</h1>
                        <p className="text-primary-600 font-bold uppercase text-[10px] tracking-widest mt-1 italic">Patient ID: {id?.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-bold text-gray-700">{profile.user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-bold text-gray-700">Joined {new Date(profile.user.createdAt).toLocaleDateString()}</span>
                        </div>

                    </div>
                    <div>
                        {profile.user.weight && (
                            <div className="flex items-center gap-2">
                                <Weight className="h-4 w-4 text-blue-400" />
                                <span className="text-sm font-bold text-gray-700">{profile.user.weight} kg</span>
                            </div>
                        )}
                        {profile.user.height && (
                            <div className="flex items-center gap-2">
                                <MoveVertical className="h-4 w-4 text-emerald-400" />
                                <span className="text-sm font-bold text-gray-700">{profile.user.height} cm</span>
                            </div>
                        )}
                    </div>
                </div>
                <div data-html2canvas-ignore className="flex gap-2">
                    <Button variant="outline" className="border-2 font-black italic shadow-lg shadow-gray-100">Contact Patient</Button>
                    <Button
                        onClick={handleDownloadPdf}
                        disabled={isGeneratingPdf}
                        className="bg-gray-900 hover:bg-black font-black italic shadow-xl">
                        {isGeneratingPdf ? 'Generating PDF...' : 'Generate Clinical Report'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Symptom Mastery Chart */}
                <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader className="bg-white border-b border-gray-50 p-6">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-rose-500" /> Severity Index (Recent Logs)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={symptomTrend}>
                                <defs>
                                    <linearGradient id="colorSev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 5]} fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="severity" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorSev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Engagement Summary */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-indigo-900 text-white overflow-hidden">
                        <CardHeader className="p-6 pb-0">
                            <CardTitle className="text-[10px] font-black uppercase text-indigo-300 tracking-widest">Protocol Adherence</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-2">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-3xl font-black">{profile.history.workouts.length}</p>
                                    <p className="text-xs text-indigo-200 uppercase tracking-tighter italic">Workouts Logged</p>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <Dumbbell className="h-6 w-6 text-indigo-100" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-emerald-900 text-white overflow-hidden">
                        <CardHeader className="p-6 pb-0">
                            <CardTitle className="text-[10px] font-black uppercase text-emerald-300 tracking-widest">Cycle Consistency</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-2">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-3xl font-black">{profile.history.cycles.length}</p>
                                    <p className="text-xs text-emerald-200 uppercase tracking-tighter italic">Cycles Observed</p>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <Activity className="h-6 w-6 text-emerald-100" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Clinical Logs */}
                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-white border-b border-gray-50 p-6">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">Recent Symptom Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-50">
                            {profile.history.symptoms.slice(0, 5).map((log, i) => (
                                <div key={i} className="p-4 px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                        <div>
                                            <p className="text-xs font-black text-gray-900 italic">{format(new Date(log.date), 'MMM dd, yyyy')}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-0.5">
                                                {Object.keys(log.severity).length} Markers Tracked
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {Object.entries(log.severity).slice(0, 3).map(([sym, sev]: any, j) => (
                                            <span key={j} className="px-2 py-0.5 bg-gray-100 rounded text-[9px] font-black text-gray-400 uppercase">
                                                {sym}: {sev}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Workout History */}
                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-white border-b border-gray-50 p-6">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">Physical Training History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-50">
                            {profile.history.workouts.slice(0, 5).map((w, i) => (
                                <div key={i} className="p-4 px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                            <Dumbbell className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-900 italic">{w.type}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-0.5">
                                                {w.duration} • {w.intensity} Intensity
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                                        {format(new Date(w.date), 'MMM dd')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
