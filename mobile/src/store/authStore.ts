import { create } from 'zustand';
import { createSession, loadSession, clearSession } from '../services/auth';
import type { AuthSession, WalletProvider, StellarNetwork } from '../types';

interface AuthState {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** True when a valid session exists but biometric gate hasn't been passed yet */
  requiresBiometric: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  login: (address: string, provider: WalletProvider, network: StellarNetwork) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  /** Call after successful biometric auth to unlock the app */
  unlockWithBiometric: () => void;
}

import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'ajo_biometric_enabled';

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isAuthenticated: false,
  isLoading: false,
  requiresBiometric: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const session = await loadSession();
      if (session) {
        const biometricEnabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
        set({
          session,
          isAuthenticated: biometricEnabled !== 'true', // locked until biometric passes
          requiresBiometric: biometricEnabled === 'true',
          isLoading: false,
        });
      } else {
        set({ session: null, isAuthenticated: false, requiresBiometric: false, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  login: async (address, provider, network) => {
    set({ isLoading: true, error: null });
    try {
      const session = await createSession(address, provider, network);
      set({ session, isAuthenticated: true, requiresBiometric: false, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Login failed',
        isLoading: false,
      });
      throw err;
    }
  },

  logout: async () => {
    await clearSession();
    set({ session: null, isAuthenticated: false, requiresBiometric: false });
  },

  clearError: () => set({ error: null }),

  unlockWithBiometric: () => set({ isAuthenticated: true, requiresBiometric: false }),
}));
