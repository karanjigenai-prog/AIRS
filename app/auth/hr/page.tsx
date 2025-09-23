// HR Login Page (simple placeholder)
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function HRLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push('/hr-portal');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setError('Check your email to confirm your account.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <form onSubmit={isSignUp ? handleSignUp : handleLogin} style={{ background: 'white', padding: '2rem 2.5rem', borderRadius: '1rem', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', minWidth: 340 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>{isSignUp ? 'HR Sign Up' : 'HR Login'}</h2>
        <div style={{ marginBottom: '1rem' }}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e5e7eb', marginBottom: '0.5rem' }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e5e7eb' }} />
        </div>
        {error && <div style={{ color: isSignUp ? 'green' : 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: '8px', background: isSignUp ? '#2563eb' : '#059669', color: 'white', border: 'none', cursor: 'pointer' }}>
          {loading ? (isSignUp ? 'Signing up...' : 'Logging in...') : (isSignUp ? 'Sign Up' : 'Log In')}
        </button>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          {isSignUp ? (
            <span>Already have an account?{' '}
              <button type="button" onClick={() => { setIsSignUp(false); setError(''); }} style={{ color: '#059669', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Log In</button>
            </span>
          ) : (
            <span>Don&apos;t have an account?{' '}
              <button type="button" onClick={() => { setIsSignUp(true); setError(''); }} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Sign Up</button>
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
