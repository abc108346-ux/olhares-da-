import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore,
  setLogLevel,
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
  Timestamp,
  increment
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
import { Critica, UserProfile, Pagina, HomeSettings, SiteStats, SiteInteressante } from '../types';
import { INITIAL_CRITICAS } from '../data/initialCriticas';

import firebaseConfigJson from '../../firebase-applet-config.json';

// Local storage backup keys
const STORAGE_KEY = 'olhares_da_cena_criticas_v2';
const PAGINAS_STORAGE_KEY = 'olhares_da_cena_paginas';
const ADMIN_SESSION_KEY = 'olhares_da_cena_admin_session';
const SITE_STATS_STORAGE_KEY = 'olhares_da_cena_site_stats';
const SITES_INTERESSANTES_STORAGE_KEY = 'olhares_da_cena_sites_interessantes';

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

// Silence internal SDK connection retries and transient offline diagnostic logs
try {
  setLogLevel('silent');
} catch {
  // ignore
}

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore using canonical getFirestore with designated databaseId
const databaseId = viteEnv.VITE_FIREBASE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId;
export const db = getFirestore(app, databaseId && databaseId !== '(default)' ? databaseId : undefined);

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
      if (Array.isArray(parsed)) {
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
 * Real-time listener for critiques collection
 */
export const subscribeToCriticas = (callback: (criticas: Critica[]) => void) => {
  try {
    const criticasRef = collection(db, 'criticas');
    return onSnapshot(criticasRef, (snapshot) => {
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
    }, (error) => {
      if ((error as any)?.code !== 'unavailable') {
        console.warn('Real-time criticas snapshot error:', error);
      }
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
      if ((error as any)?.code !== 'unavailable') {
        console.warn('Real-time paginas snapshot error:', error);
      }
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
    console.log(`Document ${id} successfully deleted from Firestore.`);
    return true;
  } catch (err) {
    console.error('Could not delete from Firestore:', err);
    throw err;
  }
};

/**
 * Seed initial sample dataset to Firestore on demand.
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
    console.warn('Could not seed to Firestore:', err);
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
    throw err;
  }
  return finalPagina;
};

export const deletePaginaFromDb = async (id: string): Promise<boolean> => {
  const local = getLocalPaginas().filter(p => p.id !== id);
  setLocalPaginas(local);

  try {
    const docRef = doc(db, 'paginas', id);
    await deleteDoc(docRef);
    console.log(`Pagina ${id} successfully deleted from Firestore.`);
    return true;
  } catch (err) {
    console.error('Could not delete pagina from Firestore:', err);
    throw err;
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
    if ((err as any)?.code !== 'unavailable') {
      console.warn('Could not fetch home settings from Firestore:', err);
    }
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

// ==========================================
// REAL SITE STATS & UNIQUE DEVICE COUNTER
// ==========================================

const DEVICE_TOKEN_KEY = 'olhares_device_token_v1';
const DEVICE_COUNTED_FLAG = 'olhares_device_counted_v1';

export const getOrCreateDeviceId = (): string => {
  try {
    let id = localStorage.getItem(DEVICE_TOKEN_KEY);
    if (!id) {
      id = 'dev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem(DEVICE_TOKEN_KEY, id);
    }
    return id;
  } catch (e) {
    return 'dev_fallback_' + Date.now();
  }
};

export const isCurrentDeviceAlreadyCounted = (): boolean => {
  try {
    return localStorage.getItem(DEVICE_COUNTED_FLAG) === 'true';
  } catch (e) {
    return false;
  }
};

export const getLocalSiteStats = (): SiteStats => {
  try {
    const cached = localStorage.getItem(SITE_STATS_STORAGE_KEY);
    if (cached !== null) {
      const parsed = JSON.parse(cached);
      if (typeof parsed === 'object' && typeof parsed.totalViews === 'number') {
        // Sanitize old mock number (>= 1200) to real count (1)
        if (parsed.totalViews >= 1200) {
          parsed.totalViews = 1;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read site stats from localStorage:', e);
  }
  return { totalViews: 1, lastViewAt: new Date().toISOString() };
};

export const setLocalSiteStats = (stats: SiteStats) => {
  try {
    // Sanitize old mock numbers
    const cleanStats = {
      ...stats,
      totalViews: stats.totalViews >= 1200 ? 1 : Math.max(0, stats.totalViews)
    };
    localStorage.setItem(SITE_STATS_STORAGE_KEY, JSON.stringify(cleanStats));
  } catch (e) {
    console.warn('Could not write site stats to localStorage:', e);
  }
};

/**
 * Fetch current site stats once from Firestore (read-only, does NOT increment)
 */
export const getSiteStats = async (): Promise<SiteStats> => {
  try {
    const docRef = doc(db, 'settings', 'stats');
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      let totalViews = typeof data.totalViews === 'number' ? data.totalViews : 1;
      
      // If Firestore contains the old mock value (>= 1200), reset it to 1 real visit
      if (totalViews >= 1200) {
        totalViews = 1;
        await setDoc(docRef, {
          totalViews: 1,
          lastViewAt: new Date().toISOString(),
          resetFromMockAt: new Date().toISOString()
        }, { merge: true });
      }

      const stats: SiteStats = {
        totalViews,
        lastViewAt: data.lastViewAt || new Date().toISOString(),
        uniqueVisitors: totalViews,
      };
      setLocalSiteStats(stats);
      return stats;
    } else {
      // First initialization: Start with 1 (the current real visitor)
      const initial: SiteStats = { totalViews: 1, lastViewAt: new Date().toISOString() };
      await setDoc(docRef, initial, { merge: true });
      setLocalSiteStats(initial);
      return initial;
    }
  } catch (err) {
    console.warn('Firestore fetch site stats fallback to local:', err);
  }
  return getLocalSiteStats();
};

/**
 * Real-time listener for site view stats (read-only)
 */
export const subscribeToSiteStats = (callback: (stats: SiteStats) => void) => {
  try {
    const docRef = doc(db, 'settings', 'stats');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        let totalViews = typeof data.totalViews === 'number' ? data.totalViews : 1;
        if (totalViews >= 1200) {
          totalViews = 1;
        }
        const stats: SiteStats = {
          totalViews,
          lastViewAt: data.lastViewAt || new Date().toISOString(),
          uniqueVisitors: totalViews,
        };
        setLocalSiteStats(stats);
        callback(stats);
      } else {
        const local = getLocalSiteStats();
        callback(local);
      }
    }, (error) => {
      if ((error as any)?.code !== 'unavailable') {
        console.warn('Real-time stats snapshot error:', error);
      }
      callback(getLocalSiteStats());
    });
  } catch (err) {
    console.warn('Failed to attach site stats onSnapshot:', err);
    callback(getLocalSiteStats());
    return () => {};
  }
};

