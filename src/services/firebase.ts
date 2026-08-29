import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore,
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged as onFirebaseAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User 
} from 'firebase/auth';
import { Critica, UserProfile, Pagina, HomeSettings } from '../types';
import { INITIAL_CRITICAS } from '../data/initialCriticas';

import firebaseConfigJson from '../../firebase-applet-config.json';

// Local storage backup keys
const STORAGE_KEY = 'olhares_da_cena_criticas_v2';
const PAGINAS_STORAGE_KEY = 'olhares_da_cena_paginas';
const ADMIN_SESSION_KEY = 'olhares_da_cena_admin_session';

const viteEnv = (import.meta as any).env || {};

// Build Firebase configuration
const projectId = viteEnv.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId;
const firebaseConfig = {
  apiKey: viteEnv.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: viteEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain || `${projectId}.firebaseapp.com`,
  projectId: projectId,
  storageBucket: viteEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket || `${projectId}.firebasestorage.app`,
  messagingSenderId: viteEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: viteEnv.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with long polling enabled for container and sandbox environments
const databaseId = viteEnv.VITE_FIREBASE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId;
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true,
}, databaseId && databaseId !== '(default)' ? databaseId : undefined);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Info: ', JSON.stringify(errInfo));
  return errInfo;
}

// Local Cache Helpers
export const getLocalCriticas = (): Critica[] => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached !== null) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read from localStorage:', e);
  }
  return INITIAL_CRITICAS;
};

export const setLocalCriticas = (items: Critica[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Could not write to localStorage:', e);
  }
};

/**
 * Syncs any local critiques (e.g. created offline or before rules were deployed) to Firestore
 */
export const syncLocalDataToFirestore = async (): Promise<void> => {
  try {
    const local = getLocalCriticas();
    if (!local || local.length === 0) return;

    for (const item of local) {
      if (item && item.id) {
        const docRef = doc(db, 'criticas', item.id);
        await setDoc(docRef, item, { merge: true });
      }
    }

    const localPaginas = getLocalPaginas();
    for (const pag of localPaginas) {
      if (pag && pag.id) {
        const docRef = doc(db, 'paginas', pag.id);
        await setDoc(docRef, pag, { merge: true });
      }
    }
  } catch (err) {
    console.warn('Error during background sync to Firestore:', err);
  }
};

/**
 * Real-time listener for critiques collection
 */
export const subscribeToCriticas = (callback: (criticas: Critica[]) => void) => {
  try {
    const criticasRef = collection(db, 'criticas');
    return onSnapshot(criticasRef, (snapshot) => {
      if (!snapshot.empty) {
        const items: Critica[] = [];
        snapshot.forEach((d) => {
          items.push({
            ...(d.data() as Critica),
            id: d.id,
          });
        });
        items.sort((a, b) => new Date(b.dataPublicacao || '').getTime() - new Date(a.dataPublicacao || '').getTime());
        setLocalCriticas(items);
        callback(items);
      } else {
        // If Firestore is empty, check if we have local cache or need to seed
        const local = getLocalCriticas();
        if (local && local.length > 0) {
          syncLocalDataToFirestore().catch(() => {});
          callback(local);
        } else {
          callback([]);
        }
      }
    }, (error) => {
      console.warn('Real-time criticas snapshot error:', error);
      callback(getLocalCriticas());
    });
  } catch (err) {
    console.warn('Failed to attach criticas onSnapshot:', err);
    callback(getLocalCriticas());
    return () => {};
  }
};

/**
 * Real-time listener for paginas collection
 */
export const subscribeToPaginas = (callback: (paginas: Pagina[]) => void) => {
  try {
    const paginasRef = collection(db, 'paginas');
    return onSnapshot(paginasRef, (snapshot) => {
      if (!snapshot.empty) {
        const items: Pagina[] = [];
        snapshot.forEach((d) => {
          items.push({ ...(d.data() as Pagina), id: d.id });
        });
        setLocalPaginas(items);
        callback(items);
      } else {
        callback(getLocalPaginas());
      }
    }, (error) => {
      console.warn('Real-time paginas snapshot error:', error);
      callback(getLocalPaginas());
    });
  } catch (err) {
    console.warn('Failed to attach paginas onSnapshot:', err);
    callback(getLocalPaginas());
    return () => {};
  }
};

