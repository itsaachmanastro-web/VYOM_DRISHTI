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
      
      {/* 1. LIVING SPACE ENVIRONMENT (Dual-Mode: Local Video OR Real-Time Three.js WebGL Orbit Simulator) */}
      <SpaceBackground videoSrc="/videos/vyom-space-background.mp4" />

      {/* 2. Spacecraft HUD Navbar */}
      <LandingNavbar />

      {/* 3. Hero & Scientific Mission Console Layered Over Space Environment */}
      <main className="flex-1 relative z-10 space-y-12">
        {/* Section 1: Orbital Hero */}
        <LandingHero />

        {/* Section 2: Core Flight Capabilities */}
        <LandingCapabilities />

        {/* Section 3: Live Perception & Vision Console */}
        <LandingPerceptionConsole />

        {/* Section 4: Experiment Workflow Automaton */}
        <LandingWorkflowSection />

        {/* Section 5: Bandwidth & Edge Performance */}
        <LandingMetricsSection />

        {/* Section 6: Mission Launch CTA */}
        <LandingCTA />
      </main>

    </div>
  );
};

export default LandingPage;
