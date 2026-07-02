'use client';
import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CustomerBillContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  async function loadBillSummary() {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/orders/${id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      } else {
        setError(data.error || 'Failed to fetch bill summary');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  }

  async function handleStripePay() {
    setPaying(true);
    setPayError('');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/payments/checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: id }),
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        setPayError(data.error || 'Failed to initialize payment session');
        setPaying(false);
      }
    } catch (err) {
      console.error(err);
      setPayError('Could not contact payment server');
      setPaying(false);
    }
  }

  useEffect(() => {
    loadBillSummary();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-base-200 p-4 text-center">
        <h1 className="text-2xl font-bold text-error">Error</h1>
        <p className="mt-2 text-sm text-base-content/70">{error || 'Order not found'}</p>
        <Link href="/menu" className="btn btn-primary mt-6">Back to Menu</Link>
      </div>
    );
  }

  const subtotal = order.subtotal || 0;
  const tax = subtotal * 0.10; // 10% tax rate
  const total = subtotal + tax;
  const isPaid = order.status === 'billed';

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4 flex flex-col items-center">
      <div className="card w-full max-w-md bg-base-100 shadow-md border border-base-300 p-6 md:p-8 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2 border-b border-base-300 pb-6">
          <h1 className="text-2xl font-black font-display text-primary uppercase tracking-wider">Gourmet Haven</h1>
          <p className="text-xs text-base-content/60 font-semibold">123 Foodie Street, Flavor Town</p>
          <p className="text-xs text-base-content/60 font-semibold">Phone: 123-456-7890</p>
        </div>

        {/* Success/Canceled Alerts */}
        {success && (
          <div className="alert alert-success text-xs font-bold py-3 text-center no-print">
            Payment successful! Bill is marked paid.
          </div>
        )}
        {canceled && (
          <div className="alert alert-warning text-xs font-bold py-3 text-center no-print">
            Payment was cancelled. You can try again.
          </div>
        )}
        {payError && (
          <div className="alert alert-error text-xs font-bold py-3 text-center no-print">
            {payError}
          </div>
        )}

        {/* Invoice metadata */}
        <div className="text-xs font-semibold space-y-1">
          <div className="flex justify-between">
            <span>Invoice Ref:</span>
            <span className="font-bold">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Service Type:</span>
            <span className="capitalize">{order.type}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span>Payment Status:</span>
            <span className={`badge badge-sm font-bold ${isPaid ? 'badge-success' : 'badge-warning'}`}>
              {isPaid ? 'PAID' : 'UNPAID'}
            </span>
          </div>
        </div>

        {/* Items details */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-base-content/65 border-b pb-1">Billing Details</h3>
          <ul className="text-xs space-y-2">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex justify-between items-start">
                <div>
                  <div className="font-bold">{item.name}</div>
                  <div className="text-[10px] text-base-content/60">{item.qty} x ${Number(item.price).toFixed(2)}</div>
                </div>
                <div className="font-bold">${Number(item.lineTotal).toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing calculations */}
        <div className="border-t border-dashed border-base-300 pt-4 space-y-2 text-xs font-semibold">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${Number(subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base-content/75">
            <span>Tax (10%):</span>
            <span>${Number(tax).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-primary pt-2 border-t border-base-300">
            <span>Total Amount:</span>
            <span>${Number(total).toFixed(2)}</span>
          </div>
        </div>

        {/* Footer/Receipt controls */}
        <div className="text-center pt-4 space-y-3">
          {!isPaid && (
            <button 
              onClick={handleStripePay} 
              disabled={paying}
              className="btn btn-primary btn-sm w-full no-print font-bold uppercase tracking-wider"
            >
              {paying ? <span className="loading loading-spinner loading-xs"></span> : 'Pay Online with Stripe'}
            </button>
          )}

          <button 
            onClick={() => window.print()} 
            className="btn btn-outline btn-sm w-full no-print font-bold uppercase tracking-wider"
          >
            Print Receipt
          </button>
          <Link href={`/order/${id}`} className="text-xs text-primary font-bold hover:underline block no-print pt-2">
            Back to Status Tracker
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CustomerBillSummary() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    }>
      <CustomerBillContent />
    </Suspense>
  );
}
