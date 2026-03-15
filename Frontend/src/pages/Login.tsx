import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { authStore } from '../lib/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Activity } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await authStore.login({
                email: data.email,
                password: data.password,
            });
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Login failed:', error);
            // Ideally set an error state here to show to the user
            alert(error.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Activity className="h-12 w-12 text-primary-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <Input
                            label="Email address"
                            type="email"
                            {...register('email')}
                            error={errors.email?.message}
                        />

                        <Input
                            label="Password"
                            type="password"
                            {...register('password')}
                            error={errors.password?.message}
                        />

                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full"
                                isLoading={isSubmitting}
                            >
                                Sign in
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    New to platform?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link to="/register">
                                <Button variant="outline" className="w-full">
                                    Create an account
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
