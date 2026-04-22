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
    X,
    Lock,
    ChevronLeft
} from 'lucide-react';
import { cn } from '../lib/utils';
import { authStore } from '../lib/auth';
import { useWorkoutReminder } from '../hooks/useWorkoutReminder';
import api from '../lib/api';
import { Button } from '../components/ui/Button';

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
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const [isEditingProfile, setIsEditingProfile] = React.useState(false);
    const [isChangingPassword, setIsChangingPassword] = React.useState(false);
    
    // We may want to re-grab user from authStore each render if it updates
    const { user } = authStore.getAuth();
    const [editHeight, setEditHeight] = React.useState(user?.height?.toString() || '');
    const [editWeight, setEditWeight] = React.useState(user?.weight?.toString() || '');
    const [isSavingProfile, setIsSavingProfile] = React.useState(false);

    // Change-password form state
    const [cpCurrent, setCpCurrent] = React.useState('');
    const [cpNew, setCpNew] = React.useState('');
    const [cpConfirm, setCpConfirm] = React.useState('');
    const [cpLoading, setCpLoading] = React.useState(false);
    const [cpError, setCpError] = React.useState('');
    const [cpSuccess, setCpSuccess] = React.useState('');

    // Initialize the workout reminder hook globally
    useWorkoutReminder();

    const handleLogout = () => {
        authStore.logout();
        navigate('/login');
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSavingProfile(true);
        try {
            const userId = user._id || user.id;
            const res = await api.put(`/user/${userId}/settings`, {
                height: editHeight ? parseFloat(editHeight) : null,
                weight: editWeight ? parseFloat(editWeight) : null
            });
            const { token } = authStore.getAuth();
            authStore.login({
                ...res.data.user,
                id: res.data.user._id || res.data.user.id
            }, token);
            setIsEditingProfile(false);
        } catch (error) {
            console.error('Failed to save profile', error);
            alert('Failed to update profile');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleChangePassword = async () => {
        setCpError('');
        setCpSuccess('');

        if (!cpNew || !cpCurrent) {
            setCpError('Please fill in all fields.');
            return;
        }
        if (cpNew.length < 6) {
            setCpError('New password must be at least 6 characters.');
            return;
        }
        if (cpNew !== cpConfirm) {
            setCpError('New passwords do not match.');
            return;
        }

        setCpLoading(true);
        try {
            await api.put('/auth/change-password', {
                currentPassword: cpCurrent,
                newPassword: cpNew,
            });
            setCpSuccess('Password changed! Logging you out now...');
            // Invalidate session — force re-login
            setTimeout(() => {
                authStore.logout();
                navigate('/login');
            }, 1800);
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Failed to change password.';
            setCpError(msg);
        } finally {
            setCpLoading(false);
        }
    };

    const navItems = user?.role === 'admin' 
        ? [
            { to: '/admin', icon: LayoutDashboard, label: 'Clinical Overview' },
            { to: '/admin/workouts', icon: Dumbbell, label: 'Workout Library' },
          ]
        : [
            { to: '/dashboard', icon: LayoutDashboard, label: 'Home Dashboard' },
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
                        <div className="relative">
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium uppercase hover:ring-2 hover:ring-primary-300 transition-all"
                            >
                                {user?.name?.charAt(0) || 'U'}
                            </button>
                            
                            {isProfileOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-40"
                                        onClick={() => { setIsProfileOpen(false); setIsChangingPassword(false); setCpError(''); setCpSuccess(''); }}
                                    />
                                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        
                                        {/* ── Header ─────────────────────────── */}
                                        <div className="flex items-center gap-3 mb-4">
                                            {isChangingPassword && (
                                                <button
                                                    onClick={() => { setIsChangingPassword(false); setCpError(''); setCpSuccess(''); }}
                                                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                                >
                                                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                                                </button>
                                            )}
                                            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold uppercase text-xl">
                                                {user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="font-bold text-gray-900 truncate">{user?.name}</h4>
                                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                            </div>
                                        </div>

                                        {/* ── Change Password Panel ────────── */}
                                        {isChangingPassword ? (
                                            <div className="space-y-3 border-t border-gray-100 pt-3">
                                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Lock className="w-3.5 h-3.5" /> Change Password
                                                </p>

                                                {cpSuccess ? (
                                                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700 font-medium text-center">
                                                        {cpSuccess}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-500">Current Password</label>
                                                            <input
                                                                type="password"
                                                                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded outline-none focus:border-primary-500"
                                                                value={cpCurrent}
                                                                onChange={(e) => setCpCurrent(e.target.value)}
                                                                placeholder="Enter current password"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-500">New Password</label>
                                                            <input
                                                                type="password"
                                                                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded outline-none focus:border-primary-500"
                                                                value={cpNew}
                                                                onChange={(e) => setCpNew(e.target.value)}
                                                                placeholder="At least 6 characters"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-500">Confirm New Password</label>
                                                            <input
                                                                type="password"
                                                                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded outline-none focus:border-primary-500"
                                                                value={cpConfirm}
                                                                onChange={(e) => setCpConfirm(e.target.value)}
                                                                placeholder="Repeat new password"
                                                            />
                                                        </div>

                                                        {cpError && (
                                                            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1">{cpError}</p>
                                                        )}

                                                        <Button
                                                            size="sm"
                                                            className="w-full text-xs h-8 mt-1"
                                                            onClick={handleChangePassword}
                                                            disabled={cpLoading}
                                                        >
                                                            {cpLoading ? 'Updating...' : 'Update Password'}
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                        <>
                                        {!isEditingProfile ? (
                                            <div className="space-y-3 border-t border-gray-100 pt-3">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500">Account Type</span>
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                        user?.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                                                    )}>
                                                        {user?.role}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500">Height</span>
                                                    <span className="font-medium text-gray-900">{user?.height ? `${user.height} cm` : 'Not set'}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500">Weight</span>
                                                    <span className="font-medium text-gray-900">{user?.weight ? `${user.weight} kg` : 'Not set'}</span>
                                                </div>
                                                {user?.workoutReminderTime && (
                                                    <div className="flex justify-between items-center text-[11px] uppercase tracking-wider font-bold mt-2 pt-2 border-t border-gray-50">
                                                        <span className="text-gray-400">Reminder</span>
                                                        <span className={user?.workoutReminderEnabled ? "text-primary-600" : "text-gray-400"}>
                                                            {user.workoutReminderEnabled ? user.workoutReminderTime : 'Disabled'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="pt-2 space-y-2">
                                                    <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => setIsEditingProfile(true)}>
                                                        Edit Profile Details
                                                    </Button>
                                                    <button
                                                        className="w-full flex items-center justify-center gap-1.5 text-xs h-8 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium"
                                                        onClick={() => { setIsChangingPassword(true); setCpError(''); setCpSuccess(''); setCpCurrent(''); setCpNew(''); setCpConfirm(''); }}
                                                    >
                                                        <Lock className="w-3.5 h-3.5" /> Change Password
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 border-t border-gray-100 pt-3">
                                                <div className="space-y-1">
                                                    <label className="text-xs text-gray-500">Height (cm)</label>
                                                    <input 
                                                        type="number" 
                                                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:border-primary-500"
                                                        value={editHeight}
                                                        onChange={(e) => setEditHeight(e.target.value)}
                                                        placeholder="e.g. 165"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs text-gray-500">Weight (kg)</label>
                                                    <input 
                                                        type="number" 
                                                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:border-primary-500"
                                                        value={editWeight}
                                                        onChange={(e) => setEditWeight(e.target.value)}
                                                        placeholder="e.g. 60"
                                                    />
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                                                    <Button size="sm" className="flex-1 text-xs h-8" onClick={handleSaveProfile} disabled={isSavingProfile}>
                                                        {isSavingProfile ? 'Saving...' : 'Save'}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                        </>
                                        )}
                                    </div>
                                </>
                            )}
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
