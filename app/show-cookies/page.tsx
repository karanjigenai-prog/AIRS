// Minimal page to show all cookies in the browser
'use client';

export default function ShowCookiesPage() {
  return (
    <div style={{ padding: 40 }}>
      <h2>Browser Cookies</h2>
      <pre style={{ background: '#f4f4f4', padding: 20, borderRadius: 8 }}>
        {typeof document !== 'undefined' ? document.cookie : 'No cookies found'}
      </pre>
      <p>Look for a cookie named <b>sb-slarczbhrjiroukvgwei-auth-token</b> (or similar).<br/>If it is missing after login, your session is not being set.</p>
    </div>
  );
}
