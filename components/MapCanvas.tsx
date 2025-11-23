import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { MapData, ToolMode, POIType, Viewport } from '../types';

interface MapCanvasProps {
  mapData: MapData;
  viewport: Viewport;
  setViewport: (v: Viewport) => void;
  mode: ToolMode;
  onAddPOI: (x: number, y: number) => void;
  onSelectPOI: (id: string | null) => void;
  onMovePOI: (id: string, x: number, y: number) => void;
  onConnect: (fromId: string, toId: string) => void;
  selectedPOIId: string | null;
}

// --- Custom Visual Components (Cute/Pixel Style) ---

const VisualHouse = () => (
  <g transform="translate(-24, -40)">
    {/* Shadow */}
    <ellipse cx="24" cy="40" rx="20" ry="8" fill="black" opacity="0.15" />
    {/* Chimney */}
    <rect x="32" y="5" width="8" height="15" fill="#78350f" />
    {/* Roof */}
    <path d="M4 20 L24 2 L44 20" fill="#ef4444" stroke="#b91c1c" strokeWidth="3" strokeLinejoin="round" />
    <path d="M4 20 L24 2 L44 20 Z" fill="#ef4444" />
    {/* Body */}
    <rect x="8" y="20" width="32" height="20" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
    {/* Door */}
    <rect x="20" y="28" width="8" height="12" fill="#92400e" rx="1" />
    <circle cx="26" cy="34" r="1" fill="#fbbf24" />
    {/* Window */}
    <rect x="12" y="25" width="6" height="6" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="1" />
  </g>
);

const VisualApartment = () => (
  <g transform="translate(-20, -60)">
    {/* Shadow */}
    <ellipse cx="20" cy="60" rx="24" ry="10" fill="black" opacity="0.15" />
    {/* Main Building */}
    <rect x="4" y="0" width="32" height="60" rx="2" fill="#60a5fa" stroke="#1e40af" strokeWidth="2" />
    {/* Side shading */}
    <rect x="30" y="2" width="4" height="56" fill="#2563eb" opacity="0.5" />
    {/* Windows */}
    <g fill="#e0f2fe" stroke="#93c5fd" strokeWidth="1">
      {[0, 15, 30, 45].map(y => (
        <React.Fragment key={y}>
          <rect x="8" y={y + 5} width="8" height="8" rx="1" />
          <rect x="20" y={y + 5} width="8" height="8" rx="1" />
        </React.Fragment>
      ))}
    </g>
    {/* Roof structure */}
    <rect x="8" y="-4" width="24" height="4" fill="#1e3a8a" />
    <line x1="15" y1="-4" x2="15" y2="-8" stroke="#ef4444" strokeWidth="1" />
    <circle cx="15" cy="-8" r="1.5" fill="red" />
  </g>
);

const VisualShop = () => (
  <g transform="translate(-28, -35)">
    {/* Shadow */}
    <ellipse cx="28" cy="35" rx="24" ry="8" fill="black" opacity="0.15" />
    {/* Building */}
    <rect x="4" y="10" width="48" height="25" fill="#fed7aa" stroke="#ea580c" strokeWidth="2" />
    {/* Door */}
    <rect x="24" y="18" width="10" height="17" fill="#78350f" />
    {/* Large Window */}
    <rect x="8" y="18" width="12" height="12" fill="#bae6fd" stroke="#0ea5e9" strokeWidth="1" />
    {/* Goods in window */}
    <circle cx="14" cy="24" r="2" fill="#fbbf24" />
    <rect x="10" y="26" width="8" height="2" fill="#7dd3fc" />
    {/* Awning */}
    <path d="M2 10 L54 10 L50 2 L6 2 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
    <path d="M6 2 L12 10 M18 2 L24 10 M30 2 L36 10 M42 2 L48 10" stroke="white" strokeWidth="3" opacity="0.7" />
    {/* Sign */}
    <rect x="38" y="15" width="10" height="8" fill="white" stroke="#ea580c" strokeWidth="1" />
    <text x="43" y="21" fontSize="6" textAnchor="middle" fill="#ea580c" fontWeight="bold">SALE</text>
  </g>
);

const VisualPark = () => (
  <g transform="translate(-30, -30)">
    {/* Pond */}
    <path d="M10 25 Q5 25 5 20 Q5 10 20 12 Q30 5 40 15 Q50 15 50 25 Q50 35 30 35 Q15 35 10 25" fill="#7dd3fc" stroke="#0ea5e9" strokeWidth="2" />
    {/* Tree 1 */}
    <g transform="translate(10, 5)">
      <rect x="3" y="15" width="4" height="10" fill="#78350f" />
      <circle cx="5" cy="10" r="10" fill="#4ade80" stroke="#16a34a" strokeWidth="2" />
      <circle cx="3" cy="7" r="2" fill="#bbf7d0" opacity="0.5" />
    </g>
    {/* Tree 2 */}
    <g transform="translate(40, 10)">
      <rect x="3" y="12" width="4" height="8" fill="#78350f" />
      <circle cx="5" cy="8" r="8" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
    </g>
  </g>
);

