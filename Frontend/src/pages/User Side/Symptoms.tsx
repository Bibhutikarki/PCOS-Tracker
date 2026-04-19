import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Save, Activity, Settings2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../lib/api';
import { useRiskAnalysis } from '../../hooks/useRiskAnalysis';
import { SymptomEntry } from '../../lib/types';
import { Modal } from '../../components/ui/Modal';
import { authStore } from '../../lib/auth';

const SYMPTOMS_LIST = [
    'Pain', 'Mood', 'Acne', 'Fatigue', 'Bloating', 'Headache',
    'Irregular Periods', 'Weight Gain', 'Hair Loss', 'Facial Hair'
];

export const Symptoms = () => {
    const [selected, setSelected] = useState<string[]>([]);
    const [severity, setSeverity] = useState<Record<string, number>>({});
    const [notes, setNotes] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [history, setHistory] = useState<SymptomEntry[]>([]);

    const { user } = authStore.getAuth();
    
    // Health Profile State
    const [weight, setWeight] = useState(user?.weight?.toString() || localStorage.getItem('pcos_weight') || '');
    const [height, setHeight] = useState(user?.height?.toString() || localStorage.getItem('pcos_height') || '');
    const [cycleLength, setCycleLength] = useState(localStorage.getItem('pcos_cycleLength') || '');
    const [isIrregular, setIsIrregular] = useState(localStorage.getItem('pcos_isIrregular') === 'true');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const riskAnalysis = useRiskAnalysis(history, { weight, height, cycleLength, isIrregular });

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await api.get('/symptoms');
            setHistory(response.data);
        } catch (error) {
            console.error('Error fetching symptoms history:', error);
        }
    };

    const saveProfile = async () => {
        try {
            setIsSavingProfile(true);
            const w = parseFloat(weight);
            const h = parseFloat(height);

            if (user && !isNaN(w) && !isNaN(h)) {
                await api.put(`/user/${user._id}/settings`, { weight: w, height: h });
                authStore.updateUser({ weight: w, height: h });
                window.dispatchEvent(new Event('authChange'));
            }

            localStorage.setItem('pcos_weight', weight);
            localStorage.setItem('pcos_height', height);
            localStorage.setItem('pcos_cycleLength', cycleLength);
            localStorage.setItem('pcos_isIrregular', String(isIrregular));
            setIsProfileModalOpen(false);
            
            // Show toast for profile save too
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to save health profile to database");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const toggleSymptom = (symptom: string) => {
        setSelected(prev => {
            if (prev.includes(symptom)) {
                return prev.filter(s => s !== symptom);
            }
            return [...prev, symptom];
        });

        setSeverity(prev => {
            if (prev[symptom]) {
                const newSeverity = { ...prev };
                delete newSeverity[symptom];
                return newSeverity;
            }
            return { ...prev, [symptom]: 1 };
        });
    };

    const updateSeverity = (symptom: string, value: number) => {
        setSeverity(prev => ({ ...prev, [symptom]: value }));
    };

    const handleSave = async () => {
        try {
            setIsSubmitting(true);
            const userId = localStorage.getItem('userId') || undefined;
            const entry = {
                userId,
                date: new Date().toISOString(),
                selectedSymptoms: selected,
                severity,
                notes
            };

            await api.post('/symptoms', entry);

            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);

            // Reset form
            setSelected([]);
            setSeverity({});
            setNotes('');

            // Refresh history after save
            fetchHistory();
        } catch (error: any) {
            console.error('Error saving symptom entry:', error);
            alert(error.response?.data?.message || 'Failed to save symptom entry.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    };

    const getRiskColor = (level: string) => {
        if (level === 'Low Risk') return 'text-green-600 bg-green-100';
        if (level === 'Moderate Risk') return 'text-orange-600 bg-orange-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Symptom Tracker</h1>
            </div>

            {/* AI Risk Analysis Card */}
            <Card className="border-primary-100 bg-primary-50/50">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-primary-900">
                        <Activity className="h-5 w-5 text-primary-600" />
                        AI PCOS Risk Analysis
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4" />
                        Health Profile
                    </Button>
                </CardHeader>
                <CardContent>
                    {weight && height && cycleLength ? (
                        <>
                            <div className="p-4 bg-white rounded-lg border border-primary-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Predicted Risk Score</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-extrabold text-gray-900">{riskAnalysis.score}</span>
                                        <span className="text-lg text-gray-500 mb-1">/ 100</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start sm:items-end gap-2">
                                    <div className={`px-4 py-2 rounded-full font-bold text-base shadow-sm ${getRiskColor(riskAnalysis.level)}`}>
                                        {riskAnalysis.level}
                                    </div>
                                    <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                                        Confidence: <span className="font-semibold">{riskAnalysis.confidence}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-4 italic bg-blue-50/50 p-2 rounded border border-blue-100">
                                This AI system estimates PCOS risk based on your logged symptoms and profile. It does not replace professional medical diagnosis.
                            </p>
                        </>
                    ) : (
                        <div className="py-8 px-4 text-center bg-gray-50 border-2 border-dashed border-primary-200 rounded-lg">
                            <Activity className="h-8 w-8 text-primary-400 mx-auto mb-3 opacity-50" />
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Health Profile Required</h3>
                            <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
                                To calculate your AI-driven PCOS risk score, please enter your weight, height, and average cycle length.
                            </p>
                            <Button onClick={() => setIsProfileModalOpen(true)} className="px-6 font-semibold">
                                Complete Profile
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Select Symptoms</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {SYMPTOMS_LIST.map(sym => (
                                <div
                                    key={sym}
                                    className="flex items-center space-x-3"
                                >
                                    <input
                                        type="checkbox"
                                        id={sym}
                                        checked={selected.includes(sym)}
                                        onChange={() => toggleSymptom(sym)}
                                        className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <label htmlFor={sym} className="text-gray-700 font-medium select-none cursor-pointer text-lg">
                                        {sym}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Severity & Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {selected.length === 0 && (
                                <p className="text-sm text-gray-500 italic">Select symptoms to log details.</p>
                            )}

                            {selected.map(sym => (
                                <div key={sym} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-gray-700">{sym} Severity</label>
                                        <span className="text-sm text-gray-500">{severity[sym] || 1}/5</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        step="1"
                                        value={severity[sym] || 1}
                                        onChange={(e) => updateSeverity(sym, parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                    />
                                </div>
                            ))}

                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                <textarea
                                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    rows={4}
                                    placeholder="Any additional details..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <Button
                                onClick={handleSave}
                                className="w-full"
                                disabled={selected.length === 0 || isSubmitting}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isSubmitting ? 'Saving...' : 'Save Entry'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {history.length > 0 && (
                <div className="mt-8 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Recent Symptom Entries</h2>
                    <div className="flex flex-col gap-4">
                        {history.slice(0, 5).map((entry, idx) => (
                            <Card key={entry._id || entry.id || idx} className="overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-shrink-0 sm:w-32 pb-3 sm:pb-0 sm:border-r border-gray-100 border-b sm:border-b-0 space-y-1">
                                        <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                            {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                        </div>
                                        <div className="text-lg font-bold text-gray-900">
                                            {formatDate(entry.date)}
                                        </div>
                                        <div className="text-xs text-gray-400 font-medium">
                                            {new Date(entry.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-wrap gap-2 items-center sm:pl-4">
                                        {entry.selectedSymptoms.map((sym) => {
                                            const sev = entry.severity[sym] || 1;
                                            const getSeverityColor = (s: number) => {
                                                if (s <= 2) return "bg-green-100 text-green-700 border-green-200";
                                                if (s <= 3) return "bg-orange-100 text-orange-700 border-orange-200";
                                                return "bg-red-100 text-red-700 border-red-200";
                                            };
                                            return (
                                                <div
                                                    key={sym}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2 shadow-sm transition-transform hover:-translate-y-0.5 cursor-default group",
                                                        getSeverityColor(sev)
                                                    )}
                                                >
                                                    <span>{sym}</span>
                                                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/60 text-xs font-bold shadow-sm group-hover:bg-white transition-colors">
                                                        {sev}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {entry.notes && (
                                        <div className="sm:max-w-xs w-full text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 italic flex-shrink-0 mt-2 sm:mt-0">
                                            "{entry.notes}"
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Health Profile Modal */}
            <Modal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                title="Update Health Profile"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                            <input
                                type="number"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="e.g. 68"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                            <input
                                type="number"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                placeholder="e.g. 165"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Average Cycle Length (days)</label>
                        <input
                            type="number"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            value={cycleLength}
                            onChange={(e) => setCycleLength(e.target.value)}
                            placeholder="e.g. 28"
                        />
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                        <input
                            type="checkbox"
                            id="irregular"
                            checked={isIrregular}
                            onChange={(e) => setIsIrregular(e.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="irregular" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                            My periods are frequently irregular or absent
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button onClick={saveProfile} isLoading={isSavingProfile}>Save Profile</Button>
                    </div>
                </div>
            </Modal>

            {/* Simple Toast */}
            <div
                className={cn(
                    "fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg transition-all transform duration-300",
                    showToast ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
                )}
            >
                Saved successfully
            </div>
        </div>
    );
};
