import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  GraduationCap, 
  Tv, 
  Compass, 
  Lightbulb, 
  Wind, 
  Flame, 
  AlertTriangle, 
  Gift, 
  Timer,
  CheckCircle2,
  Save,
  UserMinus
} from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'MECHANICS' | 'TEACHER' | 'STREAMER' | 'TIPS'>('MECHANICS');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Cách Hoạt Động & Hướng Dẫn</h2>
              <p className="text-xs text-slate-400">Nguyên lý vật lý, luật chơi và mẹo sử dụng cho lớp học & livestream</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-slate-950/60 border-b border-slate-800 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'MECHANICS', label: '1. Nguyên lý vận hành', icon: <Compass className="w-3.5 h-3.5" /> },
            { id: 'TEACHER', label: '2. Dành cho Thầy Cô', icon: <GraduationCap className="w-3.5 h-3.5" /> },
            { id: 'STREAMER', label: '3. Dành cho Streamer/MC', icon: <Tv className="w-3.5 h-3.5" /> },
            { id: 'TIPS', label: '4. Mẹo & Phím tắt', icon: <Lightbulb className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm leading-relaxed text-slate-300">
          {activeTab === 'MECHANICS' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  Mô phỏng vật lý 2D ngẫu nhiên & Tuyệt đối công bằng
                </h3>
                <p className="text-xs text-slate-300 mb-3">
                  Trò chơi không sử dụng vòng quay may mắn thông thường mà chạy trực tiếp thuật toán mô phỏng vật lý 2D trong thời gian thực:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="font-bold text-amber-400 block mb-1">Trọng lực & Lực cản</span>
                    Mỗi chiếc dù có độ cản gió và vận tốc rơi riêng biệt, đu đưa tự nhiên theo con lắc vật lý.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="font-bold text-cyan-400 block mb-1">Hệ thống luồng gió</span>
                    Gió biến thiên theo chiều ngang và người điều khiển có thể kích hoạt "Gió Lốc" bất ngờ.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="font-bold text-orange-400 block mb-1">Cột khí nóng (Thermals)</span>
                    Các luồng khí bốc lên có thể đẩy dù bay vọt ngược lên cao, tạo cảm giác lật kèo nghẹt thở.
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Các phân vùng hạ cánh trên mặt đất:
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-red-300">Vùng Thử Thách / Nguy Hiểm (Ô Đỏ):</strong> Ai rơi vào vùng này sẽ là người được chọn (lên bảng trả bài, kiểm tra miệng, hoặc thực hiện hình phạt vui).
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Gift className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300">Vùng Quà Tặng (Ô Vàng):</strong> Ai rơi vào vùng này sẽ được nhận quà may mắn, điểm cộng hoặc phần thưởng.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-300">Vùng An Toàn (Xanh lá / Biển):</strong> Tiếp đất êm ái, bình an vô sự và không bị gọi.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'TEACHER' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                  Quy trình 5 bước tổ chức trả bài đầu giờ
                </h3>
                <p className="text-xs text-slate-300">Biến 15 phút kiểm tra bài cũ căng thẳng thành giờ phút hồi hộp và vui vẻ nhất tiết học!</p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                  <span className="font-mono font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded text-sm">1</span>
                  <div>
                    <strong className="text-white">Lưu và quản lý danh sách từng lớp:</strong>
                    <p className="text-slate-400 mt-0.5">Dán danh sách lớp (copy từ file Excel của trường). Bấm <strong>"Lưu thay đổi lớp"</strong> hoặc <strong>"Tạo lớp mới"</strong>. Dữ liệu sẽ được lưu vĩnh viễn trên máy của thầy cô mà không sợ mất khi tắt trình duyệt.</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                  <span className="font-mono font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded text-sm">2</span>
                  <div>
                    <strong className="text-white">Chọn chế độ "Vùng Thử Thách (Ô Đỏ)":</strong>
                    <p className="text-slate-400 mt-0.5">Thiết lập số học sinh cần gọi lên bảng (ví dụ: 1 em hoặc 2 em cùng lên giải bài tập).</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                  <span className="font-mono font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded text-sm">3</span>
                  <div>
                    <strong className="text-white">Bắt đầu thả dù & Trình chiếu máy chiếu:</strong>
                    <p className="text-slate-400 mt-0.5">Cả lớp sẽ cùng đếm ngược 3... 2... 1... Tên học sinh hiển thị siêu to rõ ràng, học sinh ngồi cuối lớp vẫn nhìn thấy rõ chiếc dù của mình đang lượn.</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                  <span className="font-mono font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded text-sm">4</span>
                  <div>
                    <strong className="text-white">Tính năng "Loại tên này & Lượt mới" (Rất quan trọng):</strong>
                    <p className="text-slate-400 mt-0.5">Khi học sinh A rơi vào ô đỏ và đã trả bài xong, thầy cô bấm nút <strong>"Loại tên này & Tiếp tục"</strong> trên bảng kết quả. Trò chơi sẽ tự động loại em A ra khỏi danh sách và sẵn sàng gọi em tiếp theo, đảm bảo không bị gọi trùng!</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                  <span className="font-mono font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded text-sm">5</span>
                  <div>
                    <strong className="text-white">Xem lại lịch sử:</strong>
                    <p className="text-slate-400 mt-0.5">Vào mục "Lịch sử" để xem lại danh sách những học sinh đã bị gọi trong tiết học để vào điểm số.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'STREAMER' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Tv className="w-5 h-5 text-cyan-400" />
                  Mini game Giveaway & Quay thưởng tương tác trực tiếp
                </h3>
                <p className="text-xs text-slate-300">Khán giả xem qua màn hình điện thoại hoặc máy tính đều nhìn rõ nick của mình.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                  <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <Gift className="w-4 h-4" />
                    Chế độ Vùng May Mắn (Ô Vàng)
                  </div>
                  <p className="text-slate-400">Rơi vào rương kho báu để trúng phần quà giveaway từ kênh livestream.</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                  <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                    <Timer className="w-4 h-4" />
                    Kẻ Sống Sót Cuối Cùng (Last Lander)
                  </div>
                  <p className="text-slate-400">Ai lơ lửng lâu nhất và tiếp đất cuối cùng sẽ là nhà vô địch nhận giải đặc biệt!</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs">
                <strong className="text-cyan-300 block mb-1">Mẹo tăng tương tác tương tác cho Streamer:</strong>
                Trong lúc các nhân vật đang bay lượn ở giữa trời, hãy bấm nút <strong>"💨 Gió Lốc!"</strong> để đổi chiều gió bất ngờ, khiến những chiếc dù đang an toàn bất ngờ bị thổi dạt sang vùng nguy hiểm, tạo tiếng cười và bình luận sôi nổi!
              </div>
            </div>
          )}

          {activeTab === 'TIPS' && (
            <div className="space-y-3 animate-fade-in text-xs">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <h4 className="font-bold text-white mb-2 flex items-center justify-between">
                  <span>⌨️ Bộ phím tắt bục giảng dành cho giáo viên</span>
                  <span className="text-amber-400 font-mono text-[11px]">Trình chiếu</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div className="flex justify-between items-center bg-slate-900/60 px-2 py-1.5 rounded">
                    <span>Thả dù / Tạm dừng:</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-400">Space</kbd>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/60 px-2 py-1.5 rounded">
                    <span>Toàn màn hình máy chiếu:</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-400">F</kbd>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/60 px-2 py-1.5 rounded">
                    <span>Tạo gió lốc kịch tính:</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-400">G</kbd>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/60 px-2 py-1.5 rounded">
                    <span>Hạ cánh ngay:</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-400">H</kbd>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/60 px-2 py-1.5 rounded">
                    <span>Thả dù lại:</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-400">R</kbd>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/60 px-2 py-1.5 rounded">
                    <span>Quay lại cài đặt:</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-400">Esc</kbd>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <h4 className="font-bold text-white mb-1">📋 Dán trực tiếp từ Microsoft Excel / VnEdu / SMAS</h4>
                <p className="text-slate-400">Chỉ cần sao chép bảng danh sách từ Excel hoặc SMAS rồi dán vào, sau đó bấm nút <strong>"Làm sạch STT"</strong> để hệ thống tự động loại bỏ số thứ tự (1., 02-) và các cột thừa.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <h4 className="font-bold text-white mb-1">⏱️ Đồng hồ đếm ngược trả bài thông minh</h4>
                <p className="text-slate-400">Khi dù hạ cánh trúng học sinh, bảng kết quả tích hợp sẵn đồng hồ đếm ngược (15s, 30s, 45s, 60s) kèm hiệu ứng âm thanh tích tắc và chuông báo hết giờ giúp thầy cô điều phối tiết học dễ dàng.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <h4 className="font-bold text-white mb-1">⚡ Điều khiển tốc độ rơi</h4>
                <p className="text-slate-400">Trên thanh HUD, chọn tốc độ <strong>1x</strong> cho vòng chơi hồi hộp, hoặc <strong>2x / 4x</strong> để kết thúc nhanh nếu tiết học sắp hết giờ.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors"
          >
            Đã hiểu, quay lại trò chơi!
          </button>
        </div>
      </div>
    </div>
  );
};
