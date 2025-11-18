import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor } from '@craftjs/core';
import { Frame, Element } from '@craftjs/core';
import { useCanvasStore } from '../store/canvas.store';
import { AlertCircle } from 'lucide-react';
import { ContextMenu } from './ContextMenu';
import { usePageStore } from '../store/page.store';

// Import components to get their craft configuration
import { Container } from './blocks/Container';
import { Heading } from './blocks/Heading';
import { Button } from './blocks/Button';
import { Text } from './blocks/Text';
import { Image } from './blocks/Image';
import { Input } from './blocks/Input';
import { Card } from './blocks/Card';
import { List } from './blocks/List';
import { Link } from './blocks/Link';
import { Divider } from './blocks/Divider';
import { Hero } from './library/Hero';
import { Navbar } from './library/Navbar';
import { Pricing } from './library/Pricing';
import { Testimonials } from './library/Testimonials';
import { FAQ } from './library/FAQ';
import { CTA } from './library/CTA';
import { Footer } from './library/Footer';

// Map component names to their implementations for getting craft props
const COMPONENT_MAP: Record<string, any> = {
  Container,
  Heading,
  Button,
  Text,
  Image,
  Input,
  Card,
  List,
  Link,
  Divider,
  Hero,
  Navbar,
  Pricing,
  Testimonials,
  FAQ,
  CTA,
  Footer,
};

interface CanvasProps {
  initialState?: any;
}

