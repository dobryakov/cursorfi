import { websocketService } from './websocket.service';
import { codeParserService } from './code-parser.service';
import { codeGeneratorService } from './code-generator.service';
import { pageService } from './page.service';
import { metadataService } from './metadata.service';
import { fileService } from './file.service';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { CanvasState } from '../types/canvas-state';

const PROJECT_PATH = process.env.CURSORFI_PROJECT_PATH || '/app/project';

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
  private fileTimestamps: Map<string, Date> = new Map();

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

  /**
   * Transform JSON DSL (craft.js state) to AST
   * T061: JSON DSL to AST transformation
   */
  private jsonDSLToAST(canvasState: CanvasState): any {
    // This is a simplified transformation - in full implementation,
    // this would create proper TypeScript AST nodes
    // For now, we'll use code generator service which handles this
    return canvasState;
  }

  /**
   * Transform AST to JSON DSL (craft.js state)
   * T062: AST to JSON DSL transformation
   */
  private async astToJSONDSL(filePath: string): Promise<CanvasState | null> {
    return await codeParserService.parseToJSONDSL(filePath);
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
      // T079-T080: Structured logging with trace IDs
      console.log(JSON.stringify({
        level: 'info',
        message: 'Sync operation started',
        traceId,
        filePath,
        direction,
        operationId,
        timestamp: new Date().toISOString(),
        operation: 'executeSync',
      }));

      // Check for conflicts before syncing
      const conflict = await this.detectConflict(filePath, direction, traceId);
      if (conflict) {
        // Resolve conflict using last-write-wins
        await this.resolveConflict(filePath, conflict, traceId);
      } else {
        if (direction === 'visual-to-code') {
          await this.syncVisualToCode(filePath, traceId);
        } else {
          await this.syncCodeToVisual(filePath, traceId);
        }
      }

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

      // T079-T080: Structured logging with trace IDs
      console.error(JSON.stringify({
        level: 'error',
        message: 'Sync operation failed',
        traceId,
        filePath,
        direction,
        operationId,
        error: operation.error,
        timestamp: new Date().toISOString(),
        operation: 'executeSync',
      }));

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

  /**
   * Visual-to-code synchronization
   * T064: Visual-to-code sync implementation
   */
  private async syncVisualToCode(filePath: string, traceId: string): Promise<void> {
    // Get canvas state from metadata
    const canvasState = await pageService.getCanvasState(filePath);
    if (!canvasState) {
      throw new Error('No canvas state found for file');
    }

    // Transform JSON DSL to code
    const code = await codeGeneratorService.generateFromJSONDSL(filePath, canvasState, true);

    // Write code to file
    await fileService.write(filePath, code);

    // Update metadata
    await metadataService.savePageMetadata(filePath, {
      canvasState,
      lastModifiedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    });

    // Update file timestamp
    const fullPath = join(PROJECT_PATH, filePath);
    try {
      const stats = await stat(fullPath);
      this.fileTimestamps.set(filePath, stats.mtime);
    } catch (error) {
      console.error(`[${traceId}] [ERROR] Error updating file timestamp for ${filePath}:`, error);
    }

    // T079-T080: Structured logging with trace IDs
    console.log(JSON.stringify({
      level: 'info',
      message: 'Visual-to-code sync completed',
      traceId,
      filePath,
      timestamp: new Date().toISOString(),
      operation: 'syncVisualToCode',
    }));
  }

  /**
   * Code-to-visual synchronization
   * T068: Code-to-visual sync implementation
   */
  private async syncCodeToVisual(filePath: string, traceId: string): Promise<void> {
    // Parse code to JSON DSL
    const canvasState = await codeParserService.parseToJSONDSL(filePath);
    if (!canvasState) {
      throw new Error('Failed to parse code to canvas state');
    }

    // Update canvas state in metadata
    await metadataService.savePageMetadata(filePath, {
      canvasState,
      lastModifiedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    });

    // Broadcast canvas state update to frontend
    websocketService.broadcast({
      type: 'fileChange',
      data: {
        filePath,
        eventType: 'change',
        timestamp: new Date().toISOString(),
      },
    });

    // T079-T080: Structured logging with trace IDs
    console.log(JSON.stringify({
      level: 'info',
      message: 'Code-to-visual sync completed',
      traceId,
      filePath,
      timestamp: new Date().toISOString(),
      operation: 'syncCodeToVisual',
    }));
  }

  /**
   * T073: Conflict detection using timestamp comparison
   */
  private async detectConflict(
    filePath: string,
    direction: 'visual-to-code' | 'code-to-visual',
    traceId: string
  ): Promise<{ visualTimestamp: Date; codeTimestamp: Date } | null> {
    const fullPath = join(PROJECT_PATH, filePath);

    // Get file modification time
    let codeTimestamp: Date;
    try {
      const stats = await stat(fullPath);
      codeTimestamp = stats.mtime;
    } catch (error) {
      // File doesn't exist, no conflict
      return null;
    }

    // Get last modified time from metadata
    const metadata = await metadataService.getPageMetadata(filePath);
    if (!metadata) {
      // No metadata, no conflict
      return null;
    }

    const visualTimestamp = new Date(metadata.lastModifiedAt);
    const lastSynced = metadata.lastSyncedAt ? new Date(metadata.lastSyncedAt) : null;

    // Check if file was modified after last sync
    if (direction === 'visual-to-code' && lastSynced && codeTimestamp > lastSynced) {
      // Code was modified after last sync - conflict
      return { visualTimestamp, codeTimestamp };
    }

    if (direction === 'code-to-visual' && lastSynced && visualTimestamp > lastSynced) {
      // Visual was modified after last sync - conflict
      return { visualTimestamp, codeTimestamp };
    }

    // Check cached timestamp
    const cachedTimestamp = this.fileTimestamps.get(filePath);
    if (cachedTimestamp && codeTimestamp.getTime() !== cachedTimestamp.getTime()) {
      // File changed since last sync - potential conflict
      return { visualTimestamp, codeTimestamp };
    }

    return null;
  }

  /**
   * T074: Last-write-wins conflict resolution
   */
  private async resolveConflict(
    filePath: string,
    conflict: { visualTimestamp: Date; codeTimestamp: Date },
    traceId: string
  ): Promise<void> {
    // Last-write-wins: use the most recent timestamp
    const lastWrite = conflict.codeTimestamp > conflict.visualTimestamp
      ? 'code'
      : 'visual';

    // T079-T080: Structured logging with trace IDs
    console.log(JSON.stringify({
      level: 'warn',
      message: 'Conflict detected, resolving with last-write-wins',
      traceId,
      filePath,
      resolution: lastWrite,
      visualTimestamp: conflict.visualTimestamp.toISOString(),
      codeTimestamp: conflict.codeTimestamp.toISOString(),
      timestamp: new Date().toISOString(),
      operation: 'resolveConflict',
    }));

    // Broadcast conflict event
    websocketService.broadcast({
      type: 'conflict',
      data: {
        pageId: filePath,
        filePath,
        resolution: 'last-write-wins',
        timestamp: new Date().toISOString(),
      },
    });

    // If code is newer, sync code-to-visual
    if (lastWrite === 'code') {
      await this.syncCodeToVisual(filePath, traceId);
    } else {
      // If visual is newer, sync visual-to-code
      await this.syncVisualToCode(filePath, traceId);
    }
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

