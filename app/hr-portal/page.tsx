"use client";


import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { ARISEnhancedDashboard } from '@/components/aris-dashboard-clean';

export default function HRPortal() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <main className="font-sans px-4 py-6 md:px-8 max-w-7xl mx-auto min-h-screen">
      <header className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-semibold text-pretty">
              ARIS — AI Resource Intelligence System
            </h1>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              HR Portal
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            <strong>Workforce Intelligence Platform</strong><br />
            Manage employees, skill requests, and AI analysis with full HR access.
          </p>
        </div>
        <div className="shrink-0 flex gap-2 items-center">
          <ThemeToggle />
          <button
            onClick={handleSignOut}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              background: '#7744efff',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <ARISEnhancedDashboard />
    </main>
  );
}
