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
import { app } from './firebase';
import { UserProfile } from '../types';

export const ADMIN_SESSION_KEY = 'olhares_da_cena_admin_session';

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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
