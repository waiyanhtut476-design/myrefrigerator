import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import appletConfig from '../firebase-applet-config.json';

// Firebase configuration requested
export const firebaseConfig = {
  apiKey: "AIzaSyA7zahsufgxr-fnqhy4nmgDZxtzZdwuMQs",
  authDomain: "myrefrigerator-9a689.firebaseapp.com",
  projectId: "myrefrigerator-9a689",
  storageBucket: "myrefrigerator-9a689.firebasestorage.app",
  messagingSenderId: "129927552361",
  appId: "1:129927552361:web:0897a7a3da529eba44f1f8"
};

// Use active config (with fallback to applet configuration if placeholder is present)
const resolvedConfig = (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY")
  ? firebaseConfig
  : { 
      ...appletConfig, 
      projectId: "myrefrigerator-9a689", 
      authDomain: "myrefrigerator-9a689.firebaseapp.com" 
    };

const app = !getApps().length ? initializeApp(resolvedConfig) : getApp();

let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, resolvedConfig.firestoreDatabaseId || undefined);
} catch (e) {
  firestoreDb = getFirestore(app, resolvedConfig.firestoreDatabaseId || undefined);
}

export const db = firestoreDb;
export const auth = getAuth(app);

// Automatically sign in anonymously when the app opens
export const initAuth = () => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          resolve(cred.user);
        } catch (err) {
          console.warn('Anonymous auth initialization warning:', err);
          resolve(null);
        }
      }
    });
  });
};
