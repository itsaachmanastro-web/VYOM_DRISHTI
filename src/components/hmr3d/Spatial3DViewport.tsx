import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useMissionStore } from '../../store/missionStore';
import { 
  Rotate3d, 
  Maximize2, 
  Compass, 
  Layers, 
  Activity, 
  Zap, 
  Radio,
  Eye,
  RefreshCw,
  Sliders,
  Crosshair,
  Info,
  CheckCircle2,
  Video,
  Camera,
  Play,
  Pause,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Box,
  AlertTriangle,
  Flame,
  SkipForward,
  Check,
  ChevronDown,
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize,
  HelpCircle,
  FileText
} from 'lucide-react';

interface JointMarkerData {
  id: string;
  name: string;
  angleName: string;
  defaultAngle: number;
  minSafeAngle: number;
  maxSafeAngle: number;
  stationPosition: [number, number, number]; // [X, Y, Z]
  movementType: 'Flexion' | 'Abduction' | 'Pronation' | 'Tilt' | 'Plantarflexion';
}

export const Spatial3DViewport: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const { 
    isRealTrackingActive, 
    realJointAngles, 
    angularVelocity,
    isWebcamActive,
    selectedJointInfo,
    setSelectedJointInfo,
    currentActionName,
    activeProtocol,
    currentStepIndex,
    orientationReferenceFrame,
    setOrientationReferenceFrame,
    hoiInteraction,
    runSuccessfulDemo,
    runOutOfSequenceDemo,
    runSkippedStepDemo,
    validationResult
  } = useMissionStore();

  const currentStep = activeProtocol.steps[currentStepIndex];

  // Visualization toggles
  const [isPlaying, setIsPlaying] = useState(true);
  const [showMesh, setShowMesh] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showJointAngles, setShowJointAngles] = useState(true);
  const [showHullBeam, setShowHullBeam] = useState(true);
  const [isMicrogravity, setIsMicrogravity] = useState(true);
  const [activeJointId, setActiveJointId] = useState<string>('r_elbow');
  const [cameraPreset, setCameraPreset] = useState<'ISO' | 'FRONT' | 'TOP' | 'SIDE' | 'RACK'>('ISO');
  const [selectedJointGroup, setSelectedJointGroup] = useState<'Right Arm' | 'Left Arm' | 'Spine & Legs'>('Right Arm');
  const [chartJoint, setChartJoint] = useState<'Elbow Flexion' | 'Shoulder Pitch' | 'Shoulder Roll'>('Elbow Flexion');

  // Euler Posture & Telemetry
  const [postureAngle, setPostureAngle] = useState({ pitch: -12.4, roll: 6.8, yaw: 3.1 });
  const [driftVelocity] = useState({ x: 0.012, y: -0.004, z: 0.003 });
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [timelineProgress, setTimelineProgress] = useState<number>(35);

  // 12 Standard Anatomical Joints for HMR Digital Twin
  const jointMarkers: JointMarkerData[] = [
    { id: 'neck', name: 'Cervical Spine / Neck', angleName: 'Cervical Flexion', defaultAngle: 15, minSafeAngle: 0, maxSafeAngle: 45, stationPosition: [0, 0.76, 0], movementType: 'Flexion' },
    { id: 'r_shoulder', name: 'Right Shoulder', angleName: 'Shoulder Pitch', defaultAngle: -25.4, minSafeAngle: -60, maxSafeAngle: 160, stationPosition: [0.38, 0.58, 0], movementType: 'Abduction' },
    { id: 'l_shoulder', name: 'Left Shoulder', angleName: 'Shoulder Pitch', defaultAngle: -22.1, minSafeAngle: -60, maxSafeAngle: 160, stationPosition: [-0.38, 0.58, 0], movementType: 'Abduction' },
    { id: 'r_elbow', name: 'Right Elbow', angleName: 'Elbow Flexion', defaultAngle: 118.0, minSafeAngle: 30, maxSafeAngle: 165, stationPosition: [0.55, 0.22, 0.22], movementType: 'Flexion' },
    { id: 'l_elbow', name: 'Left Elbow', angleName: 'Elbow Flexion', defaultAngle: 95.0, minSafeAngle: 30, maxSafeAngle: 165, stationPosition: [-0.55, 0.22, 0.18], movementType: 'Flexion' },
    { id: 'r_wrist', name: 'Right Wrist / Hand', angleName: 'Wrist Pitch', defaultAngle: -18.3, minSafeAngle: -45, maxSafeAngle: 85, stationPosition: [0.48, -0.08, 0.46], movementType: 'Pronation' },
    { id: 'l_wrist', name: 'Left Wrist / Hand', angleName: 'Wrist Pitch', defaultAngle: 24.5, minSafeAngle: -45, maxSafeAngle: 85, stationPosition: [-0.48, -0.08, 0.38], movementType: 'Pronation' },
    { id: 'pelvis', name: 'Pelvis / Core', angleName: 'Pelvic Tilt', defaultAngle: 8.4, minSafeAngle: -15, maxSafeAngle: 25, stationPosition: [0, 0.05, 0], movementType: 'Tilt' },
    { id: 'r_knee', name: 'Right Knee', angleName: 'Knee Flexion', defaultAngle: 128.0, minSafeAngle: 45, maxSafeAngle: 160, stationPosition: [0.24, -0.56, 0.18], movementType: 'Flexion' },
    { id: 'l_knee', name: 'Left Knee', angleName: 'Knee Flexion', defaultAngle: 135.0, minSafeAngle: 45, maxSafeAngle: 160, stationPosition: [-0.24, -0.56, -0.08], movementType: 'Flexion' },
    { id: 'r_ankle', name: 'Right Ankle', angleName: 'Ankle Dorsiflexion', defaultAngle: 92.0, minSafeAngle: 70, maxSafeAngle: 120, stationPosition: [0.28, -1.05, 0.32], movementType: 'Plantarflexion' },
    { id: 'l_ankle', name: 'Left Ankle', angleName: 'Ankle Plantarflexion', defaultAngle: 88.0, minSafeAngle: 70, maxSafeAngle: 120, stationPosition: [-0.28, -1.05, 0.08], movementType: 'Plantarflexion' }
  ];

  // Resolve current angle dynamically
  const getAngleForJoint = (id: string): number => {
    if (isWebcamActive && isRealTrackingActive) {
      if (id === 'r_elbow') return realJointAngles.rightElbow;
      if (id === 'l_elbow') return realJointAngles.leftElbow;
      if (id === 'r_shoulder') return realJointAngles.rightShoulder;
      if (id === 'l_shoulder') return realJointAngles.leftShoulder;
      if (id === 'r_knee') return realJointAngles.rightKnee;
      if (id === 'l_knee') return realJointAngles.leftKnee;
    }
    const match = jointMarkers.find(j => j.id === id);
    return match ? match.defaultAngle : 90;
  };

  const currentJoint = jointMarkers.find(j => j.id === activeJointId) || jointMarkers[3];
  const currentAngle = getAngleForJoint(activeJointId);
  const isAngleSafe = currentAngle >= currentJoint.minSafeAngle && currentAngle <= currentJoint.maxSafeAngle;
  const jointVelocity = (angularVelocity > 0 ? angularVelocity : 0.02).toFixed(2);

  // Camera presets
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(2.2, 1.4, 3.6));
  const targetCamLookRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.15, 0));

  const applyCameraPreset = (preset: 'ISO' | 'FRONT' | 'TOP' | 'SIDE' | 'RACK') => {
    setCameraPreset(preset);
    if (preset === 'ISO') {
      targetCamPosRef.current.set(2.2, 1.4, 3.6);
      targetCamLookRef.current.set(0, 0.15, 0);
    } else if (preset === 'FRONT') {
      targetCamPosRef.current.set(0, 0.2, 3.8);
      targetCamLookRef.current.set(0, 0.15, 0);
    } else if (preset === 'TOP') {
      targetCamPosRef.current.set(0, 4.4, 0.2);
      targetCamLookRef.current.set(0, 0, 0);
    } else if (preset === 'SIDE') {
      targetCamPosRef.current.set(3.8, 0.2, 0);
      targetCamLookRef.current.set(0, 0.15, 0);
    } else if (preset === 'RACK') {
      targetCamPosRef.current.set(1.1, 0.6, 2.0);
      targetCamLookRef.current.set(0.3, 0.3, -0.4);
    }
  };

  const handleZoom = (delta: number) => {
    targetCamPosRef.current.multiplyScalar(delta > 0 ? 0.85 : 1.15);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 540;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.copy(targetCamPosRef.current);
    camera.lookAt(targetCamLookRef.current);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. Realistic Space Station Laboratory Lighting
    const ambientLight = new THREE.AmbientLight(0xdce7f5, 1.2);
    scene.add(ambientLight);

    const overheadKeyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    overheadKeyLight.position.set(3, 8, 4);
    overheadKeyLight.castShadow = true;
    overheadKeyLight.shadow.mapSize.width = 1024;
    overheadKeyLight.shadow.mapSize.height = 1024;
    scene.add(overheadKeyLight);

    const rackFillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    rackFillLight.position.set(-4, 3, -2);
    scene.add(rackFillLight);

    const visorGleamLight = new THREE.PointLight(0xffeedd, 1.8, 8);
    visorGleamLight.position.set(1.5, 2.2, 2.5);
    scene.add(visorGleamLight);

    const rimCyanLight = new THREE.PointLight(0x06b6d4, 1.2, 10);
    rimCyanLight.position.set(-2, 1, -2.5);
    scene.add(rimCyanLight);

    // 3. Realistic Space Station Module Interior (Laboratory Racks & Panels)
    const stationGroup = new THREE.Group();

    // Floor and Ceiling Panels
    const floorGeo = new THREE.BoxGeometry(8, 0.2, 8);
    const panelMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      roughness: 0.35, 
      metalness: 0.8 
    });
    const floorMesh = new THREE.Mesh(floorGeo, panelMat);
    floorMesh.position.set(0, -1.6, 0);
    floorMesh.receiveShadow = true;
    stationGroup.add(floorMesh);

    const ceilingMesh = new THREE.Mesh(floorGeo, panelMat);
    ceilingMesh.position.set(0, 2.4, 0);
    stationGroup.add(ceilingMesh);

    // Back & Side Equipment Rack Walls
    const backWallGeo = new THREE.BoxGeometry(8, 4.0, 0.4);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.7 });
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 0.4, -2.2);
    stationGroup.add(backWall);

    // Modular Scientific Express Racks
    [-2.2, -0.7, 0.7, 2.2].forEach((xPos, idx) => {
      const rackGeo = new THREE.BoxGeometry(1.2, 3.2, 0.8);
      const rackMat = new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0x1e293b : 0x334155,
        roughness: 0.4,
        metalness: 0.6
      });
      const rack = new THREE.Mesh(rackGeo, rackMat);
      rack.position.set(xPos, 0.3, -1.8);
      stationGroup.add(rack);

      // Locker bays & specimen access ports
      [-0.6, 0.3, 1.1].forEach(yPos => {
        const lockerGeo = new THREE.BoxGeometry(1.0, 0.6, 0.05);
        const lockerMat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          roughness: 0.3,
          metalness: 0.85
        });
        const locker = new THREE.Mesh(lockerGeo, lockerMat);
        locker.position.set(xPos, yPos, -1.38);
        stationGroup.add(locker);

        // Status indicator LED
        const ledGeo = new THREE.BoxGeometry(0.06, 0.03, 0.02);
        const ledMat = new THREE.MeshBasicMaterial({ color: idx === 1 ? 0x10b981 : 0x0284c7 });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(xPos + 0.35, yPos + 0.18, -1.34);
        stationGroup.add(led);
      });
    });

    // Anodized Aluminum 0-G Handrails (Blue & Yellow)
    const handrailMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.2 });
    [-1.5, 1.5].forEach(x => {
      const railGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.4, 16);
      const rail = new THREE.Mesh(railGeo, handrailMat);
      rail.rotation.x = Math.PI / 2;
      rail.position.set(x, 1.8, -0.6);
      stationGroup.add(rail);
    });

    // Laboratory Grid Lines on Floor
    const gridHelper = new THREE.GridHelper(6, 16, 0x0284c7, 0x1e293b);
    gridHelper.position.set(0, -1.48, 0);
    stationGroup.add(gridHelper);

    scene.add(stationGroup);

    // 4. HIGH-FIDELITY REALISTIC HUMAN ASTRONAUT RIG
    const astronautRoot = new THREE.Group();

    // High-Resolution Materials
    const suitWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xebf2f8, // Multi-layer insulation (MLI) clean space fabric
      roughness: 0.45,
      metalness: 0.12,
      wireframe: !showMesh
    });

    const suitJointMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Articulated pressurized rubber joint bellows
      roughness: 0.65,
      metalness: 0.25,
      wireframe: !showMesh
    });

    const goldVisorMat = new THREE.MeshStandardMaterial({
      color: 0x1a1505, // Deep reflective dark gold optical visor
      roughness: 0.04,
      metalness: 0.96,
      emissive: 0x332400
    });

    const dcmUnitMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Life support chest pack hardware
      roughness: 0.25,
      metalness: 0.85
    });

    const gloveMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // High-dexterity EVA glove palms and fingertips
      roughness: 0.5,
      metalness: 0.2
    });

    const bootMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // EVA footwear with magnetic restraint soles
      roughness: 0.4,
      metalness: 0.4
    });

    // 4A. Pelvis (Base Root)
    const pelvisGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.28, 24);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, suitWhiteMat);
    pelvisMesh.position.set(0, 0.06, 0);
    pelvisMesh.castShadow = true;
    astronautRoot.add(pelvisMesh);

    // 4B. Torso & Life Support Structure
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.20, 0);

    const chestGeo = new THREE.CylinderGeometry(0.32, 0.26, 0.48, 24);
    const chestMesh = new THREE.Mesh(chestGeo, suitWhiteMat);
    chestMesh.position.set(0, 0.24, 0);
    chestMesh.castShadow = true;
    torsoGroup.add(chestMesh);

    // Display & Control Module (DCM) Chest Pack
    const dcmGeo = new THREE.BoxGeometry(0.28, 0.30, 0.12);
    const dcmMesh = new THREE.Mesh(dcmGeo, dcmUnitMat);
    dcmMesh.position.set(0, 0.26, 0.18);
    torsoGroup.add(dcmMesh);

    // DCM Valves & Digital Gauge
    const gaugeGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.02, 16);
    const gaugeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const gauge = new THREE.Mesh(gaugeGeo, gaugeMat);
    gauge.rotation.x = Math.PI / 2;
    gauge.position.set(-0.06, 0.32, 0.25);
    torsoGroup.add(gauge);

    // PLSS Backpack Unit (Portable Life Support System)
    const plssGeo = new THREE.BoxGeometry(0.52, 0.68, 0.26);
    const plssMesh = new THREE.Mesh(plssGeo, dcmUnitMat);
    plssMesh.position.set(0, 0.26, -0.24);
    plssMesh.castShadow = true;
    torsoGroup.add(plssMesh);

    // Dual Oxygen Tanks
    [-0.15, 0.15].forEach(x => {
      const tankGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.54, 16);
      const tankMesh = new THREE.Mesh(tankGeo, suitWhiteMat);
      tankMesh.position.set(x, 0.26, -0.38);
      torsoGroup.add(tankMesh);
    });

    // 4C. Neck & Extravehicular Helmet Assembly
    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.12, 20), suitJointMat);
    neckMesh.position.set(0, 0.52, 0);
    torsoGroup.add(neckMesh);

    // Helmet Shell
    const helmetMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 32), suitWhiteMat);
    helmetMesh.position.set(0, 0.72, 0.02);
    helmetMesh.castShadow = true;
    torsoGroup.add(helmetMesh);

    // Dark Mirrored Gold Visor (Physically Realistic Curvature)
    const visorGeo = new THREE.SphereGeometry(0.19, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.05);
    const visorMesh = new THREE.Mesh(visorGeo, goldVisorMat);
    visorMesh.rotation.x = Math.PI / 2;
    visorMesh.position.set(0, 0.72, 0.12);
    torsoGroup.add(visorMesh);

    // 4D. RIGHT ARM KINEMATIC CHAIN
    const rShoulderPivot = new THREE.Group();
    rShoulderPivot.position.set(0.38, 0.38, 0);

    // Deltoid & Bicep
    const rBicepMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.074, 0.32, 16), suitWhiteMat);
    rBicepMesh.position.set(0, -0.16, 0);
    rBicepMesh.castShadow = true;
    rShoulderPivot.add(rBicepMesh);

    // Articulated Elbow Joint Gasket
    const rElbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.078, 16, 16), suitJointMat);
    rElbowJoint.position.set(0, -0.32, 0);
    rShoulderPivot.add(rElbowJoint);

    const rElbowPivot = new THREE.Group();
    rElbowPivot.position.set(0, -0.32, 0);

    // Forearm
    const rForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.074, 0.064, 0.34, 16), suitWhiteMat);
    rForearmMesh.position.set(0, -0.17, 0);
    rForearmMesh.castShadow = true;
    rElbowPivot.add(rForearmMesh);

    const rWristPivot = new THREE.Group();
    rWristPivot.position.set(0, -0.34, 0);

    // Detailed EVA Glove Palm
    const rPalmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.11, 0.06), gloveMat);
    rPalmMesh.position.set(0, -0.05, 0);
    rWristPivot.add(rPalmMesh);

    // Fingers with gripping posture
    const rFingersMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.04), gloveMat);
    rFingersMesh.position.set(0, -0.12, 0.015);
    rWristPivot.add(rFingersMesh);

    rElbowPivot.add(rWristPivot);
    rShoulderPivot.add(rElbowPivot);
    torsoGroup.add(rShoulderPivot);

    // 4E. LEFT ARM KINEMATIC CHAIN
    const lShoulderPivot = new THREE.Group();
    lShoulderPivot.position.set(-0.38, 0.38, 0);

    const lBicepMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.074, 0.32, 16), suitWhiteMat);
    lBicepMesh.position.set(0, -0.16, 0);
    lBicepMesh.castShadow = true;
    lShoulderPivot.add(lBicepMesh);

    const lElbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.078, 16, 16), suitJointMat);
    lElbowJoint.position.set(0, -0.32, 0);
    lShoulderPivot.add(lElbowJoint);

    const lElbowPivot = new THREE.Group();
    lElbowPivot.position.set(0, -0.32, 0);

    const lForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.074, 0.064, 0.34, 16), suitWhiteMat);
    lForearmMesh.position.set(0, -0.17, 0);
    lForearmMesh.castShadow = true;
    lElbowPivot.add(lForearmMesh);

    const lWristPivot = new THREE.Group();
    lWristPivot.position.set(0, -0.34, 0);

    const lPalmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.11, 0.06), gloveMat);
    lPalmMesh.position.set(0, -0.05, 0);
    lWristPivot.add(lPalmMesh);

    const lFingersMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.04), gloveMat);
    lFingersMesh.position.set(0, -0.12, 0.015);
    lWristPivot.add(lFingersMesh);

    lElbowPivot.add(lWristPivot);
    lShoulderPivot.add(lElbowPivot);
    torsoGroup.add(lShoulderPivot);

    astronautRoot.add(torsoGroup);

    // 4F. RIGHT LEG KINEMATIC CHAIN
    const rHipPivot = new THREE.Group();
    rHipPivot.position.set(0.18, 0, 0);

    const rThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.09, 0.46, 16), suitWhiteMat);
    rThighMesh.position.set(0, -0.23, 0);
    rThighMesh.castShadow = true;
    rHipPivot.add(rThighMesh);

    const rKneePivot = new THREE.Group();
    rKneePivot.position.set(0, -0.46, 0);

    const rShinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.078, 0.48, 16), suitWhiteMat);
    rShinMesh.position.set(0, -0.24, 0);
    rShinMesh.castShadow = true;
    rKneePivot.add(rShinMesh);

    // Lunar EVA Boot
    const rBootMesh = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.13, 0.28), bootMat);
    rBootMesh.position.set(0, -0.52, 0.06);
    rBootMesh.castShadow = true;
    rKneePivot.add(rBootMesh);

    rHipPivot.add(rKneePivot);
    astronautRoot.add(rHipPivot);

    // 4G. LEFT LEG KINEMATIC CHAIN
    const lHipPivot = new THREE.Group();
    lHipPivot.position.set(-0.18, 0, 0);

    const lThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.09, 0.46, 16), suitWhiteMat);
    lThighMesh.position.set(0, -0.23, 0);
    lThighMesh.castShadow = true;
    lHipPivot.add(lThighMesh);

    const lKneePivot = new THREE.Group();
    lKneePivot.position.set(0, -0.46, 0);

    const lShinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.078, 0.48, 16), suitWhiteMat);
    lShinMesh.position.set(0, -0.24, 0);
    lShinMesh.castShadow = true;
    lKneePivot.add(lShinMesh);

    const lBootMesh = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.13, 0.28), bootMat);
    lBootMesh.position.set(0, -0.52, 0.06);
    lBootMesh.castShadow = true;
    lKneePivot.add(lBootMesh);

    lHipPivot.add(lKneePivot);
    astronautRoot.add(lHipPivot);

    // 4H. SUBTLE SCIENTIFIC SKELETON OVERLAY (HMR 17-KEYPOINTS)
    const skeletonGroup = new THREE.Group();
    skeletonGroup.visible = showSkeleton;

    const jointDotMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const activeJointDotMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });

    jointMarkers.forEach(jm => {
      const isSelected = jm.id === activeJointId;
      const sGeo = new THREE.SphereGeometry(isSelected ? 0.045 : 0.03, 16, 16);
      const sphere = new THREE.Mesh(sGeo, isSelected ? activeJointDotMat : jointDotMat);
      sphere.position.set(...jm.stationPosition);
      skeletonGroup.add(sphere);

      if (isSelected) {
        // Glowing target ring around selected joint
        const ringGeo = new THREE.RingGeometry(0.06, 0.08, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(...jm.stationPosition);
        ring.rotation.x = Math.PI / 2;
        skeletonGroup.add(ring);
      }
    });

    astronautRoot.add(skeletonGroup);
    scene.add(astronautRoot);

    // 5. Mouse Orbit & Inspection Controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDragging = true;
        prevMouse = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;

      astronautRoot.rotation.y += dx * 0.01;
      astronautRoot.rotation.x += dy * 0.008;

      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.0025;
      camera.position.z = Math.min(6.5, Math.max(2.0, camera.position.z + zoomFactor));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // 6. Animation Loop
    let clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const state = useMissionStore.getState();

      camera.position.lerp(targetCamPosRef.current, 0.08);
      camera.lookAt(targetCamLookRef.current);

      // Microgravity Natural 0-G Floating Harmonic
      if (isMicrogravity && isPlaying) {
        const floatY = 0.05 + Math.sin(elapsedTime * 0.75) * 0.04;
        const floatX = Math.cos(elapsedTime * 0.45) * 0.025;
        const floatRotZ = Math.sin(elapsedTime * 0.35) * 0.03;
        astronautRoot.position.set(floatX, floatY, 0);
        astronautRoot.rotation.z = floatRotZ;
      }

      // KINEMATIC JOINT RIG SYNCHRONIZATION
      if (state.isWebcamActive && state.isRealTrackingActive) {
        const rElbowDeg = state.realJointAngles.rightElbow;
        const lElbowDeg = state.realJointAngles.leftElbow;
        const rShoulderDeg = state.realJointAngles.rightShoulder;
        const lShoulderDeg = state.realJointAngles.leftShoulder;
        const rKneeDeg = state.realJointAngles.rightKnee;
        const lKneeDeg = state.realJointAngles.leftKnee;

        const targetRShoulderZ = -THREE.MathUtils.degToRad(rShoulderDeg - 20) * 0.65;
        const targetRShoulderX = THREE.MathUtils.degToRad(30 + Math.sin(elapsedTime * 2) * 5);
        rShoulderPivot.rotation.z = THREE.MathUtils.lerp(rShoulderPivot.rotation.z, targetRShoulderZ, 0.15);
        rShoulderPivot.rotation.x = THREE.MathUtils.lerp(rShoulderPivot.rotation.x, targetRShoulderX, 0.15);

        const targetRElbowX = THREE.MathUtils.degToRad(180 - rElbowDeg);
        rElbowPivot.rotation.x = THREE.MathUtils.lerp(rElbowPivot.rotation.x, targetRElbowX, 0.18);

        const targetLShoulderZ = THREE.MathUtils.degToRad(lShoulderDeg - 20) * 0.65;
        const targetLShoulderX = THREE.MathUtils.degToRad(30 + Math.cos(elapsedTime * 2) * 5);
        lShoulderPivot.rotation.z = THREE.MathUtils.lerp(lShoulderPivot.rotation.z, targetLShoulderZ, 0.15);
        lShoulderPivot.rotation.x = THREE.MathUtils.lerp(lShoulderPivot.rotation.x, targetLShoulderX, 0.15);

        const targetLElbowX = THREE.MathUtils.degToRad(180 - lElbowDeg);
        lElbowPivot.rotation.x = THREE.MathUtils.lerp(lElbowPivot.rotation.x, targetLElbowX, 0.18);

        const targetRKneeX = THREE.MathUtils.degToRad(180 - rKneeDeg) * 0.4;
        const targetLKneeX = THREE.MathUtils.degToRad(180 - lKneeDeg) * 0.4;
        rKneePivot.rotation.x = THREE.MathUtils.lerp(rKneePivot.rotation.x, targetRKneeX, 0.1);
        lKneePivot.rotation.x = THREE.MathUtils.lerp(lKneePivot.rotation.x, targetLKneeX, 0.1);

      } else {
        // NATURAL EXPERIMENT SAMPLE ACQUISITION MOVEMENT (REACHING FOR RACK)
        const reachPhase = Math.sin(elapsedTime * 0.85);
        
        rShoulderPivot.rotation.z = -0.42 + reachPhase * 0.18;
        rShoulderPivot.rotation.x = 0.68 + reachPhase * 0.25;
        rElbowPivot.rotation.x = 0.82 - reachPhase * 0.32;
        rWristPivot.rotation.y = Math.sin(elapsedTime * 1.2) * 0.22;

        lShoulderPivot.rotation.z = 0.38 + Math.cos(elapsedTime * 0.65) * 0.08;
        lShoulderPivot.rotation.x = 0.42;
        lElbowPivot.rotation.x = 0.92 + Math.sin(elapsedTime * 0.75) * 0.10;

        rHipPivot.rotation.x = -0.22 + Math.sin(elapsedTime * 0.55) * 0.05;
        lHipPivot.rotation.x = 0.18 + Math.cos(elapsedTime * 0.55) * 0.05;
        rKneePivot.rotation.x = 0.42 + Math.sin(elapsedTime * 0.65) * 0.04;
        lKneePivot.rotation.x = 0.32 + Math.cos(elapsedTime * 0.65) * 0.04;
      }

      // Live Euler Angles
      const livePitch = (-12.4 + Math.sin(elapsedTime * 0.5) * 1.8).toFixed(1);
      const liveRoll = (6.8 + Math.cos(elapsedTime * 0.6) * 1.2).toFixed(1);
      const liveYaw = ((astronautRoot.rotation.y * 57.3) % 360).toFixed(1);
      setPostureAngle({ pitch: +livePitch, roll: +liveRoll, yaw: +liveYaw });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(frameId);
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
      renderer.dispose();
    };
  }, [showMesh, showSkeleton, showJointAngles, showHullBeam, isMicrogravity, activeJointId]);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto select-none">
      
      {/* 1. Page Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-cyan-400 shrink-0">
            <Rotate3d className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              3D Astronaut Digital Twin (HMR)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time biomechanical joint estimation, posture analysis, and movement tracking
            </p>
          </div>
        </div>

        {/* View Mode & Calibration Dropdown */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 shadow-xs">
            <span className="text-slate-400 text-[11px]">View Mode:</span>
            <select className="bg-transparent font-semibold outline-none cursor-pointer">
              <option value="realistic">Realistic Astronaut Model</option>
              <option value="kinematic">Kinematic Skeleton Wireframe</option>
              <option value="smpl">SMPL Body Mesh</option>
            </select>
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800 text-xs font-semibold hover:bg-blue-600 hover:text-white transition shadow-xs">
            <Settings className="w-3.5 h-3.5" />
            <span>Calibrate Model</span>
          </button>
        </div>
      </div>

      {/* 2. Ribbon Toolbar Controls (Camera Presets & Toggles) */}
      <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Camera Presets & Microgravity Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsMicrogravity(!isMicrogravity)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
              isMicrogravity
                ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-cyan-300 dark:border-blue-700 shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span>Synthetic Microgravity</span>
          </button>

          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            {(['ISO', 'FRONT', 'TOP', 'SIDE', 'RACK'] as const).map(preset => (
              <button
                key={preset}
                onClick={() => applyCameraPreset(preset)}
                className={`px-3 py-1 rounded-md transition ${
                  cameraPreset === preset
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Feature Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={showSkeleton} 
              onChange={() => setShowSkeleton(!showSkeleton)}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
            <span>Skeleton ON</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={showJointAngles} 
              onChange={() => setShowJointAngles(!showJointAngles)}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
            <span>Joint Angles ON</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={showHullBeam} 
              onChange={() => setShowHullBeam(!showHullBeam)}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
            <span>Hull/Beam ON</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={showMesh} 
              onChange={() => setShowMesh(!showMesh)}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <span>Suit Mesh ON</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            </span>
          </label>

        </div>

      </div>

      {/* 3. Main Operational Grid: 3D Viewport (68%) + Telemetry Cards (32%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left: 3D Viewport (8 of 12 cols = ~67%) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl overflow-hidden shadow-xs relative">
          
          {/* WebGL Canvas Viewport */}
          <div className="relative w-full h-[540px] bg-slate-950 flex items-center justify-center cursor-grab active:cursor-grabbing">
            <div ref={mountRef} className="w-full h-full" />

            {/* Top-Left Overlay: Astronaut Orientation */}
            <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 p-3 rounded-xl text-white text-xs space-y-1 shadow-lg pointer-events-none">
              <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                <span>ASTRONAUT ORIENTATION (0-G-EULER)</span>
              </div>
              <div className="flex items-center gap-3 pt-0.5">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block font-bold">PITCH</span>
                  <span className="font-mono font-bold text-white">{postureAngle.pitch}°</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block font-bold">ROLL</span>
                  <span className="font-mono font-bold text-white">{postureAngle.roll}°</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block font-bold">YAW</span>
                  <span className="font-mono font-bold text-white">{postureAngle.yaw}°</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10.5px] pt-1 border-t border-slate-800">
                <span className="text-slate-400">Distance to Rack</span>
                <span className="font-mono font-semibold text-white">48.8 cm</span>
                <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Nominal
                </span>
              </div>
            </div>

            {/* Top-Right Floating Camera Tools */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button 
                onClick={() => handleZoom(1)} 
                className="w-8 h-8 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-white flex items-center justify-center hover:bg-blue-600 transition shadow-md"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleZoom(-1)} 
                className="w-8 h-8 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-white flex items-center justify-center hover:bg-blue-600 transition shadow-md"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button 
                onClick={() => applyCameraPreset('ISO')} 
                className="w-8 h-8 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-white flex items-center justify-center hover:bg-blue-600 transition shadow-md"
                title="Reset View"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom-Left Overlay: Selected Joint Telemetry Card */}
            <div className="absolute bottom-16 left-4 bg-slate-900/90 backdrop-blur-md border border-blue-500/40 p-3.5 rounded-xl text-white text-xs space-y-2 max-w-xs shadow-xl pointer-events-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <div className="flex items-center gap-1.5 text-blue-300 font-bold text-xs">
                  <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Right Elbow</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  118°
                </span>
              </div>

              <div className="space-y-1 text-[10.5px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Joint Position (m)</span>
                  <span className="font-mono text-slate-200">[0.32, 0.15, -0.25]</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Joint Velocity (m/s)</span>
                  <span className="font-mono text-cyan-300">[0.02, -0.03, 0.01]</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Angle Range</span>
                  <span className="font-mono text-slate-300">30° – 165°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Angle</span>
                  <span className="font-mono font-bold text-white">118°</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">Confidence</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="w-[96%] h-full bg-blue-500 rounded-full" />
                    </div>
                    <span className="font-mono font-bold text-xs text-white">96%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom-Right 3D Coordinate Triad */}
            <div className="absolute bottom-16 right-4 pointer-events-none">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold">
                <span className="text-red-400">X</span>
                <span className="text-emerald-400">Y</span>
                <span className="text-blue-400">Z</span>
              </div>
            </div>

          </div>

          {/* Bottom Viewport Control & Scrubber Ribbon */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 text-white flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <input 
                type="range" 
                min="0" 
                max="100" 
                value={timelineProgress} 
                onChange={(e) => setTimelineProgress(parseInt(e.target.value))}
                className="w-36 sm:w-56 accent-blue-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />

              <select 
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[11px] font-mono outline-none cursor-pointer"
              >
                <option value={0.5}>0.5x</option>
                <option value={1.0}>1.0x</option>
                <option value={1.5}>1.5x</option>
                <option value={2.0}>2.0x</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => applyCameraPreset('ISO')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Reset Camera"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button 
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Capture Screenshot"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <button 
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Right: Telemetry & Biomechanical Metrics (4 of 12 cols = ~33%) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* 1. Experiment Context Card */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Experiment Context</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-cyan-300 border border-blue-200 dark:border-blue-800">
                Step 2 / 5
              </span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">
                  {currentStep?.title || 'Collect Sample'}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Retrieve biological sample vial from cold storage container.
                </p>
              </div>

              <div className="w-16 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
                <div className="text-[9px] font-mono text-center">Rack Cam #04</div>
              </div>
            </div>
          </div>

          {/* 2. Pose & Motion Metrics Card */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2 text-xs font-bold text-slate-900 dark:text-white">
              <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>Pose & Motion Metrics</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Joints Tracked</span>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">17 / 33</div>
                <span className="text-[9px] text-slate-400">Active Joints</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Overall Confidence</span>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">92.4%</div>
                <span className="text-[9px] font-bold text-emerald-500">Good</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 col-span-2">
                <span className="text-[10px] text-slate-400 block">Zero-g Drift Velocity</span>
                <div className="font-mono font-bold text-xs text-slate-900 dark:text-white mt-0.5">
                  v = [0.012, -0.004, 0.003] m/s
                </div>
                <span className="text-[9px] font-semibold text-emerald-500">Nominal</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Payload Dock Alignment</span>
                  <div className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">88.4%</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                  Good
                </span>
              </div>
            </div>
          </div>

          {/* 3. Joint Angles Breakdown Card */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Joint Angles</span>
              </div>

              <select 
                value={selectedJointGroup}
                onChange={(e) => setSelectedJointGroup(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-0.5 text-[10.5px] font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value="Right Arm">Right Arm</option>
                <option value="Left Arm">Left Arm</option>
                <option value="Spine & Legs">Spine & Legs</option>
              </select>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Shoulder Pitch</span>
                <div className="flex items-center gap-2">
                  <div className="w-14 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="w-[30%] h-full bg-blue-500 rounded-full" />
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">-25.4°</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Shoulder Roll</span>
                <div className="flex items-center gap-2">
                  <div className="w-14 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="w-[45%] h-full bg-blue-500 rounded-full" />
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">12.1°</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Shoulder Yaw</span>
                <div className="flex items-center gap-2">
                  <div className="w-14 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="w-[20%] h-full bg-blue-500 rounded-full" />
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">5.6°</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 bg-blue-50/60 dark:bg-blue-950/40 px-2 rounded-lg border border-blue-200 dark:border-blue-900/60">
                <span className="text-blue-700 dark:text-cyan-400 font-bold text-[11px]">Elbow Flexion</span>
                <div className="flex items-center gap-2">
                  <div className="w-14 h-1.5 rounded-full bg-blue-200 dark:bg-blue-900 overflow-hidden">
                    <div className="w-[85%] h-full bg-blue-600 dark:bg-cyan-400 rounded-full" />
                  </div>
                  <span className="font-mono font-extrabold text-blue-700 dark:text-cyan-400 text-[11px]">118.0°</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Wrist Pitch</span>
                <div className="flex items-center gap-2">
                  <div className="w-14 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="w-[25%] h-full bg-blue-500 rounded-full" />
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">-18.3°</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Wrist Yaw</span>
                <div className="flex items-center gap-2">
                  <div className="w-14 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="w-[60%] h-full bg-blue-500 rounded-full" />
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">41.2°</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Joint Angle vs Time Chart Card */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Joint Angle vs Time</span>
              </div>

              <select 
                value={chartJoint}
                onChange={(e) => setChartJoint(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-0.5 text-[10.5px] font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value="Elbow Flexion">Elbow Flexion</option>
                <option value="Shoulder Pitch">Shoulder Pitch</option>
                <option value="Shoulder Roll">Shoulder Roll</option>
              </select>
            </div>

            {/* SVG Trajectory Chart */}
            <div className="pt-2">
              <svg className="w-full h-24 overflow-visible" viewBox="0 0 240 80">
                {/* Grid Lines */}
                <line x1="20" y1="10" x2="230" y2="10" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="2" />
                <line x1="20" y1="40" x2="230" y2="40" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="2" />
                <line x1="20" y1="70" x2="230" y2="70" stroke="currentColor" className="text-slate-300 dark:text-slate-700" />

                {/* Y Axis Labels */}
                <text x="16" y="14" textAnchor="end" className="text-[8px] fill-slate-400 font-mono">180</text>
                <text x="16" y="44" textAnchor="end" className="text-[8px] fill-slate-400 font-mono">90</text>
                <text x="16" y="74" textAnchor="end" className="text-[8px] fill-slate-400 font-mono">0</text>

                {/* Angle Curve */}
                <path 
                  d="M 20,48 Q 50,55 80,44 T 140,32 T 180,24 T 210,35 T 230,30" 
                  fill="none" 
                  stroke="#2563eb" 
                  strokeWidth="2.5"
                  className="dark:stroke-cyan-400"
                />

                {/* Current Angle Point Marker */}
                <circle cx="180" cy="24" r="3.5" fill="#2563eb" className="dark:fill-cyan-400" />
                <rect x="164" y="10" width="34" height="12" rx="3" fill="#0f172a" />
                <text x="181" y="19" textAnchor="middle" fill="#ffffff" className="text-[8px] font-bold font-mono">118.0°</text>
              </svg>

              <div className="flex justify-between text-[9px] font-mono text-slate-400 px-4 pt-1">
                <span>0</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40</span>
                <span>50</span>
                <span>60 s</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
