import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'ยืนยันการทำรายการ',
  message,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            isDestructive ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
          }`}>
            {isDestructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-bold text-stone-900">{title}</h3>
            <p className="text-xs text-stone-600 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] py-2.5 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs active:scale-95 transition-all"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`min-h-[44px] py-2.5 px-4 rounded-2xl text-white font-bold text-xs active:scale-95 transition-all shadow-xs ${
              isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
