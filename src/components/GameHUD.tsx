import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  Wind, 
  RotateCcw, 
  FastForward, 
  Flag, 
  Award, 
  AlertTriangle,
  Maximize2,
  Minimize2,
  Keyboard
} from 'lucide-react';
import { GameMode } from '../types/game';

interface GameHUDProps {
  mode: GameMode;
  total: number;
  landed: number;
  inAir: number;
  windSpeed: number;
  fallSpeedMultiplier: number;
  soundEnabled: boolean;
  isPaused: boolean;
  onToggleSound: () => void;
  onTogglePause: () => void;
  onChangeSpeed: (speed: number) => void;
  onTriggerGust: () => void;
  onInstantLand: () => void;
  onExitGame: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  mode,
  total,
  landed,
  inAir,
  windSpeed,
  fallSpeedMultiplier,
  soundEnabled,
  isPaused,
  onToggleSound,
  onTogglePause,
  onChangeSpeed,
  onTriggerGust,
  onInstantLand,
  onExitGame,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [showKeyHints, setShowKeyHints] = useState(false);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };
  const getModeLabel = () => {
    switch (mode) {
      case 'CHALLENGE_ZONE':
        return {
          title: 'Vùng Thử Thách (Ô Đỏ Trả Bài)',
          icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
          color: 'text-red-400',
        };
      case 'LUCKY_ZONE':
        return {
          title: 'Vùng Quà Tặng (Ô Vàng May Mắn)',
          icon: <Award className="w-4 h-4 text-amber-400" />,
          color: 'text-amber-400',
        };
      case 'LAST_LANDER':
        return {
          title: 'Kẻ Sống Sót Cuối Cùng',
          icon: <Flag className="w-4 h-4 text-emerald-400" />,
          color: 'text-emerald-400',
        };
      case 'FIRST_LANDER':
        return {
          title: 'Hạ Cánh Nhanh Nhất',
          icon: <FastForward className="w-4 h-4 text-cyan-400" />,
          color: 'text-cyan-400',
        };
    }
  };

  const modeInfo = getModeLabel();

  return (
    <div className="absolute top-0 left-0 right-0 p-3 md:p-4 z-10 flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-none">
      {/* Left Pill: Mode & Return */}
      <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 shadow-lg">
        <button
          onClick={onExitGame}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Quay lại cài đặt"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Quay lại</span>
        </button>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {modeInfo.icon}
          <span className={`font-semibold ${modeInfo.color}`}>{modeInfo.title}</span>
        </div>
      </div>

      {/* Center: Live Wind & Suspense Action */}
      <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/60 shadow-lg">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
          <Wind className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Gió:</span>
          <span className="font-mono font-bold text-white tabular-nums">
            {windSpeed > 0 ? `→ ${windSpeed} m/s` : windSpeed < 0 ? `← ${Math.abs(windSpeed)} m/s` : '0 m/s'}
          </span>
        </div>

        <button
          onClick={onTriggerGust}
          className="ml-2 flex items-center gap-1 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 px-3 py-1.5 rounded-lg shadow-sm transition-transform"
          title="Tạo gió lốc bất ngờ đảo chiều"
        >
          <span>💨 Gió Lốc!</span>
        </button>
      </div>

      {/* Right: Controls & Metrics */}
      <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/60 shadow-lg">
        {/* Landed Counter */}
        <div className="text-xs font-semibold px-2 text-slate-300">
          <span>Đã đáp: </span>
          <span className="font-mono text-emerald-400 tabular-nums">{landed}</span>
          <span className="text-slate-500">/</span>
          <span className="font-mono text-white tabular-nums">{total}</span>
        </div>

        <span className="text-slate-600">|</span>

        {/* Speed Multipliers & Instant Touchdown */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg">
          {[1, 1.5, 2, 4].map((spd) => (
            <button
              key={spd}
              onClick={() => onChangeSpeed(spd)}
              className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${
                fallSpeedMultiplier === spd
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        <button
          onClick={onInstantLand}
          className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-white bg-slate-800 hover:bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-500/40 transition-colors"
          title="Tua nhanh để tất cả nhân vật chạm đất ngay lập tức"
        >
          <span>⚡ Hạ cánh</span>
        </button>

        {/* Pause Button */}
        <button
          onClick={onTogglePause}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title={isPaused ? 'Tiếp tục' : 'Tạm dừng'}
        >
          {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
        </button>

        {/* Sound Button */}
        <button
          onClick={onToggleSound}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title={isFullscreen ? 'Thu nhỏ (F)' : 'Toàn màn hình máy chiếu (F)'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Keyboard Shortcuts Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowKeyHints(!showKeyHints)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Xem phím tắt bục giảng"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {showKeyHints && (
            <div className="absolute right-0 top-full mt-2 w-52 p-3 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl text-[11px] text-slate-300 space-y-1.5 z-50 backdrop-blur-md">
              <div className="font-bold text-white text-xs border-b border-slate-800 pb-1 flex items-center justify-between">
                <span>Phím tắt bục giảng</span>
                <span className="text-[10px] text-amber-400 font-mono">Bàn phím</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>Dừng / Tiếp tục</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px] text-amber-300">Space</kbd>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>Tạo gió lốc</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px] text-amber-300">G</kbd>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>Toàn màn hình</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px] text-amber-300">F</kbd>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>Hạ cánh ngay</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px] text-amber-300">H</kbd>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>Thả dù lại</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px] text-amber-300">R</kbd>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>Quay lại cài đặt</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px] text-amber-300">Esc</kbd>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