/**
 * Fetch all critiques with sorting and optional published filter.
 */
export const fetchAllCriticas = async (onlyPublished = true): Promise<Critica[]> => {
  try {
    const criticasRef = collection(db, 'criticas');
    const snapshot = await getDocs(criticasRef);
    
    if (!snapshot.empty) {
      const items: Critica[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Critica;
        items.push({
          ...data,
          id: d.id,
        });
      });

      // Sort by publication date descending
      items.sort((a, b) => new Date(b.dataPublicacao || '').getTime() - new Date(a.dataPublicacao || '').getTime());
      
      // Update local cache
      setLocalCriticas(items);
      
      if (onlyPublished) {
        return items.filter(c => c.publicada);
      }
      return items;
    } else {
      // If Firestore is empty, attempt to sync local
      const local = getLocalCriticas();
      if (local && local.length > 0) {
        syncLocalDataToFirestore().catch(() => {});
      }
    }
  } catch (err) {
    console.warn('Firestore fetch error, falling back to local storage:', err);
  }

  // Fallback to local storage / initial state
  const local = getLocalCriticas();
  local.sort((a, b) => new Date(b.dataPublicacao || '').getTime() - new Date(a.dataPublicacao || '').getTime());
  if (onlyPublished) {
    return local.filter(c => c.publicada);
  }
  return local;
};

/**
 * Fetch a single critique by its friendly slug.
 */
export const fetchCriticaBySlug = async (slug: string): Promise<Critica | null> => {
  try {
    const criticasRef = collection(db, 'criticas');
    const q = query(criticasRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docData = snapshot.docs[0].data() as Critica;
      return {
        ...docData,
        id: snapshot.docs[0].id,
      };
    }
  } catch (err) {
    console.warn('Firestore slug lookup fallback to local:', err);
  }

  const local = getLocalCriticas();
  const found = local.find(c => c.slug === slug);
  return found || null;
};

/**
 * Save or update a critique in Firestore and local storage.
 */
export const saveCriticaToDb = async (critica: Critica): Promise<Critica> => {
  const finalCritica = {
    ...critica,
    dataAtualizacao: new Date().toISOString().split('T')[0],
  };

  // 1. Update local storage immediately for fast UI feedback
  const local = getLocalCriticas();
  const index = local.findIndex(c => c.id === finalCritica.id || c.slug === finalCritica.slug);
  if (index >= 0) {
    local[index] = finalCritica;
  } else {
    local.unshift(finalCritica);
  }
  setLocalCriticas(local);

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, 'criticas', finalCritica.id);
    await setDoc(docRef, finalCritica, { merge: true });
    console.log('Saved to Firestore successfully:', finalCritica.id);
  } catch (err) {
    console.error('Error writing directly to Firestore:', err);
    throw err;
  }

  return finalCritica;
};

/**
 * Delete a critique from Firestore and local storage.
 */
