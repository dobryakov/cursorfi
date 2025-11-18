import { create } from 'zustand';
import type { CanvasState } from '../../../backend/src/types/canvas-state';

interface CanvasStore {
  state: CanvasState | null;
  setState: (state: CanvasState) => void;
  clearState: () => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  state: null,
  setState: (state) => set({ state }),
  clearState: () => set({ state: null }),
}));

