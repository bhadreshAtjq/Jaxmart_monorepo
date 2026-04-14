'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { PageLoader } from '@/components/ui';
import { FaShieldHalved, FaPowerOff, FaClock, FaBell } from 'react-icons/fa6';
import Link from 'next/link';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoggedIn, logout, accessToken } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn || !user?.isAdmin) {
      router.replace('/admin/login');
    }
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || !user?.isAdmin) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-heading text-jax-dark">
      {/* Admin Sidebar */}
      <aside className="w-72 bg-jax-dark border-r border-white/5 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-8">
           <Link href="/admin" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-jax-accent flex items-center justify-center">
                 <FaShieldHalved className="h-5 w-5 text-jax-dark" />
              </div>
              <div className="leading-none">
                 <p className="font-black text-white text-lg tracking-tighter uppercase">Admin</p>
                 <p className="text-[9px] font-bold text-jax-accent uppercase tracking-widest mt-0.5">Control Layer</p>
              </div>
           </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
           {[
             { label: 'Platform Hub', href: '/admin' },
             { label: 'Security Logs', href: '#' },
             { label: 'Asset Review', href: '#' },
             { label: 'Global Ledger', href: '#' },
           ].map(item => (
             <Link 
               key={item.label} 
               href={item.href}
               className="flex items-center px-4 py-3.5 rounded-2xl text-[10px] font-black text-white/50 uppercase tracking-[0.2em] hover:text-white hover:bg-white/5 transition-all"
             >
               {item.label}
             </Link>
           ))}
        </nav>

        <div className="p-6 border-t border-white/5">
           <button 
             onClick={() => { logout(); router.push('/admin/login'); }}
             className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
           >
              <FaPowerOff className="h-3 w-3" /> Terminate Session
           </button>
        </div>
      </aside>

      {/* Main Command Area */}
      <main className="flex-1 ml-72">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-40">
           <div className="flex items-center gap-4 text-gray-400">
              <FaClock className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Protocol Active: {new Date().toLocaleTimeString()}</span>
           </div>
           
           <div className="flex items-center gap-6">
              <button className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-jax-dark relative group">
                 <FaBell className="h-4 w-4" />
                 <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-jax-accent rounded-full border-2 border-white" />
              </button>
              
              <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                 <div className="text-right">
                    <p className="text-sm font-black text-jax-dark uppercase tracking-tight leading-none">{user.fullName}</p>
                    <p className="text-[9px] font-bold text-jax-accent uppercase tracking-widest mt-1">Superuser</p>
                 </div>
                 <div className="h-10 w-10 rounded-xl bg-jax-dark text-white flex items-center justify-center font-black text-xs">
                    {user.fullName[0]}
                 </div>
              </div>
           </div>
        </header>
        
        <div className="p-10">
           {children}
        </div>
      </main>
    </div>
  );
}
