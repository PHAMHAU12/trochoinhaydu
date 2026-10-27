import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameMode, GroundZone, MapTheme, ParachuteEntity, PlayerInput } from '../types/game';
import { sounds } from '../services/soundEffects';

interface ParachuteCanvasProps {
  players: PlayerInput[];
  theme: MapTheme;
  mode: GameMode;
  targetCount: number;
  windLevel: 'CALM' | 'BREEZE' | 'GUSTY';
  allowThermals: boolean;
  fallSpeedMultiplier: number;
  soundEnabled: boolean;
  zones: GroundZone[];
  roundKey: number; // Increment this to force reset / replay!
  instantLandTrigger: number; // Force instant touchdown
  onGameFinish: (results: {
    chosen: ParachuteEntity[];
    allLandings: ParachuteEntity[];
  }) => void;
  onStatsUpdate: (stats: {
    total: number;
    landed: number;
    inAir: number;
    windSpeed: number;
  }) => void;
  isPaused: boolean;
  forcedGustTrigger: number;
}

interface Cloud {
  x: number;
  y: number;
  speed: number;
  scale: number;
  opacity: number;
}

interface ThermalColumn {
  x: number;
  width: number;
  strength: number;
  duration: number;
}

export const ParachuteCanvas: React.FC<ParachuteCanvasProps> = ({
  players,
  theme,
  mode,
  targetCount,
  windLevel,
  allowThermals,
  fallSpeedMultiplier,
  soundEnabled,
  zones,
  roundKey,
  instantLandTrigger,
  onGameFinish,
  onStatsUpdate,
  isPaused,
  forcedGustTrigger,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Logical dimensions (CSS pixels)
  const logicalDimsRef = useRef<{ w: number; h: number }>({ w: 1200, h: 800 });

  // Game state & entities
  const parachutesRef = useRef<ParachuteEntity[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const thermalsRef = useRef<ThermalColumn[]>([]);
  const airplaneRef = useRef<{ x: number; y: number; speed: number }>({ x: -200, y: 75, speed: 220 });

  // Wind physics
  const windRef = useRef<number>(0);
  const targetWindRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const gamePhaseRef = useRef<'COUNTDOWN' | 'DROPPING' | 'FREEZE' | 'FINISHED'>('COUNTDOWN');
  const freezeTimerRef = useRef<number>(0);
  const landedHistoryRef = useRef<ParachuteEntity[]>([]);
  const chosenFinalRef = useRef<ParachuteEntity[]>([]);

  const [displayCountdown, setDisplayCountdown] = useState<number | null>(3);

  // Maximum wind speed by level
  const maxWindSpeed = windLevel === 'CALM' ? 0.35 : windLevel === 'BREEZE' ? 0.8 : 1.5;

  // Initialize simulation
  const initSimulation = useCallback(() => {
    const container = containerRef.current;
    const w = container ? container.clientWidth || 1200 : 1200;
    const h = container ? container.clientHeight || 800 : 800;
    logicalDimsRef.current = { w, h };

    gamePhaseRef.current = 'COUNTDOWN';
    setDisplayCountdown(3);
    freezeTimerRef.current = 0;
    landedHistoryRef.current = [];
    chosenFinalRef.current = [];
    timeRef.current = 0;
    airplaneRef.current = { x: -180, y: 75, speed: (w + 350) / 4.5 };

    const count = players.length;
    // Multi-row vertical staggering for larger classes
    const numRows = count > 32 ? 3 : count > 16 ? 2 : 1;
    const margin = Math.max(35, w * (count > 30 ? 0.04 : 0.07));
    const availableWidth = w - margin * 2;
    const spacing = count > 1 ? availableWidth / (count - 1) : 0;

    const entities: ParachuteEntity[] = players.map((p, index) => {
      const row = index % numRows;
      const initX = count === 1 ? w / 2 : margin + index * spacing + (Math.random() - 0.5) * 8;
      // Stagger vertical height across tiers so they start nicely spaced out
      const initY = 50 + row * (numRows === 3 ? 36 : 42) + (Math.random() - 0.5) * 8;

      return {
        id: p.id,
        name: p.name,
        avatarIndex: p.avatarIndex,
        color: p.color,
        x: Math.max(25, Math.min(w - 25, initX)),
        y: initY,
        vx: (Math.random() - 0.5) * 0.35,
        vy: 0,
        // Responsive falling speed: arrives at ground in ~12-16 seconds at 1x
        targetVy: 1.7 + (index % 5) * 0.15 + Math.random() * 0.4,
        parachuteOpen: false,
        openProgress: 0,
        swingAngle: (Math.random() - 0.5) * 0.25,
        swingSpeed: 0.035 + Math.random() * 0.02,
        landed: false,
        landedX: 0,
        inThermal: false,
        thermalCooldown: 0,
      };
    });

    parachutesRef.current = entities;

    // Background clouds
    const clouds: Cloud[] = [];
    for (let i = 0; i < 8; i++) {
      clouds.push({
        x: Math.random() * w,
        y: 40 + Math.random() * (h * 0.35),
        speed: 0.25 + Math.random() * 0.35,
        scale: 0.8 + Math.random() * 0.8,
        opacity: 0.4 + Math.random() * 0.4,
      });
    }
    cloudsRef.current = clouds;

    // Report initial stats
    onStatsUpdate({
      total: count,
      landed: 0,
      inAir: count,
      windSpeed: 0,
    });

    if (soundEnabled) {
      sounds.playCountdown(false);
    }
  }, [players, soundEnabled, onStatsUpdate]);

  // Handle Resize & DPI Scaling
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const w = container.clientWidth || 1200;
      const h = container.clientHeight || 800;
      logicalDimsRef.current = { w, h };

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset when roundKey changes or players change
  useEffect(() => {
    initSimulation();
  }, [roundKey, players, initSimulation]);

  // Handle manual gust
  useEffect(() => {
    if (forcedGustTrigger > 0) {
      const dir = Math.random() > 0.5 ? 1 : -1;
      targetWindRef.current = dir * (maxWindSpeed * 2.2);
      windRef.current = targetWindRef.current;
      if (soundEnabled) sounds.playThermal();
    }
  }, [forcedGustTrigger, maxWindSpeed, soundEnabled]);

  // Handle Instant Touchdown Trigger
  useEffect(() => {
    if (instantLandTrigger > 0 && gamePhaseRef.current === 'DROPPING') {
      const { w, h } = logicalDimsRef.current;
      const groundY = h * 0.82;

      // Force all unlanded parachutes to touch down immediately
      parachutesRef.current.forEach((p) => {
        if (!p.landed) {
          p.landed = true;
          p.y = groundY - 6;
          p.landedX = p.x;
          p.landedTime = timeRef.current;
          p.rank = landedHistoryRef.current.length + 1;

          const ratio = p.x / w;
          const matched = zones.find((z) => ratio >= z.startRatio && ratio <= z.endRatio) || zones[0];
          p.landedZone = matched;
          landedHistoryRef.current.push(p);
        }
      });
    }
  }, [instantLandTrigger, zones]);

  // Countdown timer sequence
  useEffect(() => {
    if (isPaused) return;

    let current = 3;
    const timer = setInterval(() => {
      if (gamePhaseRef.current === 'COUNTDOWN') {
        current -= 1;
        if (current > 0) {
          setDisplayCountdown(current);
          if (soundEnabled) sounds.playCountdown(false);
        } else if (current === 0) {
          setDisplayCountdown(0);
          if (soundEnabled) sounds.playCountdown(true);
        } else {
          setDisplayCountdown(null);
          gamePhaseRef.current = 'DROPPING';
          if (soundEnabled) {
            sounds.playJump();
            setTimeout(() => sounds.playParachuteOpen(), 500);
          }
          clearInterval(timer);
        }
      }
    }, 850);

    return () => clearInterval(timer);
  }, [isPaused, soundEnabled, roundKey]);

  // Main Game Animation Loop
  useEffect(() => {
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.08);
      lastTime = now;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { w, h } = logicalDimsRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const groundY = h * 0.82;

      // Ensure canvas backing matches logical dimensions
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }

      ctx.save();
      // Scale all drawings to logical CSS pixels
      ctx.scale(dpr, dpr);

      // ==========================================
      // PHYSICS UPDATE
      // ==========================================
      if (!isPaused) {
        timeRef.current += dt;

        // Dynamic natural wind shifts
        if (Math.random() < 0.02) {
          targetWindRef.current = (Math.random() * 2 - 1) * maxWindSpeed;
        }
        windRef.current += (targetWindRef.current - windRef.current) * 0.03;

        // Occasional rising thermals
        if (allowThermals && Math.random() < 0.006 && thermalsRef.current.length < 2) {
          thermalsRef.current.push({
            x: Math.random() * (w - 200) + 100,
            width: 80 + Math.random() * 70,
            strength: 1.8 + Math.random() * 1.2,
            duration: 3.5 + Math.random() * 2,
          });
          if (soundEnabled) sounds.playThermal();
        }

        // Update thermals
        thermalsRef.current.forEach((th) => {
          th.duration -= dt;
        });
        thermalsRef.current = thermalsRef.current.filter((th) => th.duration > 0);

        // Update clouds
        cloudsRef.current.forEach((c) => {
          c.x += (c.speed + windRef.current * 0.3) * (dt * 60);
          if (c.x > w + 160) c.x = -160;
          if (c.x < -160) c.x = w + 160;
        });

        // Update airplane
        airplaneRef.current.x += airplaneRef.current.speed * dt;

        // Update parachutes
        if (gamePhaseRef.current === 'DROPPING') {
          const mult = fallSpeedMultiplier;

          parachutesRef.current.forEach((p) => {
            if (p.landed) return;

            // Open parachute after jumping
            if (!p.parachuteOpen) {
              p.openProgress += dt * 2.4;
              if (p.openProgress >= 1) {
                p.openProgress = 1;
                p.parachuteOpen = true;
              }
            }

            // Pendulum swing
            p.swingAngle += p.swingSpeed * mult;
            const swingForce = Math.sin(p.swingAngle) * 0.2;

            // Horizontal wind influence
            const windInfluence = p.parachuteOpen ? windRef.current * 1.6 : windRef.current * 0.4;
            p.vx = windInfluence + swingForce;
            p.x += p.vx * mult * (dt * 60);

            // Bounds bouncing
            if (p.x < 35) {
              p.x = 35;
              p.vx = Math.abs(p.vx);
            }
            if (p.x > w - 35) {
              p.x = w - 35;
              p.vx = -Math.abs(p.vx);
            }

            // Vertical fall & updrafts
            let targetVy = p.targetVy * mult;

            if (allowThermals && p.parachuteOpen) {
              const inThermal = thermalsRef.current.find(
                (th) => p.x >= th.x - th.width / 2 && p.x <= th.x + th.width / 2 && p.y > 110 && p.y < groundY - 70
              );
              if (inThermal) {
                p.inThermal = true;
                targetVy = -inThermal.strength * 0.7; // Push up!
              } else {
                p.inThermal = false;
              }
            }

            // Smooth approach to vertical speed
            p.vy += (targetVy - p.vy) * 0.1;
            p.y += p.vy * (dt * 60);

            // Ensure cannot fly off top
            if (p.y < 50) p.y = 50;

            // Land detection
            if (p.y >= groundY - 8) {
              p.landed = true;
              p.y = groundY - 6;
              p.landedX = p.x;
              p.landedTime = timeRef.current;
              p.rank = landedHistoryRef.current.length + 1;

              // Find zone
              const ratio = p.x / w;
              const matchedZone = zones.find((z) => ratio >= z.startRatio && ratio <= z.endRatio) || zones[0];
              p.landedZone = matchedZone;

              landedHistoryRef.current.push(p);

              if (soundEnabled && matchedZone) {
                sounds.playLanding(matchedZone.type);
              }
            }
          });

          // Soft collision avoidance so parachutes don't overlap completely in air
          if (parachutesRef.current.length > 12) {
            const activeList = parachutesRef.current.filter((p) => !p.landed);
            for (let i = 0; i < activeList.length; i++) {
              const p1 = activeList[i];
              for (let j = i + 1; j < activeList.length; j++) {
                const p2 = activeList[j];
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const minDistX = parachutesRef.current.length > 30 ? 34 : 46;
                const minDistY = 26;
                if (Math.abs(dx) < minDistX && Math.abs(dy) < minDistY) {
                  const push = (minDistX - Math.abs(dx)) * 0.04;
                  if (dx > 0) {
                    p1.x = Math.max(25, p1.x - push);
                    p2.x = Math.min(w - 25, p2.x + push);
                  } else {
                    p1.x = Math.min(w - 25, p1.x + push);
                    p2.x = Math.max(25, p2.x - push);
                  }
                }
              }
            }
          }

          // Report stats
          const landedCount = landedHistoryRef.current.length;
          const totalCount = parachutesRef.current.length;
          onStatsUpdate({
            total: totalCount,
            landed: landedCount,
            inAir: totalCount - landedCount,
            windSpeed: Number((windRef.current * 10).toFixed(1)),
          });

          // Check End-Game Conditions for ALL Game Modes
          let shouldTriggerFinish = false;
          let candidateChosen: ParachuteEntity[] = [];

          if (mode === 'CHALLENGE_ZONE') {
            const inRed = landedHistoryRef.current.filter((p) => p.landedZone?.type === 'CHALLENGE');
            if (inRed.length >= targetCount) {
              candidateChosen = inRed.slice(0, targetCount);
              shouldTriggerFinish = true;
            } else if (landedCount === totalCount) {
              // If everyone landed and none or not enough hit red, pick in red or closest to red
              if (inRed.length > 0) {
                candidateChosen = inRed.slice(0, targetCount);
              } else {
                const redZone = zones.find((z) => z.type === 'CHALLENGE') || zones[0];
                const redCenter = ((redZone.startRatio + redZone.endRatio) / 2) * w;
                const sortedByDist = [...landedHistoryRef.current].sort(
                  (a, b) => Math.abs(a.landedX - redCenter) - Math.abs(b.landedX - redCenter)
                );
                candidateChosen = sortedByDist.slice(0, targetCount);
              }
              shouldTriggerFinish = true;
            }
          } else if (mode === 'LUCKY_ZONE') {
            const inGold = landedHistoryRef.current.filter((p) => p.landedZone?.type === 'LUCKY');
            if (inGold.length >= targetCount) {
              candidateChosen = inGold.slice(0, targetCount);
              shouldTriggerFinish = true;
            } else if (landedCount === totalCount) {
              if (inGold.length > 0) {
                candidateChosen = inGold.slice(0, targetCount);
              } else {
                const goldZone = zones.find((z) => z.type === 'LUCKY') || zones[0];
                const goldCenter = ((goldZone.startRatio + goldZone.endRatio) / 2) * w;
                const sortedByDist = [...landedHistoryRef.current].sort(
                  (a, b) => Math.abs(a.landedX - goldCenter) - Math.abs(b.landedX - goldCenter)
                );
                candidateChosen = sortedByDist.slice(0, targetCount);
              }
              shouldTriggerFinish = true;
            }
          } else if (mode === 'LAST_LANDER') {
            const inAir = parachutesRef.current.filter((p) => !p.landed);
            if (inAir.length === 0 && landedHistoryRef.current.length > 0) {
              // The very last to touch down
              candidateChosen = [...landedHistoryRef.current].reverse().slice(0, targetCount);
              shouldTriggerFinish = true;
            }
          } else if (mode === 'FIRST_LANDER') {
            if (landedHistoryRef.current.length >= targetCount) {
              candidateChosen = landedHistoryRef.current.slice(0, targetCount);
              shouldTriggerFinish = true;
            }
          }

          if (shouldTriggerFinish) {
            chosenFinalRef.current = candidateChosen;
            gamePhaseRef.current = 'FREEZE';
            freezeTimerRef.current = 1.0; // 1s dramatic freeze
            if (soundEnabled) sounds.playSuspenseHit();
          }
        } else if (gamePhaseRef.current === 'FREEZE') {
          freezeTimerRef.current -= dt;
          if (freezeTimerRef.current <= 0) {
            gamePhaseRef.current = 'FINISHED';
            if (soundEnabled) sounds.playCelebration();
            onGameFinish({
              chosen: chosenFinalRef.current,
              allLandings: landedHistoryRef.current,
            });
          }
        }
      }

      // ==========================================
      // RENDERING (All in logical CSS pixels)
      // ==========================================
      ctx.clearRect(0, 0, w, h);

      // 1. Sky
      drawSkyBackground(ctx, w, h, theme);

      // 2. Clouds
      drawClouds(ctx, cloudsRef.current);

      // 3. Thermals
      if (allowThermals) {
        drawThermals(ctx, thermalsRef.current, h);
      }

      // 4. Airplane
      drawAirplane(ctx, airplaneRef.current.x, airplaneRef.current.y, theme);

      // 5. Ground Zones
      drawGroundZones(ctx, w, h, groundY, zones);

      // 6. Parachutes (landed & in air)
      const sorted = [...parachutesRef.current].sort((a, b) => a.y - b.y);
      sorted.forEach((p) => {
        drawParachute(ctx, p, groundY);
      });

      // 7. Freeze Frame Spotlight on Chosen Players
      if (gamePhaseRef.current === 'FREEZE' || gamePhaseRef.current === 'FINISHED') {
        chosenFinalRef.current.forEach((cp) => {
          ctx.save();
          // Animated glowing spotlight ring
          const pulse = Math.sin(timeRef.current * 8) * 6;
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(cp.landedX || cp.x, groundY - 12, 32 + pulse, 0, Math.PI * 2);
          ctx.stroke();

          // Golden sparkle crown
          ctx.font = '22px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('👑', cp.landedX || cp.x, groundY - 55);
          ctx.restore();
        });
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    isPaused,
    maxWindSpeed,
    allowThermals,
    soundEnabled,
    fallSpeedMultiplier,
    zones,
    mode,
    targetCount,
    theme,
    onGameFinish,
    onStatsUpdate,
  ]);

  // Render Helpers
  const drawSkyBackground = (ctx: CanvasRenderingContext2D, w: number, h: number, currentTheme: MapTheme) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);

    if (currentTheme === 'TROPICAL_ISLAND') {
      grad.addColorStop(0, '#38BDF8');
      grad.addColorStop(0.55, '#7DD3FC');
      grad.addColorStop(0.85, '#BAE6FD');
      grad.addColorStop(1, '#0284C7');
    } else if (currentTheme === 'CYBER_CITY') {
      grad.addColorStop(0, '#0F172A');
      grad.addColorStop(0.4, '#1E1B4B');
      grad.addColorStop(0.75, '#312E81');
      grad.addColorStop(1, '#4C1D95');
    } else if (currentTheme === 'COUNTRYSIDE') {
      grad.addColorStop(0, '#60A5FA');
      grad.addColorStop(0.55, '#93C5FD');
      grad.addColorStop(0.85, '#FEF08A');
      grad.addColorStop(1, '#84CC16');
    } else {
      // Cosmic Space
      grad.addColorStop(0, '#030712');
      grad.addColorStop(0.5, '#0B0F19');
      grad.addColorStop(0.85, '#1E1B4B');
      grad.addColorStop(1, '#111827');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    if (currentTheme === 'COSMIC_SPACE') {
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 45; i++) {
        const sx = (i * 137.5) % w;
        const sy = (i * 79.3) % (h * 0.7);
        const r = i % 3 === 0 ? 1.6 : 0.9;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const drawClouds = (ctx: CanvasRenderingContext2D, clouds: Cloud[]) => {
    ctx.save();
    clouds.forEach((c) => {
      ctx.fillStyle = `rgba(255, 255, 255, ${c.opacity * 0.65})`;
      ctx.beginPath();
      const r = 24 * c.scale;
      ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
      ctx.arc(c.x + 20 * c.scale, c.y - 10 * c.scale, r * 1.2, 0, Math.PI * 2);
      ctx.arc(c.x + 45 * c.scale, c.y - 4 * c.scale, r * 0.9, 0, Math.PI * 2);
      ctx.arc(c.x + 65 * c.scale, c.y + 4 * c.scale, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  };

  const drawThermals = (ctx: CanvasRenderingContext2D, thermals: ThermalColumn[], h: number) => {
    ctx.save();
    thermals.forEach((th) => {
      const grad = ctx.createLinearGradient(th.x, h * 0.75, th.x, 90);
      grad.addColorStop(0, 'rgba(251, 146, 60, 0.05)');
      grad.addColorStop(0.5, 'rgba(251, 146, 60, 0.22)');
      grad.addColorStop(1, 'rgba(251, 146, 60, 0.02)');
      ctx.fillStyle = grad;
      ctx.fillRect(th.x - th.width / 2, 90, th.width, h * 0.75 - 90);

      ctx.strokeStyle = 'rgba(251, 146, 60, 0.45)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(th.x, h * 0.7);
      ctx.lineTo(th.x, 110);
      ctx.stroke();
    });
    ctx.restore();
  };

  const drawAirplane = (ctx: CanvasRenderingContext2D, x: number, y: number, currentTheme: MapTheme) => {
    if (x > logicalDimsRef.current.w + 140) return;

    ctx.save();
    ctx.translate(x, y);

    // Fuselage
    ctx.fillStyle = currentTheme === 'CYBER_CITY' ? '#3B82F6' : '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(0, 0, 50, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red stripe
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-30, -2, 60, 4);

    // Wings
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.lineTo(-18, -28);
    ctx.lineTo(0, -28);
    ctx.lineTo(12, -4);
    ctx.closePath();
    ctx.fill();

    // Tail fin
    ctx.beginPath();
    ctx.moveTo(-38, -4);
    ctx.lineTo(-48, -22);
    ctx.lineTo(-38, -22);
    ctx.lineTo(-28, -4);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(32, -3, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawGroundZones = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    groundY: number,
    groundZones: GroundZone[]
  ) => {
    const zoneHeight = h - groundY;

    groundZones.forEach((z) => {
      const startX = z.startRatio * w;
      const endX = z.endRatio * w;
      const zoneW = endX - startX;

      ctx.fillStyle = z.color;
      ctx.fillRect(startX, groundY, zoneW, zoneHeight);

      // Vertical separator
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(startX, groundY);
      ctx.lineTo(startX, h);
      ctx.stroke();

      // Top border
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = z.type === 'CHALLENGE' ? '#FEF08A' : z.type === 'LUCKY' ? '#FDE047' : '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(startX, groundY);
      ctx.lineTo(endX, groundY);
      ctx.stroke();

      // Hazard pattern for Challenge Zone
      if (z.type === 'CHALLENGE') {
        ctx.save();
        ctx.beginPath();
        ctx.rect(startX, groundY, zoneW, 14);
        ctx.clip();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.lineWidth = 6;
        for (let ix = startX - 30; ix < endX + 30; ix += 18) {
          ctx.beginPath();
          ctx.moveTo(ix, groundY);
          ctx.lineTo(ix + 18, groundY + 14);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Zone Labels
      ctx.save();
      const midX = startX + zoneW / 2;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Plus Jakarta Sans, sans-serif';
      ctx.fillText(z.label, midX, groundY + 28);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '500 11px Plus Jakarta Sans, sans-serif';
      ctx.fillText(z.sublabel, midX, groundY + 46);
      ctx.restore();
    });
  };

  const drawParachute = (ctx: CanvasRenderingContext2D, p: ParachuteEntity, groundY: number) => {
    ctx.save();
    ctx.translate(p.x, p.y);

    const rot = p.landed ? 0 : p.swingAngle * 0.4 + p.vx * 0.08;
    ctx.rotate(rot);

    // Adaptive sizing based on total number of students
    const totalCount = parachutesRef.current.length;
    const scale = totalCount > 35 ? 0.78 : totalCount > 20 ? 0.88 : 1.0;
    const canopyRadius = 22 * scale;
    const stringLength = 30 * scale;
    const charRadius = 8.5 * scale;

    if (p.landed) {
      // Landed on ground
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(-12 * scale, 2, 14 * scale, 5 * scale, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Flag
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(6 * scale, -16 * scale, 10 * scale, 7 * scale);
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(6 * scale, -16 * scale);
      ctx.lineTo(6 * scale, 4);
      ctx.stroke();
    } else {
      // Flying
      const open = Math.max(0.2, p.openProgress);
      const curRadius = canopyRadius * open;
      const canopyY = -stringLength;

      // Canopy dome
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, canopyY, curRadius, Math.PI, 0, false);
      ctx.closePath();
      ctx.fill();

      // Canopy center accent
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.arc(0, canopyY, curRadius * 0.45, Math.PI, 0, false);
      ctx.closePath();
      ctx.fill();

      // Strings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-curRadius * 0.85, canopyY);
      ctx.lineTo(0, -5);
      ctx.moveTo(-curRadius * 0.3, canopyY);
      ctx.lineTo(0, -5);
      ctx.moveTo(curRadius * 0.3, canopyY);
      ctx.lineTo(0, -5);
      ctx.moveTo(curRadius * 0.85, canopyY);
      ctx.lineTo(0, -5);
      ctx.stroke();
    }

    // Character body
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(0, 0, charRadius, 0, Math.PI * 2);
    ctx.fill();

    // Emoji Face
    const emojis = ['🦊', '🐼', '🦁', '🐸', '🐯', '🐰', '🐨', '🐵', '🐱', '🦄'];
    const emoji = emojis[p.avatarIndex % emojis.length];
    ctx.font = `${Math.floor(13 * scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 0, 0);

    ctx.restore();

    // ==========================================
    // BIG HIGH-CONTRAST NAME BADGE (WITH ANTI-OVERLAP STAGGERING)
    // ==========================================
    ctx.save();
    const fontSize = totalCount > 35 ? 10.5 : totalCount > 20 ? 11.5 : 13;
    ctx.font = `bold ${fontSize}px Plus Jakarta Sans, sans-serif`;
    const textWidth = ctx.measureText(p.name).width;
    const padX = totalCount > 35 ? 5 : 7;
    const boxW = Math.max(textWidth + padX * 2, totalCount > 35 ? 38 : 45);
    const boxH = totalCount > 35 ? 18 : 21;

    // Landed tag offset: stagger across 3 height levels so grounded badges never block each other
    const groundTagStagger = p.landed ? ((p.rank || 0) % 3) * (boxH + 4) : 0;
    const tagY = p.landed ? p.y - 24 - groundTagStagger : p.y - stringLength - canopyRadius - 7;
    const tagX = p.x;

    ctx.fillStyle =
      p.landedZone?.type === 'CHALLENGE'
        ? 'rgba(220, 38, 38, 0.95)'
        : p.landedZone?.type === 'LUCKY'
        ? 'rgba(217, 119, 6, 0.95)'
        : 'rgba(15, 23, 42, 0.88)';

    ctx.beginPath();
    ctx.roundRect(tagX - boxW / 2, tagY - boxH / 2, boxW, boxH, 5);
    ctx.fill();

    ctx.strokeStyle = p.landed ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.name, tagX, tagY);

    if (p.landed && p.rank) {
      ctx.fillStyle = '#F59E0B';
      ctx.font = `bold ${Math.max(9, fontSize - 2)}px Plus Jakarta Sans, sans-serif`;
      ctx.fillText(`#${p.rank}`, tagX + boxW / 2 + 7, tagY);
    }

    ctx.restore();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none">
      <canvas ref={canvasRef} className="block w-full h-full" style={{ touchAction: 'none' }} />

      {/* Big Countdown Overlay */}
      {displayCountdown !== null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-xs pointer-events-none z-20">
          <div className="flex flex-col items-center animate-bounce">
            <span className="text-8xl md:text-9xl font-black text-amber-400 drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]">
              {displayCountdown > 0 ? displayCountdown : 'NHẢY! 🪂'}
            </span>
            <p className="mt-4 text-xl md:text-2xl font-bold text-white tracking-wide bg-slate-900/80 px-6 py-2 rounded-xl shadow-lg border border-white/20">
              {displayCountdown > 0 ? 'Máy bay đang mở cửa xuất phát...' : 'TẤT CẢ DÙ BUNG RA!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
