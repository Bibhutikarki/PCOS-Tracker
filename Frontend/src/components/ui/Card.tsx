import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden", className)}
        {...props}
    >
        {children}
    </div>
);

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("px-6 py-4 border-b border-gray-100", className)} {...props}>
        {children}
    </div>
);

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn("text-lg font-semibold text-gray-900", className)} {...props}>
        {children}
    </h3>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("p-6", className)} {...props}>
        {children}
    </div>
);
