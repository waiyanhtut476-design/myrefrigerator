import { useState, useEffect } from 'react';
import { 
  collection, doc, setDoc, deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, initAuth } from '../firebase';
import { Recipe } from '../types';

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      try {
        await initAuth();
        const recipesRef = collection(db, 'recipes');
        unsubscribe = onSnapshot(
          recipesRef,
          (snapshot) => {
            const data: Recipe[] = snapshot.docs.map((docSnap) => {
              const d = docSnap.data();
              return {
                id: docSnap.id,
                name: d.name || '',
                ingredients: d.ingredients || [],
                steps: d.steps || [],
              };
            });
            setRecipes(data);
            setLoading(false);
            setError(null);
          },
          (err) => {
            console.error('Recipes onSnapshot error:', err);
            setError('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ในขณะนี้');
            setLoading(false);
          }
        );
      } catch (err: any) {
        console.error('useRecipes init error:', err);
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อ Firebase');
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const addRecipe = async (newRecipe: Omit<Recipe, 'id'>) => {
    const id = `r_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const docRef = doc(db, 'recipes', id);
    await setDoc(docRef, {
      ...newRecipe,
      id,
    });
  };

  const updateRecipe = async (updatedRecipe: Recipe) => {
    const docRef = doc(db, 'recipes', updatedRecipe.id);
    await setDoc(docRef, updatedRecipe);
  };

  const deleteRecipe = async (id: string) => {
    const docRef = doc(db, 'recipes', id);
    await deleteDoc(docRef);
  };

  return {
    recipes,
    loading,
    error,
    addRecipe,
    updateRecipe,
    deleteRecipe,
  };
};
