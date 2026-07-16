import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      await signup(name, email, password, role);
    } catch (err) {
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 px-4 py-12">
      <div className="max-w-md w-full bg-white border border-stone-200 rounded-none shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-black italic tracking-tighter uppercase text-stone-950">
            ELECTRA<span className="text-amber-600">.</span>
          </h1>
          <p className="text-sm text-stone-500 mt-2 font-medium">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2.5 px-4 border border-stone-200 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600 transition-all bg-stone-50"
              placeholder="John Doe"
              required
            />
          </div>
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
              placeholder="At least 6 characters"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full py-2.5 px-4 border border-stone-200 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600 transition-all bg-stone-50"
              placeholder="Re-enter password"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono">
              I want to sign up as
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
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-stone-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-600 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};