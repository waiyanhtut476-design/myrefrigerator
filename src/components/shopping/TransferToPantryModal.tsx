import React, { useState, useEffect } from 'react';
import { X, Calendar, Refrigerator, Check, Plus, Minus, Tag } from 'lucide-react';
import { Category, PantryItem, ShoppingItem } from '../../types';
import { CATEGORIES, getFutureDateString } from '../../utils/storage';

interface TransferItemState {
  shoppingId: string;
  name: string;
  qty: number;
  unit: string;
  category: Category;
  expiry: string;
  noExpiry: boolean;
}

interface TransferToPantryModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkedItems: ShoppingItem[];
  existingPantryItems: PantryItem[];
  onConfirmTransfer: (transferredItems: Omit<PantryItem, 'id'>[], completedShoppingIds: string[]) => void;
}

export const TransferToPantryModal: React.FC<TransferToPantryModalProps> = ({
  isOpen,
  onClose,
  checkedItems,
  existingPantryItems,
  onConfirmTransfer,
}) => {
  const [itemConfigs, setItemConfigs] = useState<TransferItemState[]>([]);

  useEffect(() => {
    if (isOpen && checkedItems.length > 0) {
      const initial: TransferItemState[] = checkedItems.map((item) => {
        // Check if item already exists in pantry to inherit category if possible
        const existing = existingPantryItems.find(
          (p) => p.name.trim().toLowerCase() === item.name.trim().toLowerCase()
        );
        return {
          shoppingId: item.id,
          name: item.name,
          qty: item.qty,
          unit: item.unit,
          category: existing ? existing.category : item.category,
          expiry: getFutureDateString(7), // default 7 days fresh
          noExpiry: false,
        };
      });
      setItemConfigs(initial);
    }
  }, [isOpen, checkedItems, existingPantryItems]);

  if (!isOpen || checkedItems.length === 0) return null;

  const handleUpdateItem = (index: number, field: keyof TransferItemState, value: any) => {
    const updated = [...itemConfigs];
    updated[index] = { ...updated[index], [field]: value };
    setItemConfigs(updated);
  };

  const handleSetExpiryShortcut = (index: number, days: number) => {
    const updated = [...itemConfigs];
    updated[index] = {
      ...updated[index],
      expiry: getFutureDateString(days),
      noExpiry: false,
    };
    setItemConfigs(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const pantryItemsToAdd: Omit<PantryItem, 'id'>[] = itemConfigs.map((cfg) => ({
      name: cfg.name.trim(),
      qty: Math.max(1, cfg.qty),
      unit: cfg.unit.trim() || 'ชิ้น',
      category: cfg.category,
      expiry: cfg.noExpiry ? '' : cfg.expiry.trim(),
    }));

    const shoppingIdsToRemove = itemConfigs.map((cfg) => cfg.shoppingId);

    onConfirmTransfer(pantryItemsToAdd, shoppingIdsToRemove);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-emerald-50/80 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Refrigerator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 leading-tight">
                นำของที่ซื้อแล้วเข้าตู้เย็น
              </h2>
              <p className="text-xs text-stone-500">
                ระบุจำนวนและวันหมดอายุ ({checkedItems.length} รายการ)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-stone-200 text-stone-700 hover:bg-stone-300 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form List of items */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-xs text-stone-600 font-medium px-1">
            ตั้งค่าวันหมดอายุและจำนวนของแต่ละชิ้นก่อนบันทึกลงตู้เย็น:
          </p>

          {itemConfigs.map((item, idx) => (
            <div
              key={item.shoppingId}
              className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3"
            >
              {/* Item Title & Category */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-stone-900">
                  {idx + 1}. {item.name}
                </span>

                <select
                  value={item.category}
                  onChange={(e) => handleUpdateItem(idx, 'category', e.target.value as Category)}
                  className="text-xs px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-700"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-stone-600">จำนวนที่ซื้อมา:</span>
                <div className="flex items-center rounded-xl border border-stone-300 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => handleUpdateItem(idx, 'qty', Math.max(1, item.qty - 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold active:scale-90"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-14 text-center font-bold text-sm text-stone-900">
                    {item.qty} {item.unit}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUpdateItem(idx, 'qty', item.qty + 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold active:scale-90"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-1.5 pt-1 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>วันหมดอายุ</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer text-xs text-stone-500">
                    <input
                      type="checkbox"
                      checked={item.noExpiry}
                      onChange={(e) => handleUpdateItem(idx, 'noExpiry', e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600"
                    />
                    <span>ไม่ระบุ</span>
                  </label>
                </div>

                {!item.noExpiry ? (
                  <div className="space-y-1.5">
                    <input
                      type="date"
                      value={item.expiry || ''}
                      onChange={(e) => handleUpdateItem(idx, 'expiry', e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium min-h-[44px]"
                    />
                    <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                      <button
                        type="button"
                        onClick={() => handleSetExpiryShortcut(idx, 3)}
                        className="text-[11px] px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 font-medium shrink-0"
                      >
                        +3 วัน
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetExpiryShortcut(idx, 7)}
                        className="text-[11px] px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold shrink-0"
                      >
                        +7 วัน
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetExpiryShortcut(idx, 14)}
                        className="text-[11px] px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 font-medium shrink-0"
                      >
                        +14 วัน
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetExpiryShortcut(idx, 30)}
                        className="text-[11px] px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 font-medium shrink-0"
                      >
                        +1 เดือน
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-stone-400 italic">
                    ⚪ ไม่ระบุวันหมดอายุ (แสดงแถบสีเทา)
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Submit */}
          <div className="pt-2 pb-6">
            <button
              type="submit"
              className="w-full min-h-[48px] py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>นำเข้าตู้เย็น ({itemConfigs.length} รายการ)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
