import { create } from 'zustand';
import { authService } from '../services/authService';

// Auth store - manages user authentication state
// Using Zustand because it's simpler than Redux for this project size

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Login action
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(email, password);
      set({ 
        user: data.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  // Register action
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(userData);
      set({ isLoading: false });
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Registration failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  // Logout action
  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },

  // Load user from token (on app startup)
  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    
    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // Token might be invalid, just clear everything
      authService.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // Update profile
  updateProfile: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.updateProfile(userData);
      set({ 
        user: data.user, 
        isLoading: false 
      });
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Profile update failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.uploadAvatar(file);
      set({ 
        user: data.user, 
        isLoading: false 
      });
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Avatar upload failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