const VisualSchool = () => (
  <g transform="translate(-35, -45)">
    {/* Shadow */}
    <ellipse cx="35" cy="45" rx="30" ry="10" fill="black" opacity="0.15" />
    {/* Wings */}
    <rect x="0" y="20" width="70" height="25" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
    {/* Center Tower */}
    <rect x="25" y="5" width="20" height="40" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
    {/* Roofs */}
    <path d="M0 20 L10 10 L70 20 Z" fill="#a16207" />
    <path d="M22 5 L35 -5 L48 5 Z" fill="#854d0e" stroke="#713f12" strokeWidth="2" />
    {/* Clock */}
    <circle cx="35" cy="12" r="5" fill="white" stroke="#ca8a04" strokeWidth="1" />
    <path d="M35 12 L35 9 M35 12 L37 13" stroke="black" strokeWidth="1" strokeLinecap="round" />
    {/* Flag */}
    <line x1="35" y1="-5" x2="35" y2="-12" stroke="black" strokeWidth="1" />
    <path d="M35 -12 L45 -9 L35 -6 Z" fill="#ef4444" />
    {/* Door */}
    <path d="M30 45 L30 35 Q35 30 40 35 L40 45 Z" fill="#713f12" />
  </g>
);

const VisualHospital = () => (
  <g transform="translate(-30, -50)">
    {/* Shadow */}
    <ellipse cx="30" cy="50" rx="25" ry="10" fill="black" opacity="0.15" />
    {/* Main Block */}
    <rect x="10" y="10" width="40" height="40" rx="2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
    {/* Side Wing */}
    <rect x="0" y="25" width="15" height="25" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
    {/* Side Wing 2 */}
    <rect x="45" y="25" width="15" height="25" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
    {/* Cross Sign Circle */}
    <circle cx="30" cy="25" r="8" fill="white" stroke="#ef4444" strokeWidth="2" />
    {/* Red Cross */}
    <rect x="28" y="21" width="4" height="8" fill="#ef4444" />
    <rect x="26" y="23" width="8" height="4" fill="#ef4444" />
    {/* Windows */}
    <rect x="14" y="38" width="6" height="6" fill="#bfdbfe" />
    <rect x="40" y="38" width="6" height="6" fill="#bfdbfe" />
  </g>
);

const VisualLandmark = () => (
  <g transform="translate(-25, -60)">
    {/* Shadow */}
    <ellipse cx="25" cy="60" rx="20" ry="8" fill="black" opacity="0.15" />
    {/* Base */}
    <path d="M10 60 L15 30 L35 30 L40 60 Z" fill="#c084fc" stroke="#7e22ce" strokeWidth="2" />
    {/* Mid section */}
    <rect x="18" y="15" width="14" height="15" fill="#a855f7" stroke="#7e22ce" strokeWidth="2" />
    {/* Top cone */}
    <path d="M15 15 L25 -5 L35 15 Z" fill="#7e22ce" stroke="#581c87" strokeWidth="2" />
    {/* Flag/Star */}
    <circle cx="25" cy="-5" r="3" fill="#fbbf24" className="animate-pulse" />
    <g transform="translate(25, -5)">
         <path d="M0 -15 L3 -5 L-3 -5 Z" fill="#fbbf24" transform="rotate(45)" />
         <path d="M0 -15 L3 -5 L-3 -5 Z" fill="#fbbf24" transform="rotate(135)" />
         <path d="M0 -15 L3 -5 L-3 -5 Z" fill="#fbbf24" transform="rotate(225)" />
         <path d="M0 -15 L3 -5 L-3 -5 Z" fill="#fbbf24" transform="rotate(315)" />
    </g>
  </g>
);

const renderVisual = (type: POIType) => {
  switch (type) {
    case POIType.HOUSE: return <VisualHouse />;
    case POIType.APARTMENT: return <VisualApartment />;
    case POIType.SHOP: return <VisualShop />;
    case POIType.PARK: return <VisualPark />;
    case POIType.SCHOOL: return <VisualSchool />;
    case POIType.HOSPITAL: return <VisualHospital />;
    case POIType.LANDMARK: return <VisualLandmark />;
    default: return <VisualHouse />;
  }
};

