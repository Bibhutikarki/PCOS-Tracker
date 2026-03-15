import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Calendar, Activity, Utensils, Dumbbell } from 'lucide-react';

export const Dashboard = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
                <div className="text-sm text-gray-500">Welcome back, Jane</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Cycle Status</CardTitle>
                        <Calendar className="h-4 w-4 text-primary-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary-600">Day 14</div>
                        <p className="text-xs text-gray-500">Ovulation likely today</p>
                        <div className="mt-4 text-xs text-gray-600">
                            Next period in 14 days
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Last Symptom</CardTitle>
                        <Activity className="h-4 w-4 text-primary-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">Mild Pain</div>
                        <p className="text-xs text-gray-500">Logged yesterday</p>
                        <div className="mt-4 text-xs text-gray-600">
                            Most common: Fatigue
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Nutrition</CardTitle>
                        <Utensils className="h-4 w-4 text-primary-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">High Fiber</div>
                        <p className="text-xs text-gray-500">Today's focus</p>
                        <div className="mt-4 text-xs text-gray-600">
                            3 meals planned
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Workout</CardTitle>
                        <Dumbbell className="h-4 w-4 text-primary-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">Yoga Flow</div>
                        <p className="text-xs text-gray-500">Recommended today</p>
                        <div className="mt-4 text-xs text-gray-600">
                            Next: HIIT (Tomorrow)
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-wrap gap-4">
                <Link to="/symptoms">
                    <Button>Log Symptoms</Button>
                </Link>
                <Link to="/cycle">
                    <Button variant="outline">Track Cycle</Button>
                </Link>
                <Link to="/insights">
                    <Button variant="secondary">View Insights</Button>
                </Link>
            </div>
        </div>
    );
};
