import React, { useState, useMemo } from 'react';
import { TabType, PantryItem, Recipe, ShoppingItem } from './types';
import { usePantry } from './hooks/usePantry';
import { useRecipes } from './hooks/useRecipes';
import { useShopping } from './hooks/useShopping';
import { useMigration } from './hooks/useMigration';
import { BottomNav } from './components/BottomNav';
import { PantryPage } from './components/pantry/PantryPage';
import { RecipesPage } from './components/recipes/RecipesPage';
import { CookablePage } from './components/cookable/CookablePage';
import { ShoppingPage } from './components/shopping/ShoppingPage';
import { 
  Cloud, CloudUpload, Loader2, AlertCircle, 
  Check, RefreshCw, Sparkles 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('pantry');

  // Firebase Custom Hooks replacing localStorage
  const {
    items: pantryItems,
    loading: pantryLoading,
    error: pantryError,
    addItem: handleAddPantryItem,
    updateItem: handleUpdatePantryItem,
    deleteItem: handleDeletePantryItem,
    cookRecipeDeduct: handleCookRecipe,
  } = usePantry();

  const {
    recipes,
    loading: recipesLoading,
    error: recipesError,
    addRecipe: handleAddRecipe,
    updateRecipe: handleUpdateRecipe,
    deleteRecipe: handleDeleteRecipe,
  } = useRecipes();

  const {
    items: shoppingItems,
    loading: shoppingLoading,
    error: shoppingError,
    addItem: handleAddShoppingItem,
    updateItem: handleUpdateShoppingItem,
    toggleItem: handleToggleShoppingItem,
    deleteItem: handleDeleteShoppingItem,
    autoAddDepleted,
    transferToPantry,
  } = useShopping();

  // One-time local to Firebase migration
  const {
    hasLocalDataToMigrate,
    isMigrating,
    migrationSuccess,
    migrateLocalToFirebase,
  } = useMigration();

  const isLoading = pantryLoading || recipesLoading || shoppingLoading;
  const globalError = pantryError || recipesError || shoppingError;

  // Unchecked shopping items count for badge
  const pendingShoppingCount = useMemo(() => {
    return shoppingItems.filter((i) => !i.checked).length;
  }, [shoppingItems]);

  const handleAutoAddShopping = async () => {
    return await autoAddDepleted(pantryItems);
  };

  const handleTransferPurchased = async (
    transferred: Omit<PantryItem, 'id'>[],
    completedIds: string[]
  ) => {
    await transferToPantry(transferred, completedIds, pantryItems);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-between font-sans text-stone-900">
      {/* App Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 py-3 shadow-2xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">
              {activeTab === 'pantry' && '🧊'}
              {activeTab === 'recipes' && '📖'}
              {activeTab === 'cookable' && '🍳'}
              {activeTab === 'shopping' && '🛒'}
            </span>
            <div>
              <h1 className="text-lg font-bold text-stone-900 tracking-tight leading-tight">
                {activeTab === 'pantry' && 'ตู้เย็นของฉัน'}
                {activeTab === 'recipes' && 'คลังสูตรอาหาร'}
                {activeTab === 'cookable' && 'ทำอะไรได้'}
                {activeTab === 'shopping' && 'รายการซื้อของ'}
              </h1>
              <p className="text-xs text-stone-500 font-normal">
                {activeTab === 'pantry' && `${pantryItems.length} รายการในตู้เย็น`}
                {activeTab === 'recipes' && `${recipes.length} สูตรอาหารทั้งหมด`}
                {activeTab === 'cookable' && 'เมนูแนะนำจากของที่มีจริงในตู้'}
                {activeTab === 'shopping' && `${pendingShoppingCount} รายการที่ต้องซื้อ`}
              </p>
            </div>
          </div>

          {/* Firebase Status Badge */}
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-800">
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firestore</span>
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 w-full max-w-md mx-auto pt-3 space-y-3">
        {/* Migration Banner (One-time only if local data is detected) */}
        {hasLocalDataToMigrate && (
          <div className="mx-4 p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h3 className="text-sm font-bold">พบข้อมูลเดิมในเครื่องนี้</h3>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed">
              คุณมีรายการวัตถุดิบ/สูตรเดิมในเครื่อง ต้องการย้ายขึ้น Firebase Firestore หรือไม่?
            </p>
            <button
              onClick={migrateLocalToFirebase}
              disabled={isMigrating}
              className="w-full min-h-[44px] py-2.5 px-4 bg-white hover:bg-emerald-50 text-emerald-900 rounded-2xl font-bold text-xs shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isMigrating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                  <span>กำลังย้ายข้อมูลขึ้น Firestore...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4 text-emerald-700" />
                  <span>ย้ายข้อมูลเดิมขึ้น Firebase (ครั้งเดียว)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Migration Success Toast */}
        {migrationSuccess && (
          <div className="mx-4 p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>ย้ายข้อมูลเดิมขึ้น Firebase Firestore เรียบร้อยแล้ว!</span>
          </div>
        )}

        {/* Connection Error Message */}
        {globalError && (
          <div className="mx-4 p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 flex-1">
              <p className="font-bold">{globalError}</p>
              <p className="text-[11px] text-amber-700">
                ระบบเปิดใช้โหมดแคชออฟไลน์ (Offline Persistence) ใช้งานต่อได้ต่อเนื่องและจะซิงค์อัตโนมัติเมื่อเชื่อมต่อได้
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-stone-500">
              กำลังโหลดข้อมูลจาก Firebase Firestore...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'pantry' && (
              <PantryPage
                items={pantryItems}
                onAddItem={handleAddPantryItem}
                onUpdateItem={handleUpdatePantryItem}
                onDeleteItem={handleDeletePantryItem}
              />
            )}

            {activeTab === 'recipes' && (
              <RecipesPage
                recipes={recipes}
                onAddRecipe={handleAddRecipe}
                onUpdateRecipe={handleUpdateRecipe}
                onDeleteRecipe={handleDeleteRecipe}
              />
            )}

            {activeTab === 'cookable' && (
              <CookablePage
                recipes={recipes}
                pantryItems={pantryItems}
                onCookRecipe={handleCookRecipe}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'shopping' && (
              <ShoppingPage
                items={shoppingItems}
                pantryItems={pantryItems}
                onAddItem={handleAddShoppingItem}
                onUpdateItem={handleUpdateShoppingItem}
                onToggleItem={handleToggleShoppingItem}
                onDeleteItem={handleDeleteShoppingItem}
                onAutoAddDepleted={handleAutoAddShopping}
                onTransferToPantry={handleTransferPurchased}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pantryCount={pantryItems.length}
        shoppingCount={pendingShoppingCount}
      />
    </div>
  );
}
