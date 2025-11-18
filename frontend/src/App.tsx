import { useEffect, useState } from 'react';
import { websocketClient } from './lib/websocket';
import { Editor } from './components/Editor';
import { trpc } from './lib/trpc';

function App() {
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [pages, setPages] = useState<any[]>([]);

  useEffect(() => {
    // Connect WebSocket on mount
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

    return () => {
      websocketClient.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {currentPage ? (
        <Editor filePath={currentPage} />
      ) : (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold">CursorFi Visual Editor</h1>
          <p className="mt-2 text-gray-600">No pages available. Please create a page first.</p>
        </div>
      )}
    </div>
  );
}

export default App;

