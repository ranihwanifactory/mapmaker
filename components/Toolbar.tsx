import React from 'react';
import { MousePointer2, Route } from 'lucide-react';
import { ToolMode, POIType } from '../types';
import { POI_CONFIG } from '../constants';

interface ToolbarProps {
  currentMode: ToolMode;
  setMode: (mode: ToolMode) => void;
  currentPOIType: POIType;
  setPOIType: (type: POIType) => void;
}

// Map types to Emojis
const EMOJI_MAP: Record<POIType, string> = {
  [POIType.HOUSE]: '🏠',
  [POIType.APARTMENT]: '🏢',
  [POIType.SHOP]: '🏪',
  [POIType.PARK]: '🌳',
  [POIType.SCHOOL]: '🏫',
  [POIType.HOSPITAL]: '🏥',
  [POIType.LANDMARK]: '🗼',
};

// Colors for selection highlight
const COLOR_MAP: Record<POIType, string> = {
  [POIType.HOUSE]: 'bg-orange-100 border-orange-300',
  [POIType.APARTMENT]: 'bg-blue-100 border-blue-300',
  [POIType.SHOP]: 'bg-amber-100 border-amber-300',
  [POIType.PARK]: 'bg-green-100 border-green-300',
  [POIType.SCHOOL]: 'bg-yellow-100 border-yellow-300',
  [POIType.HOSPITAL]: 'bg-red-100 border-red-300',
  [POIType.LANDMARK]: 'bg-purple-100 border-purple-300',
};

const Toolbar: React.FC<ToolbarProps> = ({ currentMode, setMode, currentPOIType, setPOIType }) => {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl p-3 flex items-center gap-2 z-10 border border-white/50">
      
      {/* Select Tool */}
      <button
        onClick={() => setMode(ToolMode.SELECT)}
        className={`p-3 rounded-2xl transition-all duration-200 flex flex-col items-center justify-center w-14 h-14 ${currentMode === ToolMode.SELECT ? 'bg-indigo-500 text-white shadow-indigo-200 shadow-lg scale-110' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
        title="선택 및 이동"
      >
        <MousePointer2 size={24} />
      </button>

      <div className="w-px h-10 bg-gray-200 mx-2"></div>

      {/* POI Tools */}
      <div className="flex gap-2">
        {Object.values(POIType).map((type) => {
          const config = POI_CONFIG[type];
          const Emoji = EMOJI_MAP[type];
          const isActive = currentMode === ToolMode.ADD_POI && currentPOIType === type;
          const colorClass = COLOR_MAP[type];

          return (
            <button
              key={type}
              onClick={() => {
                setMode(ToolMode.ADD_POI);
                setPOIType(type);
              }}
              className={`w-12 h-12 rounded-2xl transition-all duration-200 relative group flex items-center justify-center text-2xl border-2 ${
                isActive 
                  ? `${colorClass} shadow-md scale-110 -translate-y-1` 
                  : 'border-transparent hover:bg-gray-100 hover:scale-105 grayscale hover:grayscale-0 opacity-70 hover:opacity-100'
              }`}
            >
              <span role="img" aria-label={config.label}>{Emoji}</span>
              
              {/* Tooltip */}
              <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                {config.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="w-px h-10 bg-gray-200 mx-2"></div>

      {/* Connection Tool */}
      <button
        onClick={() => setMode(ToolMode.CONNECT)}
        className={`p-3 rounded-2xl transition-all duration-200 flex flex-col items-center justify-center w-14 h-14 ${currentMode === ToolMode.CONNECT ? 'bg-slate-700 text-white shadow-slate-300 shadow-lg scale-110' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
        title="도로 건설 (두 지점 클릭)"
      >
        <Route size={24} />
      </button>

    </div>
  );
};

export default Toolbar;