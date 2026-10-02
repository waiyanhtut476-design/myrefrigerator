import React, { useState, useMemo } from 'react';
import { Plus, Search, BookOpen, Edit3, Trash2, Check, ArrowRight, AlertCircle } from 'lucide-react';
import { Recipe } from '../../types';
import { RecipeModal } from './RecipeModal';
import { RecipeDetailModal } from './RecipeDetailModal';
import { ConfirmModal } from '../ConfirmModal';

interface RecipesPageProps {
  recipes: Recipe[];
  onAddRecipe: (recipe: Omit<Recipe, 'id'>) => Promise<void> | void;
  onUpdateRecipe: (recipe: Recipe) => Promise<void> | void;
  onDeleteRecipe: (id: string) => Promise<void> | void;
}

export const RecipesPage: React.FC<RecipesPageProps> = ({
  recipes,
  onAddRecipe,
  onUpdateRecipe,
  onDeleteRecipe,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Filter recipes by menu name
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return recipes;
    const q = searchQuery.toLowerCase().trim();
    return recipes.filter((r) => r.name.toLowerCase().includes(q));
  }, [recipes, searchQuery]);

  const handleOpenAdd = () => {
    setEditingRecipe(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (recipe: Recipe, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleDeletePrompt = (recipe: Recipe, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRecipeToDelete(recipe);
  };

  const handleConfirmDelete = async () => {
    if (!recipeToDelete) return;
    try {
      await onDeleteRecipe(recipeToDelete.id);
      showToast(`บันทึกแล้ว: ลบสูตร "${recipeToDelete.name}" แล้ว`);
    } catch (err: any) {
      showToast(`ผิดพลาด: ${err.message || 'ไม่สามารถลบสูตรได้'}`, true);
    } finally {
      setRecipeToDelete(null);
    }
  };

  const handleSaveModal = async (data: Omit<Recipe, 'id'> & { id?: string }) => {
    try {
      if (data.id) {
        const existing = recipes.find((r) => r.id === data.id);
        if (existing) {
          await onUpdateRecipe({
            ...existing,
            ...data,
          });
          showToast(`บันทึกแล้ว: แก้ไขสูตร "${data.name}" เรียบร้อย`);
        }
      } else {
        await onAddRecipe(data);
        showToast(`บันทึกแล้ว: เพิ่มสูตร "${data.name}" ลงคลังแล้ว`);
      }
    } catch (err: any) {
      showToast(`ผิดพลาด: ${err.message || 'ไม่สามารถบันทึกสูตรได้'}`, true);
    }
  };

  return (
    <div className="pb-24 pt-2 max-w-md mx-auto px-4 space-y-3.5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 text-white text-xs px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in ${
          toastMessage.isError ? 'bg-red-600' : 'bg-stone-900/90'
        }`}>
          {toastMessage.isError ? (
            <AlertCircle className="w-4 h-4 text-white" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. Main Add Button */}
      <button
        onClick={handleOpenAdd}
        className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-base rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span>+ เพิ่มสูตรอาหาร</span>
      </button>

      {/* 2. Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery || ''}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาชื่อเมนูอาหาร..."
          className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 bg-stone-100 rounded-full w-4 h-4 flex items-center justify-center"
          >
            ✕
          </button>
        )}
      </div>

      {/* List count summary */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>สูตรอาหารทั้งหมด ({filteredRecipes.length} เมนู)</span>
      </div>

      {/* 3. Recipe Cards List */}
      {filteredRecipes.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-stone-300 space-y-3">
          <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-800">ไม่พบสูตรอาหาร</h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              {searchQuery
                ? `ไม่พบสูตรที่ตรงกับคำว่า "${searchQuery}"`
                : 'เริ่มต้นสร้างคลังสูตรอาหารของคุณเลย'}
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ สร้างสูตรแรก</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => setViewingRecipe(recipe)}
              className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs hover:shadow-xs transition-all active:scale-[0.99] cursor-pointer space-y-3 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <h3 className="text-base font-bold text-stone-900 leading-snug">
                    🍲 {recipe.name}
                  </h3>
                  <p className="text-xs text-stone-500">
                    ใช้วัตถุดิบ {recipe.ingredients.length} อย่าง • {recipe.steps.length} ขั้นตอน
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleOpenEdit(recipe, e)}
                    className="p-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 active:scale-95 transition-all"
                    title="แก้ไขสูตร"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeletePrompt(recipe, e)}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 active:scale-95 transition-all"
                    title="ลบสูตร"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Ingredient pills preview */}
              <div className="flex flex-wrap gap-1.5">
                {recipe.ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 font-medium"
                  >
                    {ing.name} <span className="text-stone-400 font-normal">({ing.qty} {ing.unit})</span>
                  </span>
                ))}
              </div>

              {/* Footer CTA */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                <span className="text-stone-400 font-medium">แตะเพื่อดูขั้นตอนวิธีทำ</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span>ดูวิธีทำ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add / Edit */}
      <RecipeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecipe(null);
        }}
        onSave={handleSaveModal}
        initialRecipe={editingRecipe}
      />

      {/* Modal: View Details */}
      <RecipeDetailModal
        recipe={viewingRecipe}
        onClose={() => setViewingRecipe(null)}
        onEdit={(r) => {
          setViewingRecipe(null);
          setEditingRecipe(r);
          setIsModalOpen(true);
        }}
        onDelete={(id) => {
          const r = recipes.find((item) => item.id === id);
          if (r) {
            setViewingRecipe(null);
            setRecipeToDelete(r);
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!recipeToDelete}
        title="ยืนยันการลบสูตรอาหาร"
        message={`ต้องการลบสูตร "${recipeToDelete?.name}" ใช่หรือไม่?`}
        confirmText="ลบสูตรอาหาร"
        cancelText="ยกเลิก"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setRecipeToDelete(null)}
      />
    </div>
  );
};
