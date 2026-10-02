import React from 'react';
import { X, Utensils, AlertTriangle, Check, ArrowRight } from 'lucide-react';
import { PantryItem, Recipe } from '../../types';

interface CookConfirmModalProps {
  recipe: Recipe | null;
  pantryItems: PantryItem[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (recipe: Recipe) => void;
}

const normalize = (str: string) => str.trim().toLowerCase();

export const CookConfirmModal: React.FC<CookConfirmModalProps> = ({
  recipe,
  pantryItems,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !recipe) return null;

  // Calculate deductions
  const deductions = recipe.ingredients.map((ing) => {
    const pItem = pantryItems.find((p) => normalize(p.name) === normalize(ing.name));
    const currentQty = pItem ? pItem.qty : 0;
    const unit = pItem ? pItem.unit : ing.unit;
    const newQty = Math.max(0, Number((currentQty - ing.qty).toFixed(1)));

    return {
      name: ing.name,
      usedQty: ing.qty,
      usedUnit: ing.unit,
      currentQty,
      newQty,
      unit,
      hasItem: !!pItem,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-emerald-50/80 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                ยืนยันทำเมนู "{recipe.name}"
              </h3>
              <p className="text-xs text-stone-500">
                ระบบจะตัดจำนวนวัตถุดิบในตู้เย็นตามสูตร
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/80 text-stone-600 flex items-center justify-center hover:bg-stone-300 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content: List of deductions */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="text-xs font-bold text-stone-700">
            วัตถุดิบที่จะถูกหักออกจากตู้เย็น:
          </div>

          <div className="space-y-2">
            {deductions.map((d, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-stone-900">{d.name}</span>
                  <p className="text-[11px] text-stone-500">
                    ใช้ {d.usedQty} {d.usedUnit}
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-stone-500">{d.currentQty}</span>
                    <ArrowRight className="w-3 h-3 text-stone-400" />
                    <span className={d.newQty === 0 ? 'text-red-600' : 'text-emerald-700'}>
                      {d.newQty} {d.unit}
                    </span>
                  </div>
                  {d.newQty === 0 && (
                    <span className="text-[10px] text-red-500 font-medium">
                      (หมดสต็อกพอดี)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>จำนวนในตู้เย็นจะไม่ติดลบ หากมีไม่พอจะถูกปรับเป็น 0</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/70 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl bg-white border border-stone-300 text-stone-700 font-bold text-sm hover:bg-stone-100 active:scale-95 transition-all"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => {
              onConfirm(recipe);
              onClose();
            }}
            className="flex-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>ยืนยันทำเมนูนี้</span>
          </button>
        </div>
      </div>
    </div>
  );
};
