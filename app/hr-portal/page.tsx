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
      <header className="mb-8">
        <div className="rounded-2xl shadow-xl bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-400 p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-2">
              <span className="inline-flex items-center justify-center rounded-full bg-white p-2 shadow-lg animate-pulse">
                <Brain className="h-10 w-10 text-blue-500 drop-shadow-lg" />
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
                ARIS — AI Resource Intelligence System
              </h1>
              <Badge variant="secondary" className="bg-white text-blue-700 font-bold text-base px-3 py-1 rounded-full shadow">
                HR Portal
              </Badge>
            </div>
            <p className="text-white/90 text-lg md:text-xl font-semibold drop-shadow">
              <span className="font-bold">Workforce Intelligence Platform</span><br />
              <span className="text-white/80">Manage employees, skill requests, and AI analysis with full HR access.</span>
            </p>
          </div>
          <div className="shrink-0 flex gap-3 items-center">
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-150 border-none focus:outline-none"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <ARISEnhancedDashboard />
    </main>
  );
}

// Job band requirements matrix and validation (TypeScript fixed)
type Skill = { skill: string; category: string; level: string };
type JobBandMatrix = {
  [band: string]: {
    [category: string]: { [level: string]: number }
  }
};

const jobBandMatrix: JobBandMatrix = {
  D4: {
    technical: { expert: 2 },
    soft: { expert: 2 },
    language: { expert: 2 }
  },
  D3: {
    technical: { intermediate: 2 },
    soft: { intermediate: 2 },
    language: { intermediate: 2 }
  }
  // Add more bands as needed
};

function validateEmployeeForBand(employeeSkills: Skill[], band: keyof typeof jobBandMatrix) {
  const matrix = jobBandMatrix[band];
  const result: { meetsRequirements: boolean; gaps: string[] } = { meetsRequirements: true, gaps: [] };
  for (const category in matrix) {
    for (const level in matrix[category]) {
      const requiredCount = matrix[category][level];
      const actualCount = employeeSkills.filter(
        (s: Skill) => s.category === category && s.level === level
      ).length;
      if (actualCount < requiredCount) {
        result.meetsRequirements = false;
        result.gaps.push(
          `Needs ${requiredCount - actualCount} ${level} skill(s) in ${category}`
        );
      }
    }
  }
  return result;
}

// Example usage:
// const employeeSkills: Skill[] = [
//   { skill: 'Java', category: 'technical', level: 'expert' },
//   { skill: 'Python', category: 'technical', level: 'expert' },
//   { skill: 'Communication', category: 'soft', level: 'expert' },
//   { skill: 'Teamwork', category: 'soft', level: 'intermediate' },
//   { skill: 'English', category: 'language', level: 'expert' },
//   { skill: 'French', category: 'language', level: 'intermediate' }
// ];
// const validation = validateEmployeeForBand(employeeSkills, 'D4');
// console.log(validation);
// Output: { meetsRequirements: false, gaps: [ 'Needs 1 expert skill(s) in soft', 'Needs 1 expert skill(s) in language' ] }
