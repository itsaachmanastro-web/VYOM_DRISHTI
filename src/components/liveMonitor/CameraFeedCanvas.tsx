import React, { useRef, useEffect, useState } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { poseDetectionService } from '../../services/poseDetectionService';
import { 
  Video, 
  VideoOff, 
  RefreshCw, 
  Sliders, 
  Maximize2, 
  ChevronRight,
  User, 
  Box, 
  UploadCloud,
  Radio,
  Sparkles
} from 'lucide-react';

export const CameraFeedCanvas: React.FC = () => {
  const { 
    poseKeypoints, 
    isWebcamActive, 
    setIsWebcamActive,
    videoSourceType,
    setVideoSource,
    telemetry,
    currentActionName,
    humanReadableActionName,
    actionConfidence,
    updateRealTimePose,
    activeProtocol,
    currentStepIndex,
    stepMachineState,
    demoStatus
  } = useMissionStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Overlay state toggles
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  const timeRef = useRef<number>(0);
  const animFrameId = useRef<number | null>(null);
  const currentStep = activeProtocol.steps[currentStepIndex];

  // Initialize Detector & Webcam Stream
  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true;

    if (isWebcamActive) {
      setIsModelLoading(true);

      poseDetectionService.initDetector()
        .then(() => {
          if (isMounted) setIsModelLoading(false);
        })
        .catch(err => {
          console.warn('Detector init error:', err);
          if (isMounted) setIsModelLoading(false);
        });

      navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } } 
      })
        .then(s => {
          if (!isMounted) {
            s.getTracks().forEach(t => t.stop());
            return;
          }
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
          }
          setWebcamError(null);
        })
        .catch(err => {
          console.error("Webcam access error:", err);
          if (isMounted) {
            setWebcamError("Camera access denied or unavailable.");
            setIsWebcamActive(false);
            setIsModelLoading(false);
          }
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isWebcamActive, setIsWebcamActive]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    let lastInferenceTime = 0;

    const render = async (timestamp: number) => {
      if (!isRunning) return;
      timeRef.current += 0.03;
      const t = timeRef.current;

      const width = canvas.width = canvas.parentElement?.clientWidth || 800;
      const height = canvas.height = canvas.parentElement?.clientHeight || 450;

      // 1. Process Webcam Frame or Draw Realistic Laboratory / Space Rack Simulation
      if (isWebcamActive && videoRef.current && videoRef.current.readyState >= 2) {
        if (timestamp - lastInferenceTime > 30) {
          lastInferenceTime = timestamp;
          const poseResult = await poseDetectionService.estimatePose(videoRef.current);
          if (poseResult && demoStatus !== 'PAUSED') {
            updateRealTimePose(poseResult);
          }
        }

        // Draw camera frame
        ctx.drawImage(videoRef.current, 0, 0, width, height);

        // Soft subtle darkening overlay for contrast
        ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
        ctx.fillRect(0, 0, width, height);

      } else {
        // Spacecraft Laboratory Simulation Environment (High fidelity background)
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#0c1424');
        bgGrad.addColorStop(0.5, '#0f172a');
        bgGrad.addColorStop(1, '#070d18');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Equipment Rack Panels & Modules
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        const gSize = 40;
        for (let x = 0; x < width; x += gSize) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += gSize) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }

        // Simulated Payload Apparatus (Sample Cassette Glovebox on the Right)
        const cassetteX = width * 0.65;
        const cassetteY = height * 0.28;
        const cassetteW = width * 0.22;
        const cassetteH = height * 0.44;

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(cassetteX, cassetteY, cassetteW, cassetteH, 8);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Cassette Vials
        for (let v = 0; v < 3; v++) {
          ctx.fillStyle = v === 1 ? '#0284c7' : '#475569';
          ctx.beginPath();
          ctx.roundRect(cassetteX + 15 + v * 32, cassetteY + 25, 20, 50, 4);
          ctx.fill();
        }

        // Astronaut Silhouette floating
        const driftX = Math.sin(t * 0.8) * 4;
        const driftY = Math.cos(t * 0.6) * 3;

        ctx.save();
        ctx.translate(driftX, driftY);
        // Head
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.ellipse(width * 0.38, height * 0.35, 30, 36, 0, 0, Math.PI * 2);
        ctx.fill();
        // Torso with Indian Space patch
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(width * 0.28, height * 0.42, width * 0.20, height * 0.48, 12);
        ctx.fill();

        // Indian Tricolor Badge on Astronaut Flight Suit
        ctx.fillStyle = '#FF9933';
        ctx.fillRect(width * 0.31, height * 0.48, 18, 4);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(width * 0.31, height * 0.52, 18, 4);
        ctx.fillStyle = '#138808';
        ctx.fillRect(width * 0.31, height * 0.56, 18, 4);

        ctx.restore();
      }

      // 2. Draw Scientific Object Bounding Boxes Matching Reference Image
      if (showBoxes) {
        // Astronaut Box (ID-1)
        const personX = width * 0.24;
        const personY = height * 0.18;
        const personW = width * 0.34;
        const personH = height * 0.72;

        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(personX, personY, personW, personH, 8);
        ctx.stroke();

        // Astronaut Label Tag
        ctx.fillStyle = 'rgba(6, 78, 59, 0.9)';
        ctx.beginPath();
        ctx.roundRect(personX, personY - 22, 145, 20, 4);
        ctx.fill();
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = 'bold 10.5px Inter, sans-serif';
        ctx.fillStyle = '#34D399';
        ctx.fillText('Person Detected', personX + 8, personY - 8);
        ctx.font = 'normal 10.5px Inter, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('ID-1  98.2%', personX + 96, personY - 8);

        // Sample Container Object Bounding Box
        const objX = width * 0.62;
        const objY = height * 0.25;
        const objW = width * 0.25;
        const objH = height * 0.48;

        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(objX, objY, objW, objH, 8);
        ctx.stroke();

        // Sample Container Label Tag
        ctx.fillStyle = 'rgba(8, 51, 68, 0.9)';
        ctx.beginPath();
        ctx.roundRect(objX, objY - 22, 140, 20, 4);
        ctx.fill();
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = 'bold 10.5px Inter, sans-serif';
        ctx.fillStyle = '#38BDF8';
        ctx.fillText('Sample Container', objX + 8, objY - 8);
        ctx.font = 'normal 10.5px Inter, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('96.4%', objX + 104, objY - 8);
      }

      // 3. Draw Kinematic Pose Skeleton (17 Keypoints connected)
      if (showSkeleton) {
        const defaultSkeletonPoints = [
          { name: 'nose', x: 0.38, y: 0.35, score: 0.98 },
          { name: 'left_shoulder', x: 0.32, y: 0.46, score: 0.95 },
          { name: 'right_shoulder', x: 0.44, y: 0.46, score: 0.95 },
          { name: 'left_elbow', x: 0.28, y: 0.58, score: 0.92 },
          { name: 'left_wrist', x: 0.26, y: 0.70, score: 0.90 },
          { name: 'right_elbow', x: 0.52, y: 0.48, score: 0.94 },
          { name: 'right_wrist', x: 0.65, y: 0.40, score: 0.96 }, // Reaching towards container
          { name: 'left_hip', x: 0.33, y: 0.74, score: 0.92 },
          { name: 'right_hip', x: 0.43, y: 0.74, score: 0.92 },
          { name: 'left_knee', x: 0.32, y: 0.88, score: 0.90 },
          { name: 'right_knee', x: 0.44, y: 0.88, score: 0.90 },
        ];

        const activePoints = (poseKeypoints.length > 0 && isWebcamActive) ? poseKeypoints : defaultSkeletonPoints;

        const connections = [
          ['left_shoulder', 'right_shoulder'],
          ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_wrist'],
          ['right_shoulder', 'right_elbow'], ['right_elbow', 'right_wrist'],
          ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
          ['left_hip', 'right_hip'],
          ['left_hip', 'left_knee'], ['right_hip', 'right_knee']
        ];

        const keypointMap = new Map<string, { x: number; y: number; score: number }>();
        activePoints.forEach(kp => {
          keypointMap.set(kp.name, { x: kp.x * width, y: kp.y * height, score: kp.score });
        });

        // Connector Lines (Luminous cyan & emerald)
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 2.2;
        connections.forEach(([p1, p2]) => {
          const pt1 = keypointMap.get(p1);
          const pt2 = keypointMap.get(p2);
          if (pt1 && pt2 && pt1.score > 0.30 && pt2.score > 0.30) {
            ctx.beginPath();
            ctx.moveTo(pt1.x, pt1.y);
            ctx.lineTo(pt2.x, pt2.y);
            ctx.stroke();
          }
        });

        // Keypoint Circles
        activePoints.forEach(kp => {
          if (kp.score > 0.30) {
            const kx = kp.x * width;
            const ky = kp.y * height;
            ctx.fillStyle = '#070D1A';
            ctx.beginPath();
            ctx.arc(kx, ky, 4.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = kp.name === 'right_wrist' ? '#10B981' : '#00E5FF';
            ctx.beginPath();
            ctx.arc(kx, ky, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isWebcamActive, showSkeleton, showBoxes, poseKeypoints, currentActionName, currentStepIndex, updateRealTimePose, demoStatus]);

  return (
    <div className="bg-white dark:bg-[#0D1527] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3.5 shadow-sm select-none flex flex-col justify-between">
      
      {/* 1. Header Toolbar matching Reference */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
        
        {/* Left: Title & Live Status */}
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
            <span>Live Monitor</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </h2>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10.5px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Camera Active</span>
          </div>
        </div>

        {/* Right: Technical FPS / Diagnostics toggle */}
        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 hidden sm:block">
          <span>RACK-CAM-01 • 1080p</span>
        </div>

      </div>

      {/* 2. Video Viewport Canvas */}
      <div className="relative rounded-xl overflow-hidden bg-slate-950 min-h-[360px] lg:min-h-[400px] flex items-center justify-center border border-slate-800 shadow-inner">
        <video ref={videoRef} className="hidden" playsInline muted autoPlay />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

        {/* Loading Indicator */}
        {isModelLoading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-30">
            <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
            <span className="text-white font-bold text-xs">Initializing Edge CV Model...</span>
          </div>
        )}

        {/* Top-Right LIVE Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700 text-white text-[10.5px] font-mono shadow-md z-10">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="font-bold text-rose-400">LIVE</span>
          <span className="text-slate-400">00:12:34</span>
        </div>

        {/* Bottom Technical HUD Strip */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10.5px] font-mono text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-800 z-10">
          <div className="flex items-center gap-3">
            <span>FPS: <strong className="text-white">30</strong></span>
            <span>•</span>
            <span>Latency: <strong className="text-cyan-400">{telemetry.edgeLatencyMs ? telemetry.edgeLatencyMs.toFixed(1) : '17.6'} ms</strong></span>
            <span>•</span>
            <span>Resolution: <strong className="text-slate-300">1280×720</strong></span>
          </div>

          <button className="text-slate-400 hover:text-white transition" title="Fullscreen Viewport">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 3. Bottom Controls Bar matching Reference */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2.5 border-t border-slate-100 dark:border-slate-800">
        
        {/* Left: Input Selection Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setVideoSource('WEBCAM');
              setIsWebcamActive(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              videoSourceType === 'WEBCAM' && isWebcamActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Webcam</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              videoSourceType === 'VIDEO_FILE'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload MP4</span>
          </button>

          <button
            onClick={() => setVideoSource('RTSP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              videoSourceType === 'RTSP'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>RTSP</span>
          </button>

          <button
            onClick={() => {
              setVideoSource('SIMULATION');
              setIsWebcamActive(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              videoSourceType === 'SIMULATION' && !isWebcamActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulation</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                setVideoSource('VIDEO_FILE', url, file);
                if (videoRef.current) {
                  videoRef.current.srcObject = null;
                  videoRef.current.src = url;
                  videoRef.current.loop = true;
                  videoRef.current.play();
                }
              }
            }}
          />
        </div>

        {/* Right: Show Skeleton Toggle Switch */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
          <span>Show Skeleton</span>
          <button
            onClick={() => setShowSkeleton(!showSkeleton)}
            className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${
              showSkeleton ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
              showSkeleton ? 'translate-x-3.5' : 'translate-x-0'
            }`} />
          </button>
        </div>

      </div>

    </div>
  );
};
