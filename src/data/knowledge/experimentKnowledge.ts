/**
 * VYOM DRISHTI AI — Local Knowledge Layer
 * Stored locally in /data/knowledge/ (client memory)
 * 100% Offline, Zero Cloud Retrieval, Zero External API dependencies
 */

export interface KnowledgeItem {
  id: string;
  category: 'PROCEDURE' | 'ACTIVITY' | 'SYSTEM' | 'MISSION' | 'SAFETY' | 'SOFTWARE' | 'FAQ';
  keywords: string[];
  title: string;
  summary: string;
  details: string;
  source: 'LOCAL KNOWLEDGE BASE' | 'LOCAL MISSION CONTEXT' | 'LIVE ACTIVITY MODEL';
}

export const LOCAL_KNOWLEDGE_BASE: KnowledgeItem[] = [
  // 1. Experiment Procedures (SOPs)
  {
    id: 'sop-cartridge-install',
    category: 'PROCEDURE',
    keywords: ['cartridge', 'install', 'sample cartridge', 'step 4', 'insertion', 'locking lever'],
    title: 'Sample Cartridge Installation Procedure',
    summary: 'Standard operating procedure for inserting and locking biological sample cartridges into Payload Express Rack 04.',
    details: 'Step 1: Unlatch Express Rack outer door. Step 2: Retrieve biological specimen vial from cold storage (2-8°C). Step 3: Sterilize and clean sample chamber docking area with isopropyl wipe. Step 4: Align cartridge guides and insert cartridge until tactile click is engaged. Step 5: Engage secondary safety locking latch.',
    source: 'LOCAL KNOWLEDGE BASE'
  },
  {
    id: 'sop-clean-area',
    category: 'PROCEDURE',
    keywords: ['clean', 'clean area', 'sterilize', 'sanitize', 'wipe', 'step 3', 'preparation'],
    title: 'Chamber Sterilization & Area Preparation',
    summary: 'Decontamination protocol prior to specimen loading in microgravity glovebox environment.',
    details: 'Ensure air recirculation fan is set to low flow. Use sterile antistatic lint-free wipe with 70% IPA solution. Wipe chamber perimeter from top to bottom. Allow 30 seconds dry time before opening specimen container.',
    source: 'LOCAL KNOWLEDGE BASE'
  },
  {
    id: 'sop-centrifuge-calibration',
    category: 'PROCEDURE',
    keywords: ['centrifuge', 'spin', 'speed', 'rpm', 'vibration', 'calibration', 'motor'],
    title: 'Microgravity Centrifuge Calibration',
    summary: 'Operational steps for balancing and spinning biological samples in the microgravity centrifuge module.',
    details: 'Load balanced opposing vials of equal mass (±0.05g). Verify latch engagement on rotor hub. Ramp speed gradually: 500 RPM for 30s, then 2400 RPM for 3 minutes. Monitor vibration telemetry.',
    source: 'LOCAL KNOWLEDGE BASE'
  },
  {
    id: 'sop-protein-crystal-growth',
    category: 'PROCEDURE',
    keywords: ['protein', 'crystal', 'pcg', 'inoculation', 'crystallization', 'solution'],
    title: 'Protein Crystal Growth (PCG) & Solution Inoculation Protocol',
    summary: 'Investigation BAS-SCI-01 studying macromolecular crystal growth in microgravity without convective turbulence.',
    details: '5-Step Protocol: (01) Workstation Sterilization & Rack Check, (02) Retrieve Protein Sample Container, (03) Inoculate Buffer Solution & Agitate, (04) Thermal Incubation at 22.0°C, (05) Optical Inspection & Cryo-Seal.',
    source: 'LOCAL KNOWLEDGE BASE'
  },

  // 2. Astronaut Activities & Postures
  {
    id: 'act-collect-sample',
    category: 'ACTIVITY',
    keywords: ['collect sample', 'retrieval', 'vial', 'holding vial', 'specimen handling'],
    title: 'Biological Specimen Retrieval Action',
    summary: 'Grip and transfer of sample container from rack cold storage to active workstation.',
    details: 'Astronaut grips sample vial with right hand using precision pinch grip. Left hand stabilizes workstation handhold. Postural orientation is maintained at nominal 45° angle relative to Express Rack origin.',
    source: 'LOCAL KNOWLEDGE BASE'
  },
  {
    id: 'act-lever-actuation',
    category: 'ACTIVITY',
    keywords: ['lever', 'latch', 'lock lever', 'toggle switch', 'valve'],
    title: 'Mechanical Lever Actuation & Rack Engagement',
    summary: 'Two-hand verification of mechanical lock states on payload bays.',
    details: 'Requires 90° downward torque on locking lever until dual micro-switches acknowledge secure lock. Audible mechanical click is confirmed by on-board contact sensor.',
    source: 'LOCAL KNOWLEDGE BASE'
  },

  // 3. Software Modules & Features
  {
    id: 'soft-live-monitor',
    category: 'SOFTWARE',
    keywords: ['live monitor', 'video feed', 'webcam', 'camera', 'real-time observation', 'real time'],
    title: 'Live Monitor Workspace',
    summary: 'Real-time camera observation and action validation console with AI keypoint skeleton overlay.',
    details: 'The Live Monitor streams payload video at 30 FPS, overlays the MoveNet 17-anatomical keypoint skeleton in real time, tracks hand-object interaction (HOI) vectors, and computes temporal step-hold consensus to validate experiment actions before advancing the state machine.',
    source: 'LOCAL KNOWLEDGE BASE'
  },
  {
    id: 'soft-digital-twin',
    category: 'SOFTWARE',
    keywords: ['digital twin', '3d', 'hmr', 'human mesh', 'avatar', 'joints', 'kinematics', 'euler'],
    title: '3D Astronaut Digital Twin (HMR)',
    summary: 'Biomechanical 3D astronaut avatar rigged with 12 articulated anatomical joints inside a realistic space station interior.',
    details: 'Renders in Three.js with realistic NASA EVA space suit geometry, gold optical visor, and PLSS backpack. Converts 2D MoveNet landmark streams into 3D Euler joint rotations (shoulder, elbow, wrist, spine) with synthetic zero-g floating physics and real-time comfort corridor telemetry.',
    source: 'LOCAL KNOWLEDGE BASE'
  },
  {
    id: 'soft-dataset-lab',
    category: 'SOFTWARE',
    keywords: ['dataset', 'model lab', 'training', 'svm', 'random forest', 'classifier', 'accuracy'],
    title: 'Dataset & AI Model Training Laboratory',
    summary: 'Local machine learning workbench for training and evaluating edge activity classifiers directly in the browser.',
    details: 'Supports multi-modal dataset ingestion (CSV, JSON, Parquet), automated exploratory data analysis, and train/test evaluation of local scikit-learn style algorithms (SVM, Random Forest, Decision Tree, Gradient Boosting) with confusion matrices, precision, recall, and edge model deployment.',
    source: 'LOCAL KNOWLEDGE BASE'
  },
  {
    id: 'soft-recordings-uplink',
    category: 'SOFTWARE',
    keywords: ['recordings', 'uplink', 'downlink', 'blackbox', 'packets', 'queue', 'orbital pass'],
    title: 'Recordings & Offline Uplink Controller',
    summary: 'On-board blackbox video archiving and deep-space bandwidth reduction telemetry management.',
    details: 'Archives uncompressed 1080p video locally to NVMe SSD (/data/videos/) while generating compact 2.4 kbps structured JSON telemetry packets with SHA-256 HMAC cryptographic seals. In Low-BW Mode, video remains on-board and only structured state vectors are queued for relay during AOS ground passes.',
    source: 'LOCAL KNOWLEDGE BASE'
  },
  {
    id: 'soft-mission-logs',
    category: 'SOFTWARE',
    keywords: ['mission logs', 'flight logs', 'audit', 'events', 'timestamps', 'met', 'severity'],
    title: 'Mission Event Flight Logs',
    summary: 'Cryptographically sealed audit trail capturing all system, AI, and experiment state transitions.',
    details: 'Logs every step validation, AI bounding box detection, hardware thermal update, and voice alert with microsecond MET and UTC timestamps, severity ratings (INFO, WARNING, SEQUENCE ERROR, CRITICAL), source subsystem tags, and SHA-256 hash seals.',
    source: 'LOCAL KNOWLEDGE BASE'
  },
  {
    id: 'soft-bandwidth-reduction',
    category: 'SOFTWARE',
    keywords: ['bandwidth', 'reduction', 'savings', 'downlink', 'telemetry vs video', 'deep space'],
    title: 'Deep-Space Bandwidth Reduction Architecture',
    summary: 'Eliminating the requirement for 45 Mbps continuous raw video transmission by processing vision on-board.',
    details: 'By executing MoveNet and object detection locally on-device, VYOM DRISHTI transmits only 2.4 kbps structured state vectors instead of 45.0 Mbps uncompressed video streams, delivering an 85% to 95% bandwidth reduction (saving ~486 GB per day).',
    source: 'LOCAL KNOWLEDGE BASE'
  },

  // 4. System Capabilities & Architecture
  {
    id: 'sys-capabilities',
    category: 'SYSTEM',
    keywords: ['capabilities', 'what can you do', 'system', 'software', 'vyom drishti', 'features', 'functions'],
    title: 'VYOM DRISHTI AI Software Architecture & Capabilities',
    summary: 'On-board edge intelligence system for astronaut activity recognition and experiment sequence validation.',
    details: 'Capabilities include: (1) Live video monitoring and keypoint extraction, (2) Real-time activity recognition via MoveNet and kinematic heuristics, (3) Deterministic 5-step SOP sequence validation, (4) Next-step guidance, (5) Skipped and out-of-sequence step detection, (6) Offline voice guidance and voice question recognition, (7) Local blackbox video recording, (8) Cryptographically sealed local audit logs, (9) 3D Human Mesh Recovery (HMR) Digital Twin, and (10) 100% standalone on-device execution with zero cloud dependency.',
    source: 'LOCAL KNOWLEDGE BASE'
  },
  {
    id: 'sys-offline-mode',
    category: 'SYSTEM',
    keywords: ['offline', 'cloud', 'internet', 'standalone', 'network', 'air gap', 'security', 'privacy'],
    title: 'Offline Standalone Security Architecture',
    summary: 'Zero external network transmission guarantee for on-board space operations.',
    details: 'All computer vision inference, natural language reasoning, audio synthesis, and telemetry storage execute 100% on the local workstation processor. No telemetry, video frames, or audio packets leave the spacecraft network.',
    source: 'LOCAL KNOWLEDGE BASE'
  },

  // 5. Mission Context & BAS Station
  {
    id: 'mission-bas',
    category: 'MISSION',
    keywords: ['mission', 'bas', 'space station', 'gaganyaan', 'isro', 'orbit', 'payload rack'],
    title: 'Bharatiya Antariksh Station (BAS) Experiment Context',
    summary: 'On-board scientific research campaign aboard the Bharatiya Antariksh Station in Low Earth Orbit.',
    details: 'Mission BAS-SCI-01 monitors microgravity cell biological crystallization and sample handling procedures inside the Multi-Payload Science Rack. Orbit: 408 km LEO, 51.6° inclination, 7.67 km/s orbital velocity.',
    source: 'LOCAL KNOWLEDGE BASE'
  },

  // 6. Safety & Hazard Controls
  {
    id: 'safety-glovebox',
    category: 'SAFETY',
    keywords: ['safety', 'hazard', 'risk', 'precaution', 'glovebox', 'spill', 'containment'],
    title: 'Payload Bay Containment & Safety Protocols',
    summary: 'Safety interlocks and contamination prevention procedures for biological handling.',
    details: 'Always ensure negative pressure gradient inside glovebox prior to uncapping sample vials. In case of fluid escape, engage high-efficiency HEPA particulate scrubber immediately. Do not bypass mechanical interlocks.',
    source: 'LOCAL KNOWLEDGE BASE'
  },

  // 7. FAQs & Troubleshooting
  {
    id: 'faq-step-fail',
    category: 'FAQ',
    keywords: ['why did step fail', 'flagged', 'deviation', 'wrong step', 'error'],
    title: 'Sequence Deviation Diagnosis & Troubleshooting',
    summary: 'How the system detects and resolves out-of-sequence or skipped experiment actions.',
    details: 'The system validates actions against a deterministic state machine. If an astronaut reaches for a tool or performs a step before preceding preconditions are satisfied (e.g., locking before cartridge insertion), the step is flagged with a corrective verbal cue.',
    source: 'LOCAL KNOWLEDGE BASE'
  }
];

export class LocalKnowledgeService {
  /**
   * Searches local knowledge base for relevant items matching user query
   */
  public search(query: string): KnowledgeItem | null {
    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/).filter(w => w.length > 2);

    let bestMatch: KnowledgeItem | null = null;
    let highestScore = 0;

    for (const item of LOCAL_KNOWLEDGE_BASE) {
      let score = 0;

      // Exact keyword match
      for (const kw of item.keywords) {
        if (q.includes(kw.toLowerCase())) {
          score += 6;
        }
      }

      // Word match in title or summary
      for (const word of words) {
        if (item.title.toLowerCase().includes(word)) score += 3;
        if (item.summary.toLowerCase().includes(word)) score += 2;
        if (item.details.toLowerCase().includes(word)) score += 1;
      }

      if (score > highestScore && score >= 4) {
        highestScore = score;
        bestMatch = item;
      }
    }

    return bestMatch;
  }
}

export const localKnowledgeService = new LocalKnowledgeService();
