import { useState, useEffect } from 'react';
import { 
  collection, doc, setDoc, deleteDoc, 
  onSnapshot, writeBatch, getDoc 
} from 'firebase/firestore';
import { db, initAuth } from '../firebase';
import { ShoppingItem, PantryItem } from '../types';
import { getFreshness } from '../utils/storage';

const normalize = (str: string) => str.trim().toLowerCase();

export const useShopping = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      try {
        await initAuth();
        const shoppingRef = collection(db, 'shopping');
        unsubscribe = onSnapshot(
          shoppingRef,
          (snapshot) => {
            const data: ShoppingItem[] = snapshot.docs.map((docSnap) => {
              const d = docSnap.data();
              return {
                id: docSnap.id,
                name: d.name || '',
                qty: Number(d.qty) || 1,
                unit: d.unit || 'ชิ้น',
                category: d.category || 'ของสด',
                checked: !!d.checked,
                source: d.source || 'manual',
              };
            });
            setItems(data);
            setLoading(false);
            setError(null);
          },
          (err) => {
            console.error('Shopping onSnapshot error:', err);
            setError('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ในขณะนี้');
            setLoading(false);
          }
        );
      } catch (err: any) {
        console.error('useShopping init error:', err);
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อ Firebase');
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const addItem = async (newItem: Omit<ShoppingItem, 'id' | 'checked'>) => {
    const id = `s_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const docRef = doc(db, 'shopping', id);
    await setDoc(docRef, {
      ...newItem,
      id,
      checked: false,
    });
  };

  const toggleItem = async (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const docRef = doc(db, 'shopping', id);
    await setDoc(docRef, {
      ...target,
      checked: !target.checked,
    });
  };

  const updateItem = async (updatedItem: ShoppingItem) => {
    const docRef = doc(db, 'shopping', updatedItem.id);
    await setDoc(docRef, {
      ...updatedItem,
      qty: Number(updatedItem.qty) || 1,
    });
  };

  const deleteItem = async (id: string) => {
    const docRef = doc(db, 'shopping', id);
    await deleteDoc(docRef);
  };

  const autoAddDepleted = async (pantryItems: PantryItem[]): Promise<number> => {
    const existingNames = new Set(items.map((s) => normalize(s.name)));
    const batch = writeBatch(db);
    let addedCount = 0;

    pantryItems.forEach((p) => {
      const freshness = getFreshness(p.expiry);
      const isZero = p.qty <= 0;
      const isExpired = freshness.type === 'expired';

      if ((isZero || isExpired) && !existingNames.has(normalize(p.name))) {
        const id = `s_auto_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const docRef = doc(db, 'shopping', id);
        batch.set(docRef, {
          id,
          name: p.name,
          qty: p.qty > 0 ? p.qty : 1,
          unit: p.unit,
          category: p.category,
          checked: false,
          source: isExpired ? 'auto-expired' : 'auto-depleted',
        });
        existingNames.add(normalize(p.name));
        addedCount++;
      }
    });

    if (addedCount > 0) {
      await batch.commit();
    }

    return addedCount;
  };

  const transferToPantry = async (
    transferredItems: Omit<PantryItem, 'id'>[],
    completedShoppingIds: string[],
    existingPantry: PantryItem[]
  ) => {
    const batch = writeBatch(db);

    // 1. Add/Update in pantry collection
    transferredItems.forEach((tItem) => {
      const existing = existingPantry.find(
        (p) => normalize(p.name) === normalize(tItem.name)
      );

      if (existing) {
        const docRef = doc(db, 'pantry', existing.id);
        batch.set(docRef, {
          ...existing,
          qty: Number((existing.qty + tItem.qty).toFixed(1)),
          unit: tItem.unit,
          category: tItem.category,
          expiry: tItem.expiry || existing.expiry,
        });
      } else {
        const id = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const docRef = doc(db, 'pantry', id);
        batch.set(docRef, {
          ...tItem,
          id,
        });
      }
    });

    // 2. Delete completed items from shopping collection
    completedShoppingIds.forEach((sId) => {
      const docRef = doc(db, 'shopping', sId);
      batch.delete(docRef);
    });

    await batch.commit();
  };

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    toggleItem,
    deleteItem,
    autoAddDepleted,
    transferToPantry,
  };
};
