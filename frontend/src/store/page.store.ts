import { create } from 'zustand';

interface Page {
  id: string;
  filePath: string;
  route: string;
  title: string | null;
}

interface PageStore {
  pages: Page[];
  currentPage: Page | null;
  setPages: (pages: Page[]) => void;
  setCurrentPage: (page: Page | null) => void;
}

export const usePageStore = create<PageStore>((set) => ({
  pages: [],
  currentPage: null,
  setPages: (pages) => set({ pages }),
  setCurrentPage: (page) => set({ currentPage: page }),
}));

