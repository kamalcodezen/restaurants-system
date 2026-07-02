'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function NewOrder() {
  const [type, setType] = useState('dine-in');
  const [tableId, setTableId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orderItems, setOrderItems] = useState([]); // Array of { menuItemId, name, price, qty }

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function loadData() {
    try {
      const [tablesRes, catsRes, itemsRes] = await Promise.all([
        apiFetch('/api/tables'),
        apiFetch('/api/menu/categories'),
        apiFetch('/api/menu')
      ]);

      if (tablesRes.success) {
        setTables(tablesRes.data.filter(t => t.status === 'free'));
      }
      if (catsRes.success) {
        setCategories(catsRes.data.filter(c => c.active));
      }
      if (itemsRes.success) {
        setMenuItems(itemsRes.data.filter(i => i.available));
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve required setup details');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleAddItem = (dish) => {
    setOrderItems((prev) => {
      const existing = prev.find(item => item.menuItemId === dish._id);
      if (existing) {
        return prev.map(item => 
          item.menuItemId === dish._id 
            ? { ...item, qty: item.qty + 1 } 
            : item
        );
      }
      return [...prev, { menuItemId: dish._id, name: dish.name, price: Number(dish.price), qty: 1 }];
    });
  };

  const handleRemoveItem = (dishId) => {
    setOrderItems((prev) => {
      const existing = prev.find(item => item.menuItemId === dishId);
      if (existing && existing.qty > 1) {
        return prev.map(item => 
          item.menuItemId === dishId 
            ? { ...item, qty: item.qty - 1 } 
            : item
        );
      }
      return prev.filter(item => item.menuItemId !== dishId);
    });
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!orderItems.length) {
      setError('Please add at least one item to place order');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      type,
      tableId: type === 'dine-in' ? tableId : null,
      customerName,
      customerPhone,
      items: orderItems,
      notes
    };

    try {
      const response = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.success) {
        router.push('/dashboard/orders');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit order');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-base-content font-display">Create Order</h1>
        <p className="text-sm text-base-content/70 mt-1">Place a dine-in or takeaway order for guests</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Menu Selection */}
        <div className="lg:col-span-2 space-y-6">
          {categories.map((cat) => {
            const catItems = menuItems.filter(item => item.categoryId === cat._id);
            if (!catItems.length) return null;
            return (
              <div key={cat._id} className="space-y-3">
                <h2 className="text-xl font-bold border-b border-base-300 pb-2 text-primary uppercase text-sm tracking-wider font-display">
                  {cat.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catItems.map((dish) => {
                    const quantityInOrder = orderItems.find(i => i.menuItemId === dish._id)?.qty || 0;
                    return (
                      <div key={dish._id} className="card bg-base-100 shadow border border-base-300 p-4 flex flex-row items-center justify-between hover:bg-base-200 transition-all">
                        <div className="space-y-1">
                          <h3 className="font-bold">{dish.name}</h3>
                          <div className="text-xs text-base-content/70 truncate max-w-xs">{dish.description}</div>
                          <div className="text-sm font-semibold text-primary">${Number(dish.price).toFixed(2)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {quantityInOrder > 0 && (
                            <>
                              <button type="button" className="btn btn-sm btn-circle btn-outline btn-primary" onClick={() => handleRemoveItem(dish._id)}>-</button>
                              <span className="font-bold text-sm w-4 text-center">{quantityInOrder}</span>
                            </>
                          )}
                          <button type="button" className="btn btn-sm btn-circle btn-primary" onClick={() => handleAddItem(dish)}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column - Order Detail Summary */}
        <div className="card bg-base-100 shadow border border-base-300 self-start p-6">
          <h2 className="text-lg font-bold text-primary mb-4 font-display border-b pb-2">Order Setup</h2>
          
          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Service Type</span></label>
              <select className="select select-bordered w-full" value={type} onChange={e => {
                setType(e.target.value);
                setTableId('');
              }}>
                <option value="dine-in">Dine-in</option>
                <option value="takeaway">Takeaway</option>
              </select>
            </div>

            {type === 'dine-in' ? (
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Available Table</span></label>
                <select className="select select-bordered w-full" value={tableId} onChange={e => setTableId(e.target.value)} required>
                  <option value="">Select Table</option>
                  {tables.map(t => (
                    <option key={t._id} value={t._id}>Table T-{t.number} ({t.capacity} Pax) - {t.location}</option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Customer Name</span></label>
                  <input type="text" className="input input-bordered w-full" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Customer Phone</span></label>
                  <input type="tel" className="input input-bordered w-full" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                </div>
              </>
            )}

            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Special Instructions</span></label>
              <textarea placeholder="e.g. Allergy details, spicy level" className="textarea textarea-bordered w-full text-xs" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            {/* Selected Items Summary List */}
            <div className="border-t border-b border-base-300 py-4 my-2">
              <h3 className="font-bold text-sm mb-2 uppercase text-xs tracking-wider text-base-content/60">Selected Items</h3>
              {orderItems.length === 0 ? (
                <div className="text-center py-4 text-xs text-base-content/60">No items selected</div>
              ) : (
                <ul className="space-y-2 text-xs max-h-48 overflow-y-auto pr-1">
                  {orderItems.map((item) => (
                    <li key={item.menuItemId} className="flex justify-between items-center bg-base-200 p-2 rounded">
                      <div className="font-semibold">{item.name} <span className="text-primary font-black">x{item.qty}</span></div>
                      <div className="font-bold">${(item.price * item.qty).toFixed(2)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-between items-center text-sm font-bold pt-2">
              <span>Order Subtotal:</span>
              <span className="text-xl text-primary font-black">${calculateSubtotal().toFixed(2)}</span>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4" disabled={submitting || orderItems.length === 0}>
              {submitting ? <span className="loading loading-spinner"></span> : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
