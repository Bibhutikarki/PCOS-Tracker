import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
    Plus, 
    Search, 
    Dumbbell, 
    Clock, 
    Zap, 
    Trash2, 
    Edit3,
    Check
} from 'lucide-react';
import api from '../../lib/api';
import { Modal } from '../../components/ui/Modal';

interface GlobalWorkout {
    _id: string;
    title: string;
    description: string;
    duration: string;
    intensity: 'Low' | 'Medium' | 'High';
    category: string;
    phases: string[];
}

export const WorkoutManagement = () => {
    const [workouts, setWorkouts] = useState<GlobalWorkout[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWorkout, setEditingWorkout] = useState<GlobalWorkout | null>(null);
    const [formData, setFormData] = useState<Partial<GlobalWorkout>>({
        title: '',
        description: '',
        duration: '',
        intensity: 'Medium',
        category: '',
        phases: []
    });

    useEffect(() => {
        fetchWorkouts();
    }, []);

    const fetchWorkouts = async () => {
        try {
            const res = await api.get('/admin/workouts');
            setWorkouts(res.data);
        } catch (error) {
            console.error('Error fetching workouts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingWorkout) {
                await api.put(`/admin/workouts/${editingWorkout._id}`, formData);
            } else {
                await api.post('/admin/workouts', formData);
            }
            fetchWorkouts();
            closeModal();
        } catch (error) {
            console.error('Error saving workout:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this workout from the library?')) return;
        try {
            await api.delete(`/admin/workouts/${id}`);
            fetchWorkouts();
        } catch (error) {
            console.error('Error deleting workout:', error);
        }
    };

    const openModal = (workout?: GlobalWorkout) => {
        if (workout) {
            setEditingWorkout(workout);
            setFormData(workout);
        } else {
            setEditingWorkout(null);
            setFormData({
                title: '',
                description: '',
                duration: '',
                intensity: 'Medium',
                category: '',
                phases: []
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingWorkout(null);
    };

    const togglePhase = (phase: string) => {
        const currentPhases = formData.phases || [];
        if (currentPhases.includes(phase)) {
            setFormData({ ...formData, phases: currentPhases.filter(p => p !== phase) });
        } else {
            setFormData({ ...formData, phases: [...currentPhases, phase] });
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400 italic font-display">Accessing library records...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight font-display italic">Protocol Library</h1>
                    <p className="text-primary-600 font-bold uppercase text-[10px] tracking-widest mt-1">Global Workout Management</p>
                </div>
                <Button onClick={() => openModal()} className="bg-gray-900 hover:bg-black shadow-xl">
                    <Plus className="h-4 w-4 mr-2" /> Add New Protocol
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workouts.length === 0 ? (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300">
                             <Dumbbell className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900 tracking-tight italic">No protocols found in the library.</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Initialize your first protocol to begin patient guidance.</p>
                        </div>
                        <Button onClick={() => openModal()} variant="outline" className="border-2 font-black italic text-xs">
                             Start Protocol Blueprint
                        </Button>
                    </div>
                ) : (
                    workouts.map(workout => (
                        <Card key={workout._id} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all">
                            <CardHeader className="bg-gray-50 flex flex-row items-center justify-between p-4 px-6">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2 py-1 bg-white rounded-lg border border-gray-100">
                                    {workout.category}
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal(workout)} className="p-1.5 hover:bg-white rounded-lg transition-colors text-indigo-600">
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleDelete(workout._id)} className="p-1.5 hover:bg-white rounded-lg transition-colors text-rose-600">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 line-clamp-1">{workout.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 italic leading-relaxed">{workout.description}</p>
                                </div>
                                
                                <div className="flex items-center gap-4 py-2 border-y border-gray-50">
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        <span className="text-[10px] font-black uppercase">{workout.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                        <Zap className="h-3 w-3" />
                                        <span className="text-[10px] font-black uppercase">{workout.intensity}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {workout.phases.map((p, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-[9px] font-black uppercase tracking-tighter">
                                            {p} Phase
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingWorkout ? "Refine Protocol" : "Initialize New Protocol"}>
                <form onSubmit={handleSubmit} className="space-y-6 font-sans">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 block italic">Workout Title</label>
                            <input 
                                required
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="E.g., Hormonal Balancer Yoga"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 block italic">Category</label>
                                <select 
                                    required
                                    value={formData.category}
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
                                >
                                    <option value="" disabled>Select Category</option>
                                    <option value="Yoga">Yoga</option>
                                    <option value="HIIT">HIIT</option>
                                    <option value="Strength">Strength</option>
                                    <option value="Pilates">Pilates</option>
                                    <option value="Walking">Walking</option>
                                    <option value="Cardio">Cardio</option>
                                    <option value="Meditation">Meditation</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 block italic">Duration</label>
                                <input 
                                    required
                                    value={formData.duration}
                                    onChange={e => setFormData({...formData, duration: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="E.g., 30 min"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 block italic">Target Phases</label>
                            <div className="flex flex-wrap gap-2">
                                {['Menstrual', 'Follicular', 'Ovulation', 'Luteal'].map(phase => (
                                    <button
                                        key={phase}
                                        type="button"
                                        onClick={() => togglePhase(phase)}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
                                            formData.phases?.includes(phase)
                                                ? 'bg-primary-600 border-primary-600 text-white'
                                                : 'bg-white border-gray-100 text-gray-400 hover:border-primary-100'
                                        }`}
                                    >
                                        {phase}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 block italic">Intensity</label>
                            <div className="flex gap-2">
                                {['Low', 'Medium', 'High'].map(lvl => (
                                    <button
                                        key={lvl}
                                        type="button"
                                        onClick={() => setFormData({...formData, intensity: lvl as any})}
                                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
                                            formData.intensity === lvl
                                                ? 'bg-gray-900 border-gray-900 text-white'
                                                : 'bg-white border-gray-100 text-gray-400 hover:border-gray-900'
                                        }`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 block italic">Clinical Description</label>
                            <textarea 
                                required
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none h-24 resize-none"
                                placeholder="Technical instructions or sequence breakdown..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={closeModal} className="flex-1 font-black">Abort</Button>
                        <Button type="submit" className="flex-1 bg-gray-900 hover:bg-black font-black italic">Save Protocol</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
