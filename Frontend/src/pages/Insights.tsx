import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Brain, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';

export const Insights = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                    <Brain className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">AI Health Insights</h1>
                    <p className="text-gray-500">Personalized analysis based on your logs</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Insight Panel */}
                <Card className="lg:col-span-2 bg-gradient-to-br from-primary-50 to-white border-primary-100">
                    <CardHeader>
                        <CardTitle className="text-primary-800 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Cycle & Symptom Correlation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            Based on your last 3 cycles, we noticed that your fatigue levels tend to peak 2 days before your cycle begins.
                            Implementing the "Low Impact Yoga" routine during this phase has shown to reduce reported severity by 30%.
                        </p>
                        <div className="mt-4 p-4 bg-white/60 rounded-lg border border-primary-100">
                            <h4 className="font-semibold text-primary-700 mb-1">Actionable Tip:</h4>
                            <p className="text-gray-600">Consider scheduling light yoga on expected pre-cycle days to manage fatigue better.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Alerts */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-600">
                                <AlertCircle className="h-5 w-5" />
                                Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-sm text-gray-800">
                                <span className="font-bold block mb-1">Cycle Length Variation</span>
                                Your last cycle was 5 days longer than your average. This is within normal variation but worth monitoring.
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-gray-800">
                                <span className="font-bold block mb-1">Hydration Reminder</span>
                                Symptom logs indicate headaches. Try increasing water intake to 2.5L daily.
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-600">
                                <Lightbulb className="h-5 w-5" />
                                Recommendations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <li className="text-sm text-gray-700 list-disc ml-4">Increase Magnesium rich foods</li>
                            <li className="text-sm text-gray-700 list-disc ml-4">Prioritize sleep before period starts</li>
                            <li className="text-sm text-gray-700 list-disc ml-4">Try peppermint tea for bloating</li>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg text-xs text-gray-500 text-center">
                Disclaimer: AI Insights are generated based on your data patterns and general health information.
                This is not medical advice or a diagnosis. Please consult a healthcare professional for specific medical concerns.
            </div>
        </div>
    );
};
