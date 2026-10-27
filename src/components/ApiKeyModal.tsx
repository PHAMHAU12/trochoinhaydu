import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Cpu, 
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { 
  AVAILABLE_MODELS, 
  getStoredApiKey, 
  setStoredApiKey, 
  getStoredModel, 
  setStoredModel,
  generateWithFallback
} from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  mandatory?: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  mandatory = false,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setSelectedModel(getStoredModel());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!apiKey.trim()) {
      setTestResult({
        success: false,
        message: 'Vui lòng nhập API Key để sử dụng các tính năng AI của ứng dụng.',
      });
      return;
    }
    setStoredApiKey(apiKey.trim());
    setStoredModel(selectedModel);
    if (onSaved) onSaved();
    onClose();
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({
        success: false,
        message: 'Vui lòng nhập API key trước khi kiểm tra.',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    // Temporarily set key in storage to test
    const oldKey = getStoredApiKey();
    const oldModel = getStoredModel();
    setStoredApiKey(apiKey.trim());
    setStoredModel(selectedModel);

    try {
      const res = await generateWithFallback('Chào Gemini, phản hồi ngắn: Kết nối tốt!');
      setTestResult({
        success: true,
        message: `Kết nối thành công qua ${res.modelUsed}! Phản hồi: "${res.text.trim().slice(0, 60)}"`,
      });
    } catch (err: any) {
      setStoredApiKey(oldKey);
      setStoredModel(oldModel);
      setTestResult({
        success: false,
        message: err?.message || 'Không thể kết nối đến Gemini API. Vui lòng kiểm tra lại key.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black text-white">
                Thiết lập Model & API Key
              </h2>
              <p className="text-xs text-slate-400">
                Cấu hình Gemini API để sử dụng các tính năng AI trong lớp học
              </p>
            </div>
          </div>

          {!mandatory && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
          {/* Section 1: API Key Input */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>Gemini API Key của bạn</span>
                <span className="text-rose-400">*</span>
              </label>

              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline transition-colors"
              >
                <span>Lấy API key miễn phí tại Google AI Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Dán AI Studio API Key (AIzaSy...)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 pr-20 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors text-xs flex items-center gap-1"
                title={showKey ? 'Ẩn key' : 'Hiện key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="text-[11px] font-sans">{showKey ? 'Ẩn' : 'Hiện'}</span>
              </button>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Key được lưu trực tiếp trong bộ nhớ trình duyệt của bạn (<strong>localStorage</strong>), không bao giờ gửi qua máy chủ trung gian và hoàn toàn riêng tư.
              </span>
            </div>
          </div>

          {/* Section 2: Model Selection Cards */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Chọn Mô hình AI (Cards)</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Tự động Fallback & Retry nếu quá tải
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {AVAILABLE_MODELS.map((model) => {
                const isSelected = selectedModel === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`relative cursor-pointer p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {model.badge}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-white mb-1 leading-snug">
                        {model.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {model.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Tag: {model.tag}</span>
                      {model.id === 'gemini-3-flash-preview' && (
                        <span className="text-amber-400 font-bold">Default</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 animate-fade-in ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-mono'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 break-words">
                <strong className="block font-sans mb-0.5">
                  {testResult.success ? 'Kết nối thành công!' : 'Lỗi kết nối API:'}
                </strong>
                <span>{testResult.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || !apiKey.trim()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {testing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang kiểm tra...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Kiểm tra kết nối</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            {!mandatory && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                Đóng
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-md active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Lưu cấu hình</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
