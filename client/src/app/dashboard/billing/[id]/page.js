'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function CheckoutInvoice() {
  const { id } = useParams(); // this is the orderId
  const [bill, setBill] = useState(null);
  const [order, setOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function loadData() {
    try {
      // First get or initialize the bill
      const billRes = await apiFetch(`/api/bills/order/${id}`);
      if (billRes.success) {
        setBill(billRes.data);
      }

      // Get associated order details
      const orderRes = await apiFetch(`/api/orders/${id}`);
      if (orderRes.success) {
        setOrder(orderRes.data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve checkout details');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  const handlePayBill = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await apiFetch(`/api/bills/${bill._id}/pay`, {
        method: 'POST',
        body: JSON.stringify({ paymentMethod })
      });

      if (response.success) {
        router.push('/dashboard/billing');
      }
    } catch (err) {
      setError(err.message || 'Failed to record checkout payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!bill || !order) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-base-content font-display">Invoice Checkout</h1>
          <p className="text-sm text-base-content/70 mt-1">Review guest check summary for Ref: <span className="font-bold text-primary">{bill.orderNumber}</span></p>
        </div>
        <Link href="/dashboard/billing" className="btn btn-outline">
          Cancel
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice breakdown */}
        <div className="lg:col-span-2 card bg-base-100 shadow border border-base-300 p-6 space-y-4">
          <h2 className="text-lg font-bold text-primary font-display border-b pb-2">Itemized Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="table w-full text-xs">
              <thead>
                <tr>
                  <th>Dish Name</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Unit Price</th>
                  <th className="text-right">Line Total</th>
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
        </div>

        {/* Payment Checkout Panel */}
        <div className="card bg-base-100 shadow border border-base-300 p-6 self-start space-y-4">
          <h2 className="text-lg font-bold text-primary font-display border-b pb-2">Summary & Settlement</h2>
          
          <div className="space-y-2 text-sm font-semibold border-b pb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${Number(bill.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base-content/70">
              <span>Service Tax (10%):</span>
              <span>${Number(bill.tax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-primary pt-2 border-t border-dashed border-base-300">
              <span>Grand Total:</span>
              <span>${Number(bill.total).toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handlePayBill} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Payment Option</span></label>
              <select className="select select-bordered w-full" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="cash">Cash Payment</option>
                <option value="card">Card / POS terminal</option>
                <option value="mobile">Mobile Money / UPI</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4" disabled={submitting || bill.status === 'paid'}>
              {submitting ? <span className="loading loading-spinner"></span> : 'Record Payment & Close Check'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
