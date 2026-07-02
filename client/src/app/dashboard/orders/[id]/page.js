'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  async function loadData() {
    try {
      const [staffRes, orderRes] = await Promise.all([
        apiFetch('/api/staff/me'),
        apiFetch(`/api/orders/${id}`)
      ]);

      if (staffRes.success) setStaff(staffRes.data);
      if (orderRes.success) setOrder(orderRes.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve order details');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  const handleStatusTransition = async (newStatus) => {
    setUpdating(true);
    setError('');

    try {
      const response = await apiFetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.success) {
        setOrder(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!order) return null;

  const isBilled = order.status === 'billed';
  const isServed = order.status === 'served';
  const isReady = order.status === 'ready';
  const isPreparing = order.status === 'preparing';
  const isPending = order.status === 'pending';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-base-content font-display">Order details</h1>
          <p className="text-sm text-base-content/70 mt-1">Order Ref: <span className="font-bold text-primary">{order.orderNumber}</span></p>
        </div>
        <Link href="/dashboard/orders" className="btn btn-outline">
          Back to List
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 shadow border border-base-300 p-6 space-y-4">
            <h2 className="text-lg font-bold text-primary font-display border-b pb-2">Line Items</h2>
            <div className="overflow-x-auto">
              <table className="table w-full text-xs">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th className="text-center">Qty</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover">
                      <td className="font-semibold">{item.name}</td>
                      <td className="text-center font-bold">{item.qty}</td>
                      <td className="text-right">${Number(item.price).toFixed(2)}</td>
                      <td className="text-right font-bold">${Number(item.lineTotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-end text-sm font-bold border-t pt-4 gap-1">
              <div>Subtotal: ${Number(order.subtotal).toFixed(2)}</div>
              <div className="text-lg text-primary font-black">Total: ${Number(order.total).toFixed(2)}</div>
            </div>
          </div>

          {order.notes && (
            <div className="card bg-base-100 shadow border border-base-300 p-6">
              <h3 className="font-bold text-sm text-primary mb-2 uppercase text-xs tracking-wider">Kitchen Notes</h3>
              <p className="text-sm bg-base-200 p-3 rounded border border-base-300 font-semibold">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          {/* Order Actions */}
          <div className="card bg-base-100 shadow border border-base-300 p-6 space-y-4">
            <h3 className="text-lg font-bold text-primary font-display border-b pb-2">Order Status</h3>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span>Current Status:</span>
                <span className="badge badge-primary uppercase font-bold text-xs">{order.status}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold">
                <span>Service Type:</span>
                <span className="capitalize font-semibold">{order.type}</span>
              </div>
              {order.type === 'dine-in' && (
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span>Table Alloc:</span>
                  <span className="badge badge-outline font-bold">Occupied</span>
                </div>
              )}
            </div>

            {/* Transition Control Action Buttons */}
            <div className="pt-4 border-t border-base-300 space-y-2">
              {isPending && (
                <button 
                  className="btn btn-primary w-full"
                  onClick={() => handleStatusTransition('preparing')}
                  disabled={updating}
                >
                  {updating ? <span className="loading loading-spinner"></span> : 'Start Preparing'}
                </button>
              )}

              {isPreparing && (
                <button 
                  className="btn btn-secondary w-full"
                  onClick={() => handleStatusTransition('ready')}
                  disabled={updating}
                >
                  {updating ? <span className="loading loading-spinner"></span> : 'Mark as Ready'}
                </button>
              )}

              {isReady && (
                <button 
                  className="btn btn-success w-full"
                  onClick={() => handleStatusTransition('served')}
                  disabled={updating || !['admin', 'waiter'].includes(staff?.role)}
                >
                  {updating ? <span className="loading loading-spinner"></span> : 'Mark as Served'}
                </button>
              )}

              {isServed && (
                <div className="text-center p-3 bg-base-200 rounded border text-xs font-semibold text-base-content/85">
                  Order is served. Waiting for billing to process payment.
                </div>
              )}

              {isBilled && (
                <div className="text-center p-3 bg-success/20 border border-success/30 text-success text-xs font-bold rounded">
                  Order complete and paid.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
