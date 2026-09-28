import React, { useState, useEffect, useRef } from 'react';
import { LiveOrbitalSpaceScene } from './LiveOrbitalSpaceScene';

interface SpaceBackgroundProps {
  videoSrc?: string;
}

export const SpaceBackground: React.FC<SpaceBackgroundProps> = ({
  videoSrc = '/videos/vyom-space-background.mp4',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [useVideo, setUseVideo] = useState<boolean>(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      video.play().then(() => {
        setUseVideo(true);
      }).catch(() => {
        setUseVideo(false);
      });
    };

    const handleError = () => {
      setUseVideo(false);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    // Test play
    video.play().then(() => {
      setUseVideo(true);
    }).catch(() => {
      setUseVideo(false);
    });

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [videoSrc]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none bg-[#010308]">
      
      {/* 1. REAL HTML5 VIDEO LAYER (Mode 1: Active when local video exists) */}
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${
          useVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 2. REAL-TIME 3D THREE.JS WEBGL ORBITAL SPACE ENVIRONMENT (Mode 2: 60 FPS Living Scene) */}
      {!useVideo && (
        <LiveOrbitalSpaceScene />
      )}

      {/* 3. LOCALIZED ATMOSPHERIC READABILITY GRADIENTS */}
      {/* Left side: Soft contrast gradient for text clarity */}
      <div className="absolute inset-y-0 left-0 w-full lg:w-[58%] bg-gradient-to-r from-[#01040D]/80 via-[#01040D]/35 to-transparent pointer-events-none z-10" />

      {/* Right side: Soft tint behind the Live Perception HUD */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-[48%] bg-gradient-to-l from-[#01040D]/70 via-[#01040D]/20 to-transparent pointer-events-none z-10" />

      {/* Top Header Vignette */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#01040D]/75 via-[#01040D]/25 to-transparent pointer-events-none z-10" />

      {/* Bottom Telemetry Vignette */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#01040D]/85 via-[#01040D]/30 to-transparent pointer-events-none z-10" />

      {/* 4. SPACECRAFT CUPOLA OBSERVATION WINDOW FRAME OVERLAY */}
      <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between">
        
        {/* Left Arch Metallic Frame */}
        <svg 
          className="absolute left-0 top-0 bottom-0 h-full w-20 sm:w-32 text-slate-900 pointer-events-none opacity-85" 
          viewBox="0 0 120 1000" 
          preserveAspectRatio="none"
        >
          {/* Outer Frame Body */}
          <path 
            d="M0,0 L50,0 Q38,500 75,1000 L0,1000 Z" 
            fill="#050914" 
          />
          {/* Metallic Specular Bevel Line */}
          <path 
            d="M50,0 Q38,500 75,1000" 
            fill="none" 
            stroke="rgba(71, 85, 105, 0.7)" 
            strokeWidth="1.8" 
          />
          {/* Bolts */}
          <circle cx="20" cy="150" r="3" fill="#1E293B" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1" />
          <circle cx="18" cy="350" r="3" fill="#1E293B" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1" />
          <circle cx="18" cy="550" r="3" fill="#1E293B" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1" />
          <circle cx="24" cy="750" r="3" fill="#1E293B" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1" />
          <circle cx="30" cy="900" r="3" fill="#1E293B" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1" />
        </svg>

        {/* Right Structural Upper Frame */}
        <svg 
          className="absolute right-0 top-0 bottom-0 h-full w-18 sm:w-26 text-slate-900 pointer-events-none opacity-85" 
          viewBox="0 0 100 1000" 
          preserveAspectRatio="none"
        >
          <path 
            d="M100,0 L52,0 Q62,400 32,1000 L100,1000 Z" 
            fill="#050914" 
          />
          <path 
            d="M52,0 Q62,400 32,1000" 
            fill="none" 
            stroke="rgba(71, 85, 105, 0.7)" 
            strokeWidth="1.8" 
          />
          {/* Bolts */}
          <circle cx="78" cy="150" r="3" fill="#1E293B" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1" />
          <circle cx="78" cy="350" r="3" fill="#1E293B" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1" />
          <circle cx="75" cy="550" r="3" fill="#1E293B" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1" />
          <circle cx="70" cy="750" r="3" fill="#1E293B" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1" />
        </svg>

        {/* Reticle HUD Markings on Frame */}
        <div className="absolute left-2.5 top-1/3 text-[8.5px] font-mono text-cyan-400/40 space-y-1 hidden sm:block">
          <div>G-BAS ORBIT</div>
          <div>FOV: 140°</div>
          <div>WIN-CP-04</div>
        </div>

        <div className="absolute right-2.5 top-1/4 text-[8.5px] font-mono text-cyan-400/40 space-y-1 hidden sm:block text-right">
          <div>OPTICS: OK</div>
          <div>EARTH LIMB</div>
        </div>
      </div>

    </div>
  );
};

export default SpaceBackground;
