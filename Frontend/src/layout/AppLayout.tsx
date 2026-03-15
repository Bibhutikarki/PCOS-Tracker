import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Activity,
    Utensils,
    Dumbbell,
    Brain,
    BarChart3,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { authStore } from '../lib/auth';

const SidebarNavItem = ({
    to,
    icon: Icon,
    label,
    active
}: {
    to: string;
    icon: React.ElementType;
    label: string;
    active: boolean;
}) => {
    return (
        <Link
            to={to}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                active
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
        >
            <Icon className={cn("w-5 h-5", active ? "text-primary-600" : "text-gray-400")} />
            {label}
        </Link>
    );
};

export const AppLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const handleLogout = () => {
        authStore.logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'User Dashboard' },
        { to: '/cycle', icon: Calendar, label: 'Menstrual Cycle' },
        { to: '/symptoms', icon: Activity, label: 'Symptom Tracker' },
        { to: '/nutrition', icon: Utensils, label: 'Nutrition Planner' },
        { to: '/workouts', icon: Dumbbell, label: 'Workout Planner' },
        { to: '/insights', icon: Brain, label: 'AI Insights' },
        { to: '/analytics', icon: BarChart3, label: 'Analytics & Reports' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary-600">
                        <Activity className="w-6 h-6" />
                        <span>PCOS Tracker</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <SidebarNavItem
                            key={item.to}
                            to={item.to}
                            icon={item.icon}
                            label={item.label}
                            active={location.pathname === item.to}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                        <LogOut className="w-5 h-5 text-gray-400" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                            U
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
