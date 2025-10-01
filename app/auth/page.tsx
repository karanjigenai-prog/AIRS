"use client"
import Link from 'next/link';
import React from 'react';

export default function AuthPage() {
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
      <div
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
            color: '#6d28d9',
            textShadow: '0 2px 12px #a21caf44',
            letterSpacing: '0.02em',
          }}
        >
          ARIS Login
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
          <Link href="/auth/hr">
            <button
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.15rem',
                borderRadius: '10px',
                background: 'linear-gradient(90deg, #059669 0%, #38bdf8 100%)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                boxShadow: '0 2px 12px #05966944',
                transition: 'transform 0.15s',
              }}
              className="login-btn"
            >
              HR Login
            </button>
          </Link>
          <Link href="/employee-dashboard">
            <button
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.15rem',
                borderRadius: '10px',
                background: 'linear-gradient(90deg, #2563eb 0%, #a21caf 100%)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                boxShadow: '0 2px 12px #2563eb44',
                transition: 'transform 0.15s',
              }}
              className="login-btn"
            >
              Employee Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
