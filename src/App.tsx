import React, { useEffect } from 'react';
import { useMissionStore } from './store/missionStore';
import { AppSidebar } from './components/common/AppSidebar';
import { TopHeaderBar } from './components/common/TopHeaderBar';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { MissionOverviewDeck } from './components/overview/MissionOverviewDeck';
import { LiveMonitorDashboard } from './components/liveMonitor/LiveMonitorDashboard';
import { ExperimentSequenceView } from './components/sequence/ExperimentSequenceView';
import { AIPerceptionCenter } from './components/perception/AIPerceptionCenter';
import { MissionAssistantPanel } from './components/assistant/MissionAssistantPanel';
import { VoiceAlertsCenter } from './components/alerts/VoiceAlertsCenter';
import { Spatial3DViewport } from './components/hmr3d/Spatial3DViewport';
import { MissionLogViewer } from './components/logs/MissionLogViewer';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { OfflineUplinkManager } from './components/uplink/OfflineUplinkManager';
import { SystemHealthConfig } from './components/health/SystemHealthConfig';
import { DatasetManagerView } from './components/dataset/DatasetManagerView';
import { ArchitectureDocsView } from './components/docs/ArchitectureDocsView';
import { DatasetModelLabView } from './components/modelLab/DatasetModelLabView';

export const App: React.FC = () => {
  const { currentView, session, checkSession } = useMissionStore();

  // Validate session on component mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // 1. Public Landing View
  if (currentView === 'landing') {
    return <LandingPage />;
  }

  // 2. Protected Route Guard: If unauthenticated or explicitly on 'login', show Secure Login Page
  if (currentView === 'login' || !session) {
    return <LoginPage />;
  }

  // 3. Authenticated Scientific Mission Workspace
  return (
    <div className="min-h-screen bg-[#F4F7FA] dark:bg-[#070B19] text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-600 transition-colors">
      
      {/* 1. Global Scientific Top Header Bar with Notifications, Live Clock & Profile */}
      <TopHeaderBar />

      {/* 2. Main Application Shell: Left Sidebar + Scrollable Viewport */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Navigation Sidebar */}
        <AppSidebar />

        {/* Central Scientific Operational Workspace */}
        <main className="flex-1 overflow-y-auto bg-[#F4F7FA] dark:bg-[#070B19] transition-colors">
          {currentView === 'overview' && <MissionOverviewDeck />}
          {currentView === 'live-monitor' && <LiveMonitorDashboard />}
          {currentView === 'model-lab' && <DatasetModelLabView />}
          {currentView === 'sequence' && <ExperimentSequenceView />}

          {currentView === 'perception' && <AIPerceptionCenter />}
          {currentView === 'assistant' && (
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
              <MissionAssistantPanel />
            </div>
          )}
          {currentView === 'alerts' && <VoiceAlertsCenter />}
          {currentView === 'hmr-3d' && <Spatial3DViewport />}
          {currentView === 'dataset' && <DatasetManagerView />}
          {currentView === 'docs' && <ArchitectureDocsView />}
          {currentView === 'logs' && <MissionLogViewer />}
          {currentView === 'analytics' && <AnalyticsView />}
          {currentView === 'uplink' && <OfflineUplinkManager />}
          {currentView === 'health' && <SystemHealthConfig />}
        </main>
      </div>

      {/* Global Minimal Research Footer */}
      <footer className="bg-white dark:bg-[#0D1527] border-t border-slate-200 dark:border-slate-800/90 px-6 py-2 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2 select-none transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-blue-600 dark:text-blue-400 font-bold">VYOM DRISHTI AI</span>
          <span>•</span>
          <span>On-Board Space Station Experiment Intelligence</span>
          <span>•</span>
          <span>SIH 2026 PS #26174</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Team AvishkarX</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Edge Model Verified</span>
        </div>
      </footer>

    </div>
  );
};

export default App;