/**
 * Registers a visit ONLY if this device has never been counted before.
 * Refreshing the page, reopening tabs, or clicking buttons will NEVER increment this!
 */
export const registerDeviceVisitOnce = async (): Promise<number> => {
  const deviceId = getOrCreateDeviceId();
  const alreadyCounted = isCurrentDeviceAlreadyCounted();

  // If this device was already counted on this browser, DO NOT increment. Simply fetch latest.
  if (alreadyCounted) {
    const current = await getSiteStats();
    return current.totalViews;
  }

  // Mark device as counted in persistent localStorage immediately
  try {
    localStorage.setItem(DEVICE_COUNTED_FLAG, 'true');
    localStorage.setItem('olhares_first_visit_at', new Date().toISOString());
  } catch (e) {
    console.warn('Failed to set device counted flag in localStorage:', e);
  }

  try {
    const docRef = doc(db, 'settings', 'stats');
    const nowIso = new Date().toISOString();
    
    // Check current stats
    const checkSnap = await getDoc(docRef);
    if (!checkSnap.exists()) {
      // First device ever
      await setDoc(docRef, {
        totalViews: 1,
        lastViewAt: nowIso,
        firstDeviceAt: nowIso,
      });
      setLocalSiteStats({ totalViews: 1, lastViewAt: nowIso });
      return 1;
    }

    const data = checkSnap.data();
    let currentTotal = typeof data.totalViews === 'number' ? data.totalViews : 0;

    // If it was the old simulated value >= 1200, reset it to 1
    if (currentTotal >= 1200) {
      await setDoc(docRef, {
        totalViews: 1,
        lastViewAt: nowIso,
        resetFromMockAt: nowIso
      }, { merge: true });
      setLocalSiteStats({ totalViews: 1, lastViewAt: nowIso });
      return 1;
    }

    // Atomically increment for this genuinely new device
    await setDoc(docRef, {
      totalViews: increment(1),
      lastViewAt: nowIso,
    }, { merge: true });

    const updatedSnap = await getDoc(docRef);
    if (updatedSnap.exists()) {
      const updatedData = updatedSnap.data();
      const updatedTotal = typeof updatedData.totalViews === 'number' ? updatedData.totalViews : currentTotal + 1;
      setLocalSiteStats({ totalViews: updatedTotal, lastViewAt: updatedData.lastViewAt || nowIso });
      return updatedTotal;
    }
  } catch (err) {
    console.warn('Could not persist new device to Firestore:', err);
  }

  const local = getLocalSiteStats();
  return local.totalViews;
};

