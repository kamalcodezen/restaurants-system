'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PublicMenuViewer() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  async function loadMenu() {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const [catsRes, itemsRes] = await Promise.all([
        fetch(`${API_URL}/api/menu/categories`),
        fetch(`${API_URL}/api/menu`)
      ]);

      const catsData = await catsRes.json();
      const itemsData = await itemsRes.json();

      if (catsData.success) {
        // Filter out inactive categories for the public view
        setCategories(catsData.data.filter(c => c.active));
      }
      if (itemsData.success) {
        setItems(itemsData.data);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load menu details. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMenu();
  }, []);

  // Filter items by category tab and search query
  const filteredItems = items.filter(item => {
    const matchesCategory = activeTab === 'all' || item.categoryId === activeTab;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-content py-12 px-4 shadow">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight font-display">Our Gourmet Menu</h1>
          <p className="max-w-md mx-auto text-sm md:text-base text-primary-content/80 font-semibold">
            Fresh ingredients, crafted by experts, delivered straight to your plate.
          </p>
          <div className="pt-2">
            <Link href="/" className="btn btn-sm btn-outline btn-neutral border-primary-content text-primary-content hover:bg-primary-content hover:text-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {/* Search & Tabs Row */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          {/* Tabs */}
          <div className="tabs tabs-boxed bg-base-200 p-1 flex-wrap gap-1">
            <button 
              className={`tab font-semibold ${activeTab === 'all' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button 
                key={cat._id}
                className={`tab font-semibold ${activeTab === cat._id ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(cat._id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="form-control w-full md:max-w-xs">
            <input 
              type="text" 
              placeholder="Search dishes..." 
              className="input input-bordered w-full"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Dishes Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-base-content/60 font-semibold card bg-base-200 border border-base-300">
            No dishes match your selection.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div key={item._id} className="card bg-base-200 hover:bg-base-300 shadow hover:shadow-lg transition-all border border-base-300">
                <div className="card-body p-6 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="card-title font-bold text-lg leading-tight">{item.name}</h3>
                      <span className="text-primary font-black text-xl">${Number(item.price).toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-base-content/70 leading-relaxed">
                      {item.description || 'No description available for this item.'}
                    </p>
                  </div>
                  <div className="card-actions justify-end mt-4">
                    <span className="badge badge-sm badge-outline badge-primary font-bold uppercase">
                      {categories.find(c => c._id === item.categoryId)?.name || 'Dish'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
