import { create } from "zustand";
import { login, logout, refreshToken } from "~/api/auth";
import { AuthState, LoginRequest } from "~/interfaces/Auth/interfaces";
import * as SecureStore from "expo-secure-store";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  requiresAuth: false,

  login: async (request: LoginRequest) => {
    const data = await login(request);
    await SecureStore.setItemAsync("refreshToken", data.refreshToken);
    set({ user: data.user, accessToken: data.accessToken, isLoading: false, requiresAuth: true });
  },

  logout: async () => {
    const refresh = await SecureStore.getItemAsync("refreshToken");
    if (refresh) await logout({refreshToken: refresh});
    await SecureStore.deleteItemAsync("refreshToken");
    set({ user: null, accessToken: null, isLoading: false, requiresAuth: false });
  },

  restoreSession: async () => {
    const refresh = await SecureStore.getItemAsync("refreshToken");
    if (!refresh) {
      set({ isLoading: false });
      return;
    }

    try {
      const { accessToken } = await refreshToken({refreshToken: refresh});
      // Ideally fetch user profile here if not returned by refresh
      set({ accessToken, isLoading: false, requiresAuth: Boolean(get().user) });
    } catch (e) {
      await SecureStore.deleteItemAsync("refreshToken");
      set({ user: null, accessToken: null, isLoading: false, requiresAuth: false });
    }
  },
}));