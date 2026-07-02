'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authClient.signIn.email({
        email,
        password
      });

      if (response?.error) {
        throw new Error(response.error.message || 'Login failed');
      }

      // Check role/status from backend profile
      const meResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/staff/me`, {
        headers: {
          'Authorization': `Bearer ${response.session?.token || ''}`
        },
        credentials: 'include'
      });
      
      const meData = await meResponse.json();
      
      if (!meData.success) {
        throw new Error(meData.error || 'Access denied');
      }

      const role = meData.data.role;
      if (role === 'kitchen') {
        router.push('/dashboard/kitchen');
      } else if (role === 'waiter') {
        router.push('/dashboard/orders');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold justify-center text-primary mb-2">Staff Portal</h2>
          <p className="text-center text-sm text-base-content/70 mb-6">Sign in to manage restaurant operations</p>
          
          {error && (
            <div className="alert alert-error text-sm py-2 mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Email Address</span>
              </label>
              <input
                type="email"
                placeholder="email@restaurant.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full mt-6" disabled={loading}>
              {loading ? <span className="loading loading-spinner"></span> : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
