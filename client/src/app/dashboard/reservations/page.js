'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function ReservationsManager() {
  const [bookings, setBookings] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [updatingId, setUpdatingId] = useState(null);

  // Seating guest selection state
  const [seatingBooking, setSeatingBooking] = useState(null);
  const [selectedTableId, setSelectedTableId] = useState('');

  async function loadData() {
    try {
      const [bookingsRes, tablesRes] = await Promise.all([
        apiFetch('/api/reservations'),
        apiFetch('/api/tables')
      ]);

      if (bookingsRes.success) {
        setBookings(bookingsRes.data);
      }
      if (tablesRes.success) {
        // Only fetch free tables for selection
        setTables(tablesRes.data.filter(t => t.status === 'free'));
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve reservations data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
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
        loadData();
      }
    } catch (err) {
      setError(err.message || 'Failed to update booking status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSeatGuest = async (e) => {
    e.preventDefault();
    if (!selectedTableId) return;
    setUpdatingId(seatingBooking._id);
    setError('');

    try {
      const response = await apiFetch(`/api/reservations/${seatingBooking._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'seated', tableId: selectedTableId })
      });

      if (response.success) {
        setSeatingBooking(null);
        setSelectedTableId('');
        loadData();
        document.getElementById('seat_guest_modal').close();
      }
    } catch (err) {
      setError(err.message || 'Failed to seat guest');
    } finally {
      setUpdatingId(null);
    }
  };

  const openSeatingModal = (book) => {
    setSeatingBooking(book);
    document.getElementById('seat_guest_modal').showModal();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'badge-success';
      case 'cancelled': return 'badge-error';
      case 'seated': return 'badge-info';
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-base-content font-display">Reservations Manager</h1>
          <p className="text-sm text-base-content/70 mt-1">Review table booking requests and seat guests upon arrival</p>
        </div>
        <button className="btn btn-outline" onClick={loadData}>
          Refresh List
        </button>
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
        <button className={`tab font-semibold ${statusFilter === 'seated' ? 'tab-active' : ''}`} onClick={() => setStatusFilter('seated')}>Seated Guests</button>
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

              {book.status === 'confirmed' && (
                <div className="flex gap-2 pt-2">
                  <button 
                    className="btn btn-sm btn-outline btn-error flex-none"
                    onClick={() => handleStatusChange(book._id, 'cancelled')}
                    disabled={updatingId === book._id}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-sm btn-primary flex-1"
                    onClick={() => openSeatingModal(book)}
                    disabled={updatingId === book._id}
                  >
                    Seat Guest
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Seat Guest Table Selector Modal */}
      <dialog id="seat_guest_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg text-primary mb-6">Assign Table to Seated Guest</h3>
          <form onSubmit={handleSeatGuest} className="space-y-4 font-semibold text-sm">
            <div className="form-control">
              <label className="label"><span className="label-text">Select Table</span></label>
              <select className="select select-bordered w-full" value={selectedTableId} onChange={e => setSelectedTableId(e.target.value)} required>
                <option value="">Choose Table</option>
                {tables.map(t => (
                  <option key={t._id} value={t._id}>Table T-{t.number} (Cap: {t.capacity}) - {t.location}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-full mt-6" disabled={updatingId !== null}>
              {updatingId !== null ? <span className="loading loading-spinner"></span> : 'Seat Guest & Occupy Table'}
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
}
