import { useEffect, useRef, useCallback } from 'react';
import { useEditor } from '@craftjs/core';
import { useCanvasStore } from '../store/canvas.store';
import { trpc } from '../lib/trpc';
import { websocketService } from '../services/websocket.service';
import { showToast } from '../components/Toast';
import type { WebSocketMessage } from '../../../backend/src/types/websocket.types';

interface UseCanvasSyncOptions {
  filePath: string | undefined;
  debounceMs?: number;
}

/**
 * T067: Frontend debounced sync trigger on canvas changes
 * T072: Update canvas state when fileChange event received
 */
export function useCanvasSync({ filePath, debounceMs = 400 }: UseCanvasSyncOptions) {
  const { setState, setSyncStatus, addConflictedNode, clearConflicts } = useCanvasStore();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousStateRef = useRef<any>(null);
  
  // Get craft.js editor state - track nodes for changes
  const { query, nodes } = useEditor((state) => ({
    nodes: state.nodes,
  }));

  // T067: Debounced sync trigger on canvas changes
  const triggerVisualToCodeSync = useCallback(async () => {
    if (!filePath || !query) {
      return;
    }

    try {
      // Get serialized canvas state from craft.js
      const serializedNodes = query.serialize();
      const canvasState = {
        nodes: serializedNodes,
        events: [],
        selectedNodeId: null,
        viewport: {
          zoom: 1,
          panX: 0,
          panY: 0,
        },
      };

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer
      debounceTimerRef.current = setTimeout(async () => {
        try {
          setSyncStatus('syncing', 'Saving changes...');
          // Update canvas state via page.updateCanvas procedure
          // This will trigger visual-to-code sync automatically
          await trpc.page.updateCanvas.mutate({
            filePath,
            canvasState,
          });
          setSyncStatus('synced', 'Changes saved');
          // Clear sync status after 2 seconds
          setTimeout(() => {
            setSyncStatus('pending');
          }, 2000);
        } catch (error) {
          console.error('Error triggering visual-to-code sync:', error);
          setSyncStatus('error', 'Failed to save changes');
          showToast({
            title: 'Sync Error',
            description: 'Failed to save changes to file. Please try again.',
            type: 'error',
          });
        }
      }, debounceMs);
    } catch (error) {
      console.error('Error serializing canvas state:', error);
    }
  }, [filePath, query, debounceMs]);

  // Listen to craft.js state changes via nodes
  useEffect(() => {
    if (!query || !nodes) {
      return;
    }

    try {
      // Get current serialized state
      const serializedNodes = query.serialize();
      const currentState = JSON.stringify(serializedNodes);
      
      // Compare with previous state
      if (previousStateRef.current !== currentState) {
        previousStateRef.current = currentState;
        triggerVisualToCodeSync();
      }
    } catch (error) {
      // Ignore errors during state comparison
    }

    // Cleanup debounce timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [nodes, query, triggerVisualToCodeSync]);

  // T071, T072: Frontend WebSocket listener for fileChange events
  useEffect(() => {
    if (!filePath) {
      return;
    }

    // Subscribe to fileChange events
    const unsubscribe = websocketService.on('fileChange', async (message: WebSocketMessage) => {
      if (message.type === 'fileChange') {
        const data = message.data as { filePath: string; eventType: string; timestamp: string };
        
        // Only handle changes to the current file
        if (data.filePath === filePath && (data.eventType === 'change' || data.eventType === 'add')) {
          try {
            // Fetch updated page data
            const page = await trpc.page.get.query({ filePath: data.filePath });
            
            // Update canvas state if available
            if (page?.canvasState) {
              setState(page.canvasState);
            }

            // Trigger code-to-visual sync (backend will handle the actual sync)
            await trpc.sync.trigger.mutate({
              filePath: data.filePath,
              direction: 'code-to-visual',
            });
          } catch (error) {
            console.error('Error handling fileChange event:', error);
          }
        }
      }
    });

    // Also subscribe to syncStatus events for UI feedback (T078)
    const unsubscribeSync = websocketService.on('syncStatus', (message: WebSocketMessage) => {
      if (message.type === 'syncStatus') {
        const data = message.data as { status: string; pageId?: string; traceId?: string; error?: string };
        if (data.pageId === filePath || data.filePath === filePath) {
          // Update sync status in store
          if (data.status === 'synced' || data.status === 'completed') {
            setSyncStatus('synced', 'Synced');
            setTimeout(() => setSyncStatus('pending'), 2000);
          } else if (data.status === 'in-progress' || data.status === 'syncing') {
            setSyncStatus('syncing', 'Syncing...');
          } else if (data.status === 'error' || data.status === 'failed') {
            setSyncStatus('error', data.error || 'Sync failed');
            showToast({
              title: 'Sync Error',
              description: data.error || 'Failed to sync changes',
              type: 'error',
            });
          }
        }
      }
    });

    // Subscribe to conflict events (T076, T077)
    const unsubscribeConflict = websocketService.on('conflict', (message: WebSocketMessage) => {
      if (message.type === 'conflict') {
        const data = message.data as { 
          pageId: string; 
          filePath: string; 
          resolution: string; 
          timestamp: string;
          nodeIds?: string[];
        };
        if (data.pageId === filePath || data.filePath === filePath) {
          // Show toast notification (T076)
          showToast({
            title: 'File Updated Externally',
            description: `File was modified externally. Canvas has been refreshed. (${data.resolution})`,
            type: 'warning',
            duration: 6000,
          });

          // Mark affected nodes as conflicted (T077)
          if (data.nodeIds && data.nodeIds.length > 0) {
            data.nodeIds.forEach((nodeId) => {
              addConflictedNode(nodeId);
              // Auto-remove conflict badge after 5 seconds
              setTimeout(() => {
                // Conflict badge will be removed when user interacts with element
              }, 5000);
            });
          } else {
            // If no specific node IDs, mark all nodes as potentially conflicted
            // This will be handled by Canvas component
            clearConflicts();
          }
        }
      }
    });

    // Cleanup subscriptions
    return () => {
      unsubscribe();
      unsubscribeSync();
      unsubscribeConflict();
    };
  }, [filePath, setState, setSyncStatus, addConflictedNode, clearConflicts]);

  return {
    triggerSync: triggerVisualToCodeSync,
  };
}

