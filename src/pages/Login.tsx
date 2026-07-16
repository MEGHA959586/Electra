import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      await login(email, password, role);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 px-4 py-12">
      <div className="max-w-md w-full bg-white border border-stone-200 rounded-none shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-black italic tracking-tighter uppercase text-stone-950">
            ELECTRA<span className="text-amber-600">.</span>
          </h1>
          <p className="text-sm text-stone-500 mt-2 font-medium">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-2.5 px-4 border border-stone-200 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600 transition-all bg-stone-50"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2.5 px-4 border border-stone-200 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600 transition-all bg-stone-50"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono">
              I want to sign in as
            </label>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
                <input
                  type="radio"
                  value="buyer"
                  checked={role === 'buyer'}
                  onChange={() => setRole('buyer')}
                  className="accent-amber-600 h-4 w-4"
                />
                Buyer
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
                <input
                  type="radio"
                  value="seller"
                  checked={role === 'seller'}
                  onChange={() => setRole('seller')}
                  className="accent-amber-600 h-4 w-4"
                />
                Seller
              </label>
            </div>
          </div>

          {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-stone-900 text-white font-bold py-3.5 text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all border border-stone-900 hover:border-amber-600 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-stone-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-amber-600 font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};