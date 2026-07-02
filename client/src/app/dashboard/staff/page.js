'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function StaffManagement() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // New staff form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('waiter');
  const [password, setPassword] = useState('');

  // Edit states
  const [editingStaff, setEditingStaff] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('waiter');
  const [editActive, setEditActive] = useState(true);

  async function loadStaff() {
    try {
      const response = await apiFetch('/api/staff');
      if (response.success) {
        setStaffList(response.data);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
      setError('Could not retrieve staff list');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStaff();
  }, []);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await apiFetch('/api/staff', {
        method: 'POST',
        body: JSON.stringify({ name, email, role, password })
      });

      if (response.success) {
        setName('');
        setEmail('');
        setRole('waiter');
        setPassword('');
        loadStaff();
        document.getElementById('add_staff_modal').close();
      }
    } catch (err) {
      setError(err.message || 'Failed to add staff');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await apiFetch(`/api/staff/${editingStaff._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: editName, role: editRole, active: editActive })
      });

      if (response.success) {
        setEditingStaff(null);
        loadStaff();
        document.getElementById('edit_staff_modal').close();
      }
    } catch (err) {
      setError(err.message || 'Failed to update staff');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setEditName(staff.name);
    setEditRole(staff.role);
    setEditActive(staff.active);
    document.getElementById('edit_staff_modal').showModal();
  };

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
          <h1 className="text-3xl font-bold text-base-content">Staff Management</h1>
          <p className="text-sm text-base-content/70 mt-1">Manage operations team, system credentials and permissions</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => document.getElementById('add_staff_modal').showModal()}
        >
          Add Staff Member
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Staff Table */}
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((item) => (
                <tr key={item._id} className="hover">
                  <td className="font-semibold">{item.name}</td>
                  <td>{item.email}</td>
                  <td>
                    <span className={`badge uppercase text-xs font-black ${
                      item.role === 'admin' ? 'badge-primary' : 
                      item.role === 'kitchen' ? 'badge-secondary' : 'badge-accent'
                    }`}>
                      {item.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge text-xs font-semibold ${item.active ? 'badge-success' : 'badge-ghost'}`}>
                      {item.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="btn btn-sm btn-outline" onClick={() => openEditModal(item)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      <dialog id="add_staff_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg text-primary mb-6">Create New Staff Member</h3>
          <form onSubmit={handleAddStaff} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Full Name</span></label>
              <input type="text" className="input input-bordered w-full" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Email</span></label>
              <input type="email" className="input input-bordered w-full" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Role</span></label>
              <select className="select select-bordered w-full" value={role} onChange={e => setRole(e.target.value)}>
                <option value="waiter">Waiter</option>
                <option value="kitchen">Kitchen</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Temporary Password</span></label>
              <input type="password" className="input input-bordered w-full" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-full mt-6" disabled={submitting}>
              {submitting ? <span className="loading loading-spinner"></span> : 'Create Account'}
            </button>
          </form>
        </div>
      </dialog>

      {/* Edit Staff Modal */}
      <dialog id="edit_staff_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg text-primary mb-6">Edit Staff Member</h3>
          <form onSubmit={handleUpdateStaff} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Full Name</span></label>
              <input type="text" className="input input-bordered w-full" value={editName} onChange={e => setEditName(e.target.value)} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Role</span></label>
              <select className="select select-bordered w-full" value={editRole} onChange={e => setEditRole(e.target.value)}>
                <option value="waiter">Waiter</option>
                <option value="kitchen">Kitchen</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer justify-between bg-base-200 p-3 rounded-lg border border-base-300 mt-2">
                <span className="label-text font-semibold">Active Status</span>
                <input type="checkbox" className="toggle toggle-success" checked={editActive} onChange={e => setEditActive(e.target.checked)} />
              </label>
            </div>
            <button type="submit" className="btn btn-primary w-full mt-6" disabled={submitting}>
              {submitting ? <span className="loading loading-spinner"></span> : 'Save Changes'}
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
}
