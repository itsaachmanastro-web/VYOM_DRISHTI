import React from 'react';
import { SpaceBackground } from './SpaceBackground';
import { LandingNavbar } from './LandingNavbar';
import { LandingHero } from './LandingHero';
import { LandingCapabilities } from './LandingCapabilities';
import { LandingPerceptionConsole } from './LandingPerceptionConsole';
import { LandingWorkflowSection } from './LandingWorkflowSection';
import { LandingMetricsSection } from './LandingMetricsSection';
import { LandingCTA } from './LandingCTA';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#010308] text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 1. LIVING SPACE ENVIRONMENT & CUPOLA OBSERVATION WINDOW FRAME */}
      <SpaceBackground videoSrc="/videos/vyom-space-background.mp4" />

      {/* 2. Spacecraft HUD Navbar */}
      <LandingNavbar />

      {/* 3. Hero & Scientific Mission Sections */}
      <main className="flex-1 relative z-10">
        {/* Section 1: Full-Screen Orbital Hero (Exact Image 1 Desktop Viewport) */}
        <LandingHero />

        {/* Section 2: Core Flight Capabilities (Below the fold) */}
        <LandingCapabilities />

        {/* Section 3: Live Perception & Vision Console (Below the fold) */}
        <LandingPerceptionConsole />

        {/* Section 4: Experiment Workflow Automaton (Below the fold) */}
        <LandingWorkflowSection />

        {/* Section 5: Bandwidth & Edge Performance (Below the fold) */}
        <LandingMetricsSection />

        {/* Section 6: Mission Launch CTA (Below the fold) */}
        <LandingCTA />
      </main>

    </div>
  );
};

export default LandingPage;
