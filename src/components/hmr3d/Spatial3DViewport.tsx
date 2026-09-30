import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useMissionStore } from '../../store/missionStore';
import { poseDetectionService } from '../../services/poseDetectionService';
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
  VideoOff,
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
  FileText,
  RotateCcw,
  UserCheck,
  UserX
} from 'lucide-react';

interface JointMarkerData {
  id: string;
  name: string;
  angleName: string;
  defaultAngle: number;
  minSafeAngle: number;
  maxSafeAngle: number;
  movementType: 'Flexion' | 'Abduction' | 'Pronation' | 'Tilt' | 'Plantarflexion';
}

export const Spatial3DViewport: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const { 
    isRealTrackingActive, 
    realJointAngles, 
    angularVelocity,
    isWebcamActive,
    setIsWebcamActive,
    updateRealTimePose,
    selectedJointInfo,
    setSelectedJointInfo,
    currentActionName,
    humanReadableActionName,
    activeProtocol,
    currentStepIndex,
    orientationReferenceFrame,
    setOrientationReferenceFrame,
    hoiInteraction,
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

  // Live Webcam Pose Tracking State
  const [isTrackingLive, setIsTrackingLive] = useState<boolean>(false);
  const [trackingStatus, setTrackingStatus] = useState<'OFFLINE' | 'INITIALIZING' | 'TRACKING_ACTIVE' | 'SEARCHING' | 'ERROR'>('OFFLINE');
  const [trackingConfidence, setTrackingConfidence] = useState<number>(94.5);
  const [showPiP, setShowPiP] = useState<boolean>(true);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  // Euler Posture & Telemetry
  const [postureAngle, setPostureAngle] = useState({ pitch: -12.4, roll: 6.8, yaw: 3.1 });
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [timelineProgress, setTimelineProgress] = useState<number>(35);

  // 12 Standard Anatomical Joints for HMR Digital Twin
  const jointMarkers: JointMarkerData[] = [
    { id: 'neck', name: 'Cervical Spine / Neck', angleName: 'Cervical Flexion', defaultAngle: 15, minSafeAngle: 0, maxSafeAngle: 45, movementType: 'Flexion' },
    { id: 'r_shoulder', name: 'Right Shoulder', angleName: 'Shoulder Pitch', defaultAngle: -25.4, minSafeAngle: -60, maxSafeAngle: 160, movementType: 'Abduction' },
    { id: 'l_shoulder', name: 'Left Shoulder', angleName: 'Shoulder Pitch', defaultAngle: -22.1, minSafeAngle: -60, maxSafeAngle: 160, movementType: 'Abduction' },
    { id: 'r_elbow', name: 'Right Elbow', angleName: 'Elbow Flexion', defaultAngle: 118.0, minSafeAngle: 30, maxSafeAngle: 165, movementType: 'Flexion' },
    { id: 'l_elbow', name: 'Left Elbow', angleName: 'Elbow Flexion', defaultAngle: 95.0, minSafeAngle: 30, maxSafeAngle: 165, movementType: 'Flexion' },
    { id: 'r_wrist', name: 'Right Wrist / Hand', angleName: 'Wrist Pitch', defaultAngle: -18.3, minSafeAngle: -45, maxSafeAngle: 85, movementType: 'Pronation' },
    { id: 'l_wrist', name: 'Left Wrist / Hand', angleName: 'Wrist Pitch', defaultAngle: 24.5, minSafeAngle: -45, maxSafeAngle: 85, movementType: 'Pronation' },
    { id: 'pelvis', name: 'Pelvis / Core', angleName: 'Pelvic Tilt', defaultAngle: 8.4, minSafeAngle: -15, maxSafeAngle: 25, movementType: 'Tilt' },
    { id: 'r_knee', name: 'Right Knee', angleName: 'Knee Flexion', defaultAngle: 128.0, minSafeAngle: 45, maxSafeAngle: 160, movementType: 'Flexion' },
    { id: 'l_knee', name: 'Left Knee', angleName: 'Knee Flexion', defaultAngle: 135.0, minSafeAngle: 45, maxSafeAngle: 160, movementType: 'Flexion' },
    { id: 'r_ankle', name: 'Right Ankle', angleName: 'Ankle Dorsiflexion', defaultAngle: 92.0, minSafeAngle: 70, maxSafeAngle: 120, movementType: 'Plantarflexion' },
    { id: 'l_ankle', name: 'Left Ankle', angleName: 'Ankle Plantarflexion', defaultAngle: 88.0, minSafeAngle: 70, maxSafeAngle: 120, movementType: 'Plantarflexion' }
  ];

  // Dynamic Joint Angle Resolver
  const getAngleForJoint = (id: string): number => {
    if (isTrackingLive || isRealTrackingActive) {
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

  // Camera Presets
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

  // Reset Pose Command
  const resetNeutralPose = () => {
    applyCameraPreset('FRONT');
  };

  // 1. LIVE WEBCAM MEDIA STREAM CONTROLLER
  const toggleLiveTracking = async () => {
    if (isTrackingLive) {
      // Stop tracking
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsTrackingLive(false);
      setTrackingStatus('OFFLINE');
      setIsWebcamActive(false);
    } else {
      // Start tracking
      setTrackingStatus('INITIALIZING');
      setWebcamError(null);

      try {
        await poseDetectionService.initDetector();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setIsTrackingLive(true);
        setTrackingStatus('TRACKING_ACTIVE');
        setIsWebcamActive(true);
      } catch (err: any) {
        console.error('Webcam tracking initialization error:', err);
        setWebcamError('Camera access denied or device unavailable.');
        setTrackingStatus('ERROR');
        setIsTrackingLive(false);
        setIsWebcamActive(false);
      }
    }
  };

  // Clean up video stream on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // 2. THREE.JS 3D SCENE & RIG SYNCHRONIZATION
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

    // 3. Realistic Space Station Module Interior
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

    // Back Equipment Wall
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

        const ledGeo = new THREE.BoxGeometry(0.06, 0.03, 0.02);
        const ledMat = new THREE.MeshBasicMaterial({ color: idx === 1 ? 0x10b981 : 0x0284c7 });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(xPos + 0.35, yPos + 0.18, -1.34);
        stationGroup.add(led);
      });
    });

    // Floor Grid Helper
    const gridHelper = new THREE.GridHelper(6, 16, 0x0284c7, 0x1e293b);
    gridHelper.position.set(0, -1.48, 0);
    stationGroup.add(gridHelper);

    scene.add(stationGroup);

    // 4. HIGH-FIDELITY REALISTIC HUMAN ASTRONAUT RIG
    const astronautRoot = new THREE.Group();

    // High-Resolution Materials
    const suitWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xebf2f8,
      roughness: 0.45,
      metalness: 0.12,
      wireframe: !showMesh
    });

    const suitJointMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.65,
      metalness: 0.25,
      wireframe: !showMesh
    });

    const goldVisorMat = new THREE.MeshStandardMaterial({
      color: 0x1a1505,
      roughness: 0.04,
      metalness: 0.96,
      emissive: 0x332400
    });

    const dcmUnitMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.25,
      metalness: 0.85
    });

    const gloveMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.2
    });

    const bootMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
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

    // DCM Chest Pack
    const dcmGeo = new THREE.BoxGeometry(0.28, 0.30, 0.12);
    const dcmMesh = new THREE.Mesh(dcmGeo, dcmUnitMat);
    dcmMesh.position.set(0, 0.26, 0.18);
    torsoGroup.add(dcmMesh);

    // PLSS Backpack Unit
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

    // 4C. Neck & Helmet Assembly
    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.12, 20), suitJointMat);
    neckMesh.position.set(0, 0.52, 0);
    torsoGroup.add(neckMesh);

    // Helmet Shell
    const helmetMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 32), suitWhiteMat);
    helmetMesh.position.set(0, 0.72, 0.02);
    helmetMesh.castShadow = true;
    torsoGroup.add(helmetMesh);

    // Dark Mirrored Gold Visor
    const visorGeo = new THREE.SphereGeometry(0.19, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.05);
    const visorMesh = new THREE.Mesh(visorGeo, goldVisorMat);
    visorMesh.rotation.x = Math.PI / 2;
    visorMesh.position.set(0, 0.72, 0.12);
    torsoGroup.add(visorMesh);

    // 4D. RIGHT ARM KINEMATIC CHAIN
    const rShoulderPivot = new THREE.Group();
    rShoulderPivot.position.set(0.38, 0.38, 0);

    const rBicepMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.074, 0.32, 16), suitWhiteMat);
    rBicepMesh.position.set(0, -0.16, 0);
    rBicepMesh.castShadow = true;
    rShoulderPivot.add(rBicepMesh);

    const rElbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.078, 16, 16), suitJointMat);
    rElbowJoint.position.set(0, -0.32, 0);
    rShoulderPivot.add(rElbowJoint);

    const rElbowPivot = new THREE.Group();
    rElbowPivot.position.set(0, -0.32, 0);

    const rForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.074, 0.064, 0.34, 16), suitWhiteMat);
    rForearmMesh.position.set(0, -0.17, 0);
    rForearmMesh.castShadow = true;
    rElbowPivot.add(rForearmMesh);

    const rWristPivot = new THREE.Group();
    rWristPivot.position.set(0, -0.34, 0);

    const rPalmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.11, 0.06), gloveMat);
    rPalmMesh.position.set(0, -0.05, 0);
    rWristPivot.add(rPalmMesh);

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

    // 4H. ATTACHED 3D KINEMATIC SKELETON (Synched directly to pivots)
    const skeletonGroup = new THREE.Group();
    skeletonGroup.visible = showSkeleton;

    const jointDotMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const activeJointDotMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });

    const createBoneDot = (radius: number = 0.04, isTarget: boolean = false) => {
      return new THREE.Mesh(
        new THREE.SphereGeometry(radius, 16, 16),
        isTarget ? activeJointDotMat : jointDotMat
      );
    };

    // Attach markers directly into bone hierarchies so they move 100% in sync
    const neckDot = createBoneDot(0.04, activeJointId === 'neck');
    neckDot.position.set(0, 0.52, 0);
    torsoGroup.add(neckDot);

    const rShoulderDot = createBoneDot(0.045, activeJointId === 'r_shoulder');
    rShoulderPivot.add(rShoulderDot);

    const rElbowDot = createBoneDot(0.045, activeJointId === 'r_elbow');
    rElbowPivot.add(rElbowDot);

    const rWristDot = createBoneDot(0.04, activeJointId === 'r_wrist');
    rWristPivot.add(rWristDot);

    const lShoulderDot = createBoneDot(0.045, activeJointId === 'l_shoulder');
    lShoulderPivot.add(lShoulderDot);

    const lElbowDot = createBoneDot(0.045, activeJointId === 'l_elbow');
    lElbowPivot.add(lElbowDot);

    const lWristDot = createBoneDot(0.04, activeJointId === 'l_wrist');
    lWristPivot.add(lWristDot);

    const pelvisDot = createBoneDot(0.05, activeJointId === 'pelvis');
    pelvisDot.position.set(0, 0.06, 0);
    astronautRoot.add(pelvisDot);

    const rKneeDot = createBoneDot(0.045, activeJointId === 'r_knee');
    rKneePivot.add(rKneeDot);

    const lKneeDot = createBoneDot(0.045, activeJointId === 'l_knee');
    lKneePivot.add(lKneeDot);

    astronautRoot.add(skeletonGroup);
    scene.add(astronautRoot);

    // 5. 360° MOUSE ORBIT CONTROLS
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
      astronautRoot.rotation.x = Math.max(-0.6, Math.min(0.6, astronautRoot.rotation.x + dy * 0.008));

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

    // 6. ANIMATION & POSE TRACKING INFERENCE LOOP
    let clock = new THREE.Clock();
    let frameId: number;
    let lastInferenceTimestamp = 0;

    const animate = async () => {
      frameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const now = performance.now();

      camera.position.lerp(targetCamPosRef.current, 0.08);
      camera.lookAt(targetCamLookRef.current);

      // 1. Process Live Webcam Pose Tracking
      if (videoRef.current && videoRef.current.readyState >= 2 && isTrackingLive) {
        if (now - lastInferenceTimestamp > 32) { // ~30 FPS inference loop
          lastInferenceTimestamp = now;

          const poseResult = await poseDetectionService.estimatePose(videoRef.current);
          if (poseResult) {
            updateRealTimePose(poseResult);
            setTrackingConfidence(Math.round(poseResult.actionConfidence * 100));

            if (poseResult.isTrackingLost) {
              setTrackingStatus('SEARCHING');
            } else {
              setTrackingStatus('TRACKING_ACTIVE');
            }

            // Draw Picture-in-Picture mirrored canvas
            if (pipCanvasRef.current) {
              const pipCtx = pipCanvasRef.current.getContext('2d');
              if (pipCtx) {
                const pipW = pipCanvasRef.current.width;
                const pipH = pipCanvasRef.current.height;

                pipCtx.save();
                pipCtx.clearRect(0, 0, pipW, pipH);
                // Horizontal mirror for natural selfie feedback
                pipCtx.translate(pipW, 0);
                pipCtx.scale(-1, 1);
                pipCtx.drawImage(videoRef.current, 0, 0, pipW, pipH);

                // Draw 2D Skeleton
                if (poseResult.keypoints && !poseResult.isTrackingLost) {
                  pipCtx.fillStyle = '#00E5FF';
                  poseResult.keypoints.forEach(kp => {
                    if (kp.score > 0.3) {
                      pipCtx.beginPath();
                      pipCtx.arc(kp.x * pipW, kp.y * pipH, 3.5, 0, Math.PI * 2);
                      pipCtx.fill();
                    }
                  });
                }
                pipCtx.restore();
              }
            }
          }
        }
      }

      // 2. Microgravity Floating Oscillations
      if (isMicrogravity && isPlaying) {
        const floatY = 0.05 + Math.sin(elapsedTime * 0.75) * 0.035;
        const floatX = Math.cos(elapsedTime * 0.45) * 0.02;
        const floatRotZ = Math.sin(elapsedTime * 0.35) * 0.02;
        astronautRoot.position.set(floatX, floatY, 0);
        if (!isDragging) {
          astronautRoot.rotation.z = floatRotZ;
        }
      }

      // 3. KINEMATIC RIG ACTUATION (Live Webcam Driven vs Nominal Posture)
      const state = useMissionStore.getState();

      if (state.isWebcamActive && state.isRealTrackingActive && trackingStatus !== 'SEARCHING') {
        const rElbowDeg = state.realJointAngles.rightElbow;
        const lElbowDeg = state.realJointAngles.leftElbow;
        const rShoulderDeg = state.realJointAngles.rightShoulder;
        const lShoulderDeg = state.realJointAngles.leftShoulder;
        const rKneeDeg = state.realJointAngles.rightKnee;
        const lKneeDeg = state.realJointAngles.leftKnee;

        // Arm Kinematics with Natural Shoulder Abduction & Pitch
        const targetRShoulderZ = -THREE.MathUtils.degToRad(Math.max(10, rShoulderDeg - 15)) * 0.75;
        const targetRShoulderX = (180 - rElbowDeg > 45) ? 0.45 : 0.05;
        rShoulderPivot.rotation.z = THREE.MathUtils.lerp(rShoulderPivot.rotation.z, targetRShoulderZ, 0.22);
        rShoulderPivot.rotation.x = THREE.MathUtils.lerp(rShoulderPivot.rotation.x, targetRShoulderX, 0.22);

        const targetRElbowX = THREE.MathUtils.degToRad(180 - rElbowDeg);
        rElbowPivot.rotation.x = THREE.MathUtils.lerp(rElbowPivot.rotation.x, targetRElbowX, 0.25);

        const targetLShoulderZ = THREE.MathUtils.degToRad(Math.max(10, lShoulderDeg - 15)) * 0.75;
        const targetLShoulderX = (180 - lElbowDeg > 45) ? 0.45 : 0.05;
        lShoulderPivot.rotation.z = THREE.MathUtils.lerp(lShoulderPivot.rotation.z, targetLShoulderZ, 0.22);
        lShoulderPivot.rotation.x = THREE.MathUtils.lerp(lShoulderPivot.rotation.x, targetLShoulderX, 0.22);

        const targetLElbowX = THREE.MathUtils.degToRad(180 - lElbowDeg);
        lElbowPivot.rotation.x = THREE.MathUtils.lerp(lElbowPivot.rotation.x, targetLElbowX, 0.25);

        // Legs
        const targetRKneeX = THREE.MathUtils.degToRad(180 - rKneeDeg) * 0.5;
        const targetLKneeX = THREE.MathUtils.degToRad(180 - lKneeDeg) * 0.5;
        rKneePivot.rotation.x = THREE.MathUtils.lerp(rKneePivot.rotation.x, targetRKneeX, 0.15);
        lKneePivot.rotation.x = THREE.MathUtils.lerp(lKneePivot.rotation.x, targetLKneeX, 0.15);

      } else {
        // Natural Standby Zero-G Posture (Lerp smoothly back to neutral)
        rShoulderPivot.rotation.z = THREE.MathUtils.lerp(rShoulderPivot.rotation.z, -0.22, 0.08);
        rShoulderPivot.rotation.x = THREE.MathUtils.lerp(rShoulderPivot.rotation.x, 0.15, 0.08);
        rElbowPivot.rotation.x = THREE.MathUtils.lerp(rElbowPivot.rotation.x, 0.35, 0.08);

        lShoulderPivot.rotation.z = THREE.MathUtils.lerp(lShoulderPivot.rotation.z, 0.22, 0.08);
        lShoulderPivot.rotation.x = THREE.MathUtils.lerp(lShoulderPivot.rotation.x, 0.15, 0.08);
        lElbowPivot.rotation.x = THREE.MathUtils.lerp(lElbowPivot.rotation.x, 0.35, 0.08);

        rHipPivot.rotation.x = THREE.MathUtils.lerp(rHipPivot.rotation.x, -0.05, 0.08);
        lHipPivot.rotation.x = THREE.MathUtils.lerp(lHipPivot.rotation.x, 0.05, 0.08);
        rKneePivot.rotation.x = THREE.MathUtils.lerp(rKneePivot.rotation.x, 0.18, 0.08);
        lKneePivot.rotation.x = THREE.MathUtils.lerp(lKneePivot.rotation.x, 0.18, 0.08);
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
  }, [showMesh, showSkeleton, showJointAngles, showHullBeam, isMicrogravity, activeJointId, isTrackingLive]);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto select-none">
      
      {/* Hidden Video Feed for MoveNet Inference */}
      <video ref={videoRef} playsInline muted autoPlay className="hidden" />

      {/* 1. Page Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-cyan-400 shrink-0 shadow-xs">
            <Rotate3d className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                3D Astronaut Digital Twin
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold tracking-wide uppercase flex items-center gap-1.5 ${
                trackingStatus === 'TRACKING_ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-xs animate-pulse'
                  : trackingStatus === 'SEARCHING'
                  ? 'bg-amber-600 text-white'
                  : trackingStatus === 'INITIALIZING'
                  ? 'bg-cyan-600 text-white animate-pulse'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {trackingStatus === 'TRACKING_ACTIVE' ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>Live Tracking (30 FPS)</span>
                  </>
                ) : trackingStatus === 'SEARCHING' ? (
                  <>
                    <UserX className="w-3 h-3" />
                    <span>Searching for User</span>
                  </>
                ) : trackingStatus === 'INITIALIZING' ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Loading MoveNet...</span>
                  </>
                ) : (
                  <>
                    <VideoOff className="w-3 h-3" />
                    <span>Webcam Standby</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live webcam-driven biomechanical joint estimation, 3D kinematic mirror, and posture analysis
            </p>
          </div>
        </div>

        {/* Live Webcam Activation & Reset Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleLiveTracking}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
              isTrackingLive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white'
            }`}
          >
            {isTrackingLive ? (
              <>
                <VideoOff className="w-4 h-4" />
                <span>Stop Tracking</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                <span>Start Live Tracking</span>
              </>
            )}
          </button>

          <button 
            onClick={resetNeutralPose}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition shadow-xs"
            title="Recalibrate and reset model to neutral posture"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Pose</span>
          </button>
        </div>
      </div>

      {/* Camera Error Banner if Denied */}
      {webcamError && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{webcamError} Please ensure camera permissions are allowed in your browser settings.</span>
          </div>
          <button onClick={() => setWebcamError(null)} className="font-bold underline text-xs">Dismiss</button>
        </div>
      )}

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
              checked={showPiP} 
              onChange={() => setShowPiP(!showPiP)}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
            <span>Live Camera PiP</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={showSkeleton} 
              onChange={() => setShowSkeleton(!showSkeleton)}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
            <span>3D Skeleton ON</span>
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
        
        {/* Left: 3D Viewport */}
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
                <span className="text-slate-400">Tracking Source</span>
                <span className="font-mono font-semibold text-cyan-300">
                  {isTrackingLive ? 'Live MoveNet Edge' : 'Standby Rest Posture'}
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

            {/* Live Picture-in-Picture Mirrored Webcam Feed Overlay */}
            {isTrackingLive && showPiP && (
              <div className="absolute bottom-16 right-4 bg-slate-900/90 backdrop-blur-md border border-cyan-500/50 p-2 rounded-xl text-white text-xs shadow-2xl overflow-hidden z-20">
                <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-800 text-[10px] font-bold">
                  <span className="text-cyan-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Live Mirror Feed</span>
                  </span>
                  <span className="text-slate-400 font-mono">{trackingConfidence}% Conf</span>
                </div>
                <div className="relative w-44 h-32 bg-black rounded-lg overflow-hidden border border-slate-800">
                  <canvas ref={pipCanvasRef} width={240} height={180} className="w-full h-full object-cover" />
                </div>
                <div className="text-[9.5px] text-center text-slate-400 font-mono mt-1">
                  {humanReadableActionName || 'Neutral Posture'}
                </div>
              </div>
            )}

            {/* Bottom-Left Overlay: Selected Joint Telemetry Card */}
            <div className="absolute bottom-16 left-4 bg-slate-900/90 backdrop-blur-md border border-blue-500/40 p-3.5 rounded-xl text-white text-xs space-y-2 max-w-xs shadow-xl pointer-events-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <div className="flex items-center gap-1.5 text-blue-300 font-bold text-xs">
                  <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{currentJoint.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {currentAngle}°
                </span>
              </div>

              <div className="space-y-1 text-[10.5px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Angle Range</span>
                  <span className="font-mono text-slate-300">{currentJoint.minSafeAngle}° – {currentJoint.maxSafeAngle}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Live Angle</span>
                  <span className="font-mono font-bold text-cyan-300">{currentAngle}°</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">Detector Confidence</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${trackingConfidence}%` }} />
                    </div>
                    <span className="font-mono font-bold text-xs text-white">{trackingConfidence}%</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Viewport Control Ribbon */}
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

              <span className="text-[11px] font-mono text-slate-400">
                {isTrackingLive ? 'Live Mirroring Active' : 'Standby'}
              </span>
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
                title="Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Right: Telemetry & Biomechanical Metrics */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* 1. Real-Time Tracking Status Card */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Webcam Kinematic Telemetry</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isTrackingLive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {isTrackingLive ? 'Live Active' : 'Standby'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Detected Action</span>
                <span className="font-mono font-bold text-blue-600 dark:text-cyan-400">
                  {humanReadableActionName || 'Neutral Body Posture'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Pose Confidence</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {trackingConfidence}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Inference Backend</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  MoveNet SinglePose (WebGL)
                </span>
              </div>
            </div>
          </div>

          {/* 2. Joint Angles Breakdown Card */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Computed Joint Angles</span>
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
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Right Shoulder</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                  {realJointAngles.rightShoulder}°
                </span>
              </div>

              <div className="flex items-center justify-between py-1 bg-blue-50/60 dark:bg-blue-950/40 px-2 rounded-lg border border-blue-200 dark:border-blue-900/60">
                <span className="text-blue-700 dark:text-cyan-400 font-bold text-[11px]">Right Elbow Flexion</span>
                <span className="font-mono font-extrabold text-blue-700 dark:text-cyan-400 text-[11px]">
                  {realJointAngles.rightElbow}°
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Left Shoulder</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                  {realJointAngles.leftShoulder}°
                </span>
              </div>

              <div className="flex items-center justify-between py-1 bg-blue-50/60 dark:bg-blue-950/40 px-2 rounded-lg border border-blue-200 dark:border-blue-900/60">
                <span className="text-blue-700 dark:text-cyan-400 font-bold text-[11px]">Left Elbow Flexion</span>
                <span className="font-mono font-extrabold text-blue-700 dark:text-cyan-400 text-[11px]">
                  {realJointAngles.leftElbow}°
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Right Knee</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                  {realJointAngles.rightKnee}°
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Left Knee</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                  {realJointAngles.leftKnee}°
                </span>
              </div>
            </div>
          </div>

          {/* 3. Honest Notice Distinction */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              <span>Sensor Provenance</span>
            </div>
            <p>
              Joint kinematics are computed locally via in-browser MoveNet pose detection from live webcam feed. Zero video data is transmitted externally.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
