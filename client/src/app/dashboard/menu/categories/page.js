'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [active, setActive] = useState(true);

  // Edit states
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [editActive, setEditActive] = useState(true);

  async function loadCategories() {
    try {
      const response = await apiFetch('/api/menu/categories');
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve categories');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await apiFetch('/api/menu/categories', {
        method: 'POST',
        body: JSON.stringify({ name, slug, sortOrder, active })
      });

      if (response.success) {
        setName('');
        setSlug('');
        setSortOrder(0);
        setActive(true);
        loadCategories();
        document.getElementById('add_category_modal').close();
      }
    } catch (err) {
      setError(err.message || 'Failed to add category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await apiFetch(`/api/menu/categories/${editingCategory._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: editName, slug: editSlug, sortOrder: editSortOrder, active: editActive })
      });

      if (response.success) {
        setEditingCategory(null);
        loadCategories();
        document.getElementById('edit_category_modal').close();
      }
    } catch (err) {
      setError(err.message || 'Failed to update category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    setError('');

    try {
      const response = await apiFetch(`/api/menu/categories/${id}`, {
        method: 'DELETE'
      });

      if (response.success) {
        loadCategories();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete category');
    }
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditSortOrder(cat.sortOrder);
    setEditActive(cat.active);
    document.getElementById('edit_category_modal').showModal();
  };

  const generateSlug = (val) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const generateEditSlug = (val) => {
    setEditName(val);
    setEditSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
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
          <h1 className="text-3xl font-bold text-base-content">Menu Categories</h1>
          <p className="text-sm text-base-content/70 mt-1">Manage restaurant categories to group items on the menu</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => document.getElementById('add_category_modal').showModal()}
        >
          Add Category
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Categories Table */}
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Sort Order</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((item) => (
                <tr key={item._id} className="hover">
                  <td className="font-semibold text-center w-24">{item.sortOrder}</td>
                  <td className="font-bold">{item.name}</td>
                  <td>{item.slug}</td>
                  <td>
                    <span className={`badge text-xs font-semibold ${item.active ? 'badge-success' : 'badge-ghost'}`}>
                      {item.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-right space-x-2">
                    <button className="btn btn-sm btn-outline" onClick={() => openEditModal(item)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-outline btn-error" onClick={() => handleDeleteCategory(item._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      <dialog id="add_category_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg text-primary mb-6">Create New Category</h3>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Category Name</span></label>
              <input type="text" className="input input-bordered w-full" value={name} onChange={e => generateSlug(e.target.value)} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Slug (Unique path URL)</span></label>
              <input type="text" className="input input-bordered w-full" value={slug} onChange={e => setSlug(e.target.value)} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Sort Order (Lower = shows first)</span></label>
              <input type="number" className="input input-bordered w-full" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} required />
            </div>
            <div className="form-control">
              <label className="label cursor-pointer justify-between bg-base-200 p-3 rounded-lg border border-base-300 mt-2">
                <span className="label-text font-semibold">Active Status</span>
                <input type="checkbox" className="toggle toggle-success" checked={active} onChange={e => setActive(e.target.checked)} />
              </label>
            </div>
            <button type="submit" className="btn btn-primary w-full mt-6" disabled={submitting}>
              {submitting ? <span className="loading loading-spinner"></span> : 'Create Category'}
            </button>
          </form>
        </div>
      </dialog>

      {/* Edit Category Modal */}
      <dialog id="edit_category_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg text-primary mb-6">Edit Category</h3>
          <form onSubmit={handleUpdateCategory} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Category Name</span></label>
              <input type="text" className="input input-bordered w-full" value={editName} onChange={e => generateEditSlug(e.target.value)} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Slug</span></label>
              <input type="text" className="input input-bordered w-full" value={editSlug} onChange={e => setEditSlug(e.target.value)} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Sort Order</span></label>
              <input type="number" className="input input-bordered w-full" value={editSortOrder} onChange={e => setEditSortOrder(Number(e.target.value))} required />
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
