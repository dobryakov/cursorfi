import { create } from 'zustand';
import type { CanvasState } from '../../../backend/src/types/canvas-state';

interface CanvasStore {
  state: CanvasState | null;
  setState: (state: CanvasState) => void;
  clearState: () => void;
  // Undo/redo state tracking (craft.js handles the actual history)
  canUndo: boolean;
  canRedo: boolean;
  setUndoRedoState: (canUndo: boolean, canRedo: boolean) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  state: null,
  setState: (state) => set({ state }),
  clearState: () => set({ state: null }),
  canUndo: false,
  canRedo: false,
  setUndoRedoState: (canUndo, canRedo) => set({ canUndo, canRedo }),
}));

