'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function BillingLog() {
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadBillingData() {
    try {
      const [ordersRes, billsRes] = await Promise.all([
        apiFetch('/api/orders'),
        apiFetch('/api/bills')
      ]);

      if (ordersRes.success) {
        // Filter orders that are served (needs checkout)
        setOrders(ordersRes.data.filter(o => o.status === 'served'));
      }
      if (billsRes.success) {
        setBills(billsRes.data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve invoices and checks log');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBillingData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-base-content font-display">Invoicing & Checkout</h1>
        <p className="text-sm text-base-content/70 mt-1">Review active checks ready for cashier settlement and checkout history</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Served Checks awaiting payment */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold font-display border-b pb-2 text-primary">Served Checks Awaiting Payment</h2>
          {orders.length === 0 ? (
            <div className="text-center py-12 text-sm text-base-content/60 card bg-base-100 border border-base-300">
              No checks are currently waiting for settlement.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((ord) => (
                <div key={ord._id} className="card bg-base-100 shadow border border-base-300 p-6 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">{ord.orderNumber}</span>
                      <span className="badge badge-sm badge-outline uppercase font-bold">{ord.type}</span>
                    </div>
                    <div className="text-sm font-semibold">
                      {ord.type === 'dine-in' ? `Table Seat (Occupied)` : `Takeaway - ${ord.customerName}`}
                    </div>
                    <div className="text-xs text-base-content/70">
                      Served: {ord.servedAt ? new Date(ord.servedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </div>
                    <div className="text-lg font-black text-primary">${Number(ord.total).toFixed(2)}</div>
                  </div>
                  <Link href={`/dashboard/billing/${ord._id}`} className="btn btn-primary w-full">
                    Settle & Checkout
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Invoices History */}
        <div className="card bg-base-100 shadow border border-base-300 p-6 self-start space-y-4">
          <h2 className="text-lg font-bold text-primary font-display border-b pb-2">Checkout History</h2>
          {bills.length === 0 ? (
            <div className="text-center py-8 text-xs text-base-content/60">No payment history yet</div>
          ) : (
            <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {bills.map((bill) => (
                <li key={bill._id} className="flex justify-between items-center bg-base-200 p-3 rounded border border-base-300 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-primary">{bill.orderNumber}</div>
                    <div className="text-[10px] text-base-content/60">{new Date(bill.paidAt || bill.createdAt).toLocaleDateString()}</div>
                    <div className="badge badge-xs badge-success capitalize">{bill.paymentMethod}</div>
                  </div>
                  <div className="text-right font-black text-sm">${Number(bill.total).toFixed(2)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
