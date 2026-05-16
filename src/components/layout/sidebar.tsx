'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store/sidebar-store';
import { useAuthStore } from '@/store/auth-store';
import { getGroupedMenuForRole } from '@/config/navigation';
import { useCollection } from '@/hooks';
import type { Notification } from '@/types';
import {
  LayoutDashboard, Users, Building2, BookOpen, AlertTriangle,
  Gavel, Trophy, Activity, Bell, Settings, ChevronLeft,
  ChevronRight, GraduationCap, X, UsersRound, School, Library,
  Stethoscope, FileText, Upload, Home, ChevronDown,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Users, Building2, BookOpen, AlertTriangle,
  Gavel, Trophy, Activity, Bell, Settings, UsersRound,
  GraduationCap, School, Library, Stethoscope, FileText, Upload, Home,
};

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggle, setMobileOpen } = useSidebarStore();
  const { user } = useAuthStore();
  const menuGroups = getGroupedMenuForRole(user?.role ?? 'admin');

  // Accordion: track which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Auto-expand group containing active route
  useEffect(() => {
    const activeGroup = menuGroups.find((g) =>
      g.items.some((item) => pathname === item.href || pathname?.startsWith(item.href + '/'))
    );
    if (activeGroup && !expandedGroups[activeGroup.title]) {
      setExpandedGroups((prev) => ({ ...prev, [activeGroup.title]: true }));
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleGroup = useCallback((title: string) => {
    setExpandedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  }, []);

  // Real-time unread notification count
  const { data: allNotifs } = useCollection<Notification>('notifications', [], { realtime: true });
  const filteredNotifs = user?.role === 'wali' && user?.childSantriId
    ? allNotifs.filter((n) => n.targetSantriId === user.childSantriId)
    : allNotifs;
  const unreadCount = filteredNotifs.filter((n) => !n.read).length;

  return (
    <TooltipProvider delay={0}>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full flex flex-col transition-all duration-300 ease-in-out',
        'bg-sidebar border-r border-sidebar-border dark:backdrop-blur-xl',
        isCollapsed ? 'w-[68px]' : 'w-[260px]',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className={cn('flex items-center h-16 border-b border-sidebar-border px-4 shrink-0', isCollapsed ? 'justify-center' : 'gap-3')}>
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary shrink-0 shadow-[0_0_12px_rgba(251,146,60,0.35)] dark:shadow-[0_0_16px_rgba(251,146,60,0.4)]">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-sidebar-foreground truncate">Ma&apos;had Manager</span>
              <span className="text-[10px] text-muted-foreground truncate">Sistem Manajemen Pesantren</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="lg:hidden ml-auto text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-3">
          <nav className="px-2 space-y-1">
            {menuGroups.map((group) => {
              const GroupIcon = iconMap[group.icon];
              const isExpanded = expandedGroups[group.title] || false;
              const isActiveGroup = group.items.some(
                (item) => pathname === item.href || pathname?.startsWith(item.href + '/')
              );

              return (
                <div key={group.title}>
                  {/* Group header — clickable accordion trigger */}
                  {isCollapsed ? (
                    /* Collapsed: show items directly with tooltips, no group header */
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = iconMap[item.icon] || LayoutDashboard;
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        const isNotifItem = item.icon === 'Bell';
                        const linkContent = (
                          <Link href={item.href} onClick={() => setMobileOpen(false)}
                            className={cn(
                              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                              isActive
                               ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm dark:shadow-[0_0_8px_rgba(251,146,60,0.08)] dark:border dark:border-primary/20'
                               : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                              'justify-center px-2'
                            )}>
                            <div className={cn(isNotifItem ? 'relative' : '')}>
                              <Icon className={cn('shrink-0 transition-colors duration-200 w-5 h-5', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                              {isNotifItem && unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 text-[9px] font-bold bg-destructive text-destructive-foreground rounded-full px-0.5">
                                  {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                        return (
                          <Tooltip key={item.href}>
                            <TooltipTrigger>
                              {linkContent}
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={8}>{item.title}</TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  ) : (
                    /* Expanded sidebar: accordion groups */
                    <>
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.title)}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors',
                          isActiveGroup
                            ? 'text-sidebar-foreground/80'
                            : 'text-muted-foreground/60 hover:text-sidebar-foreground/60'
                        )}
                      >
                        {GroupIcon && <GroupIcon className="w-3.5 h-3.5 shrink-0" />}
                        <span className="flex-1 text-left truncate">{group.title}</span>
                        <ChevronDown className={cn(
                          'w-3 h-3 shrink-0 transition-transform duration-200',
                          isExpanded && 'rotate-180'
                        )} />
                      </button>

                      {/* Submenu items */}
                      <div className={cn(
                        'overflow-hidden transition-all duration-200 ease-in-out',
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      )}>
                        <div className="space-y-0.5 pt-0.5 pb-1">
                          {group.items.map((item) => {
                            const Icon = iconMap[item.icon] || LayoutDashboard;
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                            const isNotifItem = item.icon === 'Bell';
                            return (
                              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                                className={cn(
                                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                                  isActive
                                   ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm dark:shadow-[0_0_8px_rgba(251,146,60,0.08)] dark:border dark:border-primary/20'
                                   : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                )}>
                                <Icon className={cn('shrink-0 w-4 h-4 transition-colors duration-200', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                                <span className="truncate">{item.title}</span>
                                {isNotifItem && unreadCount > 0 && (
                                  <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full px-1.5">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Collapse Toggle */}
        <div className="hidden lg:flex items-center justify-center border-t border-sidebar-border p-2 shrink-0">
          <Button variant="ghost" size="icon" onClick={toggle} className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors">
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
