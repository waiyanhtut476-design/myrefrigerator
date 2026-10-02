import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, Minus, Tag } from 'lucide-react';
import { Category, PantryItem } from '../../types';
import { CATEGORIES, COMMON_UNITS, getFutureDateString, getTodayString } from '../../utils/storage';

interface PantryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<PantryItem, 'id'> & { id?: string }) => void;
  initialItem?: PantryItem | null;
}

export const PantryItemModal: React.FC<PantryItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
}) => {
  const [name, setName] = useState('');
  const [qty, setQty] = useState<number>(1);
  const [unit, setUnit] = useState('ชิ้น');
  const [category, setCategory] = useState<Category>('ของสด');
  const [expiry, setExpiry] = useState<string>(getFutureDateString(7));
  const [noExpiry, setNoExpiry] = useState<boolean>(false);
  const [customUnit, setCustomUnit] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setQty(initialItem.qty);
      setUnit(initialItem.unit);
      setCategory(initialItem.category);
      if (initialItem.expiry) {
        setExpiry(initialItem.expiry);
        setNoExpiry(false);
      } else {
        setExpiry('');
        setNoExpiry(true);
      }
    } else {
      setName('');
      setQty(1);
      setUnit('ชิ้น');
      setCategory('ของสด');
      setExpiry(getFutureDateString(7));
      setNoExpiry(false);
      setCustomUnit(false);
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...(initialItem ? { id: initialItem.id } : {}),
      name: name.trim(),
      qty: Math.max(0, qty),
      unit: unit.trim() || 'ชิ้น',
      category,
      expiry: noExpiry ? '' : expiry.trim(),
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
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <h2 className="text-lg font-bold text-stone-900">
            {initialItem ? '✏️ แก้ไขวัตถุดิบ' : '➕ เพิ่มวัตถุดิบเข้าตู้เย็น'}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-200 text-stone-700 hover:bg-stone-300 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 1. Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700">
              ชื่อวัตถุดิบ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus={!initialItem}
              value={name || ''}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ไข่ไก่, หมูสับ, ผักกาดขาว"
              className="w-full text-base px-3.5 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white placeholder-stone-400 font-medium"
            />
          </div>

          {/* 2. Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">จำนวน</label>
              <div className="flex items-center rounded-2xl border border-stone-300 bg-white overflow-hidden p-1">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(0, Number(((qty || 0) - ((qty || 0) > 10 ? 5 : 1)).toFixed(1))))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 active:scale-90 font-bold text-lg"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={qty ?? 0}
                  onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
                  className="w-full text-center font-bold text-base text-stone-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQty(Number(((qty || 0) + ((qty || 0) >= 10 ? 5 : 1)).toFixed(1)))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 active:scale-90 font-bold text-lg"
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
                  className="w-full text-sm px-3.5 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                >
                  {COMMON_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                  <option value="other">+ พิมพ์ระบุเอง</option>
                </select>
              ) : (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={unit || ''}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="พิมพ์หน่วย"
                    className="w-full text-sm px-3 py-2.5 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomUnit(false)}
                    className="text-xs px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-700"
                  >
                    เลือก
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 3. Category: ของสด / ผัก / เครื่องปรุง / อื่นๆ */}
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
                    className={`py-2.5 px-3 rounded-2xl border text-sm font-bold transition-all text-center ${
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

          {/* 4. Expiry Date */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span>วันหมดอายุ</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-stone-500 hover:text-stone-700">
                <input
                  type="checkbox"
                  checked={!!noExpiry}
                  onChange={(e) => {
                    setNoExpiry(e.target.checked);
                    if (!e.target.checked && !expiry) {
                      setExpiry(getFutureDateString(7));
                    }
                  }}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>ไม่ระบุวันหมดอายุ</span>
              </label>
            </div>

            {!noExpiry ? (
              <>
                <input
                  type="date"
                  value={expiry || ''}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full text-base px-3.5 py-2.5 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                />
                {/* Quick date shortcuts */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
                  <button
                    type="button"
                    onClick={() => setExpiry(getFutureDateString(2))}
                    className="shrink-0 text-xs px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                  >
                    +2 วัน
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiry(getFutureDateString(5))}
                    className="shrink-0 text-xs px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                  >
                    +5 วัน
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiry(getFutureDateString(7))}
                    className="shrink-0 text-xs px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                  >
                    +7 วัน
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiry(getFutureDateString(14))}
                    className="shrink-0 text-xs px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                  >
                    +14 วัน
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiry(getFutureDateString(30))}
                    className="shrink-0 text-xs px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                  >
                    +1 เดือน
                  </button>
                </div>
              </>
            ) : (
              <div className="p-3 bg-stone-100 rounded-2xl text-xs text-stone-500 text-center">
                ⚪ แสดงแถบสีเทา (ไม่มีการแจ้งเตือนวันหมดอายุ)
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-3 pb-6">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {initialItem ? 'บันทึกการแก้ไข' : '➕ เพิ่มเข้าตู้เย็น'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
