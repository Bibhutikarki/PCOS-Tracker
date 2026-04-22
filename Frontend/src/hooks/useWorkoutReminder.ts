import { useEffect, useRef } from 'react';
import { authStore } from '../lib/auth';

export const useWorkoutReminder = () => {
    // Keep track so we only fire once per day per session
    const lastFiredDate = useRef<string | null>(null);

    useEffect(() => {
        const checkTime = () => {
            const auth = authStore.getAuth();
            if (!auth.isAuthenticated || !auth.user) return;

            const { workoutReminderTime, workoutReminderEnabled } = auth.user;
            if (!workoutReminderEnabled || !workoutReminderTime) return;

            const now = new Date();
            const currentHour = now.getHours().toString().padStart(2, '0');
            const currentMinute = now.getMinutes().toString().padStart(2, '0');
            const currentTimeStr = `${currentHour}:${currentMinute}`;
            
            const todayStr = now.toDateString();

            if (currentTimeStr === workoutReminderTime && lastFiredDate.current !== todayStr) {
                lastFiredDate.current = todayStr; // Prevent firing again today
                triggerNotification();
            }
        };

        const triggerNotification = () => {
            const title = "Workout Reminder";
            const options = {
                body: "It's time for your daily workout! Let's get moving.",
                icon: "/favicon.ico"
            };

            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, options);
            } else {
                // Fallback built-in alert if notifications are denied or unsupported
                alert(`${title}\n${options.body}`);
            }
        };

        // Check time every 30 seconds
        const intervalId = setInterval(checkTime, 30000);
        
        // Immediate check on mount
        checkTime();

        return () => clearInterval(intervalId);
    }, []);
};
