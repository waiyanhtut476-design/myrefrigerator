import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Tag, AlertCircle } from 'lucide-react';
import { Category, ShoppingItem } from '../../types';
import { CATEGORIES, COMMON_UNITS } from '../../utils/storage';

interface AddShoppingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<ShoppingItem, 'id' | 'checked'> & { id?: string }) => void;
  existingItems: ShoppingItem[];
  initialItem?: ShoppingItem | null;
}

const normalize = (str: string) => str.trim().toLowerCase();

export const AddShoppingModal: React.FC<AddShoppingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingItems,
  initialItem,
}) => {
  const [name, setName] = useState('');
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState('ชิ้น');
  const [category, setCategory] = useState<Category>('ของสด');
  const [customUnit, setCustomUnit] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setQty(initialItem.qty || 1);
      setUnit(initialItem.unit || 'ชิ้น');
      setCategory(initialItem.category || 'ของสด');
      setCustomUnit(!COMMON_UNITS.includes(initialItem.unit || ''));
      setErrorMsg(null);
    } else {
      setName('');
      setQty(1);
      setUnit('ชิ้น');
      setCategory('ของสด');
      setCustomUnit(false);
      setErrorMsg(null);
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    // Check duplicate name (excluding currently edited item)
    const isDuplicate = existingItems.some(
      (item) => item.id !== initialItem?.id && normalize(item.name) === normalize(trimmed)
    );

    if (isDuplicate) {
      setErrorMsg(`มี "${trimmed}" อยู่ในรายการซื้อของแล้ว`);
      return;
    }

    onSave({
      ...(initialItem ? { id: initialItem.id } : {}),
      name: trimmed,
      qty: Math.max(1, qty),
      unit: unit.trim() || 'ชิ้น',
      category,
      source: initialItem?.source || 'manual',
    });

    setName('');
    setQty(1);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <h2 className="text-lg font-bold text-stone-900">
              {initialItem ? '✏️ แก้ไขรายการซื้อของ' : '➕ เพิ่มรายการซื้อของ'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-stone-200 text-stone-700 hover:bg-stone-300 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Duplicate Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700 font-bold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700">
              ชื่อสินค้า / วัตถุดิบ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus={!initialItem}
              value={name || ''}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="เช่น หมูสามชั้น, กะเพรา, ซอสหอย"
              className="w-full text-base px-3.5 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white min-h-[48px] font-medium"
            />
          </div>

          {/* Qty & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">จำนวน</label>
              <div className="flex items-center rounded-2xl border border-stone-300 bg-white p-1 min-h-[48px]">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, (qty || 1) - ((qty || 1) > 10 ? 5 : 1)))}
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 active:scale-90 font-bold"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={qty ?? 1}
                  onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full text-center font-bold text-base focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQty((qty || 1) + ((qty || 1) >= 10 ? 5 : 1))}
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 active:scale-90 font-bold"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">หน่วย</label>
              {!customUnit ? (
                <select
                  value={COMMON_UNITS.includes(unit || '') ? (unit || 'ชิ้น') : 'other'}
                  onChange={(e) => {
                    if (e.target.value === 'other') {
                      setCustomUnit(true);
                      setUnit('');
                    } else {
                      setUnit(e.target.value);
                    }
                  }}
                  className="w-full text-sm px-3.5 py-3 rounded-2xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[48px] font-medium"
                >
                  {COMMON_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                  <option value="other">+ พิมพ์ระบุเอง</option>
                </select>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={unit || ''}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="พิมพ์หน่วย"
                    className="w-full text-sm px-3 py-2.5 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white min-h-[48px]"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomUnit(false)}
                    className="min-h-[48px] px-3 bg-stone-100 hover:bg-stone-200 rounded-2xl text-xs font-bold text-stone-700"
                  >
                    เลือก
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-stone-500" />
              <span>หมวดหมู่</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`min-h-[44px] py-2.5 px-3 rounded-2xl border text-sm font-bold transition-all text-center ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {cat === 'ของสด' && '🥩 '}
                    {cat === 'ผัก' && '🥬 '}
                    {cat === 'เครื่องปรุง' && '🧂 '}
                    {cat === 'อื่นๆ' && '🥫 '}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2 pb-6">
            <button
              type="submit"
              className="w-full min-h-[48px] py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {initialItem ? '💾 บันทึกการแก้ไข' : '+ เพิ่มในรายการซื้อ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