/**
 * Backward compatibility alias (only increments if device is new)
 */
export const recordSiteView = async (): Promise<number> => {
  return registerDeviceVisitOnce();
};

/**
 * Update or calibrate site views (Admin tool)
 */
export const updateSiteTotalViews = async (newTotal: number): Promise<boolean> => {
  try {
    const docRef = doc(db, 'settings', 'stats');
    await setDoc(docRef, {
      totalViews: Math.max(0, newTotal),
      lastViewAt: new Date().toISOString(),
    }, { merge: true });
    setLocalSiteStats({ totalViews: Math.max(0, newTotal), lastViewAt: new Date().toISOString() });
    return true;
  } catch (err) {
    console.warn('Could not update site total views in Firestore:', err);
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

// ==========================================
// SITES INTERESSANTES (Links recomendados)
// ==========================================

export const getLocalSitesInteressantes = (): SiteInteressante[] => {
  try {
    const cached = localStorage.getItem(SITES_INTERESSANTES_STORAGE_KEY);
    if (cached !== null) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read sites_interessantes from localStorage:', e);
  }
  // User requested: "e nao adiciona nenhum link ainda" - starts completely empty
  return [];
};

export const setLocalSitesInteressantes = (items: SiteInteressante[]) => {
  try {
    localStorage.setItem(SITES_INTERESSANTES_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Could not save sites_interessantes to localStorage:', e);
  }
};

export const fetchSitesInteressantes = async (onlyActive = true): Promise<SiteInteressante[]> => {
  try {
    const sitesRef = collection(db, 'sites_interessantes');
    const q = onlyActive 
      ? query(sitesRef, where('ativo', '==', true))
      : query(sitesRef);
    const snapshot = await getDocs(q);
    const list: SiteInteressante[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });
    // Sort by order ascending
    list.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
    setLocalSitesInteressantes(list);
    return list;
  } catch (err) {
    if ((err as any)?.code !== 'unavailable') {
      console.warn('Could not fetch sites_interessantes from Firestore, using local cache:', err);
    }
    const local = getLocalSitesInteressantes();
    if (onlyActive) {
      return local.filter(s => s.ativo);
    }
    return local;
  }
};

export const subscribeToSitesInteressantes = (
  callback: (sites: SiteInteressante[]) => void,
  onlyActive = false
): (() => void) => {
  try {
    const sitesRef = collection(db, 'sites_interessantes');
    const q = onlyActive 
      ? query(sitesRef, where('ativo', '==', true))
      : query(sitesRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: SiteInteressante[] = [];
        snapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        list.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
        setLocalSitesInteressantes(list);
        callback(list);
      },
      (error) => {
        console.warn('Firestore onSnapshot error on sites_interessantes:', error);
        const local = getLocalSitesInteressantes();
        callback(onlyActive ? local.filter(s => s.ativo) : local);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not establish real-time subscription for sites_interessantes:', err);
    const local = getLocalSitesInteressantes();
    callback(onlyActive ? local.filter(s => s.ativo) : local);
    return () => {};
  }
};

export const saveSiteInteressanteToDb = async (site: SiteInteressante): Promise<SiteInteressante> => {
  const finalSite: SiteInteressante = {
    ...site,
    atualizadoEm: new Date().toISOString(),
  };

  const local = getLocalSitesInteressantes();
  const index = local.findIndex(s => s.id === finalSite.id);
  if (index >= 0) {
    local[index] = finalSite;
  } else {
    local.push(finalSite);
  }
  setLocalSitesInteressantes(local);

  try {
    const docRef = doc(db, 'sites_interessantes', finalSite.id);
    await setDoc(docRef, finalSite, { merge: true });
    console.log(`Site interessante ${finalSite.id} salvo com sucesso no Firestore.`);
  } catch (err) {
    console.warn('Could not save site_interessante to Firestore:', err);
    throw err;
  }
  return finalSite;
};

export const deleteSiteInteressanteFromDb = async (id: string): Promise<boolean> => {
  const local = getLocalSitesInteressantes().filter(s => s.id !== id);
  setLocalSitesInteressantes(local);

  try {
    const docRef = doc(db, 'sites_interessantes', id);
    await deleteDoc(docRef);
    console.log(`Site interessante ${id} excluído com sucesso do Firestore.`);
    return true;
  } catch (err) {
    console.error('Could not delete site_interessante from Firestore:', err);
    throw err;
  }
};

