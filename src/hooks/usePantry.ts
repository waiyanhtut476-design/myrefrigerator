import { useState, useEffect } from 'react';
import { 
  collection, doc, setDoc, deleteDoc, 
  onSnapshot, writeBatch 
} from 'firebase/firestore';
import { db, initAuth } from '../firebase';
import { PantryItem, Recipe } from '../types';

export const usePantry = () => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      try {
        await initAuth();
        const pantryRef = collection(db, 'pantry');
        unsubscribe = onSnapshot(
          pantryRef,
          (snapshot) => {
            const data: PantryItem[] = snapshot.docs.map((docSnap) => {
              const d = docSnap.data();
              return {
                id: docSnap.id,
                name: d.name || '',
                qty: Number(d.qty) || 0,
                unit: d.unit || 'ชิ้น',
                category: d.category || 'ของสด',
                expiry: d.expiry || '',
              };
            });
            setItems(data);
            setLoading(false);
            setError(null);
          },
          (err) => {
            console.error('Pantry onSnapshot error:', err);
            setError('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ในขณะนี้');
            setLoading(false);
          }
        );
      } catch (err: any) {
        console.error('usePantry init error:', err);
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อ Firebase');
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const addItem = async (newItem: Omit<PantryItem, 'id'>) => {
    const id = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const docRef = doc(db, 'pantry', id);
    const payload = {
      ...newItem,
      id,
      qty: Number(newItem.qty) || 0,
    };
    await setDoc(docRef, payload);
  };

  const updateItem = async (updatedItem: PantryItem) => {
    const docRef = doc(db, 'pantry', updatedItem.id);
    await setDoc(docRef, {
      ...updatedItem,
      qty: Number(updatedItem.qty) || 0,
    });
  };

  const deleteItem = async (id: string) => {
    const docRef = doc(db, 'pantry', id);
    await deleteDoc(docRef);
  };

  const cookRecipeDeduct = async (recipe: Recipe) => {
    const batch = writeBatch(db);
    items.forEach((item) => {
      const matchedIng = recipe.ingredients.find(
        (i) => i.name.trim().toLowerCase() === item.name.trim().toLowerCase()
      );
      if (matchedIng) {
        const newQty = Math.max(0, Number((item.qty - matchedIng.qty).toFixed(1)));
        const docRef = doc(db, 'pantry', item.id);
        batch.set(docRef, {
          ...item,
          qty: newQty,
        });
      }
    });
    await batch.commit();
  };

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    cookRecipeDeduct,
  };
};
