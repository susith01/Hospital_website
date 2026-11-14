import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import { syncAuthenticatedUser } from '../lib/api';
import type { PatientProfile, PortalAppointment } from '../types/hospital';

interface AuthContextValue {
  firebaseUser: User | null;
  idToken: string | null;
  patientProfile: PatientProfile | null;
  appointments: PortalAppointment[];
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshPortal: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<PortalAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadBackendSession = useCallback(async (user: User) => {
    const token = await user.getIdToken();
    setIdToken(token);
    const data = await syncAuthenticatedUser(token, user.displayName || undefined);
    setPatientProfile(data.patient);
    setAppointments(data.appointments);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setIdToken(null);
        setPatientProfile(null);
        setAppointments([]);
        setLoading(false);
        return;
      }

      try {
        await loadBackendSession(user);
        setAuthError(null);
      } catch (error: any) {
        console.error('Failed to sync authenticated session:', error);
        setAuthError(error.message || 'Could not load patient portal records.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [loadBackendSession]);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      const credential = await signInWithPopup(auth, googleAuthProvider);
      await loadBackendSession(credential.user);
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user') {
        return;
      }
      console.error('Google sign-in failed:', error);
      setAuthError(error.message || 'Sign-in failed. Please try again.');
    }
  }, [loadBackendSession]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setIdToken(null);
    setPatientProfile(null);
    setAppointments([]);
  }, []);

  const refreshPortal = useCallback(async () => {
    if (!firebaseUser) return;
    await loadBackendSession(firebaseUser);
  }, [firebaseUser, loadBackendSession]);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        idToken,
        patientProfile,
        appointments,
        loading,
        authError,
        signInWithGoogle,
        logout,
        refreshPortal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
