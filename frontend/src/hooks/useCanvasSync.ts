import { useEffect, useRef, useCallback } from 'react';
import { useEditor } from '@craftjs/core';
import { useCanvasStore } from '../store/canvas.store';
import { trpc } from '../lib/trpc';
import { websocketService } from '../services/websocket.service';
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
  const { setState } = useCanvasStore();
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
          // Update canvas state via page.updateCanvas procedure
          // This will trigger visual-to-code sync automatically
          await trpc.page.updateCanvas.mutate({
            filePath,
            canvasState,
          });
        } catch (error) {
          console.error('Error triggering visual-to-code sync:', error);
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

    // Also subscribe to syncStatus events for UI feedback
    const unsubscribeSync = websocketService.on('syncStatus', (message: WebSocketMessage) => {
      if (message.type === 'syncStatus') {
        const data = message.data as { status: string; pageId?: string; traceId?: string; error?: string };
        if (data.pageId === filePath) {
          // Handle sync status updates (can be used for UI indicators)
          if (data.status === 'synced') {
            console.log('Sync completed:', data.traceId);
          } else if (data.status === 'error') {
            console.error('Sync error:', data.error);
          }
        }
      }
    });

    // Subscribe to conflict events
    const unsubscribeConflict = websocketService.on('conflict', (message: WebSocketMessage) => {
      if (message.type === 'conflict') {
        const data = message.data as { pageId: string; filePath: string; resolution: string; timestamp: string };
        if (data.pageId === filePath || data.filePath === filePath) {
          console.warn('Conflict detected and resolved:', data.resolution);
          // UI can show conflict notification here
        }
      }
    });

    // Cleanup subscriptions
    return () => {
      unsubscribe();
      unsubscribeSync();
      unsubscribeConflict();
    };
  }, [filePath, setState]);

  return {
    triggerSync: triggerVisualToCodeSync,
  };
}

