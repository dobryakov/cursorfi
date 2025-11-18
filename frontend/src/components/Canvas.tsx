import React from 'react';
import { useEditor } from '@craftjs/core';
import { Frame } from '@craftjs/core';
import { useCanvasStore } from '../store/canvas.store';
import { AlertCircle } from 'lucide-react';

export function Canvas() {
  const { actions, query, selected } = useEditor((state) => ({
    selected: state.events.selected,
  }));

  // T077: Render conflict indicator for conflicted nodes
  // Note: Individual node badges would require craft.js node customization
  // For now, we show a global conflict indicator when conflicts exist
  const conflictedNodeIds = useCanvasStore((state) => state.conflictedNodeIds);
  const hasConflicts = conflictedNodeIds.size > 0;

  return (
    <div className="h-full bg-gray-100 p-8">
      {hasConflicts && (
        <div className="mb-4 mx-auto max-w-4xl">
          <div className="flex items-center gap-2 rounded-md bg-yellow-50 border border-yellow-200 px-4 py-2 text-sm text-yellow-800">
            <AlertCircle className="h-4 w-4" />
            <span>
              {conflictedNodeIds.size} element{conflictedNodeIds.size > 1 ? 's' : ''} updated externally
            </span>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto bg-white shadow-lg min-h-[600px] p-8 relative">
        <Frame>
          {/* Canvas content will be rendered here by craft.js */}
          {/* T077: Conflict badges for individual nodes can be added via craft.js node customization */}
        </Frame>
      </div>
    </div>
  );
}

