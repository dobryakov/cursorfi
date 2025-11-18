import { websocketService } from './websocket.service';

interface SyncOperation {
  id: string;
  filePath: string;
  direction: 'visual-to-code' | 'code-to-visual';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  startedAt: string;
  completedAt: string | null;
  error: string | null;
  traceId: string;
}

class SyncService {
  private operations: Map<string, SyncOperation> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly debounceMs = parseInt(process.env.CURSORFI_SYNC_DEBOUNCE_MS || '400', 10);

  async trigger(filePath: string, direction: 'visual-to-code' | 'code-to-visual'): Promise<{ operationId: string; traceId: string }> {
    const traceId = crypto.randomUUID();
    const operationId = crypto.randomUUID();

    // Clear existing debounce timer for this file
    const existingTimer = this.debounceTimers.get(filePath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounce timer
    const timer = setTimeout(async () => {
      await this.executeSync(operationId, filePath, direction, traceId);
      this.debounceTimers.delete(filePath);
    }, this.debounceMs);

    this.debounceTimers.set(filePath, timer);

    websocketService.broadcast({
      type: 'syncStatus',
      data: {
        status: 'pending',
        pageId: filePath,
        traceId,
      },
    });

    return { operationId, traceId };
  }

  private async executeSync(
    operationId: string,
    filePath: string,
    direction: 'visual-to-code' | 'code-to-visual',
    traceId: string
  ): Promise<void> {
    const operation: SyncOperation = {
      id: operationId,
      filePath,
      direction,
      status: 'in-progress',
      startedAt: new Date().toISOString(),
      completedAt: null,
      error: null,
      traceId,
    };

    this.operations.set(operationId, operation);

    websocketService.broadcast({
      type: 'syncStatus',
      data: {
        status: 'syncing',
        pageId: filePath,
        traceId,
      },
    });

    try {
      // TODO: Implement actual sync logic
      // For now, just mark as completed
      operation.status = 'completed';
      operation.completedAt = new Date().toISOString();

      websocketService.broadcast({
        type: 'syncStatus',
        data: {
          status: 'synced',
          pageId: filePath,
          traceId,
        },
      });
    } catch (error) {
      operation.status = 'failed';
      operation.error = error instanceof Error ? error.message : 'Unknown error';
      operation.completedAt = new Date().toISOString();

      websocketService.broadcast({
        type: 'syncStatus',
        data: {
          status: 'error',
          pageId: filePath,
          traceId,
          error: operation.error,
        },
      });
    }

    this.operations.set(operationId, operation);
  }

  async getStatus(filePath: string): Promise<SyncOperation | null> {
    for (const operation of this.operations.values()) {
      if (operation.filePath === filePath && operation.status !== 'completed') {
        return operation;
      }
    }
    return null;
  }

  async list(): Promise<SyncOperation[]> {
    return Array.from(this.operations.values());
  }
}

export const syncService = new SyncService();

