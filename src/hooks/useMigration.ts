import { useState, useEffect } from 'react';
import { doc, writeBatch, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { PantryItem, Recipe, ShoppingItem } from '../types';

const MIGRATED_KEY = 'firebase_migrated_v1';

export const useMigration = () => {
  const [hasLocalDataToMigrate, setHasLocalDataToMigrate] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationSuccess, setMigrationSuccess] = useState(false);

  useEffect(() => {
    const isAlreadyMigrated = localStorage.getItem(MIGRATED_KEY) === 'true';
    if (isAlreadyMigrated) {
      setHasLocalDataToMigrate(false);
      return;
    }

    try {
      const p = localStorage.getItem('pantry');
      const r = localStorage.getItem('recipes');
      const s = localStorage.getItem('shopping');

      if (p || r || s) {
        setHasLocalDataToMigrate(true);
      }
    } catch (e) {
      console.warn('Check local data migration error:', e);
    }
  }, []);

  const migrateLocalToFirebase = async () => {
    setIsMigrating(true);
    try {
      const batch = writeBatch(db);

      const localPantry: PantryItem[] = JSON.parse(localStorage.getItem('pantry') || '[]');
      const localRecipes: Recipe[] = JSON.parse(localStorage.getItem('recipes') || '[]');
      const localShopping: ShoppingItem[] = JSON.parse(localStorage.getItem('shopping') || '[]');

      localPantry.forEach((item) => {
        const docRef = doc(db, 'pantry', item.id);
        batch.set(docRef, item);
      });

      localRecipes.forEach((recipe) => {
        const docRef = doc(db, 'recipes', recipe.id);
        batch.set(docRef, recipe);
      });

      localShopping.forEach((item) => {
        const docRef = doc(db, 'shopping', item.id);
        batch.set(docRef, item);
      });

      await batch.commit();
      localStorage.setItem(MIGRATED_KEY, 'true');
      setHasLocalDataToMigrate(false);
      setMigrationSuccess(true);
    } catch (err) {
      console.error('Migration to Firebase error:', err);
      alert('เกิดข้อผิดพลาดในการย้ายข้อมูลขึ้น Firebase กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsMigrating(false);
    }
  };

  return {
    hasLocalDataToMigrate,
    isMigrating,
    migrationSuccess,
    migrateLocalToFirebase,
  };
};
