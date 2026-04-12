import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { 
    Users, 
    Activity, 
    Calendar, 
    TrendingUp, 
    Search,
    UserCircle,
    Mail,
    AlertCircle,
    ChevronRight,
    Dumbbell
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface Stats {
    totalUsers: number;
    totalSymptoms: number;
    totalCycles: number;
    totalWorkouts: number;
}

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export const AdminDashboard = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [trend, setTrend] = useState([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, usersRes] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/admin/users')
                ]);
                setStats(statsRes.data.stats);
                setTrend(statsRes.data.registrationTrend);
                setUsers(usersRes.data);
            } catch (error) {
                console.error('Error fetching admin data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center font-display text-gray-400 italic">Syncing clinical data...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight font-display italic">Clinical Overview</h1>
                    <p className="text-primary-600 font-bold uppercase text-[10px] tracking-widest mt-1">Patient Registry & Platform Governance</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => navigate('/admin/workouts')} variant="outline" className="border-2 font-bold">
                        <Dumbbell className="h-4 w-4 mr-2" /> Content Library
                    </Button>
                </div>
            </div>

            {/* Platform Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Patients', value: stats?.totalUsers, icon: <Users />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Symptom Logs', value: stats?.totalSymptoms, icon: <Activity />, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Cycles Tracked', value: stats?.totalCycles, icon: <Calendar />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Workout Library', value: stats?.totalWorkouts, icon: <Dumbbell />, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((s, i) => (
                    <Card key={i} className="border-none shadow-sm overflow-hidden group">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`${s.bg} ${s.color} p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300`}>
                                {s.icon}
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">{s.label}</p>
                                <p className="text-2xl font-black text-gray-900">{s.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Trend */}
                <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader className="bg-white border-b border-gray-50 p-6 flex items-center justify-between">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-indigo-500" /> Patient Acquisition (Last 7 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trend}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* System Alerts / High Risk Patients Placeholder */}
                <Card className="border-none shadow-sm bg-gray-900 text-white">
                    <CardHeader>
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                             <AlertCircle className="h-4 w-4 text-rose-500" /> Critical Observations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <h4 className="font-bold text-sm">System Integrity</h4>
                            <p className="text-xs text-gray-400 mt-1 italic">All platform services are monitoring patient data logs in real-time. No unauthorized access attempts detected.</p>
                        </div>
                        <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                             <h4 className="font-bold text-sm text-rose-100 flex items-center gap-2">
                                 <Activity className="h-3 w-3" /> Potential Flags
                             </h4>
                             <p className="text-xs text-rose-200/70 mt-1">High severity symptoms reported by 3 users in the last 24h. Manual review recommended.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Patient Registry */}
            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-50 p-6 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Patients</CardTitle>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search patients..." 
                            className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Patient Identity</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Registry Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredUsers.map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-black">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 group-hover:text-primary-600 transition-colors">{user.name}</p>
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                        <Mail className="h-2 w-2" /> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                                user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 font-medium font-sans">
                                            {new Date(user.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="hover:bg-primary-50 text-primary-600 font-black italic text-xs"
                                                onClick={() => navigate(`/admin/patient/${user._id}`)}
                                            >
                                                Analyze Progress <ChevronRight className="h-3 w-3 ml-1" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
