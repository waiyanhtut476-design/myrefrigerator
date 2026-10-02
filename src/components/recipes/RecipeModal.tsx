import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, BookOpen, Utensils, ListOrdered } from 'lucide-react';
import { Recipe, RecipeIngredient } from '../../types';
import { COMMON_UNITS } from '../../utils/storage';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Omit<Recipe, 'id'> & { id?: string }) => void;
  initialRecipe?: Recipe | null;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRecipe,
}) => {
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { name: '', qty: 1, unit: 'ชิ้น' },
  ]);
  const [steps, setSteps] = useState<string[]>(['']);

  useEffect(() => {
    if (initialRecipe) {
      setName(initialRecipe.name);
      setIngredients(
        initialRecipe.ingredients && initialRecipe.ingredients.length > 0
          ? initialRecipe.ingredients
          : [{ name: '', qty: 1, unit: 'ชิ้น' }]
      );
      setSteps(
        initialRecipe.steps && initialRecipe.steps.length > 0
          ? initialRecipe.steps
          : ['']
      );
    } else {
      setName('');
      setIngredients([
        { name: '', qty: 2, unit: 'ฟอง' },
        { name: '', qty: 1, unit: 'ช้อนชา' },
      ]);
      setSteps(['', '']);
    }
  }, [initialRecipe, isOpen]);

  if (!isOpen) return null;

  // Ingredient rows operations
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', qty: 1, unit: 'ชิ้น' }]);
  };

  const handleUpdateIngredient = (index: number, field: keyof RecipeIngredient, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // Step rows operations
  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleUpdateStep = (index: number, text: string) => {
    const updated = [...steps];
    updated[index] = text;
    setSteps(updated);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Filter out empty ingredients and steps
    const validIngredients = ingredients
      .map((ing) => ({
        name: ing.name.trim(),
        qty: Math.max(0, Number(ing.qty) || 1),
        unit: ing.unit.trim() || 'ชิ้น',
      }))
      .filter((ing) => ing.name.length > 0);

    const validSteps = steps
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    onSave({
      ...(initialRecipe ? { id: initialRecipe.id } : {}),
      name: name.trim(),
      ingredients: validIngredients.length > 0 ? validIngredients : [{ name: 'วัตถุดิบหลัก', qty: 1, unit: 'ชิ้น' }],
      steps: validSteps.length > 0 ? validSteps : ['ปรุงตามขั้นตอนที่ต้องการ'],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <h2 className="text-lg font-bold text-stone-900">
              {initialRecipe ? 'แก้ไขสูตรอาหาร' : 'สร้างสูตรอาหารใหม่'}
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-200 text-stone-700 hover:bg-stone-300 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 1. Recipe Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
              <Utensils className="w-3.5 h-3.5 text-stone-500" />
              <span>ชื่อเมนูอาหาร <span className="text-red-500">*</span></span>
            </label>
            <input
              type="text"
              required
              autoFocus={!initialRecipe}
              value={name || ''}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ไข่เจียว, ผัดกะเพราหมูสับ, แกงจืด"
              className="w-full text-base px-3.5 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white placeholder-stone-400 font-bold"
            />
          </div>

          {/* 2. Ingredients Section (Dynamic Rows: ชื่อ + จำนวน + หน่วย) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1">
                <span>🥕 วัตถุดิบที่ใช้</span>
                <span className="text-stone-400 font-normal">({ingredients.length} อย่าง)</span>
              </label>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มแถว</span>
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-2xl border border-stone-200">
                  {/* Name */}
                  <input
                    type="text"
                    value={ing.name || ''}
                    onChange={(e) => handleUpdateIngredient(idx, 'name', e.target.value)}
                    placeholder="ชื่อวัตถุดิบ (เช่น ไข่ไก่)"
                    className="flex-3 text-xs px-2.5 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />

                  {/* Qty */}
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={ing.qty ?? 0}
                    onChange={(e) => handleUpdateIngredient(idx, 'qty', parseFloat(e.target.value) || 0)}
                    placeholder="จำนวน"
                    className="w-16 text-center text-xs px-1.5 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                  />

                  {/* Unit */}
                  <input
                    type="text"
                    value={ing.unit || ''}
                    onChange={(e) => handleUpdateIngredient(idx, 'unit', e.target.value)}
                    placeholder="หน่วย (เช่น ฟอง)"
                    className="w-20 text-xs px-2 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center font-medium"
                  />

                  {/* Remove row */}
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg active:scale-90 shrink-0"
                      title="ลบแถวนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Steps Section (Dynamic Rows: ข้อความขั้นตอน) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1">
                <ListOrdered className="w-3.5 h-3.5 text-stone-500" />
                <span>ขั้นตอนการทำ</span>
                <span className="text-stone-400 font-normal">({steps.length} ข้อ)</span>
              </label>
              <button
                type="button"
                onClick={handleAddStep}
                className="text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มข้อ</span>
              </button>
            </div>

            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {idx + 1}
                  </span>
                  <textarea
                    rows={2}
                    value={step || ''}
                    onChange={(e) => handleUpdateStep(idx, e.target.value)}
                    placeholder={`ระบุวิธีทำขั้นตอนที่ ${idx + 1}...`}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-medium"
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg active:scale-90 mt-0.5 shrink-0"
                      title="ลบขั้นตอนนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2 pb-6">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {initialRecipe ? '💾 บันทึกการแก้ไขสูตร' : '➕ บันทึกสูตรอาหาร'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
