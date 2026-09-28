import { ExperimentProtocol, ExperimentStep } from '../types/mission';

export interface CanonicalExperiment {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  category: 'Bio-Science' | 'AI/ML' | 'Life Science' | 'Physics';
  categoryCode: 'BIO' | 'AI' | 'LIFE' | 'PHYSICS';
  description: string;
  status: 'Running' | 'Demo' | 'Available' | 'Completed' | 'Paused';
  totalSteps: number;
  steps: ExperimentStep[];
  image: string;
  equipmentImage: string;
  tags: { label: string; color: string }[];
  payload: string;
  location: string;
  principalInvestigator: string;
  hazardLevel: 'LOW' | 'BIO-SAFETY-1' | 'BIO-SAFETY-2' | 'THERMAL';
  detailRoute: string;
  protocol: ExperimentProtocol;
}

export const CANONICAL_EXPERIMENTS: CanonicalExperiment[] = [
  // 1. BAS-SCI-01: Protein Crystal Growth & Solution Inoculation (PCG)
  {
    id: 'BAS-SCI-01',
    code: 'BAS-SCI-01',
    title: 'Protein Crystal Growth & Solution Inoculation (PCG)',
    shortTitle: 'Protein Crystal Growth',
    category: 'Bio-Science',
    categoryCode: 'BIO',
    description: 'On-board scientific protocol for protein crystallization and solution inoculation in microgravity environment.',
    status: 'Running',
    totalSteps: 5,
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
    equipmentImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&auto=format&fit=crop&q=80',
    tags: [
      { label: 'Bio-Science', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
      { label: 'Express Rack-04', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' }
    ],
    payload: 'EXPRESS RACK-04 [PAYLOAD BAY-C4]',
    location: 'Express Rack-04',
    principalInvestigator: 'ISRO Space Station Biology Payload Facility',
    hazardLevel: 'BIO-SAFETY-1',
    detailRoute: '/experiments/BAS-SCI-01',
    steps: [
      {
        stepNumber: 1,
        stepCode: 'SCI-STEP-01',
        title: 'Open Payload Rack',
        expectedAction: 'Disengage mechanical latch and open payload rack door.',
        targetObject: 'Payload-Rack-Latch-C4',
        durationEstimateSec: 15,
        safetyRequirement: 'Ensure rack hinge is locked in open position before reaching inside.',
        scientificRationale: 'Grants access to microgravity incubation manifold and sample cartridge dock.',
        voicePrompt: 'Step 1: Disengage mechanical latch and open the payload rack door.',
        validationRules: {
          requiredObjects: ['Payload-Rack-Latch-C4'],
          requiredHandInteraction: 'LID_OPEN',
          requiredKinematicAction: 'OPEN_PAYLOAD_RACK'
        }
      },
      {
        stepNumber: 2,
        stepCode: 'SCI-STEP-02',
        title: 'Collect Sample',
        expectedAction: 'Retrieve biological sample vial from cold storage container.',
        targetObject: 'Biological-Sample-Vial-A',
        durationEstimateSec: 20,
        safetyRequirement: 'Verify barcode tag and ensure thermal equilibrium threshold.',
        scientificRationale: 'Prepares biological specimen for microfluidic cartridge inoculation.',
        voicePrompt: 'Step 2: Retrieve biological sample vial from storage.',
        validationRules: {
          requiredObjects: ['Biological-Sample-Vial-A'],
          requiredHandInteraction: 'GRIP',
          requiredKinematicAction: 'COLLECT_SAMPLE'
        }
      },
      {
        stepNumber: 3,
        stepCode: 'SCI-STEP-03',
        title: 'Clean Sample Area',
        expectedAction: 'Sanitize working area using approved wipes.',
        targetObject: 'Ultrasonic-Cleaner-Stage',
        durationEstimateSec: 15,
        safetyRequirement: 'Use approved sterilizing swab to prevent cross-contamination.',
        scientificRationale: 'Eliminates dust particulate and residual fluid films in zero-g.',
        voicePrompt: 'Step 3: Sanitize working area using approved wipes.',
        validationRules: {
          requiredObjects: ['Ultrasonic-Cleaner-Stage'],
          requiredHandInteraction: 'HOLDING',
          requiredKinematicAction: 'CLEAN_SAMPLE_AREA'
        }
      },
      {
        stepNumber: 4,
        stepCode: 'SCI-STEP-04',
        title: 'Install Cartridge',
        expectedAction: 'Install sample cartridge into microgravity chamber.',
        targetObject: 'Microfluidic-Cartridge-Dock',
        durationEstimateSec: 25,
        safetyRequirement: 'Ensure guide pins align before applying axial insertion pressure.',
        scientificRationale: 'Establishes hermetic microfluidic coupling with station telemetry sensors.',
        voicePrompt: 'Step 4: Align guide pins and install sample cartridge into chamber.',
        validationRules: {
          requiredObjects: ['Microfluidic-Cartridge-Dock'],
          requiredHandInteraction: 'INSERTING',
          requiredKinematicAction: 'INSTALL_SAMPLE_CARTRIDGE'
        }
      },
      {
        stepNumber: 5,
        stepCode: 'SCI-STEP-05',
        title: 'Seal Chamber',
        expectedAction: 'Close and seal chamber, verify lock status.',
        targetObject: 'Hermetic-Seal-Clamps',
        durationEstimateSec: 15,
        safetyRequirement: 'Confirm dual tactile clicks and green LED lock telemetry.',
        scientificRationale: 'Locks chamber atmosphere and prevents outgassing during experiment run.',
        voicePrompt: 'Step 5: Engage hermetic seal clamps to lock chamber.',
        validationRules: {
          requiredObjects: ['Hermetic-Seal-Clamps'],
          requiredHandInteraction: 'LID_CLOSE',
          requiredKinematicAction: 'SEAL_CARTRIDGE'
        }
      }
    ],
    protocol: {
      id: 'exp-bas-sci-01',
      code: 'BAS-SCI-01',
      name: 'Protein Crystal Growth & Solution Inoculation (PCG)',
      category: 'BIOLOGICAL',
      rackLocation: 'EXPRESS RACK-04 [PAYLOAD BAY-C4]',
      principalInvestigator: 'ISRO Space Station Biology Payload Facility',
      description: 'On-board scientific protocol for protein crystallization and solution inoculation in microgravity environment.',
      totalSteps: 5,
      hazardLevel: 'BIO-SAFETY-1',
      steps: []
    }
  },

  // 2. BAS-DEMO-01: Live Human Activity Recognition Demo
  {
    id: 'BAS-DEMO-01',
    code: 'BAS-DEMO-01',
    title: 'Live Human Activity Recognition Demo',
    shortTitle: 'Live Activity Demo',
    category: 'AI/ML',
    categoryCode: 'AI',
    description: 'Real-time AI activity recognition demo to validate on-orbit human action monitoring and guidance system.',
    status: 'Demo',
    totalSteps: 5,
    image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800&auto=format&fit=crop&q=80',
    equipmentImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
    tags: [
      { label: 'AI/ML', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' },
      { label: 'Express Rack-01', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' }
    ],
    payload: 'EXPRESS RACK-01 [LIVE WEBCAM MODE]',
    location: 'Express Rack-01',
    principalInvestigator: 'AvishkarX Interactive Live Webcam Demo',
    hazardLevel: 'LOW',
    detailRoute: '/experiments/BAS-DEMO-01',
    steps: [
      {
        stepNumber: 1,
        stepCode: 'DEMO-STP-01',
        title: 'Hands at Rest',
        expectedAction: 'Place both hands down and stay still for a moment.',
        targetObject: 'Resting Position',
        durationEstimateSec: 6,
        safetyRequirement: 'Keep your upper body comfortably in camera view.',
        scientificRationale: 'Establishes initial operator baseline posture before activity sequence.',
        voicePrompt: 'Step 1: Place both hands down and stay still for a moment.',
        validationRules: {
          requiredObjects: ['Resting Position'],
          requiredHandInteraction: 'RESTING',
          requiredKinematicAction: 'HANDS_AT_REST'
        }
      },
      {
        stepNumber: 2,
        stepCode: 'DEMO-STP-02',
        title: 'Raise Right Hand',
        expectedAction: 'Slowly raise your right hand.',
        targetObject: 'Right Arm',
        durationEstimateSec: 6,
        safetyRequirement: 'Raise right hand gently in front of camera.',
        scientificRationale: 'Validates unilateral limb elevation and orientation tracking.',
        voicePrompt: 'Step 2: Slowly raise your right hand.',
        validationRules: {
          requiredObjects: ['Right Arm'],
          requiredHandInteraction: 'REACHING',
          requiredKinematicAction: 'RAISE_RIGHT_HAND'
        }
      },
      {
        stepNumber: 3,
        stepCode: 'DEMO-STP-03',
        title: 'Lower Right Hand',
        expectedAction: 'Lower your right hand.',
        targetObject: 'Resting Position',
        durationEstimateSec: 6,
        safetyRequirement: 'Lower right hand back to resting position.',
        scientificRationale: 'Confirms downward transition and postural recovery.',
        voicePrompt: 'Step 3: Lower your right hand.',
        validationRules: {
          requiredObjects: ['Resting Position'],
          requiredHandInteraction: 'RESTING',
          requiredKinematicAction: 'LOWER_RIGHT_HAND'
        }
      },
      {
        stepNumber: 4,
        stepCode: 'DEMO-STP-04',
        title: 'Raise Both Hands',
        expectedAction: 'Raise both hands.',
        targetObject: 'Both Arms',
        durationEstimateSec: 8,
        safetyRequirement: 'Raise both hands upward in camera frame.',
        scientificRationale: 'Validates bilateral multi-joint kinematic coordination in zero-g.',
        voicePrompt: 'Step 4: Raise both hands.',
        validationRules: {
          requiredObjects: ['Both Arms'],
          requiredHandInteraction: 'REACHING',
          requiredKinematicAction: 'RAISE_BOTH_HANDS'
        }
      },
      {
        stepNumber: 5,
        stepCode: 'DEMO-STP-05',
        title: 'Return to Rest',
        expectedAction: 'Return both hands to the resting position.',
        targetObject: 'Resting Position',
        durationEstimateSec: 6,
        safetyRequirement: 'Return hands to resting posture to complete sequence.',
        scientificRationale: 'Completes validation cycle and seals SOP execution audit log.',
        voicePrompt: 'Step 5: Return both hands to the resting position.',
        validationRules: {
          requiredObjects: ['Resting Position'],
          requiredHandInteraction: 'RESTING',
          requiredKinematicAction: 'HANDS_AT_REST'
        }
      }
    ],
    protocol: {
      id: 'exp-bas-demo-01',
      code: 'BAS-DEMO-01',
      name: 'Live Human Activity Recognition Demo',
      category: 'BIOLOGICAL',
      rackLocation: 'EXPRESS RACK-01 [LIVE WEBCAM MODE]',
      principalInvestigator: 'AvishkarX Interactive Live Webcam Demo',
      description: 'Real-time AI activity recognition demo to validate on-orbit human action monitoring and guidance system.',
      totalSteps: 5,
      hazardLevel: 'LOW',
      steps: []
    }
  },

  // 3. GAGANYAAN-CELL-02: Osteoblast Cell Culture Fixation & Bio-container
  {
    id: 'GAGANYAAN-CELL-02',
    code: 'GAGANYAAN-CELL-02',
    title: 'Osteoblast Cell Culture Fixation & Bio-container',
    shortTitle: 'Osteoblast Cell Culture',
    category: 'Life Science',
    categoryCode: 'LIFE',
    description: 'Investigation of microgravity-induced bone density loss via osteoblast cytoskeleton fixation.',
    status: 'Available',
    totalSteps: 6,
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80',
    equipmentImage: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&auto=format&fit=crop&q=80',
    tags: [
      { label: 'Life Science', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
      { label: 'Bio-Safety-2', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' }
    ],
    payload: 'RACK-GAGANYAAN-BIO-01 [BAY-A1]',
    location: 'Glovebox BGU-1',
    principalInvestigator: 'Dr. V. Ramanathan (ISRO Space Biology Division)',
    hazardLevel: 'BIO-SAFETY-2',
    detailRoute: '/experiments/GAGANYAAN-CELL-02',
    steps: [
      {
        stepNumber: 1,
        stepCode: 'CELL-STP-01',
        title: 'Access Biosafety Glovebox Unit (BGU-1)',
        expectedAction: 'Insert Hands into BGU Negative Pressure Ports',
        targetObject: 'Biosafety-Glovebox-BGU1',
        durationEstimateSec: 30,
        safetyRequirement: 'Ensure negative differential pressure reading is above 25 Pa.',
        scientificRationale: 'Protects cabin from bio-aerosols during active handling.',
        voicePrompt: 'Step 1: Engage BGU-1 ports and verify differential pressure reading.',
        validationRules: {
          requiredObjects: ['Biosafety-Glovebox-BGU1'],
          requiredHandInteraction: 'INSERTING'
        }
      },
      {
        stepNumber: 2,
        stepCode: 'CELL-STP-02',
        title: 'Extract Culture Well Plate #03 from Incubator',
        expectedAction: 'Transfer Well Plate from Incubator to Workspace',
        targetObject: 'Cell-Well-Plate-03',
        durationEstimateSec: 45,
        safetyRequirement: 'Handle by frosted perimeter rim only.',
        scientificRationale: 'Prevents thermal shock and surface contamination.',
        voicePrompt: 'Step 2: Transfer Cell Well Plate 03 to the central imaging stage.',
        validationRules: {
          requiredObjects: ['Cell-Well-Plate-03', 'Incubator-Chamber'],
          requiredHandInteraction: 'GRIP'
        }
      },
      {
        stepNumber: 3,
        stepCode: 'CELL-STP-03',
        title: 'Introduce Paraformaldehyde Fixative Agent',
        expectedAction: 'Dispense 100μL Fixative Solution into Wells',
        targetObject: 'Fixative-Dispenser-PFA',
        durationEstimateSec: 75,
        safetyRequirement: 'Verify fixative canister is fully sealed inside secondary sleeve.',
        scientificRationale: 'Cross-links proteins to preserve microgravity cytoskeleton morphology.',
        voicePrompt: 'Step 3: Dispense fixative agent uniformly across active culture wells.',
        validationRules: {
          requiredObjects: ['Fixative-Dispenser-PFA', 'Cell-Well-Plate-03'],
          requiredHandInteraction: 'PIPETTING'
        }
      },
      {
        stepNumber: 4,
        stepCode: 'CELL-STP-04',
        title: 'Perform 3-Stage Phosphate Buffer Wash',
        expectedAction: 'Aspirate Residual Fixative & Apply PBS Wash',
        targetObject: 'Aspiration-Wand-PBS',
        durationEstimateSec: 120,
        safetyRequirement: 'Maintain waste tube vacuum below 0.3 bar.',
        scientificRationale: 'Removes unbound fixative to prevent over-crosslinking artifacts.',
        voicePrompt: 'Step 4: Perform buffer rinse and aspirate waste into containment flask.',
        validationRules: {
          requiredObjects: ['Aspiration-Wand-PBS', 'Cell-Well-Plate-03'],
          requiredHandInteraction: 'PIPETTING'
        }
      },
      {
        stepNumber: 5,
        stepCode: 'CELL-STP-05',
        title: 'Transfer Stained Plate to Fluorescence Imager',
        expectedAction: 'Mount Plate into Confocal Imaging Chamber',
        targetObject: 'Confocal-Imager-Port',
        durationEstimateSec: 60,
        safetyRequirement: 'Shield plate from ambient cabin illumination.',
        scientificRationale: 'Preserves fluorophore emission intensity during spatial scanning.',
        voicePrompt: 'Step 5: Mount sample plate into the confocal imaging port.',
        validationRules: {
          requiredObjects: ['Cell-Well-Plate-03', 'Confocal-Imager-Port'],
          requiredHandInteraction: 'INSERTING'
        }
      },
      {
        stepNumber: 6,
        stepCode: 'CELL-STP-06',
        title: 'Secure Hazardous Reagent Container & Seal BGU-1',
        expectedAction: 'Cap Reagents & Disengage Glove Ports',
        targetObject: 'Hazardous-Waste-Canister',
        durationEstimateSec: 40,
        safetyRequirement: 'Verify double containment seal before glove extraction.',
        scientificRationale: 'Adheres to BAS Bio-Safety Level 2 containment protocols.',
        voicePrompt: 'Step 6: Cap waste canister and execute glovebox purge cycle.',
        validationRules: {
          requiredObjects: ['Hazardous-Waste-Canister', 'Biosafety-Glovebox-BGU1'],
          requiredHandInteraction: 'LID_CLOSE'
        }
      }
    ],
    protocol: {
      id: 'exp-gaganyaan-cell-02',
      code: 'GAGANYAAN-CELL-02',
      name: 'Osteoblast Cell Culture Fixation & Bio-container',
      category: 'CELL_CULTURE',
      rackLocation: 'RACK-GAGANYAAN-BIO-01 [BAY-A1]',
      principalInvestigator: 'Dr. V. Ramanathan (ISRO Space Biology Division)',
      description: 'Investigation of microgravity-induced bone density loss via osteoblast cytoskeleton fixation.',
      totalSteps: 6,
      hazardLevel: 'BIO-SAFETY-2',
      steps: []
    }
  },

  // 4. INEX-PHYS-01: Capillary Fluid Flow & Wetting Dynamics
  {
    id: 'INEX-PHYS-01',
    code: 'INEX-PHYS-01',
    title: 'Capillary Fluid Flow & Wetting Dynamics',
    shortTitle: 'Capillary Fluid Dynamics',
    category: 'Physics',
    categoryCode: 'PHYSICS',
    description: 'Observation of liquid interface wetting velocities in complex micro-groove geometries in zero-g.',
    status: 'Available',
    totalSteps: 5,
    image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80',
    equipmentImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80',
    tags: [
      { label: 'Physics', color: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300' },
      { label: 'Micro-Gravity', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' }
    ],
    payload: 'RACK-PHYSICS-MICRO-03 [BAY-B2]',
    location: 'Physics Rack-03',
    principalInvestigator: 'Prof. K. Sivaraman (ISRO-IISc Microgravity Laboratory)',
    hazardLevel: 'LOW',
    detailRoute: '/experiments/INEX-PHYS-01',
    steps: [
      {
        stepNumber: 1,
        stepCode: 'PHYS-STP-01',
        title: 'Verify Payload Optical Alignment Matrix',
        expectedAction: 'Calibrate High-Speed Camera Illuminator',
        targetObject: 'Optical-Illuminator-Rig',
        durationEstimateSec: 35,
        safetyRequirement: 'Do not stare directly into high-intensity LED illuminator array.',
        scientificRationale: 'Ensures shadowless boundary illumination of liquid meniscus.',
        voicePrompt: 'Step 1: Check optical alignment matrix and set illumination to 85%.',
        validationRules: {
          requiredObjects: ['Optical-Illuminator-Rig'],
          requiredHandInteraction: 'GRIP'
        }
      },
      {
        stepNumber: 2,
        stepCode: 'PHYS-STP-02',
        title: 'Insert Fluorinated Polymer Test Capillary',
        expectedAction: 'Mount Capillary Tube into Test Cell Vane',
        targetObject: 'Capillary-Vane-Assembly',
        durationEstimateSec: 50,
        safetyRequirement: 'Use vacuum tweezers to avoid oil contamination on quartz tube.',
        scientificRationale: 'Zero-G contact angle measurements are highly sensitive to surface energy.',
        voicePrompt: 'Step 2: Mount fluorinated capillary test tube into the observation vane.',
        validationRules: {
          requiredObjects: ['Capillary-Vane-Assembly'],
          requiredHandInteraction: 'INSERTING'
        }
      },
      {
        stepNumber: 3,
        stepCode: 'PHYS-STP-03',
        title: 'Inject Silicone Test Oil via Precision Syringe',
        expectedAction: 'Prime Micro-Syringe and Connect Luer-Lock',
        targetObject: 'Precision-Syringe-Pump',
        durationEstimateSec: 60,
        safetyRequirement: 'Check for micro-leaks at Luer-lock connection before valve open.',
        scientificRationale: 'Delivers exactly 500 nL/sec steady-state volumetric injection.',
        voicePrompt: 'Step 3: Connect syringe Luer lock and begin priming phase.',
        validationRules: {
          requiredObjects: ['Precision-Syringe-Pump', 'Capillary-Vane-Assembly'],
          requiredHandInteraction: 'PIPETTING'
        }
      },
      {
        stepNumber: 4,
        stepCode: 'PHYS-STP-04',
        title: 'Trigger High-Speed Telemetry Video Recording',
        expectedAction: 'Engage 1000 FPS Trigger on Edge Console',
        targetObject: 'Edge-HighSpeed-Trigger',
        durationEstimateSec: 25,
        safetyRequirement: 'Verify edge local SSD has > 10GB write capacity.',
        scientificRationale: 'Captures microsecond dynamic wetting front progression.',
        voicePrompt: 'Step 4: Engage high-speed video capture and observe fluid wavefront.',
        validationRules: {
          requiredObjects: ['Edge-HighSpeed-Trigger'],
          requiredHandInteraction: 'GRIP'
        }
      },
      {
        stepNumber: 5,
        stepCode: 'PHYS-STP-05',
        title: 'Purge Capillary Manifold with Nitrogen Gas',
        expectedAction: 'Open N2 Vent Valve for 15 Seconds',
        targetObject: 'N2-Purge-Valve',
        durationEstimateSec: 30,
        safetyRequirement: 'Observe cabin acoustic levels and line pressure gauge.',
        scientificRationale: 'Clears residual liquid for subsequent experiment iterations.',
        voicePrompt: 'Step 5: Open Nitrogen vent valve and purge test channel.',
        validationRules: {
          requiredObjects: ['N2-Purge-Valve'],
          requiredHandInteraction: 'LID_OPEN'
        }
      }
    ],
    protocol: {
      id: 'exp-inex-phys-01',
      code: 'INEX-PHYS-01',
      name: 'Capillary Fluid Flow & Wetting Dynamics',
      category: 'PHYSICAL_SCIENCES',
      rackLocation: 'RACK-PHYSICS-MICRO-03 [BAY-B2]',
      principalInvestigator: 'Prof. K. Sivaraman (ISRO-IISc Microgravity Laboratory)',
      description: 'Observation of liquid interface wetting velocities in complex micro-groove geometries in zero-g.',
      totalSteps: 5,
      hazardLevel: 'LOW',
      steps: []
    }
  }
];

// Link the steps array to protocol.steps
CANONICAL_EXPERIMENTS.forEach(exp => {
  exp.protocol.steps = exp.steps;
});

/**
 * Finds a canonical experiment by any identifier (id, code, or alias)
 */
export function getExperimentById(idOrCode?: string): CanonicalExperiment | undefined {
  if (!idOrCode) return CANONICAL_EXPERIMENTS[0];
  const normalized = idOrCode.toLowerCase().trim();
  
  return CANONICAL_EXPERIMENTS.find(exp => {
    const expId = exp.id.toLowerCase();
    const expCode = exp.code.toLowerCase();
    const protoId = exp.protocol.id.toLowerCase();
    
    return expId === normalized || 
           expCode === normalized || 
           protoId === normalized ||
           (normalized.includes('phys') && expCode.includes('PHYS')) ||
           (normalized.includes('cell') && expCode.includes('CELL')) ||
           (normalized.includes('demo') && expCode.includes('DEMO')) ||
           (normalized.includes('sci') && expCode.includes('SCI'));
  });
}

/**
 * Generates canonical ExperimentProtocol array for use across the app store
 */
export function getCanonicalProtocols(): ExperimentProtocol[] {
  return CANONICAL_EXPERIMENTS.map(exp => ({
    ...exp.protocol,
    steps: exp.steps
  }));
}
