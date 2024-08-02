import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, signOut, User, onIdTokenChanged, onAuthStateChanged, NextOrObserver } from 'firebase/auth';
import { create } from 'zustand';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  projectId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  storageBucket: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  messagingSenderId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  appId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  measurementId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
};


// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}
const auth = getAuth(app);

// Set persistence to LOCAL
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      // console.log('Persistence set to LOCAL');
    })
    .catch((error) => {
      console.error('Error setting persistence:', error);
    });
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null, error: null });
    } catch (error) {
      set({ error: 'Failed to log out' });
    }
  },
  getIdToken: async () => {
    try {
      const user = get().user;
      if (user) {
        return await user.getIdToken(true);
      }
      return null;
    } catch (error) {
      console.error('Error getting ID token:', error);
      set({ error: 'Failed to get ID token' });
      return null;
    }
  },
}));

// Token refresh logic
const handleIdTokenChanged: NextOrObserver<User> = async (user) => {
  if (typeof window !== 'undefined') {
    if (user) {
      try {
        const token = await user.getIdToken();
        localStorage.setItem('authToken', token);
      } catch (error) {
        console.error('Error refreshing token:', error);
        useAuthStore.getState().setError('Failed to refresh authentication token');
      }
    } else {
      localStorage.removeItem('authToken');
    }
  }
  useAuthStore.getState().setUser(user);
  useAuthStore.getState().setIsLoading(false);
};

// Initialize auth state
const handleAuthStateChanged: NextOrObserver<User> = (user) => {
  useAuthStore.getState().setUser(user);
  useAuthStore.getState().setIsLoading(false);
};

// Set up listeners
if (typeof window !== 'undefined') {
  onIdTokenChanged(auth, handleIdTokenChanged);
  onAuthStateChanged(auth, handleAuthStateChanged);
}

export { auth };
