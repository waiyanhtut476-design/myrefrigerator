import React, { useState } from 'react';
import { 
  Plus, Check, Trash2, Edit3, ShoppingCart, 
  Sparkles, Refrigerator, RefreshCw, Minus, AlertCircle
} from 'lucide-react';
import { PantryItem, ShoppingItem } from '../../types';
import { CATEGORY_STYLES, getFreshness } from '../../utils/storage';
import { AddShoppingModal } from './AddShoppingModal';
import { TransferToPantryModal } from './TransferToPantryModal';
import { ConfirmModal } from '../ConfirmModal';

interface ShoppingPageProps {
  items: ShoppingItem[];
  pantryItems: PantryItem[];
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => Promise<void> | void;
  onUpdateItem: (item: ShoppingItem) => Promise<void> | void;
  onToggleItem: (id: string) => Promise<void> | void;
  onDeleteItem: (id: string) => Promise<void> | void;
  onAutoAddDepleted: () => number | Promise<number>;
  onTransferToPantry: (transferredItems: Omit<PantryItem, 'id'>[], completedShoppingIds: string[]) => Promise<void> | void;
}

const normalize = (str: string) => str.trim().toLowerCase();

export const ShoppingPage: React.FC<ShoppingPageProps> = ({
  items,
  pantryItems,
  onAddItem,
  onUpdateItem,
  onToggleItem,
  onDeleteItem,
  onAutoAddDepleted,
  onTransferToPantry,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ShoppingItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const pendingItems = items.filter((i) => !i.checked);
  const checkedItems = items.filter((i) => i.checked);

  // Count depleted/expired items in pantry that are not yet in shopping list
  const depletedPantryItems = pantryItems.filter((p) => {
    const freshness = getFreshness(p.expiry);
    const isZero = p.qty <= 0;
    const isExpired = freshness.type === 'expired';
    if (!isZero && !isExpired) return false;

    // Check if not already in shopping list
    const inShopping = items.some((s) => normalize(s.name) === normalize(p.name));
    return !inShopping;
  });

  const handleAutoAdd = async () => {
    try {
      const count = await onAutoAddDepleted();
      if (count > 0) {
        showToast(`บันทึกแล้ว: ดึงของที่หมด/หมดอายุ ${count} รายการลงรายการซื้อแล้ว`);
      } else {
        showToast('ไม่มีของที่หมดหรือหมดอายุใหม่ในตู้เย็น');
      }
    } catch (err: any) {
      showToast(`ผิดพลาด: ${err.message || 'ไม่สามารถดึงข้อมูลได้'}`, true);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ShoppingItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (data: Omit<ShoppingItem, 'id' | 'checked'> & { id?: string }) => {
    try {
      if (data.id) {
        const existing = items.find((i) => i.id === data.id);
        if (existing) {
          await onUpdateItem({
            ...existing,
            ...data,
          });
          showToast(`บันทึกแล้ว: แก้ไข "${data.name}" เรียบร้อย`);
        }
      } else {
        await onAddItem(data);
        showToast(`บันทึกแล้ว: เพิ่ม "${data.name}" ลงในรายการซื้อ`);
      }
    } catch (err: any) {
      showToast(`ผิดพลาด: ${err.message || 'ไม่สามารถบันทึกได้'}`, true);
    }
  };

  const handleQtyChange = async (item: ShoppingItem, delta: number) => {
    try {
      const newQty = Math.max(1, (item.qty || 1) + delta);
      await onUpdateItem({ ...item, qty: newQty });
      showToast(`บันทึกแล้ว: ${item.name} = ${newQty} ${item.unit}`);
    } catch (err: any) {
      showToast(`ผิดพลาด: ${err.message || 'ไม่สามารถปรับจำนวนได้'}`, true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await onDeleteItem(itemToDelete.id);
      showToast(`บันทึกแล้ว: ลบ "${itemToDelete.name}" ออกจากรายการซื้อแล้ว`);
    } catch (err: any) {
      showToast(`ผิดพลาด: ${err.message || 'ไม่สามารถลบได้'}`, true);
    } finally {
      setItemToDelete(null);
    }
  };

  const handleSaveTransfer = async (transferred: Omit<PantryItem, 'id'>[], completedIds: string[]) => {
    try {
      await onTransferToPantry(transferred, completedIds);
      showToast(`บันทึกแล้ว: นำเข้าของที่ซื้อ ${transferred.length} รายการเข้าตู้เย็นเรียบร้อย!`);
    } catch (err: any) {
      showToast(`ผิดพลาด: ${err.message || 'ไม่สามารถนำเข้าตู้เย็นได้'}`, true);
    }
  };

  return (
    <div className="pb-24 pt-2 max-w-md mx-auto px-4 space-y-4">
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

      {/* 1. Auto-Add Depleted / Expired Items Banner */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white p-4 rounded-3xl shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/20 rounded-xl">
              <Sparkles className="w-4 h-4 text-amber-100" />
            </span>
            <h3 className="text-sm font-bold">เพิ่มอัตโนมัติจากตู้เย็น</h3>
          </div>
          {depletedPantryItems.length > 0 && (
            <span className="text-[11px] bg-white/25 px-2.5 py-0.5 rounded-full font-bold">
              ตรวจพบ {depletedPantryItems.length} รายการ
            </span>
          )}
        </div>

        <p className="text-xs text-amber-50 leading-relaxed">
          ตรวจจับวัตถุดิบที่มีจำนวน = 0 หรือหมดอายุแล้ว เพื่อเพิ่มเข้าลิสต์ซื้อของทันที
        </p>

        <button
          onClick={handleAutoAdd}
          className="w-full min-h-[44px] py-2.5 px-4 bg-white hover:bg-amber-50 active:bg-amber-100 text-amber-900 rounded-2xl font-bold text-xs shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4 text-amber-700" />
          <span>ดึงของที่หมด / หมดอายุทันที ({depletedPantryItems.length})</span>
        </button>
      </div>

      {/* 2. Top Action Bar: Add manual */}
      <button
        onClick={handleOpenAdd}
        className="w-full min-h-[48px] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-base rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span>+ เพิ่มรายการซื้อของ</span>
      </button>

      {/* 3. Section: Pending Items to Buy */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            รายการที่ต้องซื้อ ({pendingItems.length})
          </h4>
          <span className="text-[11px] text-stone-500 font-medium">
            (ติ๊ก ✔ เมื่อซื้อแล้ว)
          </span>
        </div>

        {pendingItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-stone-300 space-y-3">
            <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-stone-800">ไม่มีรายการที่ต้องซื้อ</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                กดปุ่มดึงของหมดจากตู้เย็น หรือกดเพิ่มรายการที่ต้องการซื้อ
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มของที่ต้องซื้อ</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingItems.map((item) => {
              const catStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES['อื่นๆ'];
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-2xs flex items-center justify-between gap-2.5 group hover:border-emerald-300 transition-all min-h-[60px]"
                >
                  {/* Toggle Checkbox Button */}
                  <button
                    onClick={() => {
                      onToggleItem(item.id);
                      showToast(`ติ๊กซื้อแล้ว: ${item.name}`);
                    }}
                    className="flex items-center gap-2.5 text-left flex-1 min-w-0 py-1"
                    aria-label={`ติ๊กซื้อแล้ว: ${item.name}`}
                  >
                    <div className="w-7 h-7 rounded-xl border-2 border-stone-300 flex items-center justify-center hover:border-emerald-500 transition-colors shrink-0 bg-stone-50">
                      {/* Unchecked */}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold border ${catStyle.badge}`}>
                          {item.category === 'ของสด' && '🥩 '}
                          {item.category === 'ผัก' && '🥬 '}
                          {item.category === 'เครื่องปรุง' && '🧂 '}
                          {item.category === 'อื่นๆ' && '🥫 '}
                          {item.category}
                        </span>
                        {item.source === 'auto-depleted' && (
                          <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-md font-bold">
                            หมดสต็อกในตู้
                          </span>
                        )}
                        {item.source === 'auto-expired' && (
                          <span className="text-[10px] text-red-800 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded-md font-bold">
                            หมดอายุในตู้
                          </span>
                        )}
                      </div>
                      <h5 className="text-sm font-bold text-stone-900 truncate leading-snug">
                        {item.name}
                      </h5>
                    </div>
                  </button>

                  {/* ➖ ➕ Stepper for Shopping Item */}
                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0">
                    <button
                      onClick={() => handleQtyChange(item, -1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-stone-800 hover:bg-stone-200 active:scale-90 border border-stone-200 text-xs font-bold shadow-2xs"
                      title="ลดจำนวน"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold px-1.5 text-stone-800 min-w-[38px] text-center">
                      {item.qty} <span className="text-[10px] text-stone-500 font-normal">{item.unit}</span>
                    </span>
                    <button
                      onClick={() => handleQtyChange(item, 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 active:scale-90 text-xs font-bold shadow-2xs"
                      title="เพิ่มจำนวน"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="w-9 h-9 flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors border border-stone-200"
                      title="แก้ไขรายการ"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="w-9 h-9 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-red-200"
                      title="ลบรายการนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Section: Checked Items (ซื้อแล้ว) */}
      {checkedItems.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-stone-200">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>✔ ซื้อแล้ว ({checkedItems.length} รายการ)</span>
            </h4>
            <span className="text-[11px] text-stone-400">แตะเพื่อยกเลิกการติ๊ก</span>
          </div>

          {/* Action: "ซื้อครบแล้ว" ส่งของเข้าตู้เย็น */}
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="w-full min-h-[48px] py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl font-bold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Refrigerator className="w-5 h-5" />
            <span>ซื้อครบแล้ว → ส่งเข้าตู้เย็น ({checkedItems.length} ชิ้น)</span>
          </button>

          {/* Checked Items List */}
          <div className="space-y-2 opacity-85">
            {checkedItems.map((item) => (
              <div
                key={item.id}
                className="bg-emerald-50/50 rounded-2xl p-3 border border-emerald-200 flex items-center justify-between gap-3 min-h-[50px]"
              >
                <button
                  onClick={() => {
                    onToggleItem(item.id);
                    showToast(`ยกเลิกติ๊ก: ${item.name}`);
                  }}
                  className="flex items-center gap-3 text-left flex-1 min-w-0"
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-stone-600 line-through truncate block">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {item.qty} {item.unit}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setItemToDelete(item)}
                  className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-xl"
                  title="ลบ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddShoppingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveModal}
        existingItems={items}
        initialItem={editingItem}
      />

      {/* Transfer to Pantry Modal */}
      <TransferToPantryModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        checkedItems={checkedItems}
        existingPantryItems={pantryItems}
        onConfirmTransfer={handleSaveTransfer}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="ยืนยันการลบรายการซื้อ"
        message={`ต้องการลบ "${itemToDelete?.name}" ออกจากรายการซื้อของใช่หรือไม่?`}
        confirmText="ลบรายการ"
        cancelText="ยกเลิก"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
