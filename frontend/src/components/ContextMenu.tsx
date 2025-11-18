import React, { useEffect, useRef, useState } from 'react';
import { useEditor } from '@craftjs/core';
import { trpc } from '../lib/trpc';
import { mapElementToFilePath } from '../utils/element-tracking';
import { FileCode } from 'lucide-react';

interface ContextMenuProps {
  nodeId: string | null;
  filePath: string | undefined;
  onClose: () => void;
  position: { x: number; y: number };
}

/**
 * T116, T117: Right-click context menu component
 * Provides "Open in Cursor" functionality for canvas elements
 */
export function ContextMenu({ nodeId, filePath, onClose, position }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { query } = useEditor();
  const [mappedPath, setMappedPath] = useState<{ filePath: string; lineNumber: number } | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    // T118: Map element to file path and line number
    if (nodeId && filePath) {
      try {
        const node = query.node(nodeId).get();
        const mapped = mapElementToFilePath(nodeId, node, filePath);
        setMappedPath(mapped);
      } catch (error) {
        console.error('[ContextMenu] Error mapping element to file path:', error);
        setMappedPath(null);
      }
    } else {
      setMappedPath(null);
    }
  }, [nodeId, filePath, query]);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Close menu on escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleOpenInCursor = async () => {
    if (!mappedPath || isOpening) {
      return;
    }

    try {
      setIsOpening(true);
      // T117: Call backend to open file in Cursor IDE
      const result = await trpc.cursor.open.mutate({
        filePath: mappedPath.filePath,
        line: mappedPath.lineNumber,
      });

      if (result.success) {
        console.log('[ContextMenu] File opened in Cursor:', mappedPath);
      } else {
        console.error('[ContextMenu] Failed to open file:', result.message);
        // TODO: Show error toast notification
      }
    } catch (error) {
      console.error('[ContextMenu] Error opening file in Cursor:', error);
      // TODO: Show error toast notification
    } finally {
      setIsOpening(false);
      onClose();
    }
  };

  if (!nodeId || !mappedPath) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <button
        onClick={handleOpenInCursor}
        disabled={isOpening}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FileCode className="h-4 w-4" />
        <span>
          {isOpening ? 'Opening...' : 'Open in Cursor'}
        </span>
      </button>
      {mappedPath && (
        <div className="px-4 py-1 text-xs text-gray-500 border-t border-gray-100">
          {mappedPath.filePath}:{mappedPath.lineNumber}
        </div>
      )}
    </div>
  );
}

