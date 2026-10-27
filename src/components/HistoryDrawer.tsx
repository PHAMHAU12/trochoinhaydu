import React, { useState } from 'react';
import { X, Trash2, Copy, Check, Clock, Award, AlertTriangle, ShieldCheck } from 'lucide-react';
import { RoundResult } from '../types/game';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: RoundResult[];
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyHistory = () => {
    if (history.length === 0) return;

    const lines = history.map((round, idx) => {
      const date = new Date(round.timestamp).toLocaleTimeString('vi-VN');
      const names = round.chosenPlayers.map((p) => p.player.name).join(', ');
      return `Lượt ${history.length - idx} (${date}) - [${round.mode}]: ${names}`;
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">Lịch sử lượt thả dù</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
              <span className="text-4xl mb-2">🪂</span>
              <p className="text-sm">Chưa có lượt thả dù nào.</p>
              <p className="text-xs text-slate-600 mt-1">Kết quả các vòng chơi sẽ lưu tại đây.</p>
            </div>
          ) : (
            history.map((round, index) => {
              const roundNum = history.length - index;
              const timeStr = new Date(round.timestamp).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={round.id}
                  className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-bold font-mono text-amber-400">Lượt #{roundNum}</span>
                    <span>{timeStr}</span>
                  </div>

                  <div className="space-y-1.5">
                    {round.chosenPlayers.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/80 border border-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          {round.mode === 'CHALLENGE_ZONE' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                          ) : round.mode === 'LUCKY_ZONE' ? (
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          <span className="font-bold text-white text-sm">{c.player.name}</span>
                        </div>
                        {c.zone && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {c.zone.label}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
            <button
              onClick={handleCopyHistory}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã sao chép' : 'Sao chép kết quả'}</span>
            </button>

            <button
              onClick={onClearHistory}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 border border-rose-500/20 transition-colors"
              title="Xóa toàn bộ lịch sử"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
