'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function PublicReservationForm() {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = { customerName, customerPhone, date, time, partySize, notes };

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setCustomerName('');
        setCustomerPhone('');
        setDate('');
        setTime('');
        setPartySize(2);
        setNotes('');
      } else {
        setError(data.error || 'Failed to request reservation');
      }
    } catch (err) {
      console.error(err);
      setError('Could not establish connection to the server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-content py-12 px-4 shadow">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight font-display">Book a Table</h1>
          <p className="max-w-md mx-auto text-sm md:text-base text-primary-content/80 font-semibold">
            Reserve your table in advance and skip the line.
          </p>
          <div className="pt-2">
            <Link href="/" className="btn btn-sm btn-outline btn-neutral border-primary-content text-primary-content hover:bg-primary-content hover:text-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-xl mx-auto px-4 mt-8">
        {success ? (
          <div className="card bg-success/20 border border-success/30 p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-success text-success-content flex items-center justify-center mx-auto text-xl font-bold">✓</div>
            <h2 className="text-2xl font-bold text-success">Booking Request Received!</h2>
            <p className="text-sm font-semibold text-base-content/80 max-w-sm mx-auto">
              Your request is pending review. We will contact you at your phone number once confirmed.
            </p>
            <button className="btn btn-primary mt-4" onClick={() => setSuccess(false)}>
              Book Another Table
            </button>
          </div>
        ) : (
          <div className="card bg-base-200 border border-base-300 p-6 md:p-8 shadow-md">
            <h2 className="text-xl font-bold text-primary font-display border-b pb-2 mb-6">Reservation Details</h2>
            
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4 text-sm font-semibold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Your Name</span></label>
                  <input type="text" className="input input-bordered w-full" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Contact Number</span></label>
                  <input type="tel" className="input input-bordered w-full" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Date</span></label>
                  <input type="date" className="input input-bordered w-full" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Time</span></label>
                  <input type="time" className="input input-bordered w-full" value={time} onChange={e => setTime(e.target.value)} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Party Size</span></label>
                  <input type="number" min="1" max="20" className="input input-bordered w-full" value={partySize} onChange={e => setPartySize(Number(e.target.value))} required />
                </div>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Special Requests</span></label>
                <textarea placeholder="e.g. Birthday setup, high chair request, window seat preference" className="textarea textarea-bordered w-full" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              <button type="submit" className="btn btn-primary w-full mt-6" disabled={submitting}>
                {submitting ? <span className="loading loading-spinner"></span> : 'Send Booking Request'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
