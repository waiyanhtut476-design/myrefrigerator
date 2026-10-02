import { Category, PantryItem, Recipe, ShoppingItem } from '../types';

export const PANTRY_STORAGE_KEY = 'pantry';
export const RECIPES_STORAGE_KEY = 'recipes';
export const SHOPPING_STORAGE_KEY = 'shopping';

export const CATEGORIES: Category[] = ['ของสด', 'ผัก', 'เครื่องปรุง', 'อื่นๆ'];

export const CATEGORY_STYLES: Record<Category, { bg: string; text: string; badge: string; border: string }> = {
  'ของสด': { bg: 'bg-rose-50', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-800 border-rose-200', border: 'border-rose-200' },
  'ผัก': { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', border: 'border-emerald-200' },
  'เครื่องปรุง': { bg: 'bg-amber-50', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-800 border-amber-200', border: 'border-amber-200' },
  'อื่นๆ': { bg: 'bg-stone-50', text: 'text-stone-700', badge: 'bg-stone-100 text-stone-800 border-stone-200', border: 'border-stone-200' },
};

export const COMMON_UNITS = ['ฟอง', 'กรัม', 'กิโลกรัม', 'ชิ้น', 'ขวด', 'แพ็ค', 'ถุง', 'กล่อง', 'มล.', 'ลิตร', 'ต้น', 'หัว', 'กำ', 'ช้อนโต๊ะ', 'ช้อนชา', 'เม็ด', 'กลีบ'];

export type FreshnessType = 'expired' | 'warning' | 'fresh' | 'none';

export interface FreshnessInfo {
  type: FreshnessType;
  color: 'red' | 'yellow' | 'green' | 'gray';
  emoji: '🔴' | '🟡' | '🟢' | '⚪';
  label: string;
  days: number | null;
  borderLeftColor: string;
  badgeClass: string;
  barColor: string;
}

export const getFreshness = (expiry?: string | null): FreshnessInfo => {
  if (!expiry || !expiry.trim()) {
    return {
      type: 'none',
      color: 'gray',
      emoji: '⚪',
      label: 'ไม่ระบุวันหมดอายุ',
      days: null,
      borderLeftColor: 'border-l-stone-400',
      badgeClass: 'bg-stone-100 text-stone-600 border border-stone-200',
      barColor: 'bg-stone-400',
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const parts = expiry.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return {
      type: 'none',
      color: 'gray',
      emoji: '⚪',
      label: 'ไม่ระบุวันหมดอายุ',
      days: null,
      borderLeftColor: 'border-l-stone-400',
      badgeClass: 'bg-stone-100 text-stone-600 border border-stone-200',
      barColor: 'bg-stone-400',
    };
  }

  const expDate = new Date(parts[0], parts[1] - 1, parts[2]).getTime();
  const diffDays = Math.round((expDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return {
      type: 'expired',
      color: 'red',
      emoji: '🔴',
      label: `หมดอายุแล้ว ${absDays} วัน`,
      days: diffDays,
      borderLeftColor: 'border-l-red-500',
      badgeClass: 'bg-red-500 text-white font-bold',
      barColor: 'bg-red-500',
    };
  }

  if (diffDays <= 3) {
    return {
      type: 'warning',
      color: 'yellow',
      emoji: '🟡',
      label: `เหลืออีก ${diffDays} วัน`,
      days: diffDays,
      borderLeftColor: 'border-l-amber-500',
      badgeClass: 'bg-amber-500 text-white font-bold',
      barColor: 'bg-amber-500',
    };
  }

  return {
    type: 'fresh',
    color: 'green',
    emoji: '🟢',
    label: `เหลืออีก ${diffDays} วัน`,
    days: diffDays,
    borderLeftColor: 'border-l-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold',
    barColor: 'bg-emerald-500',
  };
};

export const formatThaiDate = (dateStr?: string): string => {
  if (!dateStr) return 'ไม่ระบุ';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10) + 543;
  const monthNames = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const month = monthNames[parseInt(parts[1], 10) - 1] || parts[1];
  const day = parseInt(parts[2], 10);
  return `${day} ${month} ${year.toString().slice(-2)}`;
};

export const getFutureDateString = (daysToAdd: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysToAdd);
  return d.toISOString().split('T')[0];
};

export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

const initialPantry: PantryItem[] = [
  { id: '1', name: 'ไข่ไก่', qty: 6, unit: 'ฟอง', category: 'ของสด', expiry: getFutureDateString(2) },
  { id: '2', name: 'หมูสับ', qty: 300, unit: 'กรัม', category: 'ของสด', expiry: getFutureDateString(1) },
  { id: '3', name: 'กะหล่ำปลี', qty: 1, unit: 'หัว', category: 'ผัก', expiry: getFutureDateString(6) },
  { id: '4', name: 'ใบกะเพรา', qty: 1, unit: 'กำ', category: 'ผัก', expiry: getFutureDateString(2) },
  { id: '5', name: 'ซอสหอยนางรม', qty: 1, unit: 'ขวด', category: 'เครื่องปรุง', expiry: getFutureDateString(120) },
  { id: '6', name: 'น้ำปลา', qty: 1, unit: 'ขวด', category: 'เครื่องปรุง', expiry: '' },
];

const initialRecipes: Recipe[] = [
  {
    id: 'r1',
    name: 'ไข่เจียว',
    ingredients: [
      { name: 'ไข่ไก่', qty: 2, unit: 'ฟอง' },
      { name: 'น้ำปลา', qty: 1, unit: 'ช้อนชา' }
    ],
    steps: [
      'ตอกไข่ใส่ชาม',
      'ปรุงรสด้วยน้ำปลา ตีให้เข้ากันจนขึ้นฟอง',
      'ทอดในน้ำมันร้อนจัดจนฟูกรอบทั้งสองด้าน'
    ]
  },
  {
    id: 'r2',
    name: 'ผัดกะเพราหมูสับ',
    ingredients: [
      { name: 'หมูสับ', qty: 150, unit: 'กรัม' },
      { name: 'ใบกะเพรา', qty: 1, unit: 'กำ' },
      { name: 'ซอสหอยนางรม', qty: 1, unit: 'ช้อนโต๊ะ' },
      { name: 'น้ำปลา', qty: 1, unit: 'ช้อนชา' }
    ],
    steps: [
      'ตั้งกระทะใส่น้ำมัน ผัดพริกกระเทียมให้หอม',
      'ใส่หมูสับลงไปผัดจนสุก ปรุงรสด้วยซอสหอยนางรมและน้ำปลา',
      'ใส่ใบกะเพรา เร่งไฟแรงผัดเร็วๆ แล้วปิดเตา'
    ]
  },
  {
    id: 'r3',
    name: 'ต้มกะหล่ำปลีหมูสับ',
    ingredients: [
      { name: 'กะหล่ำปลี', qty: 0.5, unit: 'หัว' },
      { name: 'หมูสับ', qty: 100, unit: 'กรัม' },
      { name: 'น้ำปลา', qty: 1, unit: 'ช้อนโต๊ะ' }
    ],
    steps: [
      'ต้มน้ำให้เดือด ปั้นหมูสับเป็นก้อนใส่ลงไป',
      'ใส่กะหล่ำปลีหั่นชิ้น ต้มจนผักนุ่มหวาน',
      'ปรุงรสด้วยน้ำปลา ชิมรสตามชอบแล้วยกลง'
    ]
  }
];

const initialShopping: ShoppingItem[] = [
  { id: 's1', name: 'กระเทียม', qty: 1, unit: 'ถุง', category: 'ผัก', checked: false, source: 'manual' },
  { id: 's2', name: 'พริกสด', qty: 1, unit: 'กำ', category: 'ผัก', checked: true, source: 'manual' },
];

export const loadPantryItems = (): PantryItem[] => {
  try {
    const data = localStorage.getItem(PANTRY_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(initialPantry));
      return initialPantry;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load pantry items:', err);
    return initialPantry;
  }
};

export const savePantryItems = (items: PantryItem[]): void => {
  try {
    localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save pantry items:', err);
  }
};

export const loadRecipes = (): Recipe[] => {
  try {
    const data = localStorage.getItem(RECIPES_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(initialRecipes));
      return initialRecipes;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load recipes:', err);
    return initialRecipes;
  }
};

export const saveRecipes = (recipes: Recipe[]): void => {
  try {
    localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
  } catch (err) {
    console.error('Failed to save recipes:', err);
  }
};

export const loadShoppingItems = (): ShoppingItem[] => {
  try {
    const data = localStorage.getItem(SHOPPING_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(SHOPPING_STORAGE_KEY, JSON.stringify(initialShopping));
      return initialShopping;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load shopping items:', err);
    return initialShopping;
  }
};

export const saveShoppingItems = (items: ShoppingItem[]): void => {
  try {
    localStorage.setItem(SHOPPING_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save shopping items:', err);
  }
};
