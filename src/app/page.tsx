'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { 
  GraduationCap, Shield, MoonStar, HeartHandshake, 
  User, Briefcase, ClipboardCheck, School, Loader2 
} from 'lucide-react';
import { UserRole } from '@/types';

const DEMO_ROLES = [
  { 
    roleId: 'admin' as UserRole, 
    roleName: 'Admin', 
    desc: 'Full Access System', 
    email: 'admin@mahad.sch.id', 
    icon: Shield, 
    color: 'bg-violet-500/10 text-violet-500 border-violet-500/30 hover:bg-violet-500/20 hover:border-violet-500/50 hover:shadow-violet-500/20' 
  },
  { 
    roleId: 'musyrif' as UserRole, 
    roleName: 'Musyrif', 
    desc: 'Asrama & Santri', 
    email: 'musyrif@mahad.sch.id', 
    icon: MoonStar, 
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50 hover:shadow-blue-500/20' 
  },
  { 
    roleId: 'kepala_kesiswaan' as UserRole, 
    roleName: 'Kesiswaan', 
    desc: 'Approval & Monitor', 
    email: 'kesiswaan@mahad.sch.id', 
    icon: ClipboardCheck, 
    color: 'bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500/50 hover:shadow-rose-500/20' 
  },
  { 
    roleId: 'staff' as UserRole, 
    roleName: 'Staff', 
    desc: 'Operasional Harian', 
    email: 'staff@mahad.sch.id', 
    icon: Briefcase, 
    color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:shadow-cyan-500/20' 
  },
  { 
    roleId: 'guru' as UserRole, 
    roleName: 'Guru', 
    desc: 'Pengajar Kelas', 
    email: 'guru@mahad.sch.id', 
    icon: GraduationCap, 
    color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-500/50 hover:shadow-indigo-500/20' 
  },
  { 
    roleId: 'wali_kelas' as UserRole, 
    roleName: 'Wali Kelas', 
    desc: 'Manajemen Kelas', 
    email: 'walikelas@mahad.sch.id', 
    icon: School, 
    color: 'bg-teal-500/10 text-teal-500 border-teal-500/30 hover:bg-teal-500/20 hover:border-teal-500/50 hover:shadow-teal-500/20' 
  },
  { 
    roleId: 'wali' as UserRole, 
    roleName: 'Wali Santri', 
    desc: 'Pantau Anak', 
    email: 'wali@mahad.sch.id', 
    icon: HeartHandshake, 
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:shadow-emerald-500/20' 
  },
  { 
    roleId: 'santri' as UserRole, 
    roleName: 'Santri', 
    desc: 'Akses Pribadi', 
    email: 'santri@mahad.sch.id', 
    icon: User, 
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 hover:shadow-amber-500/20' 
  },
];

export default function LoginPage() {
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);
  const router = useRouter();

  const handleDemoLogin = (role: typeof DEMO_ROLES[0]) => {
    setLoadingRole(role.roleId);
    
    // Simulate network delay for realistic UX
    setTimeout(() => {
      // Inject user directly into the store to bypass mockUsers limit
      useAuthStore.setState({
        user: { 
          id: `demo-${role.roleId}`, 
          name: `Demo ${role.roleName}`, 
          email: role.email, 
          role: role.roleId,
          // Assign a dummy child ID if the role is wali to prevent errors in dashboard
          childSantriId: role.roleId === 'wali' ? '1' : undefined
        },
        isAuthenticated: true,
        isLoading: false
      });
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center p-4 sm:p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-4xl flex flex-col md:flex-row gap-8 items-stretch">
        
        {/* Left Side: Branding */}
        <div className="flex-1 flex flex-col justify-center text-center md:text-left space-y-6 md:pr-8">
          <div className="inline-flex items-center justify-center md:justify-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl shadow-violet-600/20 flex items-center justify-center shrink-0">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Ma&apos;had Manager</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-emerald-400 text-sm font-medium">Enterprise Edition v2.0</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 text-slate-400">
            <p className="text-lg leading-relaxed">
              Sistem manajemen pesantren modern dengan Role-Based Access Control terpusat.
            </p>
            <p className="text-sm border-l-2 border-violet-500/50 pl-4 py-1">
              Silakan pilih salah satu <strong>Role Demo</strong> di sebelah kanan untuk melihat perbedaan akses antarmuka (UI) secara langsung.
            </p>
          </div>
        </div>

        {/* Right Side: Demo Login Cards */}
        <div className="flex-1">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
            {/* Glossy reflection effect */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">Quick Demo Login</h2>
              <p className="text-slate-400 text-sm">Pilih peran Anda untuk masuk secara instan</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEMO_ROLES.map((role) => {
                const Icon = role.icon;
                const isLoading = loadingRole === role.roleId;
                
                return (
                  <button
                    key={role.roleId}
                    onClick={() => handleDemoLogin(role)}
                    disabled={loadingRole !== null}
                    className={`group text-left p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${role.color} ${loadingRole !== null && !isLoading ? 'opacity-50 grayscale cursor-not-allowed' : ''} ${isLoading ? 'scale-95 shadow-none' : ''}`}
                  >
                    <div className="relative z-10 flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-white/5 border border-white/10 shrink-0 ${isLoading ? 'animate-pulse' : ''}`}>
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm tracking-wide">{role.roleName}</h3>
                        <p className="text-xs opacity-75 mt-0.5">{role.desc}</p>
                      </div>
                    </div>
                    {/* Hover gradient background inject */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 text-center flex flex-col items-center gap-2">
              <p className="text-xs text-slate-500">
                Akses ini mengabaikan autentikasi form manual untuk keperluan demonstrasi UI/UX.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
