import { create } from 'zustand';

interface Page {
  id: string;
  filePath: string;
  route: string;
  title: string | null;
}

interface PageState {
  [filePath: string]: {
    canvasState: any;
    lastModified: string;
  };
}

/**
 * T112: Multi-page state management in Zustand store
 * Stores pages list, current page, and per-page canvas states
 */
interface PageStore {
  pages: Page[];
  currentPage: Page | null;
  pageStates: PageState; // T112: Per-page state isolation
  setPages: (pages: Page[]) => void;
  setCurrentPage: (page: Page | null) => void;
  setPageState: (filePath: string, canvasState: any) => void;
  getPageState: (filePath: string) => any | null;
  clearPageState: (filePath: string) => void;
}

export const usePageStore = create<PageStore>((set, get) => ({
  pages: [],
  currentPage: null,
  pageStates: {},
  setPages: (pages) => set({ pages }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setPageState: (filePath, canvasState) => 
    set((state) => ({
      pageStates: {
        ...state.pageStates,
        [filePath]: {
          canvasState,
          lastModified: new Date().toISOString(),
        },
      },
    })),
  getPageState: (filePath) => {
    const state = get();
    return state.pageStates[filePath]?.canvasState || null;
  },
  clearPageState: (filePath) =>
    set((state) => {
      const newStates = { ...state.pageStates };
      delete newStates[filePath];
      return { pageStates: newStates };
    }),
}));

