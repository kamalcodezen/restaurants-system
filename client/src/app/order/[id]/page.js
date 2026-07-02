'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function PublicOrderTracker() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadOrder() {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/orders/${id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      } else {
        setError(data.error || 'Failed to fetch order status');
      }
    } catch (err) {
      console.error(err);
      setError('Could not establish connection to the server');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();

    const interval = setInterval(() => {
      loadOrder();
    }, 10000); // Poll order status every 10s for customer updates

    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-base-200 p-4 text-center">
        <h1 className="text-2xl font-bold text-error">Error</h1>
        <p className="mt-2 text-sm text-base-content/70">{error}</p>
        <Link href="/menu" className="btn btn-primary mt-6">Back to Menu</Link>
      </div>
    );
  }

  const statusSteps = ['pending', 'preparing', 'ready', 'served', 'billed'];
  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-base-100 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-content py-8 px-4 shadow">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left space-y-1">
            <h1 className="text-3xl font-black font-display">Track Your Order</h1>
            <p className="text-xs text-primary-content/85 font-semibold">Ref Number: {order.orderNumber}</p>
          </div>
          <Link href="/menu" className="btn btn-sm btn-outline btn-neutral border-primary-content text-primary-content hover:bg-primary-content hover:text-primary">
            Back to Menu
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Status tracker */}
        <div className="lg:col-span-2 card bg-base-200 border border-base-300 p-6 space-y-6">
          <h2 className="text-lg font-bold font-display border-b pb-2 text-primary">Status Tracker</h2>
          
          {/* Custom Visual Timeline */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-2">
            {statusSteps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step} className="flex flex-row md:flex-col items-center gap-2 flex-1 text-center w-full md:w-auto">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    isCurrent ? 'bg-primary text-primary-content ring-4 ring-primary/30 animate-pulse' :
                    isCompleted ? 'bg-success text-success-content' : 'bg-base-300 text-base-content/40'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 text-left md:text-center">
                    <div className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-base-content' : 'text-base-content/40'}`}>
                      {step}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Helper Info Banner */}
          <div className="bg-base-100 p-4 rounded-lg border border-base-300 text-center font-semibold text-sm">
            {order.status === 'pending' && 'Chef is checking your order details.'}
            {order.status === 'preparing' && 'Ingredients are cooking in the kitchen!'}
            {order.status === 'ready' && 'Order is ready! Waiter is serving it shortly.'}
            {order.status === 'served' && 'Bon Appetit! Order is served at your table.'}
            {order.status === 'billed' && 'Payment verified. Thank you for dining with us!'}
          </div>
        </div>

        {/* Order Details summary */}
        <div className="card bg-base-200 border border-base-300 p-6 self-start space-y-4">
          <h2 className="text-lg font-bold font-display border-b pb-2 text-primary">Your Order</h2>
          <ul className="text-xs space-y-2 max-h-48 overflow-y-auto pr-1">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex justify-between items-center bg-base-100 p-2 rounded border border-base-300">
                <div className="font-semibold">{item.name} <span className="text-primary font-black">x{item.qty}</span></div>
                <div className="font-bold">${Number(item.lineTotal).toFixed(2)}</div>
              </li>
            ))}
          </ul>

          <div className="border-t border-base-300 pt-3 flex justify-between items-center text-sm font-bold">
            <span>Total Cost:</span>
            <span className="text-lg text-primary font-black">${Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
