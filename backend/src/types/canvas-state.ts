export interface CanvasState {
  nodes: Record<string, CanvasNode>;
  events?: CanvasEvent[];
  selectedNodeId?: string | null;
  viewport?: Viewport;
}

export interface CanvasNode {
  id: string;
  type: {
    resolvedName: string;
  };
  isCanvas: boolean;
  props: Record<string, any>;
  displayName: string;
  custom: Record<string, any>;
  nodes?: string[];
  parent?: string | null;
}

export interface CanvasEvent {
  id: string;
  type: 'add' | 'remove' | 'update' | 'move' | 'style';
  nodeId: string;
  timestamp: string;
  data: Record<string, any>;
}

export interface Viewport {
  zoom: number;
  panX: number;
  panY: number;
}

