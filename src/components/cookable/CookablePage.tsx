import React, { useState, useMemo } from 'react';
import { 
  Utensils, CheckCircle2, AlertCircle, 
  Flame, Check, ChefHat, Sparkles, BookOpen 
} from 'lucide-react';
import { PantryItem, Recipe } from '../../types';
import { getFreshness } from '../../utils/storage';
import { CookConfirmModal } from './CookConfirmModal';

interface CookablePageProps {
  recipes: Recipe[];
  pantryItems: PantryItem[];
  onCookRecipe: (recipe: Recipe) => Promise<void> | void;
  onNavigateToTab: (tab: 'pantry' | 'recipes' | 'cookable' | 'shopping') => void;
}

const normalize = (str: string) => str.trim().toLowerCase();

export const CookablePage: React.FC<CookablePageProps> = ({
  recipes,
  pantryItems,
  onCookRecipe,
  onNavigateToTab,
}) => {
  const [selectedRecipeForCook, setSelectedRecipeForCook] = useState<Recipe | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Compare pantry items against recipes
  const analyzedRecipes = useMemo(() => {
    return recipes.map((recipe) => {
      let isFullyReady = true;
      const missingList: { name: string; needed: number; available: number; unit: string }[] = [];
      const expiringItemsUsed: string[] = [];

      recipe.ingredients.forEach((ing) => {
        const ingNameNorm = normalize(ing.name);
        const pItem = pantryItems.find((p) => normalize(p.name) === ingNameNorm);

        if (!pItem || pItem.qty < ing.qty) {
          isFullyReady = false;
          missingList.push({
            name: ing.name,
            needed: ing.qty,
            available: pItem ? pItem.qty : 0,
            unit: ing.unit,
          });
        }

        // Check if this matched pantry item is yellow or red (warning/expired)
        if (pItem && pItem.qty > 0) {
          const freshness = getFreshness(pItem.expiry);
          if (freshness.type === 'warning' || freshness.type === 'expired') {
            expiringItemsUsed.push(pItem.name);
          }
        }
      });

      return {
        recipe,
        isFullyReady,
        missingList,
        expiringItemsUsed,
        hasExpiring: expiringItemsUsed.length > 0,
      };
    });
  }, [recipes, pantryItems]);

  // Group 1: ✅ ทำได้เลย (ของครบและจำนวนพอ)
  // Sort rule: เมนูที่ "ช่วยใช้ของใกล้หมด" เรียงขึ้นก่อน
  const readyToCook = useMemo(() => {
    return analyzedRecipes
      .filter((r) => r.isFullyReady)
      .sort((a, b) => {
        if (a.hasExpiring && !b.hasExpiring) return -1;
        if (!a.hasExpiring && b.hasExpiring) return 1;
        return a.recipe.name.localeCompare(b.recipe.name, 'th');
      });
  }, [analyzedRecipes]);

  // Group 2: ⚠️ ขาดนิดหน่อย (ของไม่ครบหรือจำนวนไม่พอ)
  // Sort rule: เมนูที่ "ช่วยใช้ของใกล้หมด" เรียงขึ้นก่อน ตามด้วยจำนวนของที่ขาดน้อยสุด
  const missingSome = useMemo(() => {
    return analyzedRecipes
      .filter((r) => !r.isFullyReady)
      .sort((a, b) => {
        if (a.hasExpiring && !b.hasExpiring) return -1;
        if (!a.hasExpiring && b.hasExpiring) return 1;
        return a.missingList.length - b.missingList.length;
      });
  }, [analyzedRecipes]);

  const handleConfirmCook = async (recipe: Recipe) => {
    try {
      await onCookRecipe(recipe);
      showToast(`บันทึกแล้ว: ตัดจำนวนวัตถุดิบสำหรับ "${recipe.name}" เรียบร้อยแล้ว!`);
    } catch (err: any) {
      showToast(`ผิดพลาด: ${err.message || 'ไม่สามารถตัดจำนวนวัตถุดิบได้'}`, true);
    }
  };

  return (
    <div className="pb-24 pt-2 max-w-md mx-auto px-4 space-y-4">
      {/* Toast */}
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

      {/* Summary Banner */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/20 rounded-xl">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              วิเคราะห์จากตู้เย็นของคุณ
            </span>
          </div>
        </div>

        <h2 className="text-lg font-bold leading-tight">
          ทำอะไรกินดีตอนนี้?
        </h2>
        <p className="text-xs text-emerald-100 leading-relaxed">
          ตรวจจับวัตถุดิบและปริมาณในตู้เย็นอัตโนมัติ เพื่อแนะนำเมนูที่พร้อมปรุงทันที
        </p>
      </div>

      {/* Section 1: ✅ ทำได้เลย (ของครบและจำนวนพอ) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-base">✅</span>
            <h3 className="text-base font-bold text-stone-900">
              ทำได้เลย ({readyToCook.length} เมนู)
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            วัตถุดิบครบถ้วน
          </span>
        </div>

        {readyToCook.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-stone-300 space-y-2">
            <ChefHat className="w-8 h-8 text-stone-400 mx-auto" />
            <p className="text-xs text-stone-500 font-medium">
              ยังไม่มีเมนูที่มีวัตถุดิบครบพอดีในตู้เย็น
            </p>
            <p className="text-[11px] text-stone-400">
              ดูเมนูในกลุ่มด้านล่างที่ขาดของเพียงเล็กน้อย
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {readyToCook.map(({ recipe, expiringItemsUsed, hasExpiring }) => (
              <div
                key={recipe.id}
                className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-2xs space-y-3 relative overflow-hidden"
              >
                {/* Left green accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />

                {/* Header */}
                <div className="flex items-start justify-between gap-2 pl-1.5">
                  <div className="space-y-1">
                    {/* Badge: ช่วยใช้ของใกล้หมด */}
                    {hasExpiring && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold border border-amber-300 shadow-2xs">
                        <Flame className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                        <span>ช่วยใช้ของใกล้หมด: {expiringItemsUsed.join(', ')}</span>
                      </span>
                    )}
                    <h4 className="text-base font-bold text-stone-900 leading-snug">
                      🍲 {recipe.name}
                    </h4>
                  </div>

                  <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-emerald-500 text-white font-bold shadow-2xs">
                    ของครบ
                  </span>
                </div>

                {/* Ingredients list */}
                <div className="flex flex-wrap gap-1.5 pl-1.5">
                  {recipe.ingredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                    >
                      ✓ {ing.name} ({ing.qty} {ing.unit})
                    </span>
                  ))}
                </div>

                {/* Steps summary */}
                <div className="text-xs text-stone-500 pl-1.5 pt-1 border-t border-stone-100">
                  <span className="font-semibold">ขั้นตอนแรก:</span> {recipe.steps[0] || 'เริ่มปรุงตามสูตร'}
                </div>

                {/* Button: ทำเมนูนี้ */}
                <div className="pt-1 pl-1.5">
                  <button
                    onClick={() => setSelectedRecipeForCook(recipe)}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-2xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Utensils className="w-4 h-4 stroke-[2.5]" />
                    <span>ทำเมนูนี้ (ตัดจำนวนในตู้เย็น)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: ⚠️ ขาดนิดหน่อย (แสดงว่าขาดอะไร) */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <h3 className="text-base font-bold text-stone-900">
              ขาดนิดหน่อย ({missingSome.length} เมนู)
            </h3>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            ซื้อเพิ่มบางอย่าง
          </span>
        </div>

        {missingSome.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 border border-stone-200 text-center text-xs text-stone-400">
            ไม่มีเมนูที่ขาดวัตถุดิบ
          </div>
        ) : (
          <div className="space-y-3">
            {missingSome.map(({ recipe, missingList, expiringItemsUsed, hasExpiring }) => (
              <div
                key={recipe.id}
                className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-3 relative overflow-hidden"
              >
                {/* Left amber accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400" />

                {/* Header */}
                <div className="flex items-start justify-between gap-2 pl-1.5">
                  <div className="space-y-1">
                    {/* Badge: ช่วยใช้ของใกล้หมด */}
                    {hasExpiring && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold border border-amber-300">
                        <Flame className="w-3.5 h-3.5 text-amber-600" />
                        <span>ช่วยใช้ของใกล้หมด: {expiringItemsUsed.join(', ')}</span>
                      </span>
                    )}
                    <h4 className="text-base font-bold text-stone-900 leading-snug">
                      🍲 {recipe.name}
                    </h4>
                  </div>

                  <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                    ขาด {missingList.length} อย่าง
                  </span>
                </div>

                {/* Missing Ingredients Warning Box */}
                <div className="bg-rose-50/80 p-3 rounded-2xl border border-rose-200 text-xs space-y-1.5 pl-2.5 ml-1.5">
                  <div className="font-bold text-rose-800 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>วัตถุดิบที่ยังขาด:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {missingList.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white border border-rose-200 rounded-xl font-bold text-rose-700 shadow-2xs"
                      >
                        ✕ {m.name} (ต้องการ {m.needed} {m.unit}
                        {m.available > 0 ? ` • มีอยู่ ${m.available}` : ' • ไม่มีในตู้'})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ingredients available */}
                <div className="flex flex-wrap gap-1.5 pl-1.5">
                  {recipe.ingredients
                    .filter((ing) => !missingList.some((m) => normalize(m.name) === normalize(ing.name)))
                    .map((ing, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-xl bg-stone-100 text-stone-600 font-medium"
                      >
                        ✓ {ing.name} ({ing.qty} {ing.unit})
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <CookConfirmModal
        recipe={selectedRecipeForCook}
        pantryItems={pantryItems}
        isOpen={!!selectedRecipeForCook}
        onClose={() => setSelectedRecipeForCook(null)}
        onConfirm={handleConfirmCook}
      />
    </div>
  );
};
