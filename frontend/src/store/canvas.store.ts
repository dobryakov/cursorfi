import { create } from 'zustand';
import type { CanvasState } from '../../../backend/src/types/canvas-state';

export type SyncStatusType = 'pending' | 'syncing' | 'synced' | 'error';

interface CanvasStore {
  state: CanvasState | null;
  setState: (state: CanvasState) => void;
  clearState: () => void;
  // Undo/redo state tracking (craft.js handles the actual history)
  canUndo: boolean;
  canRedo: boolean;
  setUndoRedoState: (canUndo: boolean, canRedo: boolean) => void;
  // Sync status tracking (T078)
  syncStatus: SyncStatusType;
  syncMessage?: string;
  setSyncStatus: (status: SyncStatusType, message?: string) => void;
  // Conflict tracking (T077)
  conflictedNodeIds: Set<string>;
  addConflictedNode: (nodeId: string) => void;
  removeConflictedNode: (nodeId: string) => void;
  clearConflicts: () => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  state: null,
  setState: (state) => set({ state }),
  clearState: () => set({ state: null }),
  canUndo: false,
  canRedo: false,
  setUndoRedoState: (canUndo, canRedo) => set({ canUndo, canRedo }),
  syncStatus: 'pending',
  syncMessage: undefined,
  setSyncStatus: (status, message) => set({ syncStatus: status, syncMessage: message }),
  conflictedNodeIds: new Set(),
  addConflictedNode: (nodeId) =>
    set((state) => ({
      conflictedNodeIds: new Set([...state.conflictedNodeIds, nodeId]),
    })),
  removeConflictedNode: (nodeId) =>
    set((state) => {
      const newSet = new Set(state.conflictedNodeIds);
      newSet.delete(nodeId);
      return { conflictedNodeIds: newSet };
    }),
  clearConflicts: () => set({ conflictedNodeIds: new Set() }),
}));

