import React, { useState, useCallback } from 'react';
import { useEditor } from '@craftjs/core';
import { Frame } from '@craftjs/core';
import { useCanvasStore } from '../store/canvas.store';
import { AlertCircle } from 'lucide-react';
import { ContextMenu } from './ContextMenu';
import { usePageStore } from '../store/page.store';

export function Canvas() {
  const { actions, query, selected } = useEditor((state) => ({
    selected: state.events.selected,
  }));

  // T077: Render conflict indicator for conflicted nodes
  // Note: Individual node badges would require craft.js node customization
  // For now, we show a global conflict indicator when conflicts exist
  const conflictedNodeIds = useCanvasStore((state) => state.conflictedNodeIds);
  const hasConflicts = conflictedNodeIds.size > 0;

  // T116, T117: Context menu state
  const [contextMenu, setContextMenu] = useState<{
    nodeId: string;
    position: { x: number; y: number };
  } | null>(null);
  const currentPage = usePageStore((state) => state.currentPage);
  const filePath = currentPage?.filePath;

  // Handle right-click on canvas elements
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // Get the selected node ID
    const selectedNodeId = selected ? Object.keys(selected)[0] : null;
    
    if (selectedNodeId) {
      setContextMenu({
        nodeId: selectedNodeId,
        position: { x: e.clientX, y: e.clientY },
      });
    }
  }, [selected]);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Handle drop from ComponentLibrary
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const componentName = e.dataTransfer.getData('craftjs/component');
    
    if (!componentName || !actions || !query) {
      return;
    }

    try {
      // Find the root node (Frame)
      const rootNode = query.node('ROOT').get();
      
      if (rootNode) {
        // Add the component to the canvas using CraftJS API
        actions.addNodeTree(
          {
            type: {
              resolvedName: componentName,
            },
            props: {},
            nodes: [],
          },
          rootNode.id
        );
      }
    } catch (error) {
      console.error('Error adding component to canvas:', error);
    }
  }, [actions, query]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="h-full bg-gray-100 p-8" onContextMenu={handleContextMenu}>
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
      <div 
        className="max-w-4xl mx-auto bg-white shadow-lg min-h-[600px] p-8 relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Frame>
          {/* Canvas content will be rendered here by craft.js */}
          {/* T077: Conflict badges for individual nodes can be added via craft.js node customization */}
        </Frame>
      </div>
      
      {/* T116, T117: Context menu for right-click actions */}
      {contextMenu && (
        <ContextMenu
          nodeId={contextMenu.nodeId}
          filePath={filePath}
          onClose={handleCloseContextMenu}
          position={contextMenu.position}
        />
      )}
    </div>
  );
}

