'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function TablesManagement() {
  const [tables, setTables] = useState([]);
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form states (Add)
  const [number, setNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Selected table for Edit Modal
  const [selectedTable, setSelectedTable] = useState(null);
  const [editNumber, setEditNumber] = useState('');
  const [editCapacity, setEditCapacity] = useState('');
  const [editStatus, setEditStatus] = useState('free');
  const [editLocation, setEditLocation] = useState('');
  const [editNotes, setEditNotes] = useState('');

  async function loadData() {
    try {
      const [staffRes, tablesRes] = await Promise.all([
        apiFetch('/api/staff/me'),
        apiFetch('/api/tables')
      ]);

      if (staffRes.success) setStaff(staffRes.data);
      if (tablesRes.success) setTables(tablesRes.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve table data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleAddTable = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await apiFetch('/api/tables', {
        method: 'POST',
        body: JSON.stringify({ number, capacity, location, notes })
      });

      if (response.success) {
        setNumber('');
        setCapacity('');
        setLocation('');
        setNotes('');
        loadData();
        document.getElementById('add_table_modal').close();
      }
    } catch (err) {
      setError(err.message || 'Failed to add table');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTable = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Waiter can only update status, others are disabled on form
    const payload = staff?.role === 'waiter' 
      ? { status: editStatus }
      : { number: editNumber, capacity: editCapacity, status: editStatus, location: editLocation, notes: editNotes };

    try {
      const response = await apiFetch(`/api/tables/${selectedTable._id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      if (response.success) {
        setSelectedTable(null);
        loadData();
        document.getElementById('edit_table_modal').close();
      }
    } catch (err) {
      setError(err.message || 'Failed to update table');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTable = async (id) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    setError('');

    try {
      const response = await apiFetch(`/api/tables/${id}`, {
        method: 'DELETE'
      });

      if (response.success) {
        setSelectedTable(null);
        loadData();
        document.getElementById('edit_table_modal').close();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete table');
    }
  };

  const openEditModal = (tbl) => {
    setSelectedTable(tbl);
    setEditNumber(tbl.number);
    setEditCapacity(tbl.capacity);
    setEditStatus(tbl.status);
    setEditLocation(tbl.location);
    setEditNotes(tbl.notes);
    document.getElementById('edit_table_modal').showModal();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied': return 'bg-error text-error-content border-error';
      case 'reserved': return 'bg-warning text-warning-content border-warning';
      default: return 'bg-success text-success-content border-success';
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const isAdmin = staff?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Restaurant Seating</h1>
          <p className="text-sm text-base-content/70 mt-1">Real-time table status grid and table allocations</p>
        </div>
        {isAdmin && (
          <button 
            className="btn btn-primary" 
            onClick={() => document.getElementById('add_table_modal').showModal()}
          >
            Add Table
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Seating Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {tables.map((tbl) => (
          <div 
            key={tbl._id} 
            className={`card shadow hover:shadow-lg border cursor-pointer transition-all ${getStatusColor(tbl.status)}`}
            onClick={() => openEditModal(tbl)}
          >
            <div className="card-body p-6 text-center space-y-2">
              <h2 className="text-3xl font-black">T-{tbl.number}</h2>
              <div className="text-xs uppercase font-bold tracking-wider">{tbl.status}</div>
              <div className="text-xs font-semibold opacity-85">Cap: {tbl.capacity} Pax</div>
              {tbl.location && (
                <div className="badge badge-sm badge-outline text-[10px] mx-auto opacity-75">{tbl.location}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Table Modal */}
      <dialog id="add_table_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg text-primary mb-6">Create New Table</h3>
          <form onSubmit={handleAddTable} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Table Number</span></label>
              <input type="number" min="1" className="input input-bordered w-full" value={number} onChange={e => setNumber(e.target.value)} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Seating Capacity</span></label>
              <input type="number" min="1" className="input input-bordered w-full" value={capacity} onChange={e => setCapacity(e.target.value)} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Location / Description (Optional)</span></label>
              <input type="text" placeholder="e.g. Patio, Window side" className="input input-bordered w-full" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Internal Notes</span></label>
              <textarea placeholder="Any special seating notes" className="textarea textarea-bordered w-full" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary w-full mt-6" disabled={submitting}>
              {submitting ? <span className="loading loading-spinner"></span> : 'Create Table'}
            </button>
          </form>
        </div>
      </dialog>

      {/* Edit Table / Status Modal */}
      <dialog id="edit_table_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg text-primary mb-6">
            Table T-{selectedTable?.number} Management
          </h3>
          <form onSubmit={handleUpdateTable} className="space-y-4">
            {/* Status Dropdown - Editable by Waiter and Admin */}
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Seating Status</span></label>
              <select className="select select-bordered w-full" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                <option value="free">Free</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>

            {/* Other Fields - Disabled for Waiter, Editable by Admin */}
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Table Number</span></label>
              <input 
                type="number" 
                min="1" 
                className="input input-bordered w-full" 
                value={editNumber} 
                onChange={e => setEditNumber(e.target.value)} 
                required 
                disabled={!isAdmin} 
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Seating Capacity</span></label>
              <input 
                type="number" 
                min="1" 
                className="input input-bordered w-full" 
                value={editCapacity} 
                onChange={e => setEditCapacity(e.target.value)} 
                required 
                disabled={!isAdmin} 
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Location / Description</span></label>
              <input 
                type="text" 
                className="input input-bordered w-full" 
                value={editLocation} 
                onChange={e => setEditLocation(e.target.value)} 
                disabled={!isAdmin} 
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Internal Notes</span></label>
              <textarea 
                className="textarea textarea-bordered w-full" 
                value={editNotes} 
                onChange={e => setEditNotes(e.target.value)} 
                disabled={!isAdmin} 
              />
            </div>

            <div className="flex gap-2 mt-6">
              {isAdmin && (
                <button 
                  type="button" 
                  className="btn btn-outline btn-error flex-none" 
                  onClick={() => handleDeleteTable(selectedTable?._id)}
                >
                  Delete Table
                </button>
              )}
              <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
                {submitting ? <span className="loading loading-spinner"></span> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}