export function Canvas({ initialState }: CanvasProps) {
  const { actions, query, selected } = useEditor((state) => ({
    selected: state.events.selected,
  }));
  
  const canvasNodeIdRef = useRef<string | null>(null);
  const currentPage = usePageStore((state) => state.currentPage);
  const filePath = currentPage?.filePath;
  
  // Create default state for index.tsx based on file content
  const createDefaultStateForIndex = useCallback(() => {
    // Match the structure of src/pages/index.tsx
    return {
      ROOT: {
        type: { resolvedName: 'Container' },
        isCanvas: true,
        props: {},
        displayName: 'Container',
        custom: {},
        nodes: [],
        parent: null,
      },
      'ROOT_0': {
        type: { resolvedName: 'div' },
        isCanvas: true,
        props: { className: 'container mx-auto p-8', 'data-cf-id': 'root' },
        displayName: 'div',
        custom: {},
        nodes: ['ROOT_0_0', 'ROOT_0_1', 'ROOT_0_2'],
        parent: 'ROOT',
      },
      'ROOT_0_0': {
        type: { resolvedName: 'Heading' },
        isCanvas: false,
        props: { text: 'Welcome to CursorFi Visual Editor', level: 1, className: 'text-4xl font-bold mb-4', 'data-cf-id': 'heading' },
        displayName: 'Heading',
        custom: {},
        nodes: [],
        parent: 'ROOT_0',
      },
      'ROOT_0_1': {
        type: { resolvedName: 'Text' },
        isCanvas: false,
        props: { text: 'This is a test page to demonstrate the visual editor functionality. You can edit this page visually using the editor interface.', className: 'text-lg text-gray-600 mb-8', 'data-cf-id': 'description' },
        displayName: 'Text',
        custom: {},
        nodes: [],
        parent: 'ROOT_0',
      },
      'ROOT_0_2': {
        type: { resolvedName: 'div' },
        isCanvas: true,
        props: { className: 'flex gap-4', 'data-cf-id': 'button-container' },
        displayName: 'div',
        custom: {},
        nodes: ['ROOT_0_2_0', 'ROOT_0_2_1'],
        parent: 'ROOT_0',
      },
      'ROOT_0_2_0': {
        type: { resolvedName: 'Button' },
        isCanvas: false,
        props: { text: 'Get Started', className: 'bg-blue-500 text-white px-6 py-2 rounded', 'data-cf-id': 'button-1' },
        displayName: 'Button',
        custom: {},
        nodes: [],
        parent: 'ROOT_0_2',
      },
      'ROOT_0_2_1': {
        type: { resolvedName: 'Button' },
        isCanvas: false,
        props: { text: 'Learn More', className: 'bg-gray-200 text-gray-800 px-6 py-2 rounded', 'data-cf-id': 'button-2' },
        displayName: 'Button',
        custom: {},
        nodes: [],
        parent: 'ROOT_0_2',
      },
    };
  }, []);
  
  // Load initial state into CraftJS when it becomes available
  useEffect(() => {
    if (!query || !actions) {
      return;
    }
    
    // Use setTimeout to avoid updating during render
    const timeoutId = setTimeout(() => {
      try {
        // Check if we already have nodes
        const currentNodes = query.getNodes();
        const hasNodes = currentNodes && Object.keys(currentNodes).length > 1;
        
        if (!hasNodes) {
          let stateToLoad = null;
          
          if (initialState && typeof initialState === 'object' && Object.keys(initialState).length > 0) {
            // Use provided initial state
            stateToLoad = initialState;
            console.log('[Canvas] Loading initial state:', Object.keys(initialState));
          } else if (filePath && filePath.includes('index.tsx')) {
            // Create default state for index.tsx if no state exists
            console.log('[Canvas] Creating default state for index.tsx');
            stateToLoad = createDefaultStateForIndex();
          }
          
          if (stateToLoad) {
            query.deserialize(stateToLoad);
            console.log('[Canvas] State loaded into CraftJS');
          }
        }
      } catch (error) {
        console.error('[Canvas] Error loading initial state:', error);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [initialState, query, actions, filePath, createDefaultStateForIndex]);
  
  // Update canvas node ID when nodes change
  useEffect(() => {
    // Use setTimeout to avoid updating during render
    const timeoutId = setTimeout(() => {
      try {
        const nodes = query.getNodes();
        if (nodes) {
          // Find canvas element - Element with canvas prop inside ROOT
          for (const [nodeId, node] of Object.entries(nodes)) {
            if (nodeId === 'ROOT') continue;
            
            const nodeData = (node as any)?.data;
            if (nodeData?.isCanvas) {
              // Check if it's a direct child of ROOT
              const parentId = nodeData?.parent;
              if (parentId === 'ROOT' || parentId === null) {
                canvasNodeIdRef.current = nodeId;
                console.log('[Canvas] Canvas node ID stored:', nodeId);
                break;
              }
            }
          }
        }
      } catch (error) {
        console.warn('[Canvas] Error finding canvas node:', error);
      }
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [query]);

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
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Try multiple ways to get the component name (some browsers require different approaches)
    let componentName = '';
    
    // Method 1: Try getData with the MIME type
    try {
      componentName = e.dataTransfer.getData('craftjs/component');
    } catch (err) {
      console.warn('[Canvas] Error getting data with craftjs/component:', err);
    }
    
    // Method 2: Try getData with text/plain
    if (!componentName) {
      try {
        componentName = e.dataTransfer.getData('text/plain');
      } catch (err) {
        console.warn('[Canvas] Error getting data with text/plain:', err);
      }
    }
    
    // Method 3: Try accessing items directly
    if (!componentName && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      try {
        const item = Array.from(e.dataTransfer.items).find(item => 
          item.type === 'craftjs/component' || item.type === 'text/plain'
        );
        if (item) {
          componentName = e.dataTransfer.getData(item.type);
        }
      } catch (err) {
        console.warn('[Canvas] Error accessing dataTransfer items:', err);
      }
    }
    
    console.log('[Canvas] Drop event received, component:', componentName, 'dataTransfer types:', Array.from(e.dataTransfer.types || []));
    
    if (!componentName) {
      console.warn('[Canvas] No component name in dataTransfer. Available types:', Array.from(e.dataTransfer.types || []));
      return;
    }
    
    if (!actions || !query) {
      console.warn('[Canvas] Actions or query not available');
      return;
    }

    try {
      // Try to use stored canvas node ID first
      let parentNodeId = canvasNodeIdRef.current;
      
      if (!parentNodeId) {
        // Get all nodes to find the canvas element (Element with canvas prop)
        const nodes = query.getNodes();
        console.log('[Canvas] Available nodes:', Object.keys(nodes || {}));
        
        // Find the canvas node - it's the Element inside Frame
        let canvasNodeId: string | null = null;
        
        if (nodes) {
          // Look for a node that has isCanvas = true and is inside ROOT
          for (const [nodeId, node] of Object.entries(nodes)) {
            if (nodeId === 'ROOT') continue;
            
            const nodeData = (node as any)?.data;
            if (nodeData?.isCanvas && (nodeData?.parent === 'ROOT' || nodeData?.parent === null)) {
              canvasNodeId = nodeId;
              console.log('[Canvas] Found canvas node:', nodeId, nodeData);
              break;
            }
          }
          
          // If no canvas node found, try ROOT itself
          if (!canvasNodeId) {
            try {
              const rootNode = query.node('ROOT').get();
              const rootData = (rootNode as any)?.data;
              if (rootData?.isCanvas) {
                canvasNodeId = 'ROOT';
              }
            } catch (err) {
              // ROOT might not exist, try to use it anyway
              canvasNodeId = 'ROOT';
            }
          }
        }
        
        // Use canvas node ID or ROOT as fallback
        parentNodeId = canvasNodeId || 'ROOT';
        canvasNodeIdRef.current = parentNodeId;
      }
      
      console.log('[Canvas] Using parent node ID:', parentNodeId);

      // Verify that parent node exists and can accept children
      let parentNode: any = null;
      try {
        parentNode = query.node(parentNodeId).get();
        console.log('[Canvas] Parent node verified:', parentNode);
        
        // Check if parent node can accept children (must be canvas)
        const parentData = (parentNode as any)?.data;
        const isCanvas = parentData?.isCanvas;
        
        console.log('[Canvas] Parent node isCanvas:', isCanvas, 'Parent data:', parentData);
        
        // If ROOT is not canvas, we need to find or wait for canvas node
        if (!isCanvas && parentNodeId === 'ROOT') {
          console.log('[Canvas] ROOT is not canvas, waiting for canvas node...');
          
          // Wait a bit for Element to initialize
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Try to find canvas node again
          const nodes = query.getNodes();
          if (nodes) {
            for (const [nodeId, node] of Object.entries(nodes)) {
              if (nodeId === 'ROOT') continue;
              const nodeData = (node as any)?.data;
              if (nodeData?.isCanvas) {
                parentNodeId = nodeId;
                parentNode = query.node(nodeId).get();
                console.log('[Canvas] Found canvas node after wait:', nodeId);
                break;
              }
            }
          }
          
          // If still no canvas node, try using ROOT anyway (CraftJS might create it)
          if (!parentNode || !((parentNode as any)?.data?.isCanvas)) {
            console.log('[Canvas] Still no canvas node, will try ROOT anyway');
          }
        }
      } catch (err) {
        console.error('[Canvas] Parent node does not exist:', parentNodeId, err);
        // Try ROOT as fallback
        parentNodeId = 'ROOT';
      }

      // Get component from our component map to get default props
      const Component = COMPONENT_MAP[componentName];
      
      if (!Component) {
        console.error('[Canvas] Component not found in component map:', componentName);
        console.log('[Canvas] Available components:', Object.keys(COMPONENT_MAP));
        return;
      }
      
      const defaultProps = Component?.craft?.props || {};
      console.log('[Canvas] Component found, default props:', defaultProps);

      // Create node tree with proper structure for CraftJS
      // CraftJS expects a specific structure - try without nested structure
      const tree = {
        type: {
          resolvedName: componentName,
        },
        props: defaultProps || {},
        nodes: [],
      };
      
      console.log('[Canvas] Adding node tree:', JSON.stringify(tree, null, 2), 'to parent:', parentNodeId);
      
      // Verify parent node one more time before adding
      try {
        const finalParent = query.node(parentNodeId).get();
        const finalParentData = (finalParent as any)?.data;
        console.log('[Canvas] Final parent node:', {
          id: parentNodeId,
          isCanvas: finalParentData?.isCanvas,
          nodes: finalParentData?.nodes,
          type: finalParentData?.type
        });
        
        if (!finalParentData?.isCanvas && parentNodeId !== 'ROOT') {
          console.warn('[Canvas] Parent node is not canvas, but trying anyway');
        }
      } catch (err) {
        console.error('[Canvas] Cannot verify final parent node:', err);
      }
      
      // Add the component to the canvas using CraftJS API
      // Use 'ROOT' if parentNodeId is still not valid
      const targetParent = parentNodeId || 'ROOT';
      
      try {
        actions.addNodeTree(tree, targetParent);
      } catch (addError) {
        console.error('[Canvas] Error in addNodeTree:', addError);
        // Try alternative: use actions.add if available
        if ((actions as any).add) {
          console.log('[Canvas] Trying actions.add as fallback');
          (actions as any).add(tree, targetParent);
        } else {
          throw addError;
        }
      }
      
      console.log('[Canvas] Component added successfully');
    } catch (error) {
      console.error('[Canvas] Error adding component to canvas:', error);
    }
  }, [actions, query]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      >
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="h-full w-full"
        >
          <Frame data={initialState || undefined}>
            <Element is={Container} canvas>
              {/* Canvas content will be rendered here by craft.js */}
              {/* T077: Conflict badges for individual nodes can be added via craft.js node customization */}
            </Element>
          </Frame>
        </div>
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