export const deleteCriticaFromDb = async (id: string): Promise<boolean> => {
  // 1. Remove from local storage
  const local = getLocalCriticas().filter(c => c.id !== id);
  setLocalCriticas(local);

  // 2. Remove from Firestore
  try {
    const docRef = doc(db, 'criticas', id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('Could not delete from Firestore (deleted locally):', err);
    return true;
  }
};

/**
 * Seed initial sample dataset to Firestore if it's empty or on demand.
 */
export const seedDatabaseIfEmpty = async (): Promise<void> => {
  try {
    const snapshot = await getDocs(collection(db, 'criticas'));
    if (snapshot.empty) {
      console.log('Seeding initial Olhares da Cena critiques to Firestore...');
      for (const item of INITIAL_CRITICAS) {
        await setDoc(doc(db, 'criticas', item.id), item);
      }
    }
  } catch (err) {
    console.warn('Could not auto-seed to Firestore:', err);
  }
};

// ==========================================
// PAGINAS
// ==========================================

export const getLocalPaginas = (): Pagina[] => {
  try {
    const cached = localStorage.getItem(PAGINAS_STORAGE_KEY);
    if (cached !== null) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read paginas from localStorage:', e);
  }
  return [];
};

export const setLocalPaginas = (items: Pagina[]) => {
  try {
    localStorage.setItem(PAGINAS_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Could not write paginas to localStorage:', e);
  }
};

export const fetchAllPaginas = async (onlyPublished = true): Promise<Pagina[]> => {
  try {
    const paginasRef = collection(db, 'paginas');
    const snapshot = await getDocs(paginasRef);
    
    if (!snapshot.empty) {
      const items: Pagina[] = [];
      snapshot.forEach((d) => {
        items.push({ ...d.data(), id: d.id } as Pagina);
      });
      setLocalPaginas(items);
      
      if (onlyPublished) {
        return items.filter(p => p.publicada);
      }
      return items;
    }
  } catch (err) {
    console.warn('Firestore fetch paginas error, fallback local:', err);
  }
  
  const local = getLocalPaginas();
  if (onlyPublished) {
    return local.filter(p => p.publicada);
  }
  return local;
};

export const savePaginaToDb = async (pagina: Pagina): Promise<Pagina> => {
  const finalPagina = {
    ...pagina,
    dataAtualizacao: new Date().toISOString(),
  };

  const local = getLocalPaginas();
  const index = local.findIndex(p => p.id === finalPagina.id);
  if (index >= 0) {
    local[index] = finalPagina;
  } else {
    local.push(finalPagina);
  }
  setLocalPaginas(local);

  try {
    const docRef = doc(db, 'paginas', finalPagina.id);
    await setDoc(docRef, finalPagina, { merge: true });
  } catch (err) {
    console.warn('Could not save pagina to Firestore:', err);
  }
  return finalPagina;
};

export const deletePaginaFromDb = async (id: string): Promise<boolean> => {
  const local = getLocalPaginas().filter(p => p.id !== id);
  setLocalPaginas(local);

  try {
    const docRef = doc(db, 'paginas', id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('Could not delete pagina from Firestore:', err);
    return true;
  }
};

// ==========================================
// HOME SETTINGS
// ==========================================

export const getHomeSettings = async (): Promise<HomeSettings | null> => {
  try {
    const docRef = doc(db, 'settings', 'home');
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as HomeSettings;
    }
  } catch (err) {
    console.warn('Could not fetch home settings from Firestore:', err);
  }
  return null;
};

export const saveHomeSettings = async (settings: HomeSettings): Promise<boolean> => {
  try {
    const docRef = doc(db, 'settings', 'home');
    await setDoc(docRef, settings, { merge: true });
    return true;
  } catch (err) {
    console.warn('Could not save home settings to Firestore:', err);
    return false;
  }
};

/**
 * Admin Authentication Helpers
 * Uses strictly Firebase Authentication (email/password or Google Sign-In) configured by the user in Firebase Console.
 */
export const subscribeToAuth = (callback: (user: UserProfile | null) => void) => {
  return onFirebaseAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Editor(a) Olhares da Cena',
        photoURL: user.photoURL,
        isAdmin: true,
      };
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(userProfile));
      callback(userProfile);
    } else {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      callback(null);
    }
  });
};

export const loginWithEmail = async (email: string, pass: string, rememberMe: boolean = false): Promise<UserProfile> => {
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const userProfile: UserProfile = {
    uid: cred.user.uid,
    email: cred.user.email,
    displayName: cred.user.displayName || 'Editor(a) Olhares da Cena',
    photoURL: cred.user.photoURL,
    isAdmin: true,
  };
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(userProfile));
  return userProfile;
};

export const registerAdminWithEmail = async (email: string, pass: string): Promise<UserProfile> => {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  const userProfile: UserProfile = {
    uid: cred.user.uid,
    email: cred.user.email,
    displayName: cred.user.displayName || 'Editor(a) Olhares da Cena',
    photoURL: cred.user.photoURL,
    isAdmin: true,
  };
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(userProfile));
  return userProfile;
};

export const loginWithGoogleAccount = async (): Promise<UserProfile> => {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const userProfile: UserProfile = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || 'Editor(a) Olhares da Cena',
      photoURL: cred.user.photoURL,
      isAdmin: true,
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(userProfile));
    return userProfile;
  } catch (err: any) {
    console.error('Google Sign-in error:', err);
    throw err;
  }
};

export const logoutAdminUser = async () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  try {
    await signOut(auth);
  } catch {
    // ignore
  }
};
