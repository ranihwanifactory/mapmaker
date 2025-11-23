import React, { useState, useEffect, useRef } from 'react';
import MapCanvas from './components/MapCanvas';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import { MapData, ToolMode, POIType, POI, Path, Viewport } from './types';
import { INITIAL_MAP_NAME, DEFAULT_VIEWPORT, POI_CONFIG } from './constants';

// Simple ID generator replacement
const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  // --- State ---
  const [mapData, setMapData] = useState<MapData>({
    name: INITIAL_MAP_NAME,
    pois: [],
    paths: []
  });

  const [viewport, setViewport] = useState<Viewport>(DEFAULT_VIEWPORT);
  const [mode, setMode] = useState<ToolMode>(ToolMode.SELECT);
  const [currentPOIType, setCurrentPOIType] = useState<POIType>(POIType.HOUSE);
  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Reference for screenshot
  const svgRef = useRef<SVGSVGElement>(null);

  // --- Handlers ---

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddPOI = (x: number, y: number) => {
    const config = POI_CONFIG[currentPOIType];
    const newPOI: POI = {
      id: generateId(),
      x,
      y,
      type: currentPOIType,
      name: `${config.label} ${mapData.pois.filter(p => p.type === currentPOIType).length + 1}`,
      description: '새로운 장소입니다.',
    };
    
    setMapData(prev => ({
      ...prev,
      pois: [...prev.pois, newPOI]
    }));

    // Auto-select newly created POI to encourage editing
    setSelectedPOIId(newPOI.id);
    setMode(ToolMode.SELECT);
  };

  const handleSelectPOI = (id: string | null) => {
    setSelectedPOIId(id);
  };

  const handleMovePOI = (id: string, x: number, y: number) => {
    setMapData(prev => ({
      ...prev,
      pois: prev.pois.map(p => p.id === id ? { ...p, x, y } : p)
    }));
  };

  const handleConnect = (fromId: string, toId: string) => {
    // Check if connection already exists
    const exists = mapData.paths.some(
        p => (p.fromId === fromId && p.toId === toId) || (p.fromId === toId && p.toId === fromId)
    );

    if (!exists) {
        const newPath: Path = {
            id: generateId(),
            fromId,
            toId
        };
        setMapData(prev => ({
            ...prev,
            paths: [...prev.paths, newPath]
        }));
    }
  };

  const handleUpdatePOI = (updated: POI) => {
    setMapData(prev => ({
      ...prev,
      pois: prev.pois.map(p => p.id === updated.id ? updated : p)
    }));
  };

  const handleDeletePOI = (id: string) => {
    // Direct delete without confirmation to avoid sandbox issues
    setMapData(prev => ({
        ...prev,
        pois: prev.pois.filter(p => p.id !== id),
        paths: prev.paths.filter(path => path.fromId !== id && path.toId !== id)
    }));
    setSelectedPOIId(null);
    showToast("건물이 철거되었습니다.");
  };

  const handleAddSuggestedPOI = (poiData: { name: string; type: POIType; description: string }) => {
    // Random position within current viewport
    const range = 400; 
    const x = (Math.random() - 0.5) * range;
    const y = (Math.random() - 0.5) * range;

    const newPOI: POI = {
        id: generateId(),
        x,
        y,
        type: poiData.type,
        name: poiData.name,
        description: poiData.description
    };

    setMapData(prev => ({
        ...prev,
        pois: [...prev.pois, newPOI]
    }));
  };

  const handleSaveImage = () => {
    if (!svgRef.current) return;

    // Serialize SVG
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Set SVG size
    const svgSize = svgRef.current.getBoundingClientRect();
    canvas.width = svgSize.width * 2; // High res
    canvas.height = svgSize.height * 2;

    img.onload = () => {
        if (!ctx) return;
        // Draw white background
        ctx.fillStyle = "#ecfdf5"; // Match background color
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw SVG
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Download
        const link = document.createElement("a");
        link.download = `my-town-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        showToast("지도가 이미지로 저장되었습니다.");
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleShare = async () => {
    // Simulate sharing by copying summary to clipboard
    const buildingCounts = mapData.pois.reduce((acc, poi) => {
        acc[poi.type] = (acc[poi.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    let summary = `🏠 ${mapData.name}에 놀러오세요!\n\n`;
    summary += `이곳에는 ${mapData.pois.length}개의 건물과 ${mapData.paths.length}개의 도로가 있습니다.\n`;
    
    // Add top 3 interesting descriptions
    const interestingPOIs = mapData.pois.filter(p => p.description && p.description.length > 10).slice(0, 3);
    if (interestingPOIs.length > 0) {
        summary += "\n✨ 주요 명소:\n";
        interestingPOIs.forEach(p => {
            summary += `- ${p.name}: ${p.description}\n`;
        });
    }

    try {
        if (navigator.share) {
            await navigator.share({
                title: mapData.name,
                text: summary,
                // url: window.location.href // If we had routing
            });
        } else {
            await navigator.clipboard.writeText(summary);
            showToast("동네 소개가 클립보드에 복사되었습니다!");
        }
    } catch (err) {
        console.error("Share failed:", err);
        showToast("공유하기에 실패했습니다.");
    }
  };

  // Center viewport on mount
  useEffect(() => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    setViewport({ x: cx, y: cy, scale: 1 });
  }, []);

  const selectedPOI = mapData.pois.find(p => p.id === selectedPOIId) || null;

  return (
    <div className="w-screen h-screen bg-slate-50 relative overflow-hidden bg-grid-pattern">
      
      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-gray-800/90 text-white px-6 py-3 rounded-full shadow-xl text-sm font-medium z-50 animate-in fade-in slide-in-from-top-4 transition-all">
          {notification}
        </div>
      )}

      {/* Map Canvas */}
      <MapCanvas
        ref={svgRef}
        mapData={mapData}
        viewport={viewport}
        setViewport={setViewport}
        mode={mode}
        onAddPOI={handleAddPOI}
        onSelectPOI={handleSelectPOI}
        onMovePOI={handleMovePOI}
        onConnect={handleConnect}
        selectedPOIId={selectedPOIId}
      />

      {/* Floating UI Layers */}
      <Toolbar
        currentMode={mode}
        setMode={setMode}
        currentPOIType={currentPOIType}
        setPOIType={setCurrentPOIType}
      />

      <Sidebar
        selectedPOI={selectedPOI}
        onUpdatePOI={handleUpdatePOI}
        onClose={() => setSelectedPOIId(null)}
        onAddSuggestedPOI={handleAddSuggestedPOI}
        onDeletePOI={handleDeletePOI}
        onSaveImage={handleSaveImage}
        onShare={handleShare}
      />

      {/* Footer Info */}
      <div className="absolute bottom-4 left-4 text-gray-400 text-sm pointer-events-none select-none">
         {mapData.pois.length}개의 장소 • {mapData.paths.length}개의 길
      </div>
    </div>
  );
};

export default App;