export type WebSocketEventType =
  | 'fileChange'
  | 'syncStatus'
  | 'componentScanComplete'
  | 'conflict';

export interface FileChangeEvent {
  filePath: string;
  eventType: 'add' | 'change' | 'unlink';
  timestamp: string;
}

export interface SyncStatusEvent {
  status: 'pending' | 'syncing' | 'synced' | 'error';
  pageId?: string;
  traceId?: string;
  error?: string;
}

export interface ComponentScanCompleteEvent {
  componentCount: number;
  timestamp: string;
}

export interface ConflictEvent {
  pageId: string;
  filePath: string;
  resolution: 'last-write-wins' | 'manual';
  timestamp: string;
}

export interface WebSocketMessage {
  type: WebSocketEventType;
  data: FileChangeEvent | SyncStatusEvent | ComponentScanCompleteEvent | ConflictEvent;
}

