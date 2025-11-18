import { create } from 'zustand';

interface AppState {
  // Add global app state here
}

export const useAppStore = create<AppState>(() => ({}));

