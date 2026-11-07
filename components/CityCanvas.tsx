'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PlacedBuilding, BuildingDefinition, AbuDhabiDistrict } from '@/types/game';
import { BUILDINGS_CATALOG, DISTRICTS } from '@/lib/buildingsData';
import { soundSynth } from '@/lib/audioSynth';

interface CityCanvasProps {
  district: AbuDhabiDistrict;
  placedBuildings: PlacedBuilding[];
  selectedBuildingToPlace: BuildingDefinition | null;
  onPlaceBuilding: (x: number, y: number) => void;
  onSelectPlacedBuilding: (building: PlacedBuilding | null) => void;
  selectedPlacedBuilding: PlacedBuilding | null;
  timeOfDay: 'day' | 'sunset' | 'night';
}

export const CityCanvas: React.FC<CityCanvasProps> = ({
  district,
  placedBuildings,
  selectedBuildingToPlace,
  onPlaceBuilding,
  onSelectPlacedBuilding,
  selectedPlacedBuilding,
  timeOfDay,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const districtInfo = DISTRICTS[district];
  const gridW = districtInfo.gridSize.width;
  const gridH = districtInfo.gridSize.height;

  // Viewport camera transform
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, camX: 0, camY: 0 });
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);

  // Isometric constants
  const tileWidth = 64;
  const tileHeight = 32;

  // Convert Grid (x, y) to Isometric Screen Coordinates
  const gridToIso = useCallback(
    (gx: number, gy: number) => {
      const originX = 0;
      const originY = 60;
      return {
        x: originX + (gx - gy) * (tileWidth / 2),
        y: originY + (gx + gy) * (tileHeight / 2),
      };
    },
    [tileWidth, tileHeight]
  );

  // Convert Screen Coordinates (canvas space) to Grid (x, y)
  const screenToGrid = useCallback(
    (sx: number, sy: number) => {
      const originX = 0;
      const originY = 60;
      const adjustedX = (sx - camera.x) / camera.zoom - originX;
      const adjustedY = (sy - camera.y) / camera.zoom - originY;

      const gx = Math.floor((adjustedX / (tileWidth / 2) + adjustedY / (tileHeight / 2)) / 2);
      const gy = Math.floor((adjustedY / (tileHeight / 2) - adjustedX / (tileWidth / 2)) / 2);
      return { gx, gy };
    },
    [camera, tileWidth, tileHeight]
  );

  // Center camera on initial render or district switch
  useEffect(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setCamera({
        x: rect.width / 2,
        y: rect.height / 3,
        zoom: rect.width < 768 ? 0.85 : 1.1,
      });
    }
  }, [district]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        if (parent) {
          canvasRef.current.width = parent.clientWidth;
          canvasRef.current.height = parent.clientHeight;
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main Render Loop
  useEffect(() => {
    let animId: number;
    let tickCount = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      tickCount++;
      const width = canvas.width;
      const height = canvas.height;

      // Clear & Background Sky / Water / Desert
      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Environment Sky Gradient based on Time of Day
      let skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (timeOfDay === 'day') {
        skyGrad.addColorStop(0, '#0284c7');
        skyGrad.addColorStop(0.4, '#38bdf8');
        skyGrad.addColorStop(0.8, '#bae6fd');
        skyGrad.addColorStop(1, '#e0f2fe');
      } else if (timeOfDay === 'sunset') {
        skyGrad.addColorStop(0, '#4c0519');
        skyGrad.addColorStop(0.3, '#881337');
        skyGrad.addColorStop(0.6, '#b45309');
        skyGrad.addColorStop(0.85, '#f59e0b');
        skyGrad.addColorStop(1, '#fef08a');
      } else {
        // Night
        skyGrad.addColorStop(0, '#030712');
        skyGrad.addColorStop(0.5, '#0f172a');
        skyGrad.addColorStop(1, '#1e293b');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient Arabian Gulf Water Glow
      const waterGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.7,
        50,
        width / 2,
        height * 0.7,
        width * 0.8
      );
      if (timeOfDay === 'night') {
        waterGrad.addColorStop(0, '#0c4a6e');
        waterGrad.addColorStop(1, '#022c43');
      } else if (timeOfDay === 'sunset') {
        waterGrad.addColorStop(0, '#be185d');
        waterGrad.addColorStop(1, '#0e7490');
      } else {
        waterGrad.addColorStop(0, '#06b6d4');
        waterGrad.addColorStop(1, '#0284c7');
      }
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, height * 0.45, width, height * 0.55);

      // Apply Camera Transform
      ctx.save();
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.zoom, camera.zoom);

      // 1. Draw Island Base & Ground Mesh
      for (let y = 0; y < gridH; y++) {
        for (let x = 0; x < gridW; x++) {
          const iso = gridToIso(x, y);

          // Tile Base Color
          const isWaterEdge = x === 0 || y === 0 || x === gridW - 1 || y === gridH - 1;
          const isOasisArea = district === 'corniche' || district === 'masdar';

          let tileColor = '#eab308'; // Desert Dune Gold
          let tileStroke = '#ca8a04';

          if (isWaterEdge) {
            tileColor = timeOfDay === 'night' ? '#075985' : '#38bdf8';
            tileStroke = '#0284c7';
          } else if (isOasisArea && (x + y) % 3 === 0) {
            tileColor = '#d97706'; // Dune sand
            tileStroke = '#b45309';
          }

          // Diamond Isometric Tile
          ctx.beginPath();
          ctx.moveTo(iso.x, iso.y);
          ctx.lineTo(iso.x + tileWidth / 2, iso.y + tileHeight / 2);
          ctx.lineTo(iso.x, iso.y + tileHeight);
          ctx.lineTo(iso.x - tileWidth / 2, iso.y + tileHeight / 2);
          ctx.closePath();

          ctx.fillStyle = tileColor;
          ctx.fill();
          ctx.strokeStyle = tileStroke;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Highlight Hovered Tile
          if (hoveredTile && hoveredTile.x === x && hoveredTile.y === y) {
            ctx.fillStyle = selectedBuildingToPlace
              ? 'rgba(34, 197, 94, 0.4)'
              : 'rgba(56, 189, 248, 0.3)';
            ctx.fill();
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // Selected placed tile border
          if (
            selectedPlacedBuilding &&
            selectedPlacedBuilding.x === x &&
            selectedPlacedBuilding.y === y
          ) {
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 3;
            ctx.stroke();
          }
        }
      }

      // 2. Sort & Render Placed Buildings (Painter's Algorithm by (x + y))
      const sortedBuildings = [...placedBuildings].sort((a, b) => a.x + a.y - (b.x + b.y));

      sortedBuildings.forEach((pb) => {
        const def = BUILDINGS_CATALOG.find((b) => b.id === pb.buildingId);
        if (!def) return;
        const iso = gridToIso(pb.x, pb.y);

        ctx.save();
        ctx.translate(iso.x, iso.y + tileHeight / 2);

        // Render Custom Abu Dhabi Architectural Models
        renderAbuDhabiModel(ctx, def.renderModel, timeOfDay, tickCount, pb.level);

        // Level Stars badge
        if (pb.level > 1) {
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`★ Lv.${pb.level}`, 0, -55);
        }

        ctx.restore();
      });

      // 3. Render Ghost Building Preview under cursor
      if (selectedBuildingToPlace && hoveredTile) {
        const isOccupied = placedBuildings.some(
          (b) => b.x === hoveredTile.x && b.y === hoveredTile.y
        );
        const iso = gridToIso(hoveredTile.x, hoveredTile.y);

        ctx.save();
        ctx.translate(iso.x, iso.y + tileHeight / 2);
        ctx.globalAlpha = 0.65;
        renderAbuDhabiModel(ctx, selectedBuildingToPlace.renderModel, timeOfDay, tickCount, 1);

        if (isOccupied) {
          // Red warning cross
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-15, -15);
          ctx.lineTo(15, 15);
          ctx.moveTo(15, -15);
          ctx.lineTo(-15, 15);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.restore(); // Restore camera
      ctx.restore(); // Restore global

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    district,
    placedBuildings,
    selectedBuildingToPlace,
    hoveredTile,
    selectedPlacedBuilding,
    timeOfDay,
    camera,
    gridToIso,
    gridW,
    gridH,
  ]);

  // Custom Architectural Vector Drawers for Abu Dhabi Landmarks
  const renderAbuDhabiModel = (
    ctx: CanvasRenderingContext2D,
    model: string,
    time: string,
    tick: number,
    level: number
  ) => {
    switch (model) {
      case 'mosque': {
        // Sheikh Zayed Grand Mosque (White marble, 4 minarets, central dome, gold crescent)
        // Main prayer hall base
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-28, -32, 56, 32);
        ctx.strokeStyle = '#cbd5e1';
        ctx.strokeRect(-28, -32, 56, 32);

        // Reflective water pools
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-24, 0, 48, 6);

        // Main Grand Dome
        ctx.beginPath();
        ctx.arc(0, -32, 16, Math.PI, 0);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.stroke();

        // 2 Side Domes
        ctx.beginPath();
        ctx.arc(-16, -26, 9, Math.PI, 0);
        ctx.arc(16, -26, 9, Math.PI, 0);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Golden Minarets
        [-26, 26].forEach((mx) => {
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(mx - 2, -60, 5, 60);
          // Minaret gold spire
          ctx.beginPath();
          ctx.moveTo(mx + 0.5, -68);
          ctx.lineTo(mx - 2.5, -60);
          ctx.lineTo(mx + 3.5, -60);
          ctx.closePath();
          ctx.fillStyle = '#fbbf24';
          ctx.fill();
        });

        // Golden Crescent on central dome
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, -50, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'louvre': {
        // Louvre Abu Dhabi floating geometric rain-of-light dome
        // Sea pedestal
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(-24, -6, 48, 10);

        // Building blocks underneath
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-18, -20, 36, 16);

        // Iconic Geometric Lattice Dome
        ctx.beginPath();
        ctx.ellipse(0, -22, 34, 18, 0, 0, Math.PI * 2);
        const domeGrad = ctx.createLinearGradient(-34, -22, 34, -22);
        domeGrad.addColorStop(0, '#94a3b8');
        domeGrad.addColorStop(0.5, '#e2e8f0');
        domeGrad.addColorStop(1, '#64748b');
        ctx.fillStyle = domeGrad;
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Starlight / Rain of light laser perforations
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        for (let i = -20; i <= 20; i += 8) {
          ctx.moveTo(i, -30);
          ctx.lineTo(i + 4, -14);
        }
        ctx.stroke();
        break;
      }

      case 'tower':
      case 'skyscraper': {
        // Etihad Towers & Abu Dhabi Corporate Towers
        const height = 48 + level * 12;
        // Tower glass gradient
        const towerGrad = ctx.createLinearGradient(-14, -height, 14, 0);
        towerGrad.addColorStop(0, '#38bdf8');
        towerGrad.addColorStop(0.5, '#0284c7');
        towerGrad.addColorStop(1, '#0f172a');

        ctx.fillStyle = towerGrad;
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(-10, -height);
        ctx.lineTo(0, -height - 12);
        ctx.lineTo(10, -height);
        ctx.lineTo(12, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#e0f2fe';
        ctx.stroke();

        // Glass window horizontal bands
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        for (let y = -8; y > -height; y -= 8) {
          ctx.beginPath();
          ctx.moveTo(-10, y);
          ctx.lineTo(10, y);
          ctx.stroke();
        }

        // Night time luxury office lights
        if (time === 'night') {
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(-6, -height + 15, 4, 4);
          ctx.fillRect(2, -height + 25, 4, 4);
          ctx.fillRect(-4, -height + 35, 4, 4);
        }
        break;
      }

      case 'circuit': {
        // Yas Marina Circuit (Curving asphalt race track, LED Viceroy canopy)
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.ellipse(0, -6, 26, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Red and white curbs
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner grass/island
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.ellipse(0, -6, 14, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Racing car moving along track
        const angle = (tick * 0.08) % (Math.PI * 2);
        const carX = Math.cos(angle) * 20;
        const carY = -6 + Math.sin(angle) * 11;
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(carX - 2, carY - 2, 5, 3);
        break;
      }

      case 'solar': {
        // Masdar Clean PV Bifacial Solar Panels
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-18, -16, 36, 16);

        // Solar blue cells
        ctx.fillStyle = '#0284c7';
        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < 3; c++) {
            ctx.fillRect(-16 + c * 11, -14 + r * 7, 9, 5);
          }
        }

        // Clean energy green glow pulsing
        const glow = (Math.sin(tick * 0.1) + 1) / 2;
        ctx.strokeStyle = `rgba(52, 211, 153, ${0.4 + glow * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-18, -16, 36, 16);
        break;
      }

      case 'mangrove': {
        // Jubail Mangrove Natural Sanctuary
        ctx.fillStyle = '#0284c7'; // Tidal stream
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mangrove foliage cluster
        [-8, 4, -2].forEach((tx, idx) => {
          ctx.fillStyle = idx % 2 === 0 ? '#059669' : '#10b981';
          ctx.beginPath();
          ctx.arc(tx, -14 - idx * 4, 8, 0, Math.PI * 2);
          ctx.fill();

          // Tree trunk
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(tx, -10);
          ctx.lineTo(tx, -2);
          ctx.stroke();
        });
        break;
      }

      case 'oasis': {
        // Liwa Date Palms and Falaj irrigation channel
        // Blue falaj waterway
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-18, -3, 36, 5);

        // 2 Tall Date Palms
        [-8, 8].forEach((px) => {
          // Curved palm trunk
          ctx.strokeStyle = '#92400e';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(px, 0);
          ctx.quadraticCurveTo(px + 4, -14, px + 2, -26);
          ctx.stroke();

          // Palm fronds
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 2;
          for (let a = 0; a < 6; a++) {
            const rad = (a * Math.PI) / 3;
            ctx.beginPath();
            ctx.moveTo(px + 2, -26);
            ctx.lineTo(px + 2 + Math.cos(rad) * 11, -26 + Math.sin(rad) * 8);
            ctx.stroke();
          }
        });
        break;
      }

      case 'villa': {
        // Saadiyat Beachfront Villa (Arabian contemporary white & terracotta)
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-14, -14, 28, 14);

        // Terracotta roof
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.moveTo(-16, -14);
        ctx.lineTo(0, -24);
        ctx.lineTo(16, -14);
        ctx.closePath();
        ctx.fill();

        // Private plunge pool
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-10, 1, 10, 5);
        break;
      }

      case 'adgm': {
        // ADGM Financial Cube / Diamond structure
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-16, -28, 32, 28);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-16, -28, 32, 28);

        // Diamond emblem
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.lineTo(6, -14);
        ctx.lineTo(0, -6);
        ctx.lineTo(-6, -14);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'desal': {
        // Reverse Osmosis Desalination Hub
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-18, -18, 36, 18);
        // Twin cylindrical blue tanks
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(-8, -18, 6, 0, Math.PI * 2);
        ctx.arc(8, -18, 6, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'road': {
        // Asphalt Highway with street line
        ctx.fillStyle = '#334155';
        ctx.fillRect(-12, -4, 24, 8);
        ctx.strokeStyle = '#fef08a';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      }

      default: {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-10, -20, 20, 20);
      }
    }
  };

  // Mouse / Touch handlers for panning, zooming, placing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      camX: camera.x,
      camY: camera.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    if (isDragging) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setCamera((prev) => ({
        ...prev,
        x: dragStart.current.camX + dx,
        y: dragStart.current.camY + dy,
      }));
    } else {
      const { gx, gy } = screenToGrid(sx, sy);
      if (gx >= 0 && gx < gridW && gy >= 0 && gy < gridH) {
        setHoveredTile({ x: gx, y: gy });
      } else {
        setHoveredTile(null);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const dragDistance = Math.hypot(
      e.clientX - dragStart.current.x,
      e.clientY - dragStart.current.y
    );
    setIsDragging(false);

    // If click (not dragged)
    if (dragDistance < 6 && hoveredTile) {
      const existing = placedBuildings.find(
        (b) => b.x === hoveredTile.x && b.y === hoveredTile.y
      );

      if (selectedBuildingToPlace) {
        if (!existing) {
          onPlaceBuilding(hoveredTile.x, hoveredTile.y);
          soundSynth.playBuild();
        }
      } else {
        onSelectPlacedBuilding(existing || null);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setCamera((prev) => ({
      ...prev,
      zoom: Math.min(Math.max(prev.zoom * zoomFactor, 0.4), 2.2),
    }));
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden touch-none">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-crosshair"
      />

      {/* Floating Canvas Controls (Reset Camera, Zoom In, Zoom Out) */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={() =>
            setCamera((prev) => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 2.2) }))
          }
          className="w-10 h-10 bg-slate-900/80 backdrop-blur border border-amber-500/40 text-amber-400 rounded-lg flex items-center justify-center font-bold text-lg hover:bg-slate-800 shadow-lg active:scale-95 transition"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() =>
            setCamera((prev) => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.4) }))
          }
          className="w-10 h-10 bg-slate-900/80 backdrop-blur border border-amber-500/40 text-amber-400 rounded-lg flex items-center justify-center font-bold text-lg hover:bg-slate-800 shadow-lg active:scale-95 transition"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={() => {
            if (canvasRef.current) {
              const rect = canvasRef.current.getBoundingClientRect();
              setCamera({ x: rect.width / 2, y: rect.height / 3, zoom: 1 });
            }
          }}
          className="w-10 h-10 bg-slate-900/80 backdrop-blur border border-amber-500/40 text-amber-400 rounded-lg flex items-center justify-center text-xs hover:bg-slate-800 shadow-lg active:scale-95 transition"
          title="Reset Camera"
        >
          🎯
        </button>
      </div>

      {/* District Watermark */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <span className="text-xs uppercase tracking-widest text-amber-400/70 font-semibold">
          Abu Dhabi Smart City Grid
        </span>
        <h2 className="text-xl font-bold text-white drop-shadow-md">
          {districtInfo.name}
        </h2>
        <span className="text-xs text-amber-300/80 block font-arabic font-medium">
          {districtInfo.nameAr}
        </span>
      </div>
    </div>
  );
};
