import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const LiveOrbitalSpaceScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let renderer: THREE.WebGLRenderer | null = null;
    let animId: number | null = null;

    try {
      // 1. Scene, Camera, Renderer
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x010206);

      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1200);
      camera.position.set(0, 0, 22);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      container.appendChild(renderer.domElement);

    // -------------------------------------------------------------
    // 2. PHOTOREALISTIC PROCEDURAL TEXTURES FOR EARTH
    // -------------------------------------------------------------
    const createPhotorealisticEarthTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 4096;
      canvas.height = 2048;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Deep Ocean Base with realistic bathymetry gradient
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 2048);
      oceanGrad.addColorStop(0, '#020b22');
      oceanGrad.addColorStop(0.3, '#031238');
      oceanGrad.addColorStop(0.6, '#01081a');
      oceanGrad.addColorStop(1, '#00040e');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 4096, 2048);

      // Continental Landmasses (Detailed organic coastlines)
      const drawContinent = (
        points: [number, number][],
        landColor = '#0b1626',
        coastalColor = '#0f243d'
      ) => {
        ctx.fillStyle = coastalColor;
        ctx.beginPath();
        points.forEach(([x, y], idx) => {
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = landColor;
        ctx.beginPath();
        points.forEach(([x, y], idx) => {
          // Inset slightly for land interior
          const ix = x + (idx % 2 === 0 ? 3 : -3);
          const iy = y + (idx % 2 === 0 ? 3 : -3);
          if (idx === 0) ctx.moveTo(ix, iy);
          else ctx.lineTo(ix, iy);
        });
        ctx.closePath();
        ctx.fill();
      };

      // 1. Indian Subcontinent & South Asia
      drawContinent([
        [2700, 700], [2800, 720], [2900, 760], [2980, 840], [2940, 960],
        [2880, 1080], [2820, 1180], [2800, 1260], [2760, 1160], [2720, 1020],
        [2660, 920], [2620, 840], [2650, 750]
      ], '#0e1d32', '#142a4a');

      // 2. Eurasia & Middle East
      drawContinent([
        [2100, 600], [2350, 580], [2600, 620], [2900, 580], [3300, 620],
        [3500, 750], [3350, 900], [3150, 880], [2950, 820], [2600, 800],
        [2400, 750], [2250, 700]
      ], '#0a1525', '#10223b');

      // 3. East Asia & Pacific Rim
      drawContinent([
        [3200, 750], [3450, 780], [3600, 900], [3500, 1100], [3350, 1180],
        [3250, 1050], [3150, 950]
      ], '#0c192d', '#122644');

      // 4. Africa
      drawContinent([
        [2050, 800], [2300, 820], [2450, 950], [2400, 1200], [2300, 1450],
        [2150, 1550], [2050, 1400], [1950, 1150], [1900, 950]
      ], '#0d1828', '#13243c');

      // 5. Europe
      drawContinent([
        [2050, 500], [2250, 480], [2400, 550], [2350, 700], [2150, 720],
        [2000, 650], [1950, 550]
      ], '#0e1c30', '#152946');

      // 6. Americas
      drawContinent([
        [800, 450], [1100, 480], [1250, 650], [1150, 850], [1000, 950],
        [850, 800], [700, 600]
      ], '#0a1626', '#102239');

      drawContinent([
        [1150, 1000], [1350, 1100], [1450, 1300], [1350, 1600], [1200, 1750],
        [1100, 1500], [1050, 1200]
      ], '#0c192d', '#122542');

      // Golden Amber Night City Lights Networks (Sprawling metropolitan corridors)
      const majorHubs = [
        // India (Dense Northern belt + Golden Quadrilateral network)
        { x: 2780, y: 840, r: 45, density: 450, coreColor: '#fffbeb', glowColor: 'rgba(253, 224, 71, 0.45)' }, // Delhi / NCR
        { x: 2680, y: 1040, r: 35, density: 320, coreColor: '#fef08a', glowColor: 'rgba(251, 191, 36, 0.45)' }, // Mumbai / West Coast
        { x: 2770, y: 1120, r: 38, density: 350, coreColor: '#fef08a', glowColor: 'rgba(251, 191, 36, 0.45)' }, // Bengaluru / South
        { x: 2880, y: 920, r: 35, density: 300, coreColor: '#fde047', glowColor: 'rgba(245, 158, 11, 0.4)' },  // Kolkata / East
        { x: 2800, y: 1180, r: 30, density: 260, coreColor: '#fde047', glowColor: 'rgba(245, 158, 11, 0.4)' },  // Chennai / Coastal
        // Europe & Middle East
        { x: 2150, y: 600, r: 60, density: 500, coreColor: '#fffbeb', glowColor: 'rgba(253, 224, 71, 0.4)' },
        { x: 2500, y: 880, r: 35, density: 300, coreColor: '#fde047', glowColor: 'rgba(251, 191, 36, 0.4)' },  // Dubai / Gulf
        // East Asia
        { x: 3350, y: 820, r: 50, density: 420, coreColor: '#fffbeb', glowColor: 'rgba(253, 224, 71, 0.4)' },
        { x: 3500, y: 880, r: 45, density: 380, coreColor: '#fef08a', glowColor: 'rgba(251, 191, 36, 0.4)' },  // Japan
        // US East & West
        { x: 1150, y: 650, r: 65, density: 520, coreColor: '#fffbeb', glowColor: 'rgba(253, 224, 71, 0.4)' },
        { x: 780, y: 680, r: 40, density: 300, coreColor: '#fef08a', glowColor: 'rgba(251, 191, 36, 0.4)' },
      ];

      majorHubs.forEach(hub => {
        // Ambient city halo
        const haloGrad = ctx.createRadialGradient(hub.x, hub.y, 2, hub.x, hub.y, hub.r * 1.5);
        haloGrad.addColorStop(0, hub.glowColor);
        haloGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.12)');
        haloGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, hub.r * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // City light points
        for (let i = 0; i < hub.density; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.pow(Math.random(), 0.55) * hub.r;
          const lx = (hub.x + Math.cos(angle) * dist) % 4096;
          const ly = hub.y + Math.sin(angle) * dist * 0.7;

          ctx.fillStyle = Math.random() < 0.3 ? '#ffffff' : hub.coreColor;
          ctx.beginPath();
          ctx.arc(lx, ly, Math.random() * 1.2 + 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      return texture;
    };

    const createPhotorealisticCloudTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      ctx.clearRect(0, 0, 2048, 1024);

      // Cyclonic spiral cloud swirls and trade wind streaks
      for (let i = 0; i < 75; i++) {
        const cx = Math.random() * 2048;
        const cy = Math.random() * 600 + 200;
        const cr = Math.random() * 110 + 35;
        const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, cr);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        grad.addColorStop(0.4, 'rgba(240, 249, 255, 0.22)');
        grad.addColorStop(0.8, 'rgba(224, 242, 254, 0.08)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fill();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      return texture;
    };

    // -------------------------------------------------------------
    // 3. 3D EARTH GLOBE WITH DUAL-SHADER ATMOSPHERIC SCATTERING
    // -------------------------------------------------------------
    const earthRadius = 15.0;
    const earthGroup = new THREE.Group();
    // Position Earth curved horizon across lower viewport matching Image 1
    earthGroup.position.set(0, -18.6, -11.0);
    scene.add(earthGroup);

    // Earth Base Sphere
    const earthGeo = new THREE.SphereGeometry(earthRadius, 96, 96);
    const earthTex = createPhotorealisticEarthTexture();
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.88,
      metalness: 0.12,
      color: 0xffffff,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Rotating Wispy Cloud Layer
    const cloudGeo = new THREE.SphereGeometry(earthRadius + 0.14, 96, 96);
    const cloudTex = createPhotorealisticCloudTexture();
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      roughness: 1.0,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(cloudMesh);

    // Atmospheric Rayleigh Limb Glow (Fresnel Inverted Atmospheric Shader)
    const atmoGeo = new THREE.SphereGeometry(earthRadius + 0.42, 96, 96);
    const atmoShaderMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
          float intensity = pow(fresnel, 3.4);
          // Luminous cyan & electric atmospheric blue rim
          vec3 atmoCyan = vec3(0.0, 0.88, 1.0);
          vec3 atmoBlue = vec3(0.08, 0.35, 0.95);
          vec3 color = mix(atmoCyan, atmoBlue, fresnel * 0.5);
          gl_FragColor = vec4(color, intensity * 0.92);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoShaderMat);
    earthGroup.add(atmoMesh);

    // -------------------------------------------------------------
    // 4. SCIENTIFIC HIGH-FIDELITY 3D SATELLITE / SPACECRAFT (BAS & ISS)
    // -------------------------------------------------------------
    const stationGroup = new THREE.Group();
    stationGroup.position.set(7.6, 5.0, 2.5);
    stationGroup.scale.set(0.42, 0.42, 0.42);
    scene.add(stationGroup);

    // Realistic Aerospace Materials
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.85,
      roughness: 0.22,
    });
    const goldMliMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.92,
      roughness: 0.18,
      emissive: 0xb45309,
      emissiveIntensity: 0.15,
    });
    const darkCarbonMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.35,
    });
    const solarCellMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.3,
      metalness: 0.95,
      roughness: 0.12,
    });

    // 1. Central Pressurized Cylindrical Habitation/Research Module
    const coreCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 3.4, 20), titaniumMat);
    coreCylinder.rotation.z = Math.PI / 2;
    stationGroup.add(coreCylinder);

    // 2. Gold MLI Thermal Foil Service Module
    const serviceModule = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 1.2, 20), goldMliMat);
    serviceModule.rotation.z = Math.PI / 2;
    serviceModule.position.set(-1.1, 0, 0);
    stationGroup.add(serviceModule);

    // 3. Main Titanium Backbone Truss
    const truss = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.18, 0.18), darkCarbonMat);
    truss.position.set(0, 0.65, 0);
    stationGroup.add(truss);

    // 4. Photovoltaic Solar Array Wings (4 Articulated Panels with Framework)
    const solarGeo = new THREE.BoxGeometry(2.6, 1.25, 0.05);

    const solarL1 = new THREE.Mesh(solarGeo, solarCellMat);
    solarL1.position.set(-3.5, 1.5, 0);
    stationGroup.add(solarL1);

    const solarL2 = new THREE.Mesh(solarGeo, solarCellMat);
    solarL2.position.set(-3.5, -0.2, 0);
    stationGroup.add(solarL2);

    const solarR1 = new THREE.Mesh(solarGeo, solarCellMat);
    solarR1.position.set(3.5, 1.5, 0);
    stationGroup.add(solarR1);

    const solarR2 = new THREE.Mesh(solarGeo, solarCellMat);
    solarR2.position.set(3.5, -0.2, 0);
    stationGroup.add(solarR2);

    // Solar array mast support brackets
    const bracketL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 8), darkCarbonMat);
    bracketL.position.set(-3.5, 0.65, 0);
    stationGroup.add(bracketL);

    const bracketR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 8), darkCarbonMat);
    bracketR.position.set(3.5, 0.65, 0);
    stationGroup.add(bracketR);

    // 5. High-Gain Parabolic Telemetry Dish
    const dish = new THREE.Mesh(new THREE.ConeGeometry(0.52, 0.28, 20, 1, true), titaniumMat);
    dish.position.set(0.6, -1.1, 0.45);
    dish.rotation.x = -Math.PI / 3.2;
    dish.rotation.z = Math.PI / 6;
    stationGroup.add(dish);

    // Feed horn for dish
    const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), goldMliMat);
    horn.position.set(0.6, -1.1, 0.65);
    horn.rotation.x = -Math.PI / 3.2;
    stationGroup.add(horn);

    // 6. Navigation Strobe Beacons (Red on Port / Cyan on Starboard)
    const portBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    portBeacon.position.set(-4.85, 0.65, 0);
    stationGroup.add(portBeacon);

    const stbdBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00e5ff }));
    stbdBeacon.position.set(4.85, 0.65, 0);
    stationGroup.add(stbdBeacon);

    const stbdLight = new THREE.PointLight(0x00e5ff, 2.8, 10);
    stbdLight.position.set(4.85, 0.65, 0);
    stationGroup.add(stbdLight);

    // -------------------------------------------------------------
    // 5. DENSE MULTI-DEPTH STARFIELD (3,800+ Pinpoint Realistic Stars)
    // -------------------------------------------------------------
    const createDenseStarLayer = (count: number, size: number, spreadZ: number, baseOpacity: number) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);

      const spectralColors = [
        new THREE.Color(0xffffff), // Pure white
        new THREE.Color(0xf8fafc), // Ice white
        new THREE.Color(0xe0f2fe), // Soft cyan-white
        new THREE.Color(0xbae6fd), // Sky blue
        new THREE.Color(0xfef08a), // Warm pale gold
        new THREE.Color(0xfde047), // Stellar gold
        new THREE.Color(0xc4b5fd), // Soft violet
      ];

      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 95;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 70;
        pos[i * 3 + 2] = -Math.random() * spreadZ - 6;

        const c = spectralColors[Math.floor(Math.random() * spectralColors.length)];
        col[i * 3] = c.r;
        col[i * 3 + 1] = c.g;
        col[i * 3 + 2] = c.b;
      }

      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

      const mat = new THREE.PointsMaterial({
        size,
        vertexColors: true,
        transparent: true,
        opacity: baseOpacity,
        blending: THREE.AdditiveBlending,
      });

      return new THREE.Points(geo, mat);
    };

    // Layer 1: Distant Background Stars (2,600 pinpoint stars)
    const distantStars = createDenseStarLayer(2600, 0.11, 140, 0.88);
    // Layer 2: Midground Stars (1,000 stars)
    const midStars = createDenseStarLayer(1000, 0.19, 70, 0.95);
    // Layer 3: Foreground Orbital Micro-Particles (200 particles)
    const foregroundParticles = createDenseStarLayer(200, 0.32, 30, 0.65);

    scene.add(distantStars);
    scene.add(midStars);
    scene.add(foregroundParticles);

    // -------------------------------------------------------------
    // 6. CINEMATIC SOLAR DIRECTIONAL LIGHTING & SPECULAR GLINTS
    // -------------------------------------------------------------
    // Primary Solar Light Source casting realistic day/night terminator
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
    sunLight.position.set(16, 12, 12);
    scene.add(sunLight);

    // Deep Space Ambient Fill
    const spaceAmbient = new THREE.AmbientLight(0x0a1428, 0.6);
    scene.add(spaceAmbient);

    // Earth-Reflected Atmospheric Blue Fill
    const earthAlbedoLight = new THREE.DirectionalLight(0x0284c7, 0.55);
    earthAlbedoLight.position.set(0, -10, 5);
    scene.add(earthAlbedoLight);

    // -------------------------------------------------------------
    // 7. SMOOTH 60 FPS ORBITAL FLIGHT ANIMATION LOOP
    // -------------------------------------------------------------
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Earth & Cloud Majestic Slow Rotation
      earthMesh.rotation.y = elapsedTime * 0.016 + 1.45;
      cloudMesh.rotation.y = elapsedTime * 0.021 + 1.45;

      // Starfield subtle multi-depth parallax drift
      distantStars.rotation.y = elapsedTime * 0.0012;
      midStars.rotation.y = elapsedTime * 0.0024;
      foregroundParticles.rotation.y = elapsedTime * 0.0048;
      foregroundParticles.position.x = Math.sin(elapsedTime * 0.08) * 0.25;

      // Space Station Smooth Orbital Path & Solar Panel Tracking
      stationGroup.position.x = 7.4 + Math.sin(elapsedTime * 0.15) * 1.6;
      stationGroup.position.y = 4.8 + Math.cos(elapsedTime * 0.11) * 0.6;
      stationGroup.position.z = 2.4 + Math.sin(elapsedTime * 0.09) * 0.8;

      stationGroup.rotation.y = 0.38 + Math.sin(elapsedTime * 0.07) * 0.12;
      stationGroup.rotation.z = 0.14 + Math.cos(elapsedTime * 0.05) * 0.06;

      // Navigation Strobe Blink (1 Hz Aviation Pulse)
      const blink = Math.sin(elapsedTime * 4.5) > 0.45 ? 1 : 0;
      stbdBeacon.visible = blink === 1;
      portBeacon.visible = blink === 1;
      stbdLight.intensity = blink ? 3.2 : 0.0;

      if (renderer) {
        renderer.render(scene, camera);
      }
    };

    animate();

    // -------------------------------------------------------------
    // 8. RESIZE & TAB VISIBILITY OPTIMIZATION
    // -------------------------------------------------------------
    const handleResize = () => {
      if (!container || !renderer) return;
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clock.stop();
      } else {
        clock.start();
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (animId !== null) cancelAnimationFrame(animId);
        if (renderer && renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        if (renderer) renderer.dispose();
        earthGeo.dispose();
        cloudGeo.dispose();
        atmoGeo.dispose();
        earthTex.dispose();
        cloudTex.dispose();
        distantStars.geometry.dispose();
        midStars.geometry.dispose();
        foregroundParticles.geometry.dispose();
      };
    } catch (err) {
      console.warn('WebGL space scene initialization safely caught and bypassed:', err);
      return () => {};
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
    />
  );
};

export default LiveOrbitalSpaceScene;
