import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  RotateCcw, 
  ArrowLeft, 
  BookmarkCheck, 
  UserMinus, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  AlertOctagon, 
  Trophy,
  Timer,
  Play,
  Pause,
  Bot,
  Loader2,
  AlertCircle,
  Key
} from 'lucide-react';
import { GameMode, ParachuteEntity } from '../types/game';
import { AVATAR_EMOJIS } from '../services/presets';
import { sounds } from '../services/soundEffects';
import { generateWithFallback } from '../services/geminiService';

interface ResultModalProps {
  mode: GameMode;
  chosenPlayers: ParachuteEntity[];
  allLandings: ParachuteEntity[];
  onReplay: () => void;
  onBackToSetup: () => void;
  onEliminateChosen: (ids: string[]) => void;
  onSaveToHistory: () => void;
  onOpenApiKeyModal?: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  mode,
  chosenPlayers,
  allLandings,
  onReplay,
  onBackToSetup,
  onEliminateChosen,
  onSaveToHistory,
  onOpenApiKeyModal,
}) => {
  const [showAllLandings, setShowAllLandings] = useState(false);
  const [saved, setSaved] = useState(false);

  // Classroom Countdown Timer State
  const [initialSeconds, setInitialSeconds] = useState(30);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  // AI Quiz Question Generator State
  const [topic, setTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRetryInfo, setAiRetryInfo] = useState<string | null>(null);
  const [aiQuestions, setAiQuestions] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAiBox, setShowAiBox] = useState(false);

  const handleGenerateQuestions = async () => {
    if (!topic.trim()) {
      setAiError('Vui lòng nhập chủ đề hoặc bài học cần hỏi.');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setAiRetryInfo(null);
    setAiQuestions(null);

    const studentNames = chosenPlayers.map((p) => p.name).join(', ');
    const prompt = `Bạn là trợ lý giáo viên. Hãy tạo 2 câu hỏi kiểm tra miệng ngắn gọn, kèm gợi ý đáp án nhanh dành cho học sinh: ${studentNames}.
Chủ đề môn học / Bài học: "${topic}".
Yêu cầu: Ngắn gọn, súc tích, câu hỏi phù hợp trả lời nhanh trong 30-60 giây.`;

    try {
      const res = await generateWithFallback(prompt, (failedModel, nextModel, errorMsg) => {
        setAiRetryInfo(`Model ${failedModel} quá tải (${errorMsg.slice(0, 35)}...). Tự động chuyển sang ${nextModel}...`);
      });
      setAiQuestions(res.text);
      setAiRetryInfo(null);
    } catch (err: any) {
      setAiError(err?.message || 'Có lỗi xảy ra khi gọi AI.');
      setAiRetryInfo(null);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            sounds.playBuzzer();
            setTimerActive(false);
            return 0;
          }
          sounds.playTick(prev - 1 <= 5);
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timerSeconds]);

  const selectTimerDuration = (secs: number) => {
    setInitialSeconds(secs);
    setTimerSeconds(secs);
    setTimerActive(false);
  };

  const toggleTimer = () => {
    if (timerSeconds === 0) {
      setTimerSeconds(initialSeconds);
      setTimerActive(true);
    } else {
      setTimerActive(!timerActive);
    }
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimerSeconds(initialSeconds);
  };

  useEffect(() => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 350);
    } catch {
      // Confetti fallback
    }
  }, []);

  const getModeTitle = () => {
    switch (mode) {
      case 'CHALLENGE_ZONE':
        return {
          header: '🎯 KẾT QUẢ VÙNG THỬ THÁCH',
          subtitle: 'Những người may mắn hạ cánh vào vùng trả bài!',
          badgeBg: 'bg-red-500/20 text-red-400 border-red-500/30',
          icon: <AlertOctagon className="w-8 h-8 text-red-400" />,
        };
      case 'LUCKY_ZONE':
        return {
          header: '🎁 KẾT QUẢ VÙNG QUÀ THƯỞNG',
          subtitle: 'Chúc mừng những người chơi đã ẵm trọn phần thưởng!',
          badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          icon: <Trophy className="w-8 h-8 text-amber-400" />,
        };
      case 'LAST_LANDER':
        return {
          header: '👑 KẺ SỐNG SÓT CUỐI CÙNG',
          subtitle: 'Người lơ lửng lâu nhất trên bầu trời bao la!',
          badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          icon: <Sparkles className="w-8 h-8 text-emerald-400" />,
        };
      case 'FIRST_LANDER':
        return {
          header: '⚡ HẠ CÁNH THẦN TỐC',
          subtitle: 'Người chạm đất đầu tiên!',
          badgeBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
          icon: <Sparkles className="w-8 h-8 text-cyan-400" />,
        };
    }
  };

  const modeInfo = getModeTitle();

  const handleSave = () => {
    onSaveToHistory();
    setSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header Banner */}
        <div className="p-6 text-center border-b border-slate-800 bg-gradient-to-b from-slate-800/60 to-slate-900/60">
          <div className="inline-flex p-3 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-inner mb-3">
            {modeInfo.icon}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide">
            {modeInfo.header}
          </h2>
          <p className="text-sm text-slate-400 mt-1">{modeInfo.subtitle}</p>
        </div>

        {/* Chosen Players Spotlight */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 gap-3">
            {chosenPlayers.map((player, idx) => {
              const emoji = AVATAR_EMOJIS[player.avatarIndex % AVATAR_EMOJIS.length];
              return (
                <div
                  key={player.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-800/90 to-slate-800/40 border-2 border-amber-500/40 shadow-lg relative overflow-hidden"
                >
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-4xl shadow-inner shrink-0">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
                        Người được chọn #{idx + 1}
                      </span>
                      {player.landedZone && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-700/80 text-slate-300">
                          {player.landedZone.label}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-white truncate mt-0.5">
                      {player.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {mode === 'CHALLENGE_ZONE'
                        ? '🎯 Mời bạn lên bảng trả bài hoặc thực hiện thử thách!'
                        : mode === 'LUCKY_ZONE'
                        ? '🎉 Nhận 1 phần quà may mắn hoặc +10 điểm tích lũy!'
                        : '⭐ Đã hạ cánh xuất sắc với thời gian kỷ lục!'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Classroom Countdown Timer */}
          <div className="mt-5 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">Đồng hồ đếm ngược trả lời</span>
              </div>
              <div className="flex items-center gap-1">
                {[15, 30, 45, 60].map((s) => (
                  <button
                    key={s}
                    onClick={() => selectTimerDuration(s)}
                    className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded transition-colors ${
                      initialSeconds === s
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-900/90 rounded-lg p-2.5 border border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className={`text-2xl md:text-3xl font-black font-mono tracking-wider tabular-nums ${
                    timerSeconds <= 5 && timerSeconds > 0
                      ? 'text-red-400 animate-pulse'
                      : timerSeconds === 0
                      ? 'text-rose-500 font-extrabold'
                      : 'text-amber-400'
                  }`}
                >
                  {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:
                  {String(timerSeconds % 60).padStart(2, '0')}
                </div>
                {timerSeconds === 0 && (
                  <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 animate-bounce">
                    Hết giờ trả bài! 🔔
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleTimer}
                  className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 ${
                    timerActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400'
                  }`}
                >
                  {timerActive ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Tạm dừng</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{timerSeconds === 0 ? 'Làm lại' : 'Bắt đầu'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={resetTimer}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Đặt lại đồng hồ"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* AI Quiz Question Generator (Gemini Fallback Integration) */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 shadow-inner">
            <button
              onClick={() => setShowAiBox(!showAiBox)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-200 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <span>AI Trợ lý: Tạo câu hỏi kiểm tra bài cũ</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Gemini API
                </span>
              </div>
              {showAiBox ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showAiBox && (
              <div className="mt-3 space-y-3 pt-3 border-t border-slate-800 animate-fade-in text-xs">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateQuestions()}
                    placeholder="Nhập môn học hoặc bài học (VD: Lịch sử 10 Bài 5, Toán 8, Unit 3...)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <button
                    onClick={handleGenerateQuestions}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 disabled:opacity-50 transition-all shrink-0"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang tạo...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                        <span>Tạo câu hỏi</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Retry Information Notification */}
                {aiRetryInfo && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed animate-pulse">
                    ⚠️ {aiRetryInfo}
                  </div>
                )}

                {/* Error Box (Verbatim API Error Display as per rules) */}
                {aiError && (
                  <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-[11px] leading-relaxed flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-sans text-rose-200 mb-0.5">Lỗi API (Đã dừng do lỗi):</strong>
                        <span className="font-mono break-all">{aiError}</span>
                      </div>
                    </div>
                    {onOpenApiKeyModal && (
                      <button
                        onClick={onOpenApiKeyModal}
                        className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded border border-rose-500/40 shrink-0 transition-colors"
                      >
                        <Key className="w-3 h-3" />
                        <span>Cài đặt Key</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Generated Questions Card */}
                {aiQuestions && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/40 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-cyan-400 font-bold">
                      <span>Câu hỏi gợi ý cho học sinh:</span>
                      <button
                        onClick={() => {
                          setInitialSeconds(30);
                          setTimerSeconds(30);
                          setTimerActive(true);
                        }}
                        className="flex items-center gap-1 text-[10px] bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40"
                      >
                        <Timer className="w-3 h-3" />
                        <span>Bấm giờ 30s</span>
                      </button>
                    </div>
                    <div className="text-slate-200 whitespace-pre-wrap leading-relaxed font-sans text-xs bg-slate-950/60 p-2.5 rounded border border-slate-800">
                      {aiQuestions}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Toggle All Landings Accordion */}
          <div className="mt-5 border-t border-slate-800 pt-4">
            <button
              onClick={() => setShowAllLandings(!showAllLandings)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-white py-1 transition-colors"
            >
              <span>Xem bảng chi tiết tất cả ({allLandings.length} người hạ cánh)</span>
              {showAllLandings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAllLandings && (
              <div className="mt-3 max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {allLandings.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 w-5">#{i + 1}</span>
                      <span className="font-medium text-slate-200">{p.name}</span>
                    </div>
                    <span
                      className={`font-semibold ${
                        p.landedZone?.type === 'CHALLENGE'
                          ? 'text-red-400'
                          : p.landedZone?.type === 'LUCKY'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {p.landedZone?.name || 'Vùng hạ cánh'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReplay}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg active:scale-98 transition-transform"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Thả dù lại</span>
            </button>

            <button
              onClick={() => onEliminateChosen(chosenPlayers.map((p) => p.id))}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
              title="Loại người này khỏi danh sách để không bị gọi lại ở lượt tiếp theo"
            >
              <UserMinus className="w-4 h-4" />
              <span>Loại tên này & Lượt mới</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={onBackToSetup}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Về màn hình cài đặt</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saved}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                saved
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>{saved ? 'Đã lưu lịch sử' : 'Lưu vào lịch sử'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