const MapCanvas = forwardRef<SVGSVGElement, MapCanvasProps>(({
  mapData,
  viewport,
  setViewport,
  mode,
  onAddPOI,
  onSelectPOI,
  onMovePOI,
  onConnect,
  selectedPOIId,
}, ref) => {
  // We use internal ref for internal logic, but also want to expose it
  const internalRef = useRef<SVGSVGElement>(null);
  
  // Combine refs
  useImperativeHandle(ref, () => internalRef.current!);

  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingPOI, setDraggingPOI] = useState<string | null>(null);
  const [connectStartId, setConnectStartId] = useState<string | null>(null);

  const getSVGPoint = (clientX: number, clientY: number) => {
    if (!internalRef.current) return { x: 0, y: 0 };
    const CTM = internalRef.current.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };
    return {
      x: (clientX - CTM.e) / CTM.a,
      y: (clientY - CTM.f) / CTM.d,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode === ToolMode.SELECT && e.button === 0 && !draggingPOI) {
        setIsDraggingCanvas(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setViewport({ ...viewport, x: viewport.x + dx, y: viewport.y + dy });
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (draggingPOI) {
        const pt = getSVGPoint(e.clientX, e.clientY);
        const mapX = (pt.x - viewport.x) / viewport.scale;
        const mapY = (pt.y - viewport.y) / viewport.scale;
        onMovePOI(draggingPOI, mapX, mapY);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggingPOI(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.max(0.2, Math.min(3, viewport.scale + scaleAmount));
    setViewport({ ...viewport, scale: newScale });
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (isDraggingCanvas) return; 
    
    if (mode === ToolMode.ADD_POI) {
        const pt = getSVGPoint(e.clientX, e.clientY);
        const mapX = (pt.x - viewport.x) / viewport.scale;
        const mapY = (pt.y - viewport.y) / viewport.scale;
        onAddPOI(mapX, mapY);
    } else if (mode === ToolMode.SELECT) {
        onSelectPOI(null);
        setConnectStartId(null);
    }
  };

  const handlePOIClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    if (mode === ToolMode.SELECT) {
        onSelectPOI(id);
    } else if (mode === ToolMode.CONNECT) {
        if (connectStartId === null) {
            setConnectStartId(id);
        } else {
            if (connectStartId !== id) {
                onConnect(connectStartId, id);
            }
            setConnectStartId(null);
        }
    }
  };

  const handlePOIMouseDown = (e: React.MouseEvent, id: string) => {
      if (mode === ToolMode.SELECT) {
          e.stopPropagation();
          setDraggingPOI(id);
          onSelectPOI(id);
      }
  }

  return (
    <svg
      ref={internalRef}
      className={`w-full h-full bg-[#ecfdf5] ${mode === ToolMode.SELECT ? (isDraggingCanvas ? 'cursor-grabbing' : 'cursor-default') : 'cursor-crosshair'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleBackgroundClick}
    >
       {/* Grass Pattern Background Hint */}
       <defs>
        <pattern id="grass" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#d1fae5" />
            <circle cx="22" cy="22" r="1" fill="#d1fae5" />
        </pattern>
       </defs>
       <rect x="0" y="0" width="100%" height="100%" fill="url(#grass)" />

      <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.scale})`}>
        {/* Render Roads (Bottom Layer) - Improved visual */}
        {mapData.paths.map((path) => {
            const from = mapData.pois.find(p => p.id === path.fromId);
            const to = mapData.pois.find(p => p.id === path.toId);
            if (!from || !to) return null;

            return (
                <g key={path.id}>
                  {/* Road Border (Curb) */}
                  <line
                      x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke="#334155" strokeWidth="26" strokeLinecap="round"
                  />
                  {/* Asphalt */}
                  <line
                      x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke="#475569" strokeWidth="22" strokeLinecap="round"
                  />
                  {/* Yellow Center Line */}
                  <line
                      x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke="#fbbf24" strokeWidth="2" strokeDasharray="10,12" strokeLinecap="round"
                  />
                </g>
            );
        })}

        {/* Connection Preview */}
        {connectStartId && mode === ToolMode.CONNECT && (
           <circle 
             cx={mapData.pois.find(p => p.id === connectStartId)?.x} 
             cy={mapData.pois.find(p => p.id === connectStartId)?.y} 
             r="40" 
             fill="none" 
             stroke="#fbbf24" 
             strokeWidth="3" 
             strokeDasharray="5,5" 
             className="animate-spin-slow"
           />
        )}

        {/* Render Buildings (Top Layer) */}
        {mapData.pois.map((poi) => {
            const isSelected = selectedPOIId === poi.id;

            return (
                <g
                    key={poi.id}
                    transform={`translate(${poi.x}, ${poi.y})`}
                    onClick={(e) => handlePOIClick(e, poi.id)}
                    onMouseDown={(e) => handlePOIMouseDown(e, poi.id)}
                    className="cursor-pointer transition-all duration-200 ease-out hover:brightness-110"
                    style={{ 
                        transformOrigin: 'center bottom',
                        filter: isSelected ? 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.6))' : 'none'
                    }}
                >
                    {/* Selection Indicator */}
                    {isSelected && (
                         <path d="M-10 -70 L0 -60 L10 -70" stroke="#4f46e5" strokeWidth="3" fill="none" className="animate-bounce" />
                    )}
                    
                    {/* Building Visual */}
                    {renderVisual(poi.type)}

                    {/* Label */}
                    <g transform="translate(0, 15)">
                       <rect x="-40" y="0" width="80" height="20" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1" opacity="0.9" />
                       <text y="14" textAnchor="middle" className="text-[11px] font-bold fill-slate-700 select-none" style={{ fontFamily: 'Noto Sans KR' }}>
                         {poi.name.length > 8 ? poi.name.substring(0,7) + '..' : poi.name}
                       </text>
                    </g>
                </g>
            );
        })}
      </g>
    </svg>
  );
});

MapCanvas.displayName = 'MapCanvas';

export default MapCanvas;