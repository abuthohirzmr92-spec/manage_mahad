import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: ReactNode;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", className)}>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

interface PageCardProps {
    title: ReactNode;
    description?: string;
    children: ReactNode;
    className?: string;
    action?: ReactNode;
}

export function PageCard({ title, description, children, className, action }: PageCardProps) {
    return (
        <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)}>
            <div className="flex flex-col space-y-1.5 p-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
                    {action && <div>{action}</div>}
                </div>
                {description && (
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
            </div>
            <div className="p-6 pt-0">
                {children}
            </div>
        </div>
    );
}
