import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Save } from 'lucide-react';
import { cn } from '../lib/utils';

const SYMPTOMS_LIST = [
    'Pain', 'Mood', 'Acne', 'Fatigue', 'Bloating', 'Headache'
];

interface SymptomEntry {
    id: string;
    date: string;
    selectedSymptoms: string[];
    severity: Record<string, number>;
    notes: string;
}

export const Symptoms = () => {
    const [selected, setSelected] = useState<string[]>([]);
    const [severity, setSeverity] = useState<Record<string, number>>({});
    const [notes, setNotes] = useState('');
    const [showToast, setShowToast] = useState(false);

    const toggleSymptom = (symptom: string) => {
        if (selected.includes(symptom)) {
            setSelected(selected.filter(s => s !== symptom));
            const newSeverity = { ...severity };
            delete newSeverity[symptom];
            setSeverity(newSeverity);
        } else {
            setSelected([...selected, symptom]);
            setSeverity({ ...severity, [symptom]: 1 });
        }
    };

    const updateSeverity = (symptom: string, value: number) => {
        setSeverity({ ...severity, [symptom]: value });
    };

    const handleSave = () => {
        const entry: SymptomEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            selectedSymptoms: selected,
            severity,
            notes
        };

        const saved = localStorage.getItem('pcos_symptoms');
        const history = saved ? JSON.parse(saved) : [];
        localStorage.setItem('pcos_symptoms', JSON.stringify([entry, ...history]));

        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);

        // Reset form
        setSelected([]);
        setSeverity({});
        setNotes('');
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Symptom Tracker</h1>
            </div>

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

                            <Button onClick={handleSave} className="w-full" disabled={selected.length === 0}>
                                <Save className="w-4 h-4 mr-2" />
                                Save Entry
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

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
