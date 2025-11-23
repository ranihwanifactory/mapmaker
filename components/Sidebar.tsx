import React, { useState } from 'react';
import { POI, POIType } from '../types';
import { POI_CONFIG } from '../constants';
import { X, Sparkles, Map, Loader2, Trash2, Download, Share2 } from 'lucide-react';
import { generatePlaceDescription, suggestNeighborhoodPlaces } from '../services/geminiService';

interface SidebarProps {
  selectedPOI: POI | null;
  onUpdatePOI: (updated: POI) => void;
  onClose: () => void;
  onAddSuggestedPOI: (poiData: { name: string; type: POIType; description: string }) => void;
  onDeletePOI: (id: string) => void;
  onSaveImage: () => void;
  onShare: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  selectedPOI, 
  onUpdatePOI, 
  onClose, 
  onAddSuggestedPOI,
  onDeletePOI,
  onSaveImage,
  onShare
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestionTheme, setSuggestionTheme] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleMagicDescription = async () => {
    if (!selectedPOI) return;
    setIsGenerating(true);
    const newDesc = await generatePlaceDescription(selectedPOI.name, POI_CONFIG[selectedPOI.type].label, selectedPOI.description);
    onUpdatePOI({ ...selectedPOI, description: newDesc });
    setIsGenerating(false);
  };

  const handleSuggestion = async () => {
    if (!suggestionTheme.trim()) return;
    setIsSuggesting(true);
    const suggestions = await suggestNeighborhoodPlaces(suggestionTheme);
    
    // Add suggestions with a small delay for effect
    let count = 0;
    for (const s of suggestions) {
      setTimeout(() => {
        onAddSuggestedPOI(s);
      }, count * 300);
      count++;
    }
    
    setIsSuggesting(false);
    setSuggestionTheme('');
  };

  return (
    <div className="absolute top-4 right-4 w-80 bg-white/95 backdrop-blur shadow-2xl rounded-2xl p-6 flex flex-col gap-6 border border-gray-100 max-h-[calc(100vh-2rem)] overflow-y-auto z-20 transition-all">
      
      {/* Header / Close */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          {selectedPOI ? '장소 편집' : '동네 도우미'}
        </h2>
        {selectedPOI && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        )}
      </div>

      {selectedPOI ? (
        // EDIT MODE
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">이름</label>
            <input
              type="text"
              value={selectedPOI.name}
              onChange={(e) => onUpdatePOI({ ...selectedPOI, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="장소 이름 입력"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">유형</label>
            <select
              value={selectedPOI.type}
              onChange={(e) => onUpdatePOI({ ...selectedPOI, type: e.target.value as POIType })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {Object.keys(POI_CONFIG).map((t) => (
                <option key={t} value={t}>{POI_CONFIG[t as POIType].label}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase">설명</label>
              <button
                onClick={handleMagicDescription}
                disabled={isGenerating || !selectedPOI.name}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                AI 생성
              </button>
            </div>
            <textarea
              value={selectedPOI.description}
              onChange={(e) => onUpdatePOI({ ...selectedPOI, description: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-600 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
              placeholder="이 장소에 대한 설명..."
            />
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
             {React.createElement(POI_CONFIG[selectedPOI.type].icon, { className: "text-gray-400 mt-1", size: 20 })}
             <div>
                <p className="text-xs text-gray-500">팁</p>
                <p className="text-sm text-gray-600">
                  이름을 구체적으로 적고 AI 생성 버튼을 누르면 더 멋진 설명이 나옵니다.
                </p>
             </div>
          </div>

          {/* Delete Button */}
          <button 
            onClick={() => onDeletePOI(selectedPOI.id)}
            className="mt-2 w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm"
          >
            <Trash2 size={16} />
            이 건물 철거하기
          </button>
        </div>
      ) : (
        // ASSISTANT MODE (No selection)
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-center py-6">
            <Map size={48} className="mx-auto text-indigo-200 mb-3" />
            <p className="text-gray-500 text-sm">
              지도에서 장소를 선택하여 편집하거나,<br />
              아래에서 AI에게 장소 추천을 받아보세요.
            </p>
          </div>

          {/* Global Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={onSaveImage}
                className="flex flex-col items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-3 rounded-xl transition-colors"
            >
                <Download size={20} />
                <span className="text-xs font-semibold">지도 저장</span>
            </button>
            <button 
                onClick={onShare}
                className="flex flex-col items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-3 rounded-xl transition-colors"
            >
                <Share2 size={20} />
                <span className="text-xs font-semibold">공유하기</span>
            </button>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
               <Sparkles size={14} className="text-indigo-500"/>
               동네 테마 추천
            </label>
            <div className="flex gap-2 mb-3">
              <input 
                type="text"
                value={suggestionTheme}
                onChange={(e) => setSuggestionTheme(e.target.value)}
                placeholder="예: 미래 도시, 마법 학교"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleSuggestion()}
              />
              <button 
                onClick={handleSuggestion}
                disabled={isSuggesting || !suggestionTheme}
                className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[60px]"
              >
                {isSuggesting ? <Loader2 size={16} className="animate-spin" /> : '추천'}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              테마를 입력하면 AI가 어울리는 장소 5곳을 지도에 무작위로 배치해줍니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;