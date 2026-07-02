'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function SettingsManagement() {
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxRate, setTaxRate] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadSettings() {
    try {
      const response = await apiFetch('/api/settings');
      if (response.success && response.data) {
        setName(response.data.name || '');
        setTagline(response.data.tagline || '');
        setPhone(response.data.phone || '');
        setAddress(response.data.address || '');
        setTaxRate(response.data.taxRate || 0);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve settings details');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiFetch('/api/settings', {
        method: 'PATCH',
        body: JSON.stringify({ name, tagline, phone, address, taxRate })
      });

      if (response.success) {
        setSuccess('Restaurant settings updated successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to update settings');
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
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-base-content font-display">System Settings</h1>
        <p className="text-sm text-base-content/70 mt-1">Manage corporate brand configuration and service tax thresholds</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
        </div>
      )}

      <div className="card bg-base-100 shadow border border-base-300 p-6 md:p-8">
        <form onSubmit={handleSaveSettings} className="space-y-4 font-semibold text-sm">
          <div className="form-control">
            <label className="label"><span className="label-text">Restaurant Name</span></label>
            <input type="text" className="input input-bordered w-full" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Brand Tagline</span></label>
            <input type="text" className="input input-bordered w-full" value={tagline} onChange={e => setTagline(e.target.value)} />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Contact Phone</span></label>
            <input type="text" className="input input-bordered w-full" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Physical Address</span></label>
            <textarea className="textarea textarea-bordered w-full" value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Sales Tax Rate (%)</span></label>
            <input type="number" step="0.1" min="0" max="50" className="input input-bordered w-full" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} required />
          </div>

          <button type="submit" className="btn btn-primary w-full mt-6" disabled={submitting}>
            {submitting ? <span className="loading loading-spinner"></span> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
