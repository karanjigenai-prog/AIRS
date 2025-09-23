import Link from 'next/link';

export default function PortalSwitch() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Welcome to ARIS Platform</h1>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <Link href="/employee-dashboard">
          <button style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }}>
            Employee Portal
          </button>
        </Link>
        <Link href="/hr-portal">
          <button style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '8px', background: '#059669', color: 'white', border: 'none', cursor: 'pointer' }}>
            HR Portal
          </button>
        </Link>
      </div>
    </div>
  );
}
