import { 
  collection, doc, setDoc, deleteDoc, 
  onSnapshot, getDocs, writeBatch 
} from 'firebase/firestore';
import { db, auth } from './config';
import { PantryItem, Recipe, ShoppingItem } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Sanitize ID for Firestore rules compliance: ^[a-zA-Z0-9_\-]+$
export const sanitizeId = (id: string): string => {
  const sanitized = id.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  return sanitized || `item_${Date.now()}`;
};

// ----------------- PANTRY -----------------
export const savePantryItemToFirestore = async (userId: string, item: PantryItem): Promise<void> => {
  const cleanId = sanitizeId(item.id);
  const path = `users/${userId}/pantry/${cleanId}`;
  try {
    const payload: any = {
      id: cleanId,
      name: item.name.slice(0, 200),
      qty: Number(item.qty) || 0,
      unit: (item.unit || 'ชิ้น').slice(0, 50),
      category: item.category,
      userId,
    };
    if (item.expiry) {
      payload.expiry = item.expiry.slice(0, 50);
    }
    await setDoc(doc(db, `users/${userId}/pantry`, cleanId), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deletePantryItemFromFirestore = async (userId: string, itemId: string): Promise<void> => {
  const cleanId = sanitizeId(itemId);
  const path = `users/${userId}/pantry/${cleanId}`;
  try {
    await deleteDoc(doc(db, `users/${userId}/pantry`, cleanId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

export const subscribePantry = (
  userId: string,
  onData: (items: PantryItem[]) => void
) => {
  const path = `users/${userId}/pantry`;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: PantryItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          qty: data.qty,
          unit: data.unit,
          category: data.category,
          expiry: data.expiry || '',
        };
      });
      onData(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
};

// ----------------- RECIPES -----------------
export const saveRecipeToFirestore = async (userId: string, recipe: Recipe): Promise<void> => {
  const cleanId = sanitizeId(recipe.id);
  const path = `users/${userId}/recipes/${cleanId}`;
  try {
    const payload = {
      id: cleanId,
      name: recipe.name.slice(0, 200),
      ingredients: recipe.ingredients || [],
      steps: recipe.steps || [],
      userId,
    };
    await setDoc(doc(db, `users/${userId}/recipes`, cleanId), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deleteRecipeFromFirestore = async (userId: string, recipeId: string): Promise<void> => {
  const cleanId = sanitizeId(recipeId);
  const path = `users/${userId}/recipes/${cleanId}`;
  try {
    await deleteDoc(doc(db, `users/${userId}/recipes`, cleanId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

export const subscribeRecipes = (
  userId: string,
  onData: (recipes: Recipe[]) => void
) => {
  const path = `users/${userId}/recipes`;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const recipes: Recipe[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          ingredients: data.ingredients || [],
          steps: data.steps || [],
        };
      });
      onData(recipes);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
};

// ----------------- SHOPPING -----------------
export const saveShoppingItemToFirestore = async (userId: string, item: ShoppingItem): Promise<void> => {
  const cleanId = sanitizeId(item.id);
  const path = `users/${userId}/shopping/${cleanId}`;
  try {
    const payload: any = {
      id: cleanId,
      name: item.name.slice(0, 200),
      qty: Number(item.qty) || 1,
      unit: (item.unit || 'ชิ้น').slice(0, 50),
      category: item.category,
      checked: !!item.checked,
      userId,
    };
    if (item.source) {
      payload.source = item.source.slice(0, 50);
    }
    await setDoc(doc(db, `users/${userId}/shopping`, cleanId), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deleteShoppingItemFromFirestore = async (userId: string, itemId: string): Promise<void> => {
  const cleanId = sanitizeId(itemId);
  const path = `users/${userId}/shopping/${cleanId}`;
  try {
    await deleteDoc(doc(db, `users/${userId}/shopping`, cleanId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

export const subscribeShopping = (
  userId: string,
  onData: (items: ShoppingItem[]) => void
) => {
  const path = `users/${userId}/shopping`;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: ShoppingItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          qty: data.qty,
          unit: data.unit,
          category: data.category,
          checked: data.checked,
          source: data.source,
        };
      });
      onData(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
};

// Sync batch initial data to Firestore
export const syncAllLocalToFirestore = async (
  userId: string,
  pantry: PantryItem[],
  recipes: Recipe[],
  shopping: ShoppingItem[]
): Promise<void> => {
  const batch = writeBatch(db);

  pantry.forEach((item) => {
    const cleanId = sanitizeId(item.id);
    const ref = doc(db, `users/${userId}/pantry`, cleanId);
    const payload: any = {
      id: cleanId,
      name: item.name.slice(0, 200),
      qty: Number(item.qty) || 0,
      unit: (item.unit || 'ชิ้น').slice(0, 50),
      category: item.category,
      userId,
    };
    if (item.expiry) payload.expiry = item.expiry.slice(0, 50);
    batch.set(ref, payload);
  });

  recipes.forEach((recipe) => {
    const cleanId = sanitizeId(recipe.id);
    const ref = doc(db, `users/${userId}/recipes`, cleanId);
    batch.set(ref, {
      id: cleanId,
      name: recipe.name.slice(0, 200),
      ingredients: recipe.ingredients || [],
      steps: recipe.steps || [],
      userId,
    });
  });

  shopping.forEach((item) => {
    const cleanId = sanitizeId(item.id);
    const ref = doc(db, `users/${userId}/shopping`, cleanId);
    const payload: any = {
      id: cleanId,
      name: item.name.slice(0, 200),
      qty: Number(item.qty) || 1,
      unit: (item.unit || 'ชิ้น').slice(0, 50),
      category: item.category,
      checked: !!item.checked,
      userId,
    };
    if (item.source) payload.source = item.source.slice(0, 50);
    batch.set(ref, payload);
  });

  await batch.commit();
};
