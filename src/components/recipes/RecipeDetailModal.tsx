import React from 'react';
import { X, Edit3, Trash2, Utensils, CheckCircle2 } from 'lucide-react';
import { Recipe } from '../../types';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!recipe) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50/70 flex items-start justify-between shrink-0">
          <div className="space-y-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              📖 สูตรอาหาร
            </span>
            <h2 className="text-xl font-bold text-stone-900 leading-tight">
              {recipe.name}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(recipe)}
              className="w-9 h-9 rounded-full bg-white border border-stone-200 text-stone-700 flex items-center justify-center hover:bg-stone-100 active:scale-95 shadow-2xs"
              title="แก้ไขสูตร"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm(`ต้องการลบสูตร "${recipe.name}" ใช่หรือไม่?`)) {
                  onDelete(recipe.id);
                  onClose();
                }
              }}
              className="w-9 h-9 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center hover:bg-red-100 active:scale-95 shadow-2xs"
              title="ลบสูตร"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center hover:bg-stone-300 active:scale-95 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Ingredients list */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <span>🥕 วัตถุดิบที่ต้องใช้</span>
              <span className="text-xs font-normal text-stone-500">
                ({recipe.ingredients.length} อย่าง)
              </span>
            </h3>

            <div className="space-y-1.5">
              {recipe.ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/90 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-stone-800">{ing.name}</span>
                  </div>
                  <span className="font-bold px-2.5 py-1 bg-white border border-stone-200 rounded-xl text-stone-700">
                    {ing.qty} {ing.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cooking Steps list */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-emerald-600" />
              <span>ขั้นตอนการทำ ({recipe.steps.length} ข้อ)</span>
            </h3>

            <div className="space-y-2.5">
              {recipe.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-stone-800 leading-relaxed font-medium pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/70">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-2xl bg-stone-900 text-white font-bold text-sm shadow-xs hover:bg-stone-800 active:scale-[0.98] transition-all"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
