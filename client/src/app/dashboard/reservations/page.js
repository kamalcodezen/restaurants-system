'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function ReservationsManager() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [updatingId, setUpdatingId] = useState(null);

  async function loadBookings() {
    try {
      const response = await apiFetch('/api/reservations');
      if (response.success) {
        setBookings(response.data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve reservations log');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  const handleStatusChange = async (id, nextStatus) => {
    setUpdatingId(id);
    setError('');

    try {
      const response = await apiFetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });

      if (response.success) {
        loadBookings();
      }
    } catch (err) {
      setError(err.message || 'Failed to update booking status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'badge-success';
      case 'cancelled': return 'badge-error';
      default: return 'badge-warning';
    }
  };

  const filteredBookings = bookings.filter(b => b.status === statusFilter);

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
        <h1 className="text-3xl font-bold text-base-content font-display">Reservations Manager</h1>
        <p className="text-sm text-base-content/70 mt-1">Review table booking requests and update status details</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="tabs tabs-boxed bg-base-100 p-2 shadow border border-base-300">
        <button className={`tab font-semibold ${statusFilter === 'pending' ? 'tab-active' : ''}`} onClick={() => setStatusFilter('pending')}>Pending Requests</button>
        <button className={`tab font-semibold ${statusFilter === 'confirmed' ? 'tab-active' : ''}`} onClick={() => setStatusFilter('confirmed')}>Confirmed</button>
        <button className={`tab font-semibold ${statusFilter === 'cancelled' ? 'tab-active' : ''}`} onClick={() => setStatusFilter('cancelled')}>Cancelled</button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 text-sm text-base-content/60 card bg-base-100 border border-base-300">
          No reservations found matching this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((book) => (
            <div key={book._id} className="card bg-base-100 shadow border border-base-300 p-6 space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{book.customerName}</h3>
                    <div className="text-xs text-base-content/60 mt-1">{book.customerPhone}</div>
                  </div>
                  <span className={`badge uppercase text-xs font-bold ${getStatusColor(book.status)}`}>
                    {book.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold bg-base-200 p-3 rounded-lg border border-base-300">
                  <div>Date: <span className="font-bold text-primary">{book.date}</span></div>
                  <div>Time: <span className="font-bold text-primary">{book.time}</span></div>
                  <div className="col-span-2">Party Size: <span className="font-bold text-primary">{book.partySize} guests</span></div>
                </div>

                {book.notes && (
                  <div className="bg-base-200 p-2 text-[10px] rounded italic text-base-content/70">
                    "{book.notes}"
                  </div>
                )}
              </div>

              {book.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <button 
                    className="btn btn-sm btn-outline btn-error flex-1"
                    onClick={() => handleStatusChange(book._id, 'cancelled')}
                    disabled={updatingId === book._id}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-sm btn-primary flex-1"
                    onClick={() => handleStatusChange(book._id, 'confirmed')}
                    disabled={updatingId === book._id}
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
