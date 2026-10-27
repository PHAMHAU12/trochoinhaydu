import React, { useState } from 'react';
import { X, Plus, Trash2, Edit3, Check, RotateCcw, Users } from 'lucide-react';
import { SavedClass } from '../types/game';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: SavedClass[];
  selectedClassId: string;
  onSelectClass: (id: string) => void;
  onCreateClass: (name: string, description: string) => void;
  onUpdateClassMeta: (id: string, name: string, description: string) => void;
  onDeleteClass: (id: string) => void;
  onResetToDefaults: () => void;
}

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  classes,
  selectedClassId,
  onSelectClass,
  onCreateClass,
  onUpdateClassMeta,
  onDeleteClass,
  onResetToDefaults,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');

  if (!isOpen) return null;

  const startEdit = (c: SavedClass) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditDesc(c.description || '');
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) return;
    onUpdateClassMeta(id, editName.trim(), editDesc.trim());
    setEditingId(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    onCreateClass(newClassName.trim(), newClassDesc.trim() || `${new Date().toLocaleDateString('vi-VN')}`);
    setNewClassName('');
    setNewClassDesc('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">Quản Lý Danh Sách Lớp Học</h3>
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
          {/* New class button / form */}
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-3 px-4 rounded-xl border border-dashed border-amber-500/40 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo thêm lớp mới</span>
            </button>
          ) : (
            <form onSubmit={handleCreate} className="p-3.5 rounded-xl bg-slate-800 border border-amber-500/40 space-y-2.5">
              <div className="font-bold text-xs text-white">Tạo lớp học mới:</div>
              <div>
                <input
                  type="text"
                  placeholder="Ví dụ: Lớp 11B3, Nhóm 4, Tổ 2..."
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Mô tả ngắn (tùy chọn)..."
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!newClassName.trim()}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 disabled:opacity-50"
                >
                  Tạo lớp
                </button>
              </div>
            </form>
          )}

          {/* List of classes */}
          <div className="space-y-2">
            {classes.map((c) => {
              const isSelected = selectedClassId === c.id;
              const isEditing = editingId === c.id;

              return (
                <div
                  key={c.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                      />
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Mô tả..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => saveEdit(c.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-bold bg-emerald-500 text-slate-950 rounded-lg"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Lưu tên</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div
                        onClick={() => {
                          onSelectClass(c.id);
                          onClose();
                        }}
                        className="flex-1 cursor-pointer min-w-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white truncate">{c.name}</span>
                          {isSelected && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Đang chọn
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 truncate mt-0.5">
                          {c.names.length} học sinh · {c.description || 'Chưa có mô tả'}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                          title="Đổi tên lớp"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {classes.length > 1 && (
                          <button
                            onClick={() => onDeleteClass(c.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                            title="Xóa lớp này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={onResetToDefaults}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
            title="Khôi phục các lớp mặc định ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mẫu ban đầu</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
