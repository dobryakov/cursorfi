import { fileService } from './file.service';
import { metadataService } from './metadata.service';
import { frameworkDetectorService } from './framework-detector.service';
import { projectService } from './project.service';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';

const PROJECT_PATH = process.env.CURSORFI_PROJECT_PATH || '/app/project';

interface Page {
  id: string;
  filePath: string;
  route: string;
  title: string | null;
  canvasState: any;
  lastSyncedAt: string | null;
  lastModifiedAt: string;
  createdAt: string;
}

class PageService {
  /**
   * T109-T113: List all pages in the project using framework detection
   */
  async list(): Promise<Page[]> {
    const projectMetadata = await projectService.getMetadata();
    if (!projectMetadata) {
      return [];
    }

    // Detect pages based on framework
    const pageFiles = await frameworkDetectorService.detectPages(
      PROJECT_PATH,
      projectMetadata.framework,
      projectMetadata.frameworkVariant
    );

    // Convert PageFile[] to Page[]
    const pages: Page[] = [];
    for (const pageFile of pageFiles) {
      // Get file stats for lastModifiedAt
      const fullPath = join(PROJECT_PATH, pageFile.filePath);
      let fileMtime: Date | null = null;
      try {
        const stats = await stat(fullPath);
        fileMtime = stats.mtime;
      } catch (error) {
        console.error(`Error getting file stats for ${pageFile.filePath}:`, error);
        continue;
      }

      // Get cached metadata if available
      const metadata = await metadataService.getPageMetadata(pageFile.filePath);
      
      pages.push({
        id: crypto.randomUUID(),
        filePath: pageFile.filePath,
        route: pageFile.route,
        title: null, // Could extract from file or metadata
        canvasState: metadata?.canvasState || null,
        lastSyncedAt: metadata?.lastSyncedAt || null,
        lastModifiedAt: metadata?.lastModifiedAt || fileMtime.toISOString(),
        createdAt: metadata?.lastModifiedAt || fileMtime.toISOString(),
      });
    }

    return pages;
  }

  async get(filePath: string): Promise<Page | null> {
    const exists = await fileService.exists(filePath);
    if (!exists) {
      return null;
    }

    // Get file modification time
    const fullPath = join(PROJECT_PATH, filePath);
    let fileMtime: Date | null = null;
    try {
      const stats = await stat(fullPath);
      fileMtime = stats.mtime;
    } catch (error) {
      console.error('Error getting file stats:', error);
    }

    // Check metadata cache
    const metadata = await metadataService.getPageMetadata(filePath);
    
    // If cache exists and file hasn't changed, use cached state
    if (metadata?.canvasState && fileMtime) {
      const cacheMtime = new Date(metadata.lastModifiedAt);
      if (fileMtime <= cacheMtime) {
        // File hasn't changed since last cache, use cached state
        return {
          id: crypto.randomUUID(),
          filePath,
          route: `/${filePath.replace(/\.[^/.]+$/, '').replace(/^app\/|^pages\/|^src\/pages\//, '')}`,
          title: null,
          canvasState: metadata.canvasState,
          lastSyncedAt: metadata.lastSyncedAt || null,
          lastModifiedAt: metadata.lastModifiedAt,
          createdAt: metadata.lastModifiedAt,
        };
      }
    }

    // If file changed or no cache, parse code to JSON DSL (T055a, T062a)
    const { codeParserService } = await import('./code-parser.service');
    const canvasState = await codeParserService.parseToJSONDSL(filePath);
    
    // Save parsed state to metadata cache
    if (canvasState) {
      await metadataService.savePageMetadata(filePath, {
        canvasState,
        lastModifiedAt: fileMtime?.toISOString() || new Date().toISOString(),
        lastSyncedAt: fileMtime?.toISOString() || new Date().toISOString(),
      });
    }
    
    return {
      id: crypto.randomUUID(),
      filePath,
      route: `/${filePath.replace(/\.[^/.]+$/, '').replace(/^app\/|^pages\/|^src\/pages\//, '')}`,
      title: null,
      canvasState: canvasState || null,
      lastSyncedAt: fileMtime?.toISOString() || null,
      lastModifiedAt: fileMtime?.toISOString() || new Date().toISOString(),
      createdAt: fileMtime?.toISOString() || new Date().toISOString(),
    };
  }

  async create(filePath: string, route: string): Promise<Page> {
    // TODO: Implement page creation
    return {
      id: crypto.randomUUID(),
      filePath,
      route,
      title: null,
      canvasState: null,
      lastSyncedAt: null,
      lastModifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
  }

  async switch(filePath: string): Promise<Page | null> {
    return await this.get(filePath);
  }

  async updateCanvas(filePath: string, canvasState: any): Promise<{ success: boolean }> {
    await metadataService.savePageMetadata(filePath, {
      canvasState,
      lastModifiedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    });
    
    // Trigger visual-to-code sync (T066)
    const { syncService } = await import('./sync.service');
    await syncService.trigger(filePath, 'visual-to-code');
    
    return { success: true };
  }

  async getCanvasState(filePath: string): Promise<any | null> {
    const metadata = await metadataService.getPageMetadata(filePath);
    return metadata?.canvasState || null;
  }
}

export const pageService = new PageService();

