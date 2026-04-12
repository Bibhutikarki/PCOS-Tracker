import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import {
    Users,
    Activity,
    Calendar,
    TrendingUp,
    Download,
    Search,
    UserCircle,
    Mail,
    ShieldCheck
} from 'lucide-react';
import {
    BarChart,
    Bar,
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

interface Stats {
    totalUsers: number;
    totalSymptoms: number;
    totalCycles: number;
}

interface Trend {
    date: string;
    users: number;
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
    const [trend, setTrend] = useState<Trend[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    if (loading) {
        return <div className="p-8 text-center text-gray-500 font-display">Loading Administrative Intelligence...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight font-display">System Administration</h1>
                    <p className="text-primary-600 font-bold uppercase text-[10px] tracking-widest mt-1">Platform-Wide Intelligence & Governance</p>
                </div>
                <Button className="bg-gray-900 hover:bg-black shadow-xl">
                    <Download className="h-4 w-4 mr-2" /> Export Platform Data
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Patients', value: stats?.totalUsers, icon: <Users className="h-6 w-6" />, color: 'bg-indigo-500' },
                    { label: 'Symptom Logs', value: stats?.totalSymptoms, icon: <Activity className="h-6 w-6" />, color: 'bg-rose-500' },
                    { label: 'Cycles Tracked', value: stats?.totalCycles, icon: <Calendar className="h-6 w-6" />, color: 'bg-emerald-500' },
                ].map((s, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`${s.color} p-3 rounded-2xl text-white shadow-lg shadow-${s.color.split('-')[1]}-100`}>
                                {s.icon}
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">{s.label}</p>
                                <p className="text-3xl font-black text-gray-900">{s.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Trend */}
                <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-white border-b border-gray-50 p-6">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-indigo-500" /> User Acquisition (Last 7 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trend}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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

                {/* System Roles Distribution */}
                <Card className="border-none shadow-sm flex flex-col justify-center bg-indigo-900 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <ShieldCheck className="h-32 w-32" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-xs font-black text-indigo-300 uppercase tracking-widest">Access Control</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                        <div>
                            <h4 className="text-3xl font-black">Strict Governance</h4>
                            <p className="text-indigo-200 text-sm mt-2 opacity-80">Managing platform roles and security protocols for clinical data protection.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                <p className="text-[10px] font-black uppercase text-indigo-200">Admins</p>
                                <p className="text-2xl font-black">{users.filter(u => u.role === 'admin').length}</p>
                            </div>
                            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                <p className="text-[10px] font-black uppercase text-indigo-200">Patients</p>
                                <p className="text-2xl font-black">{users.filter(u => u.role === 'user').length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* User Management Table */}
            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-50 p-6 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">Member Registry</CardTitle>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredUsers.map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <UserCircle className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{user.name}</p>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                                        <Mail className="h-3 w-3" /> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button variant="ghost" size="sm" className="text-xs font-bold text-gray-400 hover:text-primary-600">
                                                Inspect Profile
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="p-12 text-center text-gray-500 italic text-sm">No members matching your search.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
