'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await apiFetch('/api/dashboard/stats');
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const cards = [
    { name: 'Today Revenue', value: `$${stats?.revenue || 0}`, desc: 'Total paid bills today', color: 'border-l-success' },
    { name: 'Active Orders', value: stats?.activeOrders || 0, desc: 'Orders currently cooking or serving', color: 'border-l-warning' },
    { name: 'Reserved Tables', value: stats?.reservedTables || 0, desc: 'Occupied or reserved tables', color: 'border-l-info' },
    { name: 'Today Reservations', value: stats?.reservationsCount || 0, desc: 'Total bookings scheduled today', color: 'border-l-primary' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-base-content">Welcome Back!</h1>
        <p className="text-sm text-base-content/70 mt-1">Here is a quick look at restaurant operations today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className={`card bg-base-100 shadow border-l-4 ${card.color}`}>
            <div className="card-body p-6">
              <h2 className="text-sm font-semibold text-base-content/60 uppercase">{card.name}</h2>
              <p className="text-3xl font-black text-base-content mt-2">{card.value}</p>
              <p className="text-xs text-base-content/50 mt-1">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
