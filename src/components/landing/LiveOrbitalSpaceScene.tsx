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
      // -------------------------------------------------------------
      // 1. SCENE, CAMERA, & HIGH-PRECISION WEBGL RENDERER
      // -------------------------------------------------------------
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x010308);

      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1500);
      camera.position.set(0, 0, 22);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;
      container.appendChild(renderer.domElement);

      // -------------------------------------------------------------
      // 2. PHOTOREALISTIC PROCEDURAL TEXTURE GENERATORS
      // -------------------------------------------------------------

      // 2A. High-Fidelity Earth Surface Texture (Vibrant Blue Oceans, Continents, Biomes)
      const createPhotorealisticEarthTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');
        if (!ctx) return new THREE.CanvasTexture(canvas);

        // 1. Deep Ocean Base with Bathymetric Gradients
        const oceanGrad = ctx.createLinearGradient(0, 0, 0, 2048);
        oceanGrad.addColorStop(0.0, '#062354'); // North polar ocean
        oceanGrad.addColorStop(0.2, '#08387f'); // Temperate deep blue
        oceanGrad.addColorStop(0.5, '#0b4d9c'); // Equatorial vibrant azure
        oceanGrad.addColorStop(0.8, '#08387f'); // Southern deep blue
        oceanGrad.addColorStop(1.0, '#041738'); // Antarctic waters
        ctx.fillStyle = oceanGrad;
        ctx.fillRect(0, 0, 4096, 2048);

        // 2. Coastal Turquoise Reefs & Continental Shelves
        const drawShallowReef = (points: [number, number][], blur = 18) => {
          ctx.save();
          ctx.filter = `blur(${blur}px)`;
          ctx.fillStyle = '#0ea5e9';
          ctx.beginPath();
          points.forEach(([x, y], idx) => {
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        };

        // 3. Realistic Continental Landmasses with Biome Layering
        const drawContinent = (
          points: [number, number][],
          landColor: string,
          shelfColor = '#0284c7',
          mountainPoints?: [number, number][],
          desertPoints?: [number, number][]
        ) => {
          // Shallow shelf halo
          drawShallowReef(points, 24);

          // Continental shelf boundary
          ctx.fillStyle = shelfColor;
          ctx.beginPath();
          points.forEach(([x, y], idx) => {
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.closePath();
          ctx.fill();

          // Main vegetated landmass (inset slightly)
          ctx.fillStyle = landColor;
          ctx.beginPath();
          points.forEach(([x, y], idx) => {
            const ix = x + (idx % 2 === 0 ? 3 : -3);
            const iy = y + (idx % 2 === 0 ? 3 : -3);
            if (idx === 0) ctx.moveTo(ix, iy);
            else ctx.lineTo(ix, iy);
          });
          ctx.closePath();
          ctx.fill();

          // Arid / Desert regions
          if (desertPoints && desertPoints.length > 2) {
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            desertPoints.forEach(([x, y], idx) => {
              if (idx === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fill();
          }

          // Mountain ridges & snow peaks
          if (mountainPoints && mountainPoints.length > 1) {
            ctx.strokeStyle = '#f8fafc';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            mountainPoints.forEach(([x, y], idx) => {
              if (idx === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            });
            ctx.stroke();
          }
        };

        // --- CONTINENTAL GEOGRAPHY ---

        // 1. Indian Subcontinent & South Asia
        drawContinent(
          [
            [2660, 680], [2740, 700], [2880, 720], [2990, 780], [3020, 860],
            [2980, 940], [2920, 1060], [2860, 1160], [2820, 1260], [2790, 1280],
            [2760, 1180], [2710, 1050], [2640, 940], [2600, 840], [2630, 740]
          ],
          '#15803d',
          '#0284c7',
          [[2720, 710], [2850, 730], [2980, 780]],
          [[2640, 800], [2710, 820], [2690, 890], [2630, 860]]
        );

        // Sri Lanka
        drawContinent(
          [[2820, 1310], [2840, 1330], [2835, 1370], [2810, 1350]],
          '#166534',
          '#38bdf8'
        );

        // 2. Eurasia & Middle East
        drawContinent(
          [
            [2050, 520], [2300, 480], [2650, 490], [3050, 500], [3450, 540],
            [3650, 680], [3550, 840], [3350, 880], [3150, 850], [2950, 780],
            [2600, 760], [2400, 720], [2200, 680], [2050, 600]
          ],
          '#2d5a27',
          '#0284c7',
          [[2150, 580], [2350, 560], [2550, 590], [2900, 560]],
          [[2350, 740], [2580, 780], [2640, 880], [2420, 850]]
        );

        // 3. East Asia & Japan
        drawContinent(
          [
            [3250, 720], [3500, 740], [3680, 860], [3580, 1050], [3420, 1150],
            [3300, 1050], [3200, 920]
          ],
          '#15803d',
          '#0284c7'
        );
        drawContinent(
          [[3720, 780], [3760, 820], [3740, 880], [3700, 840]],
          '#166534',
          '#38bdf8'
        );

        // 4. Africa
        drawContinent(
          [
            [1950, 760], [2250, 760], [2460, 880], [2420, 1150], [2350, 1420],
            [2250, 1600], [2150, 1620], [2020, 1450], [1920, 1180], [1860, 950]
          ],
          '#15803d',
          '#0284c7',
          undefined,
          [[1920, 800], [2400, 820], [2420, 1020], [1900, 980]]
        );

        // 5. Europe & British Isles
        drawContinent(
          [
            [1980, 460], [2220, 440], [2380, 520], [2300, 660], [2100, 680],
            [1960, 620], [1920, 520]
          ],
          '#166534',
          '#0284c7'
        );
        drawContinent(
          [[1900, 480], [1940, 470], [1950, 530], [1910, 540]],
          '#15803d',
          '#38bdf8'
        );

        // 6. Americas
        drawContinent(
          [
            [750, 420], [1050, 440], [1220, 600], [1160, 820], [980, 940],
            [820, 820], [680, 580]
          ],
          '#2d5a27',
          '#0284c7',
          [[800, 460], [920, 620], [1020, 780]]
        );
        drawContinent(
          [
            [1120, 980], [1320, 1060], [1440, 1260], [1350, 1580], [1200, 1780],
            [1100, 1540], [1040, 1200]
          ],
          '#14532d',
          '#0284c7',
          [[1060, 1020], [1120, 1300], [1180, 1650]]
        );

        // 7. Australia
        drawContinent(
          [
            [3400, 1350], [3680, 1360], [3760, 1520], [3650, 1680], [3420, 1650],
            [3340, 1480]
          ],
          '#a16207',
          '#0284c7',
          undefined,
          [[3450, 1420], [3620, 1440], [3600, 1580], [3440, 1560]]
        );

        // 8. Polar Ice Caps
        const drawPolarCap = (y: number, height: number, isNorth: boolean) => {
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          if (isNorth) {
            ctx.rect(0, 0, 4096, height);
          } else {
            ctx.rect(0, y, 4096, height);
          }
          ctx.fill();

          ctx.fillStyle = '#e2e8f0';
          for (let x = 0; x < 4096; x += 120) {
            ctx.beginPath();
            ctx.arc(x + Math.random() * 40, isNorth ? height : y, Math.random() * 35 + 15, 0, Math.PI * 2);
            ctx.fill();
          }
        };
        drawPolarCap(0, 140, true);
        drawPolarCap(1920, 128, false);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        return texture;
      };

      // 2B. Photorealistic Emissive Night City Lights Texture
      const createPhotorealisticNightTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');
        if (!ctx) return new THREE.CanvasTexture(canvas);

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 4096, 2048);

        // Global Population & Urban Corridors
        const majorHubs = [
          // India
          { x: 2780, y: 840, r: 60, density: 650, coreColor: '#fffbeb', glowColor: 'rgba(253, 224, 71, 0.6)' }, // Delhi-NCR
          { x: 2680, y: 1040, r: 45, density: 480, coreColor: '#fef08a', glowColor: 'rgba(251, 191, 36, 0.55)' }, // Mumbai-Pune
          { x: 2770, y: 1120, r: 48, density: 500, coreColor: '#fef08a', glowColor: 'rgba(251, 191, 36, 0.55)' }, // Bengaluru-Hyderabad
          { x: 2880, y: 920, r: 42, density: 420, coreColor: '#fde047', glowColor: 'rgba(245, 158, 11, 0.5)' }, // Kolkata
          { x: 2800, y: 1180, r: 40, density: 380, coreColor: '#fde047', glowColor: 'rgba(245, 158, 11, 0.5)' }, // Chennai
          { x: 2720, y: 950, r: 38, density: 320, coreColor: '#fef08a', glowColor: 'rgba(251, 191, 36, 0.45)' }, // Gujarat
          // Middle East & Europe
          { x: 2150, y: 580, r: 70, density: 650, coreColor: '#fffbeb', glowColor: 'rgba(253, 224, 71, 0.5)' },
          { x: 2480, y: 860, r: 45, density: 400, coreColor: '#fde047', glowColor: 'rgba(251, 191, 36, 0.5)' }, // Dubai
          // East Asia
          { x: 3350, y: 820, r: 65, density: 580, coreColor: '#fffbeb', glowColor: 'rgba(253, 224, 71, 0.5)' },
          { x: 3420, y: 980, r: 50, density: 450, coreColor: '#fef08a', glowColor: 'rgba(251, 191, 36, 0.5)' },
          { x: 3730, y: 830, r: 55, density: 520, coreColor: '#fffbeb', glowColor: 'rgba(253, 224, 71, 0.55)' }, // Tokyo
          // Americas
          { x: 1160, y: 640, r: 75, density: 680, coreColor: '#fffbeb', glowColor: 'rgba(253, 224, 71, 0.48)' },
          { x: 780, y: 680, r: 50, density: 450, coreColor: '#fef08a', glowColor: 'rgba(251, 191, 36, 0.48)' },
        ];

        majorHubs.forEach(hub => {
          const haloGrad = ctx.createRadialGradient(hub.x, hub.y, 2, hub.x, hub.y, hub.r * 1.6);
          haloGrad.addColorStop(0, hub.glowColor);
          haloGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.18)');
          haloGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(hub.x, hub.y, hub.r * 1.6, 0, Math.PI * 2);
          ctx.fill();

          for (let i = 0; i < hub.density; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.pow(Math.random(), 0.52) * hub.r;
            const lx = (hub.x + Math.cos(angle) * dist + 4096) % 4096;
            const ly = hub.y + Math.sin(angle) * dist * 0.75;

            ctx.fillStyle = Math.random() < 0.35 ? '#ffffff' : hub.coreColor;
            ctx.beginPath();
            ctx.arc(lx, ly, Math.random() * 1.4 + 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        return texture;
      };

      // 2C. Photorealistic Cloud Systems
      const createPhotorealisticCloudTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');
        if (!ctx) return new THREE.CanvasTexture(canvas);

        ctx.clearRect(0, 0, 4096, 2048);

        // ITCZ equatorial cloud ripples
        for (let i = 0; i < 280; i++) {
          const cx = Math.random() * 4096;
          const cy = 1024 + (Math.random() - 0.5) * 320;
          const rw = Math.random() * 160 + 60;
          const rh = Math.random() * 40 + 15;
          const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, rw);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
          grad.addColorStop(0.4, 'rgba(240, 249, 255, 0.42)');
          grad.addColorStop(0.8, 'rgba(224, 242, 254, 0.12)');
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rw, rh, Math.PI / 12, 0, Math.PI * 2);
          ctx.fill();
        }

        // Cyclonic Storm Vortices
        const drawCyclone = (x: number, y: number, radius: number) => {
          for (let angle = 0; angle < Math.PI * 4; angle += 0.15) {
            const dist = (angle / (Math.PI * 4)) * radius;
            const px = x + Math.cos(angle) * dist;
            const py = y + Math.sin(angle) * dist * 0.7;
            const puffR = Math.random() * 32 + 16;
            const grad = ctx.createRadialGradient(px, py, 2, px, py, puffR);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.82)');
            grad.addColorStop(0.5, 'rgba(241, 245, 249, 0.45)');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(px, py, puffR, 0, Math.PI * 2);
            ctx.fill();
          }
        };

        drawCyclone(2950, 920, 160); // Bay of Bengal
        drawCyclone(3550, 780, 180); // Western Pacific
        drawCyclone(1100, 720, 170); // Atlantic

        // Trade Wind Streaks
        for (let i = 0; i < 350; i++) {
          const cx = Math.random() * 4096;
          const cy = Math.random() * 1800 + 120;
          const cr = Math.random() * 95 + 30;
          const grad = ctx.createRadialGradient(cx, cy, 3, cx, cy, cr);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
          grad.addColorStop(0.5, 'rgba(240, 249, 255, 0.28)');
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
      // 3. 3D EARTH GLOBE ANCHORED AT BOTTOM HORIZON (MATCHING IMAGE 1)
      // -------------------------------------------------------------
      const earthRadius = 20.0;
      const earthGroup = new THREE.Group();
      // Position Earth so its curved planetary horizon sweeps gently across the lower viewport
      earthGroup.position.set(0, -23.4, -7.5);
      scene.add(earthGroup);

      // 3A. Earth Base Surface Sphere
      const earthGeo = new THREE.SphereGeometry(earthRadius, 128, 128);
      const earthTex = createPhotorealisticEarthTexture();
      const nightTex = createPhotorealisticNightTexture();

      const earthMat = new THREE.MeshStandardMaterial({
        map: earthTex,
        roughness: 0.72,
        metalness: 0.1,
        emissiveMap: nightTex,
        emissive: new THREE.Color(0xffd166),
        emissiveIntensity: 0.65,
      });
      const earthMesh = new THREE.Mesh(earthGeo, earthMat);
      earthGroup.add(earthMesh);

      // 3B. Rotating Wispy Cloud Layer Sphere
      const cloudGeo = new THREE.SphereGeometry(earthRadius + 0.18, 128, 128);
      const cloudTex = createPhotorealisticCloudTexture();
      const cloudMat = new THREE.MeshStandardMaterial({
        map: cloudTex,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        roughness: 0.9,
      });
      const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
      earthGroup.add(cloudMesh);

      // 3C. Atmospheric Rayleigh Limb Glow (Inverted BackSide Fresnel Shader)
      const atmoGeo = new THREE.SphereGeometry(earthRadius + 0.58, 128, 128);
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
            float intensity = pow(fresnel, 2.6);
            
            vec3 atmoCyan = vec3(0.0, 0.92, 1.0);
            vec3 atmoDeepBlue = vec3(0.12, 0.42, 1.0);
            vec3 color = mix(atmoDeepBlue, atmoCyan, fresnel);
            
            gl_FragColor = vec4(color, intensity * 0.96);
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
      // 4. SATELLITE / SPACECRAFT IN UPPER-RIGHT QUADRANT (MATCHING IMAGE 1)
      // -------------------------------------------------------------
      const stationGroup = new THREE.Group();
      // Positioned in upper right quadrant against deep starfield
      stationGroup.position.set(6.6, 4.8, 1.8);
      stationGroup.scale.set(0.38, 0.38, 0.38);
      scene.add(stationGroup);

      // Multi-Junction Solar Cell Grid Texture
      const createSolarCellTexture = () => {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 512;
        const ctx = c.getContext('2d');
        if (!ctx) return new THREE.CanvasTexture(c);

        ctx.fillStyle = '#03254c';
        ctx.fillRect(0, 0, 512, 512);

        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        for (let x = 0; x < 512; x += 32) {
          ctx.beginPath();
          ctx.moveTo(x, 0); ctx.lineTo(x, 512);
          ctx.stroke();
        }
        for (let y = 0; y < 512; y += 32) {
          ctx.beginPath();
          ctx.moveTo(0, y); ctx.lineTo(512, y);
          ctx.stroke();
        }

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(128, 0); ctx.lineTo(128, 512);
        ctx.moveTo(384, 0); ctx.lineTo(384, 512);
        ctx.stroke();

        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(4, 2);
        return tex;
      };

      const solarTex = createSolarCellTexture();

      // Materials
      const titaniumHullMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.88,
        roughness: 0.22,
      });

      const goldMliFoilMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.94,
        roughness: 0.18,
        emissive: 0xb45309,
        emissiveIntensity: 0.2,
      });

      const darkCompositeMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.9,
        roughness: 0.35,
      });

      const solarArrayMat = new THREE.MeshStandardMaterial({
        map: solarTex,
        color: 0x38bdf8,
        emissive: 0x0369a1,
        emissiveIntensity: 0.35,
        metalness: 0.95,
        roughness: 0.14,
      });

      const radiatorWhiteMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        metalness: 0.15,
        roughness: 0.3,
      });

      // 4A. Central Pressurized Module Bus
      const coreModule = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 3.4, 24), titaniumHullMat);
      coreModule.rotation.z = Math.PI / 2;
      stationGroup.add(coreModule);

      for (let rx = -1.4; rx <= 1.4; rx += 0.7) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.025, 12, 32), darkCompositeMat);
        ring.rotation.y = Math.PI / 2;
        ring.position.set(rx, 0, 0);
        stationGroup.add(ring);
      }

      // 4B. Gold MLI Service Module
      const serviceModule = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 1.3, 24), goldMliFoilMat);
      serviceModule.rotation.z = Math.PI / 2;
      serviceModule.position.set(-1.2, 0, 0);
      stationGroup.add(serviceModule);

      // 4C. Backbone Truss
      const truss = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.18, 0.18), darkCompositeMat);
      truss.position.set(0, 0.7, 0);
      stationGroup.add(truss);

      // 4D. Articulated Solar Array Wings (4 Panels)
      const solarPanelGeo = new THREE.BoxGeometry(2.6, 1.25, 0.05);

      const solarL1 = new THREE.Mesh(solarPanelGeo, solarArrayMat);
      solarL1.position.set(-3.5, 1.55, 0);
      stationGroup.add(solarL1);

      const solarL2 = new THREE.Mesh(solarPanelGeo, solarArrayMat);
      solarL2.position.set(-3.5, -0.15, 0);
      stationGroup.add(solarL2);

      const solarR1 = new THREE.Mesh(solarPanelGeo, solarArrayMat);
      solarR1.position.set(3.5, 1.55, 0);
      stationGroup.add(solarR1);

      const solarR2 = new THREE.Mesh(solarPanelGeo, solarArrayMat);
      solarR2.position.set(3.5, -0.15, 0);
      stationGroup.add(solarR2);

      // Mast Supports
      const mastL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.0, 12), darkCompositeMat);
      mastL.position.set(-3.5, 0.7, 0);
      stationGroup.add(mastL);

      const mastR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.0, 12), darkCompositeMat);
      mastR.position.set(3.5, 0.7, 0);
      stationGroup.add(mastR);

      // 4E. Radiators
      const radiatorGeo = new THREE.BoxGeometry(1.5, 0.85, 0.03);
      const radL = new THREE.Mesh(radiatorGeo, radiatorWhiteMat);
      radL.position.set(-1.6, 1.4, 0);
      radL.rotation.y = Math.PI / 2;
      stationGroup.add(radL);

      const radR = new THREE.Mesh(radiatorGeo, radiatorWhiteMat);
      radR.position.set(1.6, 1.4, 0);
      radR.rotation.y = Math.PI / 2;
      stationGroup.add(radR);

      // 4F. Telemetry Dish
      const dish = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.28, 24, 1, true), titaniumHullMat);
      dish.position.set(0.65, -1.1, 0.45);
      dish.rotation.x = -Math.PI / 3.0;
      dish.rotation.z = Math.PI / 6;
      stationGroup.add(dish);

      const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), goldMliFoilMat);
      horn.position.set(0.65, -1.1, 0.65);
      horn.rotation.x = -Math.PI / 3.0;
      stationGroup.add(horn);

      // 4G. Navigation Strobes
      const portBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      portBeacon.position.set(-4.9, 0.7, 0);
      stationGroup.add(portBeacon);

      const stbdBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00e5ff }));
      stbdBeacon.position.set(4.9, 0.7, 0);
      stationGroup.add(stbdBeacon);

      const stbdLight = new THREE.PointLight(0x00e5ff, 3.0, 10);
      stbdLight.position.set(4.9, 0.7, 0);
      stationGroup.add(stbdLight);

      // -------------------------------------------------------------
      // 5. DENSE MULTI-DEPTH STARFIELD (4,200+ Stars)
      // -------------------------------------------------------------
      const createDenseStarLayer = (count: number, size: number, spreadZ: number, baseOpacity: number) => {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);

        const spectralColors = [
          new THREE.Color(0xffffff),
          new THREE.Color(0xf8fafc),
          new THREE.Color(0xe0f2fe),
          new THREE.Color(0xbae6fd),
          new THREE.Color(0xfef08a),
          new THREE.Color(0xfde047),
          new THREE.Color(0xc4b5fd),
        ];

        for (let i = 0; i < count; i++) {
          pos[i * 3] = (Math.random() - 0.5) * 110;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 80;
          pos[i * 3 + 2] = -Math.random() * spreadZ - 8;

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

      const distantStars = createDenseStarLayer(2800, 0.11, 160, 0.92);
      const midStars = createDenseStarLayer(1200, 0.19, 80, 0.98);
      const orbitalDust = createDenseStarLayer(200, 0.32, 35, 0.7);

      scene.add(distantStars);
      scene.add(midStars);
      scene.add(orbitalDust);

      // -------------------------------------------------------------
      // 6. CINEMATIC SOLAR LIGHTING & ALBEDO BOUNCE
      // -------------------------------------------------------------
      const sunLight = new THREE.DirectionalLight(0xffffff, 3.2);
      sunLight.position.set(18, 14, 15);
      scene.add(sunLight);

      const spaceAmbient = new THREE.AmbientLight(0x061124, 0.5);
      scene.add(spaceAmbient);

      const earthAlbedoLight = new THREE.DirectionalLight(0x0284c7, 0.65);
      earthAlbedoLight.position.set(0, -10, 6);
      scene.add(earthAlbedoLight);

      // -------------------------------------------------------------
      // 7. SMOOTH 60 FPS ORBITAL ANIMATION LOOP
      // -------------------------------------------------------------
      const clock = new THREE.Clock();

      const animate = () => {
        animId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Earth & Cloud Majestic Slow Rotation
        earthMesh.rotation.y = elapsedTime * 0.016 + 1.45;
        cloudMesh.rotation.y = elapsedTime * 0.021 + 1.45;

        // Starfield subtle multi-depth parallax drift
        distantStars.rotation.y = elapsedTime * 0.0012;
        midStars.rotation.y = elapsedTime * 0.0022;
        orbitalDust.rotation.y = elapsedTime * 0.0045;
        orbitalDust.position.x = Math.sin(elapsedTime * 0.08) * 0.3;

        // Space Station Smooth Orbital Path & Attitude Drift
        stationGroup.position.x = 6.6 + Math.sin(elapsedTime * 0.12) * 1.2;
        stationGroup.position.y = 4.8 + Math.cos(elapsedTime * 0.09) * 0.45;
        stationGroup.position.z = 1.8 + Math.sin(elapsedTime * 0.07) * 0.5;

        stationGroup.rotation.y = 0.35 + Math.sin(elapsedTime * 0.05) * 0.08;
        stationGroup.rotation.z = 0.12 + Math.cos(elapsedTime * 0.04) * 0.04;

        // Navigation Strobe Blink (1 Hz Aviation Pulse)
        const blink = Math.sin(elapsedTime * 4.5) > 0.4 ? 1 : 0;
        stbdBeacon.visible = blink === 1;
        portBeacon.visible = blink === 1;
        stbdLight.intensity = blink ? 3.2 : 0.0;

        if (renderer) {
          renderer.render(scene, camera);
        }
      };

      animate();

      // -------------------------------------------------------------
      // 8. RESIZE & VISIBILITY HANDLING
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
        nightTex.dispose();
        cloudTex.dispose();
        solarTex.dispose();
        distantStars.geometry.dispose();
        midStars.geometry.dispose();
        orbitalDust.geometry.dispose();
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
