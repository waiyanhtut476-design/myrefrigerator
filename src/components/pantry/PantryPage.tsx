import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Trash2, Edit3, Check, 
  Package, AlertCircle
} from 'lucide-react';
import { Category, PantryItem } from '../../types';
import { 
  CATEGORIES, CATEGORY_STYLES, formatThaiDate, 
  getFreshness 
} from '../../utils/storage';
import { PantryItemModal } from './PantryItemModal';
import { ConfirmModal } from '../ConfirmModal';

interface PantryPageProps {
  items: PantryItem[];
  onAddItem: (item: Omit<PantryItem, 'id'>) => Promise<void> | void;
  onUpdateItem: (item: PantryItem) => Promise<void> | void;
  onDeleteItem: (id: string) => Promise<void> | void;
}

type ExpiryFilterType = 'all' | 'warning' | 'expired';

export const PantryPage: React.FC<PantryPageProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ทั้งหมด'>('ทั้งหมด');
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilterType>('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<PantryItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Quick quantity change (+ / -)
  const handleQtyChange = async (item: PantryItem, delta: number) => {
    try {
      const newQty = Math.max(0, Number(((item.qty || 0) + delta).toFixed(1)));
      await onUpdateItem({ ...item, qty: newQty });
      showToast(`บันทึกแล้ว: ปรับ "${item.name}" เป็น ${newQty} ${item.unit}`);
    } catch (err: any) {
      showToast(`ผิดพลาด: ${err.message || 'ไม่สามารถปรับจำนวนได้'}`, true);
    }
  };

  // Summary counts for "🔴 2  🟡 3  🟢 10"
  const summaryCounts = useMemo(() => {
    let expired = 0; // 🔴
    let warning = 0; // 🟡
    let fresh = 0;   // 🟢
    let none = 0;    // ⚪

    items.forEach((item) => {
      const freshness = getFreshness(item.expiry);
      if (freshness.type === 'expired') expired++;
      else if (freshness.type === 'warning') warning++;
      else if (freshness.type === 'fresh') fresh++;
      else none++;
    });

    return { expired, warning, fresh, none, total: items.length };
  }, [items]);

  // Filtered & Sorted items:
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = item.name.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          if (!matchName && !matchCat) return false;
        }

        // Category filter
        if (selectedCategory !== 'ทั้งหมด' && item.category !== selectedCategory) {
          return false;
        }

        // Expiry Filter
        const freshness = getFreshness(item.expiry);
        if (expiryFilter === 'expired' && freshness.type !== 'expired') {
          return false;
        }
        if (expiryFilter === 'warning' && freshness.type !== 'warning') {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const freshnessA = getFreshness(a.expiry);
        const freshnessB = getFreshness(b.expiry);

        if (freshnessA.days !== null && freshnessB.days !== null) {
          return freshnessA.days - freshnessB.days;
        }
        if (freshnessA.days !== null && freshnessB.days === null) {
          return -1;
        }
        if (freshnessA.days === null && freshnessB.days !== null) {
          return 1;
        }
        return a.name.localeCompare(b.name, 'th');
      });
  }, [items, searchQuery, selectedCategory, expiryFilter]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PantryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (data: Omit<PantryItem, 'id'> & { id?: string }) => {
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
        showToast(`บันทึกแล้ว: เพิ่ม "${data.name}" เข้าตู้เย็น`);
      }
    } catch (err: any) {
      showToast(`ผิดพลาด: ${err.message || 'ไม่สามารถบันทึกข้อมูลได้'}`, true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await onDeleteItem(itemToDelete.id);
      showToast(`บันทึกแล้ว: ลบ "${itemToDelete.name}" ออกจากตู้เย็นแล้ว`);
    } catch (err: any) {
      showToast(`ผิดพลาด: ${err.message || 'ไม่สามารถลบข้อมูลได้'}`, true);
    } finally {
      setItemToDelete(null);
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

      {/* 1. Summary Bar: "🔴 2  🟡 3  🟢 10" */}
      <div className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs font-semibold text-stone-500">
          <span>สถานะความสด:</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpiryFilter(expiryFilter === 'expired' ? 'all' : 'expired')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              expiryFilter === 'expired'
                ? 'bg-red-500 text-white shadow-xs'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
            title="กรองเฉพาะของหมดอายุ"
          >
            <span>🔴</span>
            <span>{summaryCounts.expired}</span>
          </button>

          <button
            onClick={() => setExpiryFilter(expiryFilter === 'warning' ? 'all' : 'warning')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              expiryFilter === 'warning'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
            title="กรองเฉพาะของใกล้หมดอายุ"
          >
            <span>🟡</span>
            <span>{summaryCounts.warning}</span>
          </button>

          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800"
            title="ของยังสด"
          >
            <span>🟢</span>
            <span>{summaryCounts.fresh}</span>
          </div>

          {summaryCounts.none > 0 && (
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-medium bg-stone-100 text-stone-600"
              title="ไม่ระบุวันหมดอายุ"
            >
              <span>⚪</span>
              <span>{summaryCounts.none}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Add Button (Big & prominent) */}
      <button
        onClick={handleOpenAdd}
        className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-base rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span>+ เพิ่มวัตถุดิบ</span>
      </button>

      {/* 3. Expiry Filter Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setExpiryFilter('all')}
          className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all text-center ${
            expiryFilter === 'all'
              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          ทั้งหมด ({summaryCounts.total})
        </button>

        <button
          onClick={() => setExpiryFilter('warning')}
          className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
            expiryFilter === 'warning'
              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
              : 'bg-white text-amber-800 border-stone-200 hover:bg-amber-50'
          }`}
        >
          <span>🟡</span>
          <span>ใกล้หมด ({summaryCounts.warning})</span>
        </button>

        <button
          onClick={() => setExpiryFilter('expired')}
          className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
            expiryFilter === 'expired'
              ? 'bg-red-500 text-white border-red-500 shadow-xs'
              : 'bg-white text-red-700 border-stone-200 hover:bg-red-50'
          }`}
        >
          <span>🔴</span>
          <span>หมดแล้ว ({summaryCounts.expired})</span>
        </button>
      </div>

      {/* 4. Search & Category Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาวัตถุดิบในตู้เย็น..."
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

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
          <button
            onClick={() => setSelectedCategory('ทั้งหมด')}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-xl border font-bold transition-all ${
              selectedCategory === 'ทั้งหมด'
                ? 'bg-stone-800 text-white border-stone-800'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            หมวดทั้งหมด
          </button>

          {CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isSelected ? 'ทั้งหมด' : cat)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-xl border font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>
                  {cat === 'ของสด' && '🥩'}
                  {cat === 'ผัก' && '🥬'}
                  {cat === 'เครื่องปรุง' && '🧂'}
                  {cat === 'อื่นๆ' && '🥫'}
                </span>
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-100 text-stone-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sorting note */}
      <div className="flex items-center justify-between text-[11px] text-stone-500 px-1 pt-1">
        <span>พบ {filteredItems.length} รายการ</span>
        <span className="text-stone-400">⚡ เรียงของใกล้หมดอายุขึ้นก่อน</span>
      </div>

      {/* Item Cards List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-stone-300 space-y-3">
          <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
            <Package className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-800">ไม่พบวัตถุดิบ</h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              {expiryFilter !== 'all' || searchQuery || selectedCategory !== 'ทั้งหมด'
                ? 'ลองเปลี่ยนเงื่อนไขตัวกรอง'
                : 'เริ่มต้นจดวัตถุดิบชิ้นแรกของคุณเลย'}
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มวัตถุดิบ</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const freshness = getFreshness(item.expiry);
            const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES['อื่นๆ'];

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden space-y-3"
              >
                {/* Freshness color bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-2 ${freshness.barColor}`}
                />

                {/* Top Row: Name, Category, Freshness status */}
                <div className="flex items-start justify-between gap-2 pl-1.5">
                  <div className="space-y-1">
                    <span className={`text-[11px] px-2 py-0.5 rounded-lg font-bold border ${style.badge}`}>
                      {item.category === 'ของสด' && '🥩 '}
                      {item.category === 'ผัก' && '🥬 '}
                      {item.category === 'เครื่องปรุง' && '🧂 '}
                      {item.category === 'อื่นๆ' && '🥫 '}
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-stone-900 leading-tight">
                      {item.name}
                    </h3>
                  </div>

                  {/* Freshness Badge */}
                  <div className="text-right shrink-0">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold shadow-2xs inline-flex items-center gap-1 ${freshness.badgeClass}`}>
                      <span>{freshness.emoji}</span>
                      <span>{freshness.label}</span>
                    </span>
                    {item.expiry && (
                      <p className="text-[10px] text-stone-400 mt-1">
                        หมด: {formatThaiDate(item.expiry)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Stepper ➖ ➕ & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 gap-2 pl-1.5">
                  {/* Stepper ➖ ➕ */}
                  <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl border border-stone-200">
                    <button
                      onClick={() => handleQtyChange(item, (item.qty || 0) > 10 ? -5 : -1)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-stone-800 hover:bg-stone-200 active:scale-90 border border-stone-200 text-sm font-bold shadow-2xs"
                      aria-label="ลดจำนวน"
                    >
                      ➖
                    </button>

                    <div className="px-2 text-center min-w-[60px]">
                      <span className="text-base font-bold text-stone-900">
                        {item.qty}
                      </span>
                      <span className="text-xs text-stone-600 ml-1 font-medium">
                        {item.unit}
                      </span>
                    </div>

                    <button
                      onClick={() => handleQtyChange(item, (item.qty || 0) >= 10 ? 5 : 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-90 text-sm font-bold shadow-2xs"
                      aria-label="เพิ่มจำนวน"
                    >
                      ➕
                    </button>
                  </div>

                  {/* Action Buttons: Edit & Delete */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 active:scale-95 transition-all"
                      title="แก้ไขวัตถุดิบ"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 active:scale-95 transition-all"
                      title="ลบวัตถุดิบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Add / Edit */}
      <PantryItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveModal}
        initialItem={editingItem}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="ยืนยันการลบวัตถุดิบ"
        message={`ต้องการลบ "${itemToDelete?.name}" ออกจากตู้เย็นใช่หรือไม่?`}
        confirmText="ลบวัตถุดิบ"
        cancelText="ยกเลิก"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
