import { useEffect, useState } from 'react';
import { websocketClient } from './lib/websocket';
import { Editor } from './components/Editor';
import { ToastProvider } from './components/Toast';
import { SyncStatus } from './components/SyncStatus';
import { useCanvasStore } from './store/canvas.store';
import { trpc } from './lib/trpc';

function App() {
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const syncStatus = useCanvasStore((state) => state.syncStatus);
  const syncMessage = useCanvasStore((state) => state.syncMessage);

  useEffect(() => {
    // Connect WebSocket on mount
    // Don't disconnect on unmount - WebSocket should stay connected
    // It will be cleaned up when the page is closed
    websocketClient.connect();

    // Load pages list
    const loadPages = async () => {
      try {
        const pageList = await trpc.page.list.query();
        setPages(pageList);
        if (pageList.length > 0 && !currentPage) {
          setCurrentPage(pageList[0].filePath);
        }
      } catch (error) {
        console.error('Failed to load pages:', error);
      }
    };

    loadPages();

    // Cleanup: disconnect only when page is being unloaded
    const handleBeforeUnload = () => {
      websocketClient.disconnect();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Don't disconnect here - React StrictMode causes double mount/unmount
      // WebSocket should stay connected across component remounts
    };
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-100">
        {/* T078: Sync status indicator */}
        {currentPage && (
          <div className="fixed top-4 right-4 z-50">
            <SyncStatus status={syncStatus} message={syncMessage} />
          </div>
        )}
        {currentPage ? (
          <Editor filePath={currentPage} />
        ) : (
          <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold">CursorFi Visual Editor</h1>
            <p className="mt-2 text-gray-600">No pages available. Please create a page first.</p>
          </div>
        )}
      </div>
    </ToastProvider>
  );
}

export default App;

