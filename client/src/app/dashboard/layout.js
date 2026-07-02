'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { authClient } from '@/lib/auth';

export default function DashboardLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await apiFetch('/api/staff/me');
        if (response.success && response.data) {
          setStaff(response.data);
          
          // Basic pathname role check
          const role = response.data.role;
          if (role === 'kitchen' && pathname !== '/dashboard/kitchen') {
            router.push('/dashboard/kitchen');
          } else if (role === 'waiter' && (pathname.startsWith('/dashboard/staff') || pathname.startsWith('/dashboard/settings') || pathname === '/dashboard/menu')) {
            router.push('/dashboard/unauthorized');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router, pathname]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!staff) return null;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', roles: ['admin', 'waiter'] },
    { name: 'Kitchen Queue', path: '/dashboard/kitchen', roles: ['admin', 'waiter', 'kitchen'] },
    { name: 'Orders', path: '/dashboard/orders', roles: ['admin', 'waiter'] },
    { name: 'Tables', path: '/dashboard/tables', roles: ['admin', 'waiter'] },
    { name: 'Reservations', path: '/dashboard/reservations', roles: ['admin', 'waiter'] },
    { name: 'Billing', path: '/dashboard/billing', roles: ['admin', 'waiter'] },
    { name: 'Menu CRUD', path: '/dashboard/menu', roles: ['admin'] },
    { name: 'Staff Management', path: '/dashboard/staff', roles: ['admin'] },
    { name: 'Settings', path: '/dashboard/settings', roles: ['admin'] }
  ];

  const allowedMenuItems = menuItems.filter(item => item.roles.includes(staff.role));

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
      
      {/* Page Content */}
      <div className="drawer-content flex flex-col min-h-screen">
        {/* Navbar */}
        <div className="navbar bg-base-100 shadow border-b border-base-300 px-4">
          <div className="flex-none lg:hidden">
            <label htmlFor="dashboard-drawer" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </label>
          </div>
          <div className="flex-1">
            <span className="text-xl font-bold px-2 text-primary">Dashboard</span>
          </div>
          <div className="flex-none gap-4">
            <div className="flex flex-col items-end text-sm">
              <span className="font-semibold">{staff.name}</span>
              <span className="text-xs text-base-content/70 capitalize">{staff.role}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-outline btn-sm btn-error">
              Logout
            </button>
          </div>
        </div>

        {/* Inner page content */}
        <main className="p-6 flex-grow">
          {children}
        </main>
      </div>

      {/* Sidebar Drawer */}
      <div className="drawer-side border-r border-base-300">
        <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>
        <ul className="menu p-4 w-80 min-h-full bg-base-100 text-base-content gap-1">
          <li className="mb-4 text-center">
            <span className="text-2xl font-black text-primary block">Gourmet Haven</span>
          </li>
          
          {allowedMenuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link 
                  href={item.path} 
                  className={`font-semibold p-3 rounded-lg transition-all ${isActive ? 'bg-primary text-primary-content shadow' : 'hover:bg-base-200'}`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
