import React, { useEffect, useState } from 'react';
import { trpc } from '../lib/trpc';
import { usePageStore } from '../store/page.store';
import { FileText, Loader2 } from 'lucide-react';

/**
 * T111: Page list UI component for multi-page editing
 */
export function PageList() {
  const { pages, currentPage, setPages, setCurrentPage } = usePageStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPages = async () => {
      try {
        setLoading(true);
        const pageList = await trpc.page.list.query();
        
        // Convert to Page format for store
        const formattedPages = pageList.map(page => ({
          id: page.id,
          filePath: page.filePath,
          route: page.route,
          title: page.title,
        }));
        
        setPages(formattedPages);
        
        // Set first page as current if none selected
        if (formattedPages.length > 0 && !currentPage) {
          setCurrentPage(formattedPages[0]);
        }
      } catch (error) {
        console.error('Failed to load pages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPages();
  }, [setPages, setCurrentPage, currentPage]);

  const handlePageSelect = (filePath: string) => {
    const page = pages.find(p => p.filePath === filePath);
    if (page) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Pages</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {pages.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            No pages found
          </div>
        ) : (
          <div className="space-y-1">
            {pages.map(page => (
              <button
                key={page.id}
                onClick={() => handlePageSelect(page.filePath)}
                className={`w-full text-left p-3 rounded-md transition-colors flex items-center gap-3 ${
                  currentPage?.filePath === page.filePath
                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {page.title || page.route || page.filePath}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {page.filePath}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

