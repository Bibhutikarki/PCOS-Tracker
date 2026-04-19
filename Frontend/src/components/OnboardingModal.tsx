import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { authStore } from '../lib/auth';
import api from '../lib/api';

interface OnboardingModalProps {
    onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
    const { user } = authStore.getAuth();
    const [weight, setWeight] = useState(user?.weight?.toString() || '');
    const [height, setHeight] = useState(user?.height?.toString() || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const w = parseFloat(weight);
        const h = parseFloat(height);

        if (isNaN(w) || w <= 0 || isNaN(h) || h <= 0) {
            setError('Please enter valid positive numbers for weight and height.');
            return;
        }

        try {
            setLoading(true);
            const res = await api.put(`/user/${user._id}/settings`, {
                weight: w,
                height: h
            });
            
            // Update authStore
            authStore.updateUser({ weight: w, height: h });
            onComplete();
        } catch (error: any) {
            console.error('Error updating profile:', error);
            setError(error.response?.data?.message || 'Failed to save details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in zoom-in-95 duration-500">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-gray-900 font-display">Welcome!</h2>
                    <p className="text-sm text-gray-500 mt-2 font-medium">
                        Before you start tracking your journey, we need two quick details to personalize your experience.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Input
                            label="Weight (in kg)"
                            type="number"
                            step="0.1"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="e.g. 65"
                            required
                        />
                    </div>
                    <div>
                        <Input
                            label="Height (in cm)"
                            type="number"
                            step="0.1"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            placeholder="e.g. 165"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-xs font-bold text-rose-500 bg-rose-50 p-3 rounded-lg">
                            {error}
                        </p>
                    )}

                    <Button type="submit" isLoading={loading} className="w-full font-black text-lg py-6 shadow-xl shadow-primary-500/20">
                        Save Details
                    </Button>
                </form>
            </div>
        </div>
    );
};
