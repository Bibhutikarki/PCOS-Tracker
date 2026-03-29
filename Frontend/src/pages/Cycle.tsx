import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    parseISO,
    differenceInDays
} from 'date-fns';
import { cn } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../lib/api';

interface CycleEntry {
    _id: string;
    startDate: string;
    endDate: string;
}

const cycleSchema = z.object({
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
});

type CycleFormData = z.infer<typeof cycleSchema>;

export const Cycle = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [history, setHistory] = useState<CycleEntry[]>([]);
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<CycleFormData>({
        resolver: zodResolver(cycleSchema),
    });

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await api.get('/cycle');
            setHistory(response.data);
        } catch (error) {
            console.error('Error fetching cycle history:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const onSubmit = async (data: CycleFormData) => {
        try {
            if (selectedEntryId) {
                // Update
                await api.put(`/cycle/${selectedEntryId}`, data);
            } else {
                // Create
                await api.post('/cycle', data);
            }
            await fetchHistory();
            setSelectedEntryId(null);
            reset({ startDate: '', endDate: '' });
        } catch (error: any) {
            console.error('Error saving cycle:', error);
            alert(error.response?.data?.message || 'Failed to save cycle entry.');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            try {
                await api.delete(`/cycle/${id}`);
                await fetchHistory();
                if (selectedEntryId === id) {
                    setSelectedEntryId(null);
                    reset({ startDate: '', endDate: '' });
                }
            } catch (error: any) {
                console.error('Error deleting cycle:', error);
                alert(error.response?.data?.message || 'Failed to delete cycle entry.');
            }
        }
    };

    const handleEdit = (entry: CycleEntry) => {
        setSelectedEntryId(entry._id);
        setValue('startDate', entry.startDate);
        setValue('endDate', entry.endDate);
    };

    // Calendar Helpers
    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    const getDayStatus = (date: Date) => {
        // Simple check if date falls within any cycle range
        const inCycle = history.some(range => {
            const start = parseISO(range.startDate);
            const end = parseISO(range.endDate);
            return date >= start && date <= end;
        });
        return inCycle ? 'cycle' : 'none';
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Menstrual Cycle Tracker</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Panel */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Calendar View</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="font-medium">{format(currentMonth, 'MMMM yyyy')}</span>
                            <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="font-medium text-gray-500 py-1">{day}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {/* Padding for start of month */}
                            {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                                <div key={`pad-${i}`} />
                            ))}

                            {days.map(day => {
                                const status = getDayStatus(day);
                                const isToday = isSameDay(day, new Date());

                                return (
                                    <div
                                        key={day.toISOString()}
                                        className={cn(
                                            "h-14 rounded-lg flex items-center justify-center text-sm transition-colors border border-transparent",
                                            status === 'cycle' && "bg-primary-100 text-primary-700 font-bold border-primary-200",
                                            status === 'none' && "hover:bg-gray-50",
                                            isToday && "ring-2 ring-primary-500"
                                        )}
                                    >
                                        {format(day, 'd')}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Right Panel */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cycle Dates</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <Input
                                    label="Start Date"
                                    type="date"
                                    {...register('startDate')}
                                    error={errors.startDate?.message}
                                />
                                <Input
                                    label="End Date"
                                    type="date"
                                    {...register('endDate')}
                                    error={errors.endDate?.message}
                                />
                                <div className="flex gap-2">
                                    <Button type="submit" className="w-full">
                                        {selectedEntryId ? 'Update' : 'Save'}
                                    </Button>
                                    {selectedEntryId && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedEntryId(null);
                                                reset({ startDate: '', endDate: '' });
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cycle History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {loading ? (
                                    <p className="text-sm text-gray-500">Loading history...</p>
                                ) : history.length === 0 ? (
                                    <p className="text-sm text-gray-500">No history logged.</p>
                                ) : (
                                    history.map(entry => {
                                        const daysCount = differenceInDays(parseISO(entry.endDate), parseISO(entry.startDate)) + 1;
                                        return (
                                            <div
                                                key={entry._id}
                                                onClick={() => handleEdit(entry)}
                                                className={cn(
                                                    "flex items-center justify-between p-3 rounded-lg border text-sm cursor-pointer hover:bg-gray-50",
                                                    selectedEntryId === entry._id ? "border-primary-500 bg-primary-50" : "border-gray-100"
                                                )}
                                            >
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {format(parseISO(entry.startDate), 'MMM d, yyyy')} - {format(parseISO(entry.endDate), 'MMM d, yyyy')}
                                                    </div>
                                                    <div className="text-gray-500">{daysCount} days</div>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(entry._id); }}
                                                    className="text-gray-400 hover:text-red-500 p-1"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

