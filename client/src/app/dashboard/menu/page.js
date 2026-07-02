'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Form states
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [available, setAvailable] = useState(true);

  // Edit states
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAvailable, setEditAvailable] = useState(true);

  async function loadData() {
    try {
      const [catsRes, itemsRes] = await Promise.all([
        apiFetch('/api/menu/categories'),
        apiFetch('/api/menu')
      ]);

      if (catsRes.success) setCategories(catsRes.data);
      if (itemsRes.success) setItems(itemsRes.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve menu details');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await apiFetch('/api/menu', {
        method: 'POST',
        body: JSON.stringify({ categoryId, name, price, description, available })
      });

      if (response.success) {
        setName('');
        setCategoryId('');
        setPrice('');
        setDescription('');
        setAvailable(true);
        loadData();
        document.getElementById('add_item_modal').close();
      }
    } catch (err) {
      setError(err.message || 'Failed to add menu item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await apiFetch(`/api/menu/${editingItem._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          categoryId: editCategoryId,
          name: editName,
          price: editPrice,
          description: editDescription,
          available: editAvailable
        })
      });

      if (response.success) {
        setEditingItem(null);
        loadData();
        document.getElementById('edit_item_modal').close();
      }
    } catch (err) {
      setError(err.message || 'Failed to update menu item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    setError('');

    try {
      const response = await apiFetch(`/api/menu/${id}`, {
        method: 'DELETE'
      });

      if (response.success) {
        loadData();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete item');
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditCategoryId(item.categoryId);
    setEditPrice(item.price);
    setEditDescription(item.description);
    setEditAvailable(item.available);
    document.getElementById('edit_item_modal').showModal();
  };

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c._id === catId);
    return cat ? cat.name : 'Unknown';
  };

  const filteredItems = selectedCategoryFilter === 'all' 
    ? items 
    : items.filter(item => item.categoryId === selectedCategoryFilter);

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
          <h1 className="text-3xl font-bold text-base-content">Menu Items</h1>
          <p className="text-sm text-base-content/70 mt-1">Manage restaurant dishes, pricing, and availability</p>
        </div>
        <div className="flex gap-2">
          <a href="/dashboard/menu/categories" className="btn btn-outline">
            Manage Categories
          </a>
          <button 
            className="btn btn-primary" 
            onClick={() => document.getElementById('add_item_modal').showModal()}
          >
            Add Menu Item
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="tabs tabs-boxed bg-base-100 p-2 shadow border border-base-300">
        <button 
          className={`tab font-semibold ${selectedCategoryFilter === 'all' ? 'tab-active' : ''}`}
          onClick={() => setSelectedCategoryFilter('all')}
        >
          All Items
        </button>
        {categories.map(cat => (
          <button 
            key={cat._id}
            className={`tab font-semibold ${selectedCategoryFilter === cat._id ? 'tab-active' : ''}`}
            onClick={() => setSelectedCategoryFilter(cat._id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Items Table */}
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item._id} className="hover">
                  <td>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-xs text-base-content/60 truncate max-w-xs">{item.description || 'No description'}</div>
                  </td>
                  <td>
                    <span className="badge badge-sm badge-neutral">{getCategoryName(item.categoryId)}</span>
                  </td>
                  <td className="font-bold text-primary">${Number(item.price).toFixed(2)}</td>
                  <td>
                    <span className={`badge text-xs font-semibold ${item.available ? 'badge-success' : 'badge-ghost'}`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="text-right space-x-2">
                    <button className="btn btn-sm btn-outline" onClick={() => openEditModal(item)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-outline btn-error" onClick={() => handleDeleteItem(item._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      <dialog id="add_item_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg text-primary mb-6">Create New Menu Item</h3>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Dish Name</span></label>
              <input type="text" className="input input-bordered w-full" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Category</span></label>
              <select className="select select-bordered w-full" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Price ($)</span></label>
              <input type="number" step="0.01" min="0" className="input input-bordered w-full" value={price} onChange={e => setPrice(e.target.value)} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Description</span></label>
              <textarea className="textarea textarea-bordered w-full" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="form-control">
              <label className="label cursor-pointer justify-between bg-base-200 p-3 rounded-lg border border-base-300 mt-2">
                <span className="label-text font-semibold">Available Status</span>
                <input type="checkbox" className="toggle toggle-success" checked={available} onChange={e => setAvailable(e.target.checked)} />
              </label>
            </div>
            <button type="submit" className="btn btn-primary w-full mt-6" disabled={submitting}>
              {submitting ? <span className="loading loading-spinner"></span> : 'Create Dish'}
            </button>
          </form>
        </div>
      </dialog>

      {/* Edit Item Modal */}
      <dialog id="edit_item_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg text-primary mb-6">Edit Menu Item</h3>
          <form onSubmit={handleUpdateItem} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Dish Name</span></label>
              <input type="text" className="input input-bordered w-full" value={editName} onChange={e => setEditName(e.target.value)} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Category</span></label>
              <select className="select select-bordered w-full" value={editCategoryId} onChange={e => setEditCategoryId(e.target.value)} required>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Price ($)</span></label>
              <input type="number" step="0.01" min="0" className="input input-bordered w-full" value={editPrice} onChange={e => setEditPrice(e.target.value)} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Description</span></label>
              <textarea className="textarea textarea-bordered w-full" value={editDescription} onChange={e => setEditDescription(e.target.value)} />
            </div>
            <div className="form-control">
              <label className="label cursor-pointer justify-between bg-base-200 p-3 rounded-lg border border-base-300 mt-2">
                <span className="label-text font-semibold">Available Status</span>
                <input type="checkbox" className="toggle toggle-success" checked={editAvailable} onChange={e => setEditAvailable(e.target.checked)} />
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
