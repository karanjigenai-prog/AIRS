import Link from 'next/link';
import React from 'react';

export default function AuthPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ background: 'white', padding: '2rem 2.5rem', borderRadius: '1rem', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', minWidth: 340 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>ARIS Login</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Link href="/auth/hr" passHref legacyBehavior>
            <button style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: '8px', background: '#059669', color: 'white', border: 'none', cursor: 'pointer' }}>
              HR Login
            </button>
          </Link>
            <Link href="/employee-dashboard" passHref legacyBehavior>
              <button style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }}>
                Employee Login
              </button>
            </Link>
        </div>
      </div>
    </div>
  );
}
