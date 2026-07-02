'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  async function loadOrders() {
    try {
      const response = await apiFetch('/api/orders');
      if (response.success) {
        setOrders(response.data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve orders log');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'preparing': return 'badge-secondary';
      case 'ready': return 'badge-accent';
      case 'served': return 'badge-success';
      default: return 'badge-ghost';
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-base-content font-display">Orders log</h1>
          <p className="text-sm text-base-content/70 mt-1">Review active and completed dine-in or takeaway orders</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/kitchen" className="btn btn-outline">
            Kitchen Queue
          </Link>
          <Link href="/dashboard/orders/new" className="btn btn-primary">
            New Order
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="tabs tabs-boxed bg-base-100 p-2 shadow border border-base-300">
        <button className={`tab font-semibold ${statusFilter === 'all' ? 'tab-active' : ''}`} onClick={() => setStatusFilter('all')}>All Orders</button>
        <button className={`tab font-semibold ${statusFilter === 'pending' ? 'tab-active' : ''}`} onClick={() => setStatusFilter('pending')}>Pending</button>
        <button className={`tab font-semibold ${statusFilter === 'preparing' ? 'tab-active' : ''}`} onClick={() => setStatusFilter('preparing')}>Preparing</button>
        <button className={`tab font-semibold ${statusFilter === 'ready' ? 'tab-active' : ''}`} onClick={() => setStatusFilter('ready')}>Ready</button>
        <button className={`tab font-semibold ${statusFilter === 'served' ? 'tab-active' : ''}`} onClick={() => setStatusFilter('served')}>Served</button>
        <button className={`tab font-semibold ${statusFilter === 'billed' ? 'tab-active' : ''}`} onClick={() => setStatusFilter('billed')}>Billed</button>
      </div>

      {/* Orders Table */}
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="overflow-x-auto">
          <table className="table w-full text-sm">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Type</th>
                <th>Details</th>
                <th>Total</th>
                <th>Status</th>
                <th>Time</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord) => (
                <tr key={ord._id} className="hover">
                  <td className="font-bold text-primary">{ord.orderNumber}</td>
                  <td className="capitalize font-semibold">{ord.type}</td>
                  <td>
                    {ord.type === 'dine-in' ? (
                      <span className="badge badge-sm badge-outline">Table {ord.tableId ? 'Occupied' : 'N/A'}</span>
                    ) : (
                      <div className="text-xs truncate max-w-xs font-semibold">{ord.customerName} {ord.customerPhone}</div>
                    )}
                  </td>
                  <td className="font-bold">${Number(ord.total).toFixed(2)}</td>
                  <td>
                    <span className={`badge uppercase text-xs font-bold ${getStatusColor(ord.status)}`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="text-xs text-base-content/70">{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="text-right">
                    <Link href={`/dashboard/orders/${ord._id}`} className="btn btn-sm btn-outline">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
