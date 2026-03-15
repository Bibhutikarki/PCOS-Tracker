import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText } from 'lucide-react';

const CYCLE_DATA = [
    { name: 'Jan', length: 28 },
    { name: 'Feb', length: 29 },
    { name: 'Mar', length: 27 },
    { name: 'Apr', length: 32 },
    { name: 'May', length: 28 },
    { name: 'Jun', length: 30 },
];

const SYMPTOMS_DATA = [
    { name: 'Week 1', pain: 2, mood: 1 },
    { name: 'Week 2', pain: 3, mood: 3 },
    { name: 'Week 3', pain: 1, mood: 2 },
    { name: 'Week 4', pain: 4, mood: 4 },
];

const LIFESTYLE_DATA = [
    { name: 'Consistency', value: 75 },
    { name: 'Missed', value: 25 },
];

const COLORS = ['#ec4899', '#f3f4f6'];

export const Analytics = () => {
    const handleDownload = () => {
        // Mock download
        alert("Downloading report...");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownload}>
                        <FileText className="h-4 w-4 mr-2" />
                        View All
                    </Button>
                    <Button onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Report (CSV)
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Cycle Regularity</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={CYCLE_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="length" fill="#ec4899" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Symptom Trends</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={SYMPTOMS_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="pain" stroke="#ec4899" strokeWidth={2} />
                                <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lifestyle Consistency</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={LIFESTYLE_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {LIFESTYLE_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="text-center text-sm text-gray-500 mt-2">
                            75% Adherence to Planned Diet & Workouts
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Key Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-3 text-sm bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Avg Cycle Length</span>
                            <span className="font-bold text-gray-900">29 Days</span>
                        </div>
                        <div className="flex justify-between items-center p-3 text-sm bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Most Logged Symptom</span>
                            <span className="font-bold text-gray-900">Fatigue (12 times)</span>
                        </div>
                        <div className="flex justify-between items-center p-3 text-sm bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Workout Completion</span>
                            <span className="font-bold text-green-600">85%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 text-sm bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Top Nutrient Focus</span>
                            <span className="font-bold text-blue-600">Protein</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
