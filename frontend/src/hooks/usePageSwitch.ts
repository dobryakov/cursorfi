import { useEffect } from 'react';
import { trpc } from '../lib/trpc';
import { usePageStore } from '../store/page.store';
import { useCanvasStore } from '../store/canvas.store';

/**
 * T109: Hook for page switching - loads different page state
 */
export function usePageSwitch(filePath: string | null) {
  const { setCurrentPage } = usePageStore();
  const { setState } = useCanvasStore();

  useEffect(() => {
    if (!filePath) {
      return;
    }

    const switchPage = async () => {
      try {
        // T110: Call page.switch procedure to load page canvas state
        const page = await trpc.page.switch.mutate({ filePath });
        
        if (page) {
          // Update page store
          setCurrentPage({
            id: page.id,
            filePath: page.filePath,
            route: page.route,
            title: page.title,
          });

          // Update canvas state
          if (page.canvasState) {
            setState(page.canvasState);
          }
        }
      } catch (error) {
        console.error(`Failed to switch to page ${filePath}:`, error);
      }
    };

    switchPage();
  }, [filePath, setCurrentPage, setState]);
}

