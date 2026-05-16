'use client';

import { useAuthStore } from '@/store/auth-store';
import { useSidebarStore } from '@/store/sidebar-store';
import { useTheme } from 'next-themes';
import { UserRole } from '@/types';
import { roleLabels, roleColors } from '@/config/theme';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Bell, Menu, Moon, Sun, LogOut, User, Shield, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useCollection } from '@/hooks';
import type { Notification } from '@/types';
import { notificationsService } from '@/lib/firebase/services';
import { cn } from '@/lib/utils';

export function Topbar() {
  const { user, logout, switchRole } = useAuthStore();
  const { setMobileOpen } = useSidebarStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Load notifications from Firebase with realtime subscription
  const { data: rawNotifications } = useCollection<Notification>('notifications', [], { realtime: true });

  // Wali only sees their child's notifications
  const notifications = user?.role === 'wali' && user.childSantriId
    ? rawNotifications.filter((n) => n.targetSantriId === user.childSantriId)
    : rawNotifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'AD';

  return (
    <header className="sticky top-0 z-30 flex items-center h-16 border-b border-border bg-background/80 dark:bg-sidebar/80 backdrop-blur-xl px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden mr-2" onClick={() => setMobileOpen(true)}>
        <Menu className="w-5 h-5" />
      </Button>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        {user && (
          <Badge variant="outline" className={cn('hidden sm:flex text-xs', roleColors[user.role])}>
            <Shield className="w-3 h-3 mr-1" />{roleLabels[user.role]}
          </Badge>
        )}
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-muted-foreground hover:text-foreground">
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative text-muted-foreground hover:text-foreground")}>
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full">{unreadCount}</span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifikasi
                {unreadCount > 0 && <Badge variant="secondary" className="text-[10px]">{unreadCount} baru</Badge>}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {notifications.slice(0, 5).map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  className="cursor-pointer py-0"
                  onClick={async () => {
                    if (!notif.read) {
                      await notificationsService.markAsRead(notif.id);
                    }
                    router.push('/dashboard/notifikasi');
                  }}
                >
                  <div className="flex flex-col gap-1 py-3 w-full">
                    <div className="flex items-center gap-2">
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                      <span className={cn('text-sm font-medium', notif.read && 'text-muted-foreground')}>{notif.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-1 pl-4">{notif.message}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push('/dashboard/notifikasi')}
              className="cursor-pointer justify-center text-sm text-primary font-medium"
            >
              Lihat Semua
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost" }), "flex items-center gap-2 px-2 h-9")}>
            <Avatar className="w-7 h-7">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">{user?.name || 'Admin'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col"><span>{user?.name}</span><span className="text-xs font-normal text-muted-foreground">{user?.email}</span></div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer"><User className="w-4 h-4 mr-2" />Profil</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger><Shield className="w-4 h-4 mr-2" />Switch Role (Demo)</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {(['admin', 'kepala_kesiswaan', 'musyrif', 'wali_kelas', 'guru', 'staff', 'wali', 'santri', 'alumni'] as UserRole[]).map((role) => (
                    <DropdownMenuItem key={role} onClick={() => switchRole(role)} className="cursor-pointer">
                      <Badge variant="outline" className={cn('text-xs mr-2', roleColors[role])}>{roleLabels[role]}</Badge>
                      {user?.role === role && <span className="ml-auto text-xs text-primary">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer"><LogOut className="w-4 h-4 mr-2" />Keluar</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
