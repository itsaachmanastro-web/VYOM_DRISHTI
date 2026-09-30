import React from 'react';
import { MetricCardsRow } from './MetricCardsRow';
import { DemoModeHeaderBanner } from './DemoModeHeaderBanner';
import { CameraFeedCanvas } from './CameraFeedCanvas';
import { CurrentStepCard } from './CurrentStepCard';
import { ExperimentSequenceCard } from './ExperimentSequenceCard';
import { RecentActivityLogCard } from './RecentActivityLogCard';
import { CompactAssistantCard } from './CompactAssistantCard';
import { SystemStatusCard } from './SystemStatusCard';
import { RecordingStreamPanel } from './RecordingStreamPanel';

export const LiveMonitorDashboard: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1720px] mx-auto select-none">
      
      {/* 1. Top Metrics KPI Row */}
      <MetricCardsRow />

      {/* 2. Interactive Real-Time Demo Mode Switcher Banner */}
      <DemoModeHeaderBanner />

      {/* 3. Recording & RTSP Streaming Panel */}
      <RecordingStreamPanel />

      {/* 3. Primary Workspace Grid: Live Video & Step Validation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Left / Center: Large Live Video Canvas */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <CameraFeedCanvas />
        </div>

        {/* Right: Current Step Card */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <CurrentStepCard />
        </div>

      </div>

      {/* 4. Secondary Row: Sequence Stepper & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Sequence Stepper (Left 7) */}
        <div className="lg:col-span-7 xl:col-span-7">
          <ExperimentSequenceCard />
        </div>

        {/* Recent Activity Log (Right 5) */}
        <div className="lg:col-span-5 xl:col-span-5">
          <RecentActivityLogCard />
        </div>

      </div>

      {/* 5. Tertiary Row: Compact AI Mission Assistant & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* AI Mission Assistant (Left 7) */}
        <div className="lg:col-span-7 xl:col-span-7">
          <CompactAssistantCard />
        </div>

        {/* System Status Checklist (Right 5) */}
        <div className="lg:col-span-5 xl:col-span-5">
          <SystemStatusCard />
        </div>

      </div>

    </div>
  );
};
