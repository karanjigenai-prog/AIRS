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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #4f46e5 0%, #38bdf8 50%, #a21caf 100%)',
      }}
    >
      <form
        onSubmit={isSignUp ? handleSignUp : handleLogin}
        style={{
          background: 'linear-gradient(135deg, #fff 60%, #f3e8ff 100%)',
          padding: '2.5rem 3rem',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 32px rgba(80,0,160,0.12)',
          minWidth: 340,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
          border: '2px solid #a21caf22',
        }}
      >
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: '0.5rem',
            textAlign: 'center',
            color: '#059669',
            textShadow: '0 2px 12px #05966944',
            letterSpacing: '0.02em',
          }}
        >
          {isSignUp ? 'HR Sign Up' : 'HR Login'}
        </h2>
        <div style={{ marginBottom: '1rem', width: '100%' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '8px',
              border: '1.5px solid #a21caf33',
              marginBottom: '0.7rem',
              background: '#eef2ff',
              fontSize: '1.05rem',
              fontWeight: 500,
              color: '#4f46e5',
              boxShadow: '0 2px 8px #a21caf11',
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '8px',
              border: '1.5px solid #a21caf33',
              background: '#eef2ff',
              fontSize: '1.05rem',
              fontWeight: 500,
              color: '#4f46e5',
              boxShadow: '0 2px 8px #a21caf11',
            }}
          />
        </div>
        {error && (
          <div
            style={{
              color: isSignUp ? '#2563eb' : '#d97706',
              marginBottom: '1rem',
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.15rem',
            borderRadius: '10px',
            background: isSignUp
              ? 'linear-gradient(90deg, #2563eb 0%, #a21caf 100%)'
              : 'linear-gradient(90deg, #059669 0%, #38bdf8 100%)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            boxShadow: isSignUp
              ? '0 2px 12px #2563eb44'
              : '0 2px 12px #05966944',
            transition: 'transform 0.15s',
          }}
          className="login-btn"
        >
          {loading
            ? isSignUp
              ? 'Signing up...'
              : 'Logging in...'
            : isSignUp
            ? 'Sign Up'
            : 'Log In'}
        </button>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError('');
                }}
                style={{
                  color: '#059669',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 600,
                }}
              >
                Log In
              </button>
            </span>
          ) : (
            <span>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setError('');
                }}
                style={{
                  color: '#2563eb',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 600,
                }}
              >
                Sign Up
              </button>
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
