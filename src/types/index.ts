export type Category = 'ของสด' | 'ผัก' | 'เครื่องปรุง' | 'อื่นๆ';

export interface PantryItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  category: Category;
  expiry?: string; // YYYY-MM-DD
}

export interface RecipeIngredient {
  name: string;
  qty: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  steps: string[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  category: Category;
  checked: boolean;
  source?: 'auto-depleted' | 'auto-expired' | 'manual';
}

export type TabType = 'pantry' | 'recipes' | 'cookable' | 'shopping';
