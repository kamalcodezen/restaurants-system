'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function KitchenQueue() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  async function loadActiveOrders() {
    try {
      const response = await apiFetch('/api/orders');
      if (response.success) {
        // Kitchen only cares about pending, preparing, and ready orders
        const active = response.data.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));
        setOrders(active);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch kitchen line');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActiveOrders();

    // Polling interval every 8 seconds for real-time kitchen queue updates
    const interval = setInterval(() => {
      loadActiveOrders();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleAdvanceStatus = async (id, nextStatus) => {
    setUpdatingId(id);
    setError('');

    try {
      const response = await apiFetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });

      if (response.success) {
        // Immediately reload list
        loadActiveOrders();
      }
    } catch (err) {
      setError(err.message || 'Failed to update order step');
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

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
          <h1 className="text-3xl font-bold text-base-content font-display">Kitchen Line Queue</h1>
          <p className="text-sm text-base-content/70 mt-1">Live order dispatch and preparation monitor (auto-refreshes)</p>
        </div>
        <button className="btn btn-outline" onClick={loadActiveOrders}>
          Refresh Queue
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Pending */}
        <div className="card bg-base-300 shadow p-4 border border-base-300">
          <h2 className="text-md font-bold mb-4 flex justify-between items-center px-1 font-display border-b border-base-300 pb-2">
            <span>Pending Setup</span>
            <span className="badge badge-warning font-black">{pendingOrders.length}</span>
          </h2>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {pendingOrders.map(ord => (
              <div key={ord._id} className="card bg-base-100 shadow-sm border border-base-300 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-primary">T-{ord.type === 'dine-in' ? `Table ${ord.tableId ? 'Seat' : 'N/A'}` : 'Takeaway'}</span>
                  <span className="text-xs text-base-content/50">{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <ul className="text-xs space-y-1 font-medium border-t border-b border-base-200 py-2">
                  {ord.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{item.name}</span>
                      <span className="font-black text-primary">x{item.qty}</span>
                    </li>
                  ))}
                </ul>
                {ord.notes && <div className="text-[10px] bg-base-200 p-2 rounded italic text-base-content/70">"{ord.notes}"</div>}
                <button 
                  className="btn btn-sm btn-primary w-full"
                  onClick={() => handleAdvanceStatus(ord._id, 'preparing')}
                  disabled={updatingId === ord._id}
                >
                  {updatingId === ord._id ? <span className="loading loading-spinner loading-xs"></span> : 'Start Cooking'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Preparing */}
        <div className="card bg-base-300 shadow p-4 border border-base-300">
          <h2 className="text-md font-bold mb-4 flex justify-between items-center px-1 font-display border-b border-base-300 pb-2">
            <span>In Preparation</span>
            <span className="badge badge-secondary font-black">{preparingOrders.length}</span>
          </h2>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {preparingOrders.map(ord => (
              <div key={ord._id} className="card bg-base-100 shadow-sm border border-base-300 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-primary">T-{ord.type === 'dine-in' ? `Table ${ord.tableId ? 'Seat' : 'N/A'}` : 'Takeaway'}</span>
                  <span className="text-xs text-base-content/50">{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <ul className="text-xs space-y-1 font-medium border-t border-b border-base-200 py-2">
                  {ord.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{item.name}</span>
                      <span className="font-black text-primary">x{item.qty}</span>
                    </li>
                  ))}
                </ul>
                {ord.notes && <div className="text-[10px] bg-base-200 p-2 rounded italic text-base-content/70">"{ord.notes}"</div>}
                <button 
                  className="btn btn-sm btn-secondary w-full"
                  onClick={() => handleAdvanceStatus(ord._id, 'ready')}
                  disabled={updatingId === ord._id}
                >
                  {updatingId === ord._id ? <span className="loading loading-spinner loading-xs"></span> : 'Mark Ready'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Ready */}
        <div className="card bg-base-300 shadow p-4 border border-base-300">
          <h2 className="text-md font-bold mb-4 flex justify-between items-center px-1 font-display border-b border-base-300 pb-2">
            <span>Ready to Serve</span>
            <span className="badge badge-accent font-black">{readyOrders.length}</span>
          </h2>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {readyOrders.map(ord => (
              <div key={ord._id} className="card bg-base-100 shadow-sm border border-base-300 p-4 space-y-3 opacity-90">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-primary">T-{ord.type === 'dine-in' ? `Table ${ord.tableId ? 'Seat' : 'N/A'}` : 'Takeaway'}</span>
                  <span className="text-xs text-base-content/50">{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <ul className="text-xs space-y-1 font-medium border-t border-b border-base-200 py-2">
                  {ord.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{item.name}</span>
                      <span className="font-black text-primary">x{item.qty}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-center py-2 text-xs font-bold text-success/80">
                  Ready. Call waiter to dispatch.
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
