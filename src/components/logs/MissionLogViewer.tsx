import React, { useState, useMemo } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { MissionLogEvent, SeverityLevel } from '../../types/mission';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  ShieldCheck, 
  Key, 
  Activity, 
  Clock, 
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  X,
  Sparkles,
  Calendar,
  Layers,
  Check,
  MoreHorizontal,
  Code
} from 'lucide-react';

export const MissionLogViewer: React.FC = () => {
  const { logs, activeProtocol } = useMissionStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<string>('Last 24 Hours');
  const [selectedLogId, setSelectedLogId] = useState<string | null>('log-003');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Extended realistic flight logs if store has initial small count
  const allLogs: MissionLogEvent[] = useMemo(() => {
    if (logs && logs.length >= 10) return logs;
    
    // Supplement with high-fidelity realistic flight logs from master reference
    const defaultFullLogs: MissionLogEvent[] = [
      {
        id: 'log-001',
        timestamp: '2026-09-28 20:00:15',
        metTimestamp: 'T+04:15:00',
        event: 'Payload Rack EXPRESS-01 Power Bus Online',
        category: 'SYSTEM',
        severity: 'INFO',
        confidence: 1.0,
        source: 'BAS_POWER_MGMT',
        details: { power_draw_watts: 412.5, voltage: 28.1, status: 'NOMINAL' },
        hashSeal: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e'
      },
      {
        id: 'log-002',
        timestamp: '2026-09-28 20:02:45',
        metTimestamp: 'T+04:16:12',
        event: 'Edge NPU Vision Pipeline Initialized [MoveNet & INT8 Quantized Models Loaded]',
        category: 'AI_PERCEPTION',
        severity: 'INFO',
        confidence: 0.998,
        source: 'EDGE_NPU_CORE_0',
        details: { npu_utilization: '68.2%', latency_ms: 4.8, memory_mb: 248 },
        hashSeal: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0'
      },
      {
        id: 'log-003',
        timestamp: '2026-09-28 20:04:17',
        metTimestamp: 'T+04:17:05',
        event: 'Camera CAM-01 (RGB/Depth) Locked to Payload Rack C4 Coordinate Origin',
        category: 'CAMERA',
        severity: 'INFO',
        confidence: 0.985,
        source: 'CAM_DRIVER_01',
        details: {
          camera_id: 'CAM-01',
          mode: 'RGBD',
          resolution: '1280x720',
          alignment: 'Rack_C4',
          calibration_status: 'OK'
        },
        hashSeal: 'e0d1c2b3a4f5968778695a4b3c2d1e0ff0e1d2c3b4a5968778695a4b3c2d1e0f'
      },
      {
        id: 'log-004',
        timestamp: '2026-09-28 20:05:22',
        metTimestamp: 'T+04:18:40',
        event: 'Astronaut detected in workspace. Pose tracking locked with 17 keypoints.',
        category: 'AI_PERCEPTION',
        severity: 'INFO',
        confidence: 0.974,
        source: 'ZEROG_POSENET',
        details: { keypoints: 17, orientation_pitch: -12.4, roll: 6.8, yaw: 3.1 },
        hashSeal: '87654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba09'
      },
      {
        id: 'log-005',
        timestamp: '2026-09-28 20:06:50',
        metTimestamp: 'T+04:19:22',
        event: 'Step 01 Validated: Operator calibrated at station origin.',
        category: 'EXPERIMENT_ENGINE',
        severity: 'INFO',
        confidence: 0.968,
        source: 'SEQ_VALIDATOR_V2',
        details: { step_code: 'PCG-STP-01', rule_match: 'ORIGIN_CALIBRATION_OK' },
        hashSeal: '543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef9876'
      },
      {
        id: 'log-006',
        timestamp: '2026-09-28 20:08:12',
        metTimestamp: 'T+04:21:10',
        event: 'Uplink bandwidth approaching threshold (85% of allocation).',
        category: 'GROUND_UPLINK',
        severity: 'WARNING',
        confidence: 0.852,
        source: 'DSN_LINK_MGR',
        details: { bandwidth_kbps: 2.8, allocated_kbps: 3.2, queue_depth: 4 },
        hashSeal: 'b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e9f8e7d6c5'
      },
      {
        id: 'log-007',
        timestamp: '2026-09-28 20:09:44',
        metTimestamp: 'T+04:21:33',
        event: 'Crystal growth temperature stabilized at 20.4 °C.',
        category: 'EXPERIMENT_ENGINE',
        severity: 'INFO',
        confidence: 0.989,
        source: 'PCG_THERMAL_01',
        details: { target_temp: 20.5, actual_temp: 20.42, delta: -0.08 },
        hashSeal: '3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e9f8e7d6c5b4a'
      },
      {
        id: 'log-008',
        timestamp: '2026-09-28 20:11:05',
        metTimestamp: 'T+04:23:11',
        event: 'Transient packet loss detected (3 consecutive frames).',
        category: 'SYSTEM',
        severity: 'WARNING',
        confidence: 0.726,
        source: 'DSN_LINK_MGR',
        details: { dropped_frames: 3, recovery_time_ms: 120, status: 'RECOVERED' },
        hashSeal: '1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e9f8e7d6c5b4a3f2e'
      },
      {
        id: 'log-009',
        timestamp: '2026-09-28 20:12:30',
        metTimestamp: 'T+04:24:05',
        event: 'On-board data compression cycle completed.',
        category: 'SYSTEM',
        severity: 'INFO',
        confidence: 0.991,
        source: 'DATA_COMPRESSOR',
        details: { uncompressed_mb: 48.2, compressed_kb: 124.0, ratio: '388:1' },
        hashSeal: 'c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e9f8e7d6c5b4a3f2e1d0'
      },
      {
        id: 'log-010',
        timestamp: '2026-09-28 20:14:02',
        metTimestamp: 'T+04:25:18',
        event: 'Tool interaction detected: Pipette picked up.',
        category: 'AI_PERCEPTION',
        severity: 'INFO',
        confidence: 0.978,
        source: 'OBJ_DETECTOR_V3',
        details: { target: 'Micropipette-25uL', hand: 'RIGHT', g_score: 0.978 },
        hashSeal: '8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e9f8e7d6c5b4a3f2e1d0c9b'
      }
    ];

    return [...logs, ...defaultFullLogs.filter(d => !logs.some(l => l.id === d.id))];
  }, [logs]);

  // Filter logs based on search and selectors
  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        log.event.toLowerCase().includes(searchLower) ||
        log.source.toLowerCase().includes(searchLower) ||
        log.metTimestamp.toLowerCase().includes(searchLower) ||
        log.category.toLowerCase().includes(searchLower);
      
      const matchesCategory = selectedCategory === 'ALL' || log.category === selectedCategory;
      const matchesSeverity = selectedSeverity === 'ALL' || log.severity === selectedSeverity;
      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [allLogs, searchTerm, selectedCategory, selectedSeverity]);

  // Summary Metrics calculations
  const totalCount = allLogs.length;
  const criticalCount = allLogs.filter(l => l.severity === 'CRITICAL' || l.severity === 'SEQUENCE ERROR').length;
  const warningCount = allLogs.filter(l => l.severity === 'WARNING').length;
  const infoCount = allLogs.filter(l => l.severity === 'INFO').length;
  const avgConfidence = allLogs.length 
    ? (allLogs.reduce((acc, l) => acc + l.confidence, 0) / allLogs.length * 100).toFixed(1) 
    : '98.4';

  // Selected Log Object for Right Drawer
  const selectedLog = useMemo(() => {
    return allLogs.find(l => l.id === selectedLogId) || allLogs[2] || allLogs[0];
  }, [allLogs, selectedLogId]);

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `VYOM_DRISHTI_FLIGHT_LOG_${activeProtocol.code || 'PCG-01'}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = "MET,UTC Timestamp,Category,Severity,Event,Confidence,Source,SHA256 Seal\n";
    const rows = allLogs.map(l => 
      `"${l.metTimestamp}","${l.timestamp}","${l.category}","${l.severity}","${l.event.replace(/"/g, '""')}","${(l.confidence * 100).toFixed(1)}%","${l.source}","${l.hashSeal || ''}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `VYOM_DRISHTI_FLIGHT_LOG_${activeProtocol.code || 'PCG-01'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto select-none">
      
      {/* 1. Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
        <span>Mission Logs</span>
        <span>&gt;</span>
        <span className="text-slate-700 dark:text-slate-300 font-semibold">Flight Logs</span>
      </div>

      {/* 2. Page Header Bar & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Title & Subtitle with Icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-cyan-400 shrink-0 shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Mission Event Flight Logs
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cryptographically sealed on-board telemetry blackbox and experiment audit trail
            </p>
          </div>
        </div>

        {/* Right: Export Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0D1527] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-bold transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>

      </div>

      {/* 3. Search & Filter Bar (Single Card) */}
      <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3 shadow-xs flex flex-col md:flex-row items-center gap-3 text-xs">
        
        {/* Search Input Box */}
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by event description, MET time or subsystem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-44 shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="SYSTEM">System Health</option>
            <option value="AI_PERCEPTION">AI Perception</option>
            <option value="CAMERA">Camera Subsystem</option>
            <option value="EXPERIMENT_ENGINE">Experiment Engine</option>
            <option value="TELEMETRY">Telemetry Uplink</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div className="w-full md:w-44 shrink-0">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="INFO">INFO / Nominal</option>
            <option value="SUCCESS">SUCCESS / Validated</option>
            <option value="WARNING">WARNING / Caution</option>
            <option value="CRITICAL">CRITICAL / Alert</option>
          </select>
        </div>

        {/* Timeframe Filter */}
        <div className="w-full md:w-44 shrink-0">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="Last 24 Hours">Last 24 Hours</option>
            <option value="Last 6 Hours">Last 6 Hours</option>
            <option value="Mission All-Time">Mission All-Time</option>
          </select>
        </div>

      </div>

      {/* 4. Summary Metrics Row (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* Metric 1: Total Events */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Events</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              1,248
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              +32 (last 24h)
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-cyan-400">
            <FileText className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 2: Critical */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Critical</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              12
            </div>
            <div className="text-[10px] text-rose-500 font-semibold">
              1.0%
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 3: Warning */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Warning</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              46
            </div>
            <div className="text-[10px] text-amber-500 font-semibold">
              3.7%
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 4: Info */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Info</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              1,168
            </div>
            <div className="text-[10px] text-blue-600 dark:text-cyan-400 font-semibold">
              93.6%
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-cyan-400">
            <Info className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 5: Avg. Confidence */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3.5 shadow-xs flex items-center justify-between col-span-2 sm:col-span-1">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Avg. Confidence</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              {avgConfidence}%
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Optimal Precision
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* 5. Main Operational Grid: Event Table + Side Event Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left: Event Table (8 of 12 cols when drawer is open, or 12 if closed) */}
        <div className={`${selectedLogId ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between`}>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[11px]">
                  <th className="py-3 px-3.5">MET Timestamp ⇅</th>
                  <th className="py-3 px-3">Severity ⇅</th>
                  <th className="py-3 px-3">Category ⇅</th>
                  <th className="py-3 px-3.5">Event Description</th>
                  <th className="py-3 px-3">Source Subsystem ⇅</th>
                  <th className="py-3 px-3 text-right">Confidence ⇅</th>
                  <th className="py-3 px-2 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No flight logs match your search filters.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isSelected = selectedLogId === log.id;
                    const isCritical = log.severity === 'CRITICAL' || log.severity === 'SEQUENCE ERROR';
                    const isWarning = log.severity === 'WARNING';
                    const isSuccess = log.severity === 'INFO' && log.confidence >= 0.99;

                    return (
                      <tr 
                        key={log.id}
                        onClick={() => setSelectedLogId(log.id)}
                        className={`cursor-pointer transition ${
                          isSelected 
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-l-blue-600 font-medium' 
                            : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* MET Timestamp */}
                        <td className="py-3 px-3.5 font-mono text-slate-700 dark:text-slate-300 text-[11px]">
                          {log.metTimestamp}
                        </td>

                        {/* Severity Badge */}
                        <td className="py-3 px-3">
                          {isCritical ? (
                            <span className="bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              ERROR
                            </span>
                          ) : isWarning ? (
                            <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              WARNING
                            </span>
                          ) : isSuccess ? (
                            <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              SUCCESS
                            </span>
                          ) : (
                            <span className="bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              INFO
                            </span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3 font-mono text-[10.5px] text-slate-600 dark:text-slate-400 uppercase">
                          {log.category}
                        </td>

                        {/* Event Description */}
                        <td className="py-3 px-3.5 text-slate-900 dark:text-white max-w-xs sm:max-w-md truncate">
                          <span>{log.event}</span>
                        </td>

                        {/* Source Subsystem */}
                        <td className="py-3 px-3 font-mono text-[10.5px] text-slate-500 dark:text-slate-400">
                          {log.source}
                        </td>

                        {/* Confidence */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                          {(log.confidence * 100).toFixed(1)}%
                        </td>

                        {/* Action menu */}
                        <td className="py-3 px-2 text-center text-slate-400 hover:text-slate-600 dark:hover:text-white">
                          <MoreHorizontal className="w-4 h-4 mx-auto" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

            </table>
          </div>

          {/* Table Footer Pagination */}
          <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
            <div>
              Showing 1 – {Math.min(itemsPerPage, filteredLogs.length)} of {filteredLogs.length} events
            </div>

            <div className="flex items-center gap-1 text-xs">
              <button className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                &lt;
              </button>
              <button className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold">
                1
              </button>
              <button className="px-2.5 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                2
              </button>
              <button className="px-2.5 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                3
              </button>
              <button className="px-2.5 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                4
              </button>
              <button className="px-2.5 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                5
              </button>
              <span>...</span>
              <button className="px-2.5 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                125
              </button>
              <button className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                &gt;
              </button>
            </div>
          </div>

        </div>

        {/* Right: Event Details Drawer / Panel (4 of 12 cols) */}
        {selectedLog && (
          <div className="lg:col-span-4 bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
            
            {/* Header with Close button */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                Event Details
              </div>
              <button 
                onClick={() => setSelectedLogId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Severity & Confidence Badges */}
            <div className="flex items-center justify-between gap-2">
              <span className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded text-[11px] font-bold inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {selectedLog.severity}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                Confidence: {(selectedLog.confidence * 100).toFixed(1)}%
              </span>
            </div>

            {/* Event Title & Subtitle */}
            <div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                {selectedLog.event}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Camera system successfully initialized and aligned to payload rack coordinate frame.
              </p>
            </div>

            {/* Key-Value Metadata List */}
            <div className="space-y-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">MET Timestamp</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white text-[11px]">{selectedLog.metTimestamp}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">UTC Timestamp</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">{selectedLog.timestamp}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Category</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white text-[11px]">{selectedLog.category}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Source Subsystem</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white text-[11px]">{selectedLog.source}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Confidence</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">{(selectedLog.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Related Experiment Step</span>
                <span className="font-semibold text-slate-900 dark:text-white text-[11px]">Step 1</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Event ID</span>
                <span className="font-mono text-slate-600 dark:text-slate-400 text-[10px]">EVT_20260928_041705_CAM_001</span>
              </div>
            </div>

            {/* AI Context Section */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-cyan-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Context</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                Camera pose estimated using ORB feature matching. Coordinate frame aligned with Payload Rack C4. Calibration parameters verified.
              </p>
            </div>

            {/* Telemetry Context Section (JSON Block) */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Code className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Telemetry Context</span>
              </div>
              
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                <pre>{JSON.stringify(selectedLog.details || {
                  camera_id: "CAM-01",
                  mode: "RGBD",
                  resolution: "1280x720",
                  alignment: "Rack_C4",
                  calibration_status: "OK"
                }, null, 2)}</pre>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default MissionLogViewer;
