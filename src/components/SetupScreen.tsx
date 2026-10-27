import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Upload, 
  Shuffle, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Wind, 
  Flame, 
  Compass,
  History,
  AlertTriangle,
  Gift,
  Timer,
  Save,
  Plus,
  Settings,
  HelpCircle,
  FileSpreadsheet,
  Maximize2,
  Minimize2,
  Wand2,
  Key
} from 'lucide-react';
import { GameMode, MapTheme, PlayerInput, SavedClass } from '../types/game';

interface SetupScreenProps {
  namesText: string;
  onNamesTextChange: (val: string) => void;
  parsedPlayers: PlayerInput[];
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  theme: MapTheme;
  onThemeChange: (theme: MapTheme) => void;
  targetCount: number;
  onTargetCountChange: (count: number) => void;
  windLevel: 'CALM' | 'BREEZE' | 'GUSTY';
  onWindLevelChange: (level: 'CALM' | 'BREEZE' | 'GUSTY') => void;
  allowThermals: boolean;
  onAllowThermalsChange: (allow: boolean) => void;
  soundEnabled: boolean;
  onSoundEnabledChange: (enabled: boolean) => void;
  onStartGame: () => void;
  onOpenHistory: () => void;
  historyCount: number;

  // New Class Management Props
  classes: SavedClass[];
  selectedClassId: string;
  onSelectClass: (id: string) => void;
  onSaveCurrentClassChanges: () => void;
  onOpenClassManager: () => void;
  onOpenHowItWorks: () => void;
  onOpenApiKeyModal: () => void;
  hasUnsavedChanges: boolean;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  namesText,
  onNamesTextChange,
  parsedPlayers,
  mode,
  onModeChange,
  theme,
  onThemeChange,
  targetCount,
  onTargetCountChange,
  windLevel,
  onWindLevelChange,
  allowThermals,
  onAllowThermalsChange,
  soundEnabled,
  onSoundEnabledChange,
  onStartGame,
  onOpenHistory,
  historyCount,
  classes,
  selectedClassId,
  onSelectClass,
  onSaveCurrentClassChanges,
  onOpenClassManager,
  onOpenHowItWorks,
  onOpenApiKeyModal,
  hasUnsavedChanges,
}) => {
  const [notification, setNotification] = useState<string | null>(null);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const triggerNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Shuffle names
  const handleShuffle = () => {
    const list = namesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    onNamesTextChange(list.join('\n'));
    triggerNotice('Đã xáo trộn danh sách người chơi!');
  };

  // Deduplicate names
  const handleDeduplicate = () => {
    const list = namesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const unique = Array.from(new Set(list));
    onNamesTextChange(unique.join('\n'));
    triggerNotice(`Đã lọc trùng! Còn lại ${unique.length} người.`);
  };

  // Helper to clean lines from Excel / Word tables / STT numbers
  const cleanStudentLine = (raw: string): string => {
    let s = raw.trim();
    // If copied from Excel/Sheets with tabs or commas, extract student name column
    if (s.includes('\t') || s.includes(';') || s.includes(',')) {
      const parts = s.split(/[\t;,]+/).map((p) => p.trim()).filter(Boolean);
      // Find part that isn't purely numeric or gender/class code
      const namePart = parts.find((p) => isNaN(Number(p)) && p.length > 2 && !['nam', 'nữ', 'nu'].includes(p.toLowerCase())) || parts[1] || parts[0];
      if (namePart) s = namePart;
    }
    // Remove leading numbers: "1. ", "02 - ", "3/ ", "STT 4: "
    s = s.replace(/^(stt\s*)?(\d+[\.\-\/\)\:]\s*|\d+\s+)/i, '').trim();
    return s;
  };

  // One-click clean STT and Excel table formatting
  const handleCleanExcelText = () => {
    const lines = namesText
      .split(/[\r\n]+/)
      .map(cleanStudentLine)
      .filter((s) => s.length > 0 && !s.toLowerCase().includes('họ và tên') && !s.toLowerCase().includes('stt'));
    onNamesTextChange(lines.join('\n'));
    triggerNotice(`Đã làm sạch STT & dữ liệu Excel cho ${lines.length} học sinh!`);
  };

  // Clear names
  const handleClear = () => {
    onNamesTextChange('');
    triggerNotice('Đã xóa toàn bộ tên!');
  };

  // File import (.txt, .csv, .tsv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const items = content
          .split(/[\r\n]+/)
          .map(cleanStudentLine)
          .filter((s) => s.length > 0 && !s.toLowerCase().includes('họ và tên') && !s.toLowerCase().includes('name') && !s.toLowerCase().includes('stt'));
        onNamesTextChange(items.join('\n'));
        triggerNotice(`Đã nhập thành công ${items.length} người từ file!`);
      }
    };
    reader.readAsText(file);
  };

  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

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

  const handleSaveClass = () => {
    onSaveCurrentClassChanges();
    triggerNotice(`Đã lưu thay đổi cho ${selectedClass?.name || 'lớp'}!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Bar Header */}
      <header className="flex items-center justify-between gap-4 px-4 md:px-6 py-3.5 border-b border-slate-800 bg-slate-900/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl shadow-md shrink-0">
            🪂
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black tracking-tight text-white whitespace-nowrap">
              TRÒ CHƠI THẢ DÙ _ PHẠM HẬU
            </h1>
            <p className="text-[11px] md:text-xs text-slate-400">Vòng quay gọi trả bài & bốc thăm 2D sống động</p>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2">
          {/* Settings API Key Button with red reminder text */}
          <button
            onClick={onOpenApiKeyModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors group shadow-sm"
            title="Cấu hình Gemini API Key và chọn Model AI"
          >
            <Key className="w-3.5 h-3.5 text-rose-400 group-hover:rotate-12 transition-transform" />
            <span className="font-bold text-rose-400">Settings (API Key)</span>
            <span className="text-[11px] text-rose-400 font-bold">
              - Lấy API key để sử dụng app
            </span>
          </button>

          {/* How It Works Button */}
          <button
            onClick={onOpenHowItWorks}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors"
            title="Xem cách hoạt động, luật chơi và hướng dẫn cho giáo viên/streamer"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Cách hoạt động</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => onSoundEnabledChange(!soundEnabled)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Bật âm thanh' : 'Tắt âm'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Toàn màn hình máy chiếu (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
          </button>

          {/* Quick Start Button in Header */}
          <button
            onClick={onStartGame}
            disabled={parsedPlayers.length === 0}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-md transition-all ${
              parsedPlayers.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 shadow-amber-500/20 ring-2 ring-amber-400/30'
            }`}
            title="Bắt đầu thả dù ngay"
          >
            <span>🪂 Thả Dù ({parsedPlayers.length})</span>
          </button>
        </div>
      </header>

      {/* Main Container - Split Screen Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: Player Roster & Class Management (col-span-5) */}
        {/* ======================================================== */}
        <section className="lg:col-span-5 flex flex-col bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-white text-base">Danh sách lớp học</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-md">
                {parsedPlayers.length} người
              </span>
            </div>
          </div>

          {/* Class Selector & Save Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400">
                Chọn lớp đang dạy / nhóm chơi:
              </label>
              <button
                onClick={onOpenClassManager}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                title="Thêm, sửa tên hoặc xóa các lớp"
              >
                <Settings className="w-3 h-3" />
                <span>Quản lý lớp</span>
              </button>
            </div>

            {/* Quick Class Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-2.5">
              {classes.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectClass(c.id)}
                  className={`text-left p-2.5 rounded-xl text-xs font-medium border transition-all ${
                    selectedClassId === c.id
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-xs'
                      : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold truncate">{c.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{c.names.length} học sinh</div>
                </button>
              ))}
            </div>

            {/* Save Class Changes Alert Button */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
              <div className="text-xs truncate">
                <span className="text-slate-400">Đang chọn: </span>
                <span className="font-bold text-white">{selectedClass?.name}</span>
                {hasUnsavedChanges && (
                  <span className="ml-2 text-[10px] text-amber-400 font-bold bg-amber-500/20 px-1.5 py-0.5 rounded">
                    Chưa lưu thay đổi
                  </span>
                )}
              </div>

              <button
                onClick={handleSaveClass}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  hasUnsavedChanges
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm animate-pulse'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
                title="Lưu danh sách học sinh hiện tại vào lớp này"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu lớp</span>
              </button>
            </div>
          </div>

          {/* Textarea Input */}
          <div className="relative mb-3 flex-1 flex flex-col">
            <label className="text-xs font-semibold text-slate-400 mb-1 flex items-center justify-between">
              <span>Nội dung danh sách (mỗi tên 1 dòng):</span>
              <span className="text-[11px] text-slate-500">Dán từ Excel/Sheets</span>
            </label>
            <textarea
              value={namesText}
              onChange={(e) => onNamesTextChange(e.target.value)}
              placeholder="Nhập hoặc dán tên học sinh tại đây...&#10;Ví dụ:&#10;Nguyễn Văn An&#10;Trần Thị Thảo&#10;Lê Hoàng Long"
              rows={8}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm font-medium text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-mono leading-relaxed"
            />
          </div>

          {/* Quick Roster Action Tools */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShuffle}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Xáo trộn thứ tự nhảy"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Xáo trộn</span>
              </button>

              <button
                onClick={handleDeduplicate}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Lọc các tên trùng lặp"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Lọc trùng</span>
              </button>

              <button
                onClick={handleCleanExcelText}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
                title="Lọc bỏ số thứ tự (1., 02-) và làm sạch định dạng copy từ bảng Excel/Word"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Làm sạch STT</span>
              </button>

              <button
                onClick={handleClear}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                title="Xóa toàn bộ danh sách"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa hết</span>
              </button>
            </div>

            {/* File Upload Button */}
            <label className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 cursor-pointer transition-colors" title="Nhập danh sách từ file text, CSV, Excel xuất khẩu (.txt, .csv, .tsv)">
              <Upload className="w-3.5 h-3.5" />
              <span>Nhập file</span>
              <input
                type="file"
                accept=".txt,.csv,.tsv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {notification && (
            <div className="mt-3 py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium text-center animate-fade-in">
              {notification}
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Map Theme & Game Mode Rules (col-span-7) */}
        {/* ======================================================== */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          {/* ======================================================== */}
          {/* TOP HERO CTA BUTTON: Big prominent animated orange start button */}
          {/* ======================================================== */}
          <div className="relative">
            <button
              onClick={onStartGame}
              disabled={parsedPlayers.length === 0}
              className={`w-full py-4 sm:py-5 px-6 rounded-2xl font-black text-xl sm:text-2xl text-white tracking-wider uppercase transition-all duration-300 shadow-2xl flex items-center justify-center gap-3.5 relative overflow-hidden group ${
                parsedPlayers.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:via-amber-600 hover:to-orange-600 active:scale-[0.99] shadow-amber-500/30 cursor-pointer ring-4 ring-amber-500/25 animate-pulse'
              }`}
            >
              <span className="text-3xl group-hover:scale-125 transition-transform duration-300">🪂</span>
              <span className="drop-shadow-md">Bắt Đầu Thả Dù Ngay!</span>
              <span className="text-xs sm:text-sm font-bold font-mono bg-black/30 px-3 py-1 rounded-full text-white/95 border border-white/20">
                {parsedPlayers.length} nhân vật sẵn sàng
              </span>
            </button>
          </div>

          {/* 1. Theme Map Selection */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-3">
              <Compass className="w-5 h-5 text-cyan-400" />
              <h2 className="font-bold text-white text-base">Bản đồ thế giới nhảy dù</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  id: 'TROPICAL_ISLAND',
                  label: 'Đảo Nhiệt Đới',
                  sub: 'Biển xanh cát vàng',
                  icon: '🏝️',
                  gradient: 'from-sky-500/20 to-teal-500/20 border-sky-500/40',
                },
                {
                  id: 'CYBER_CITY',
                  label: 'Thành Phố Neon',
                  sub: 'Cyberpunk tương lai',
                  icon: '🌆',
                  gradient: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40',
                },
                {
                  id: 'COUNTRYSIDE',
                  label: 'Làng Quê Mộc',
                  sub: 'Đồng quê thanh bình',
                  icon: '🌾',
                  gradient: 'from-emerald-500/20 to-lime-500/20 border-emerald-500/40',
                },
                {
                  id: 'COSMIC_SPACE',
                  label: 'Vũ Trụ Thần Bí',
                  sub: 'Hố đen & dải ngân hà',
                  icon: '🚀',
                  gradient: 'from-blue-500/20 to-pink-500/20 border-blue-500/40',
                },
              ].map((map) => (
                <button
                  key={map.id}
                  onClick={() => onThemeChange(map.id as MapTheme)}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-24 ${
                    theme === map.id
                      ? `bg-gradient-to-br ${map.gradient} ring-2 ring-amber-400 text-white shadow-md`
                      : 'bg-slate-800/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-2xl">{map.icon}</div>
                  <div>
                    <div className="font-bold text-xs leading-tight">{map.label}</div>
                    <div className="text-[10px] text-slate-400">{map.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Game Mode Selection & Rules */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-white text-base">Thiết lập luật chơi & Chế độ</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {[
                {
                  id: 'CHALLENGE_ZONE',
                  name: 'Vùng Nguy Hiểm (Ô Đỏ Trả Bài)',
                  desc: 'Ai rơi trúng vùng đỏ sẽ bị gọi trả bài / phạt thử thách vui',
                  icon: <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />,
                  tag: 'Phổ biến cho lớp học',
                  tagColor: 'text-red-400 bg-red-500/10 border-red-500/20',
                },
                {
                  id: 'LUCKY_ZONE',
                  name: 'Vùng May Mắn (Ô Vàng Nhận Quà)',
                  desc: 'Ai rơi trúng vùng vàng nhận thưởng / cộng điểm thi đua',
                  icon: <Gift className="w-4 h-4 text-amber-400 shrink-0" />,
                  tag: 'Giveaway & Thưởng',
                  tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                },
                {
                  id: 'LAST_LANDER',
                  name: 'Kẻ Sống Sót Cuối Cùng',
                  desc: 'Ai lơ lửng trên trời lâu nhất và tiếp đất sau cùng là người trúng',
                  icon: <Timer className="w-4 h-4 text-emerald-400 shrink-0" />,
                  tag: 'Cực kỳ hồi hộp',
                  tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                },
                {
                  id: 'FIRST_LANDER',
                  name: 'Chạm Đất Nhanh Nhất',
                  desc: 'Ai tiếp đất sớm nhất được vinh danh',
                  icon: <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />,
                  tag: 'Tốc độ phản xạ',
                  tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
                },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => onModeChange(m.id as GameMode)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    mode === m.id
                      ? 'bg-slate-800/90 border-amber-500/60 shadow-lg ring-1 ring-amber-500/30'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 font-bold text-xs text-white">
                      {m.icon}
                      <span>{m.name}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">{m.desc}</p>
                  <div className="mt-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${m.tagColor}`}>
                      {m.tag}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Target Count & Wind Level Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
              {/* Target Count */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Số người cần chọn:
                </label>
                <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl">
                  {[1, 2, 3, 5].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => onTargetCountChange(cnt)}
                      className={`flex-1 py-1.5 text-xs font-bold font-mono rounded-lg transition-colors ${
                        targetCount === cnt
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wind Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Cường độ gió:
                </label>
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
                  {[
                    { id: 'CALM', label: 'Êm đềm' },
                    { id: 'BREEZE', label: 'Gió nhẹ' },
                    { id: 'GUSTY', label: 'Gió mạnh' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      onClick={() => onWindLevelChange(w.id as 'CALM' | 'BREEZE' | 'GUSTY')}
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${
                        windLevel === w.id
                          ? 'bg-cyan-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thermals Updrafts Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Cột khí nóng bất ngờ:
                </label>
                <button
                  onClick={() => onAllowThermalsChange(!allowThermals)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    allowThermals
                      ? 'bg-orange-500/15 border-orange-500/40 text-orange-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Flame className={`w-3.5 h-3.5 ${allowThermals ? 'text-orange-400 animate-pulse' : ''}`} />
                  <span>{allowThermals ? 'Đang bật (Tăng kịch tính)' : 'Đã tắt'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Info */}
      <footer className="py-3 px-6 text-center text-xs text-slate-500 border-t border-slate-800/80">
        TRÒ CHƠI THẢ DÙ _ PHẠM HẬU · Hoàn toàn ngẫu nhiên & công bằng bằng mô phỏng vật lý · Tối ưu cho máy chiếu lớp học & livestream
      </footer>
    </div>
  );
};
