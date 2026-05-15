'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
  iconClassName?: string;
}

export function StatsCard({ title, value, description, icon: Icon, trend, className, iconClassName }: StatsCardProps) {
  return (
    <Card className={cn(
      'relative overflow-hidden cursor-default',
      // Explicit transition — better GPU compositing than transition-all
      'transition-[transform,box-shadow,background-color,border-color] duration-300',
      // Light mode: subtle lift
      'hover:shadow-md',
      // Dark mode: reuse shared glass-card utility for consistency
      'dark:glass-card',
      // motion-safe: respect reduced-motion preference
      'motion-safe:hover:-translate-y-0.5',
      // Refined amber glow — smaller spread for StatsCard scale
      'dark:hover:shadow-[0_6px_24px_rgba(251,146,60,0.08),0_2px_8px_rgba(0,0,0,0.20)]',
      className,
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {/* Title: slightly more visible in dark mode for readability */}
        <CardTitle className="text-sm font-medium text-muted-foreground dark:text-muted-foreground/90">
          {title}
        </CardTitle>
        {/* Icon container: softer dark-mode background for premium softness */}
        <div className={cn(
          'flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10',
          'dark:bg-primary/10 dark:ring-1 dark:ring-primary/20',
          iconClassName,
        )}>
          <Icon aria-hidden="true" className="w-4 h-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Value: slightly enhanced weight for dark-mode pop */}
        <div className="text-2xl font-bold tracking-tight dark:text-foreground/95">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            <span className={cn(
              'text-xs font-medium',
              trend.value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
            )}>
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
