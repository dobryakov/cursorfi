import { fileService } from './file.service';
import { metadataService } from './metadata.service';

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
  async list(): Promise<Page[]> {
    // TODO: Implement page listing from framework detection
    return [];
  }

  async get(filePath: string): Promise<Page | null> {
    const exists = await fileService.exists(filePath);
    if (!exists) {
      return null;
    }

    const metadata = await metadataService.getPageMetadata(filePath);
    if (metadata?.canvasState) {
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

    // If no cached state, will need to parse code
    return {
      id: crypto.randomUUID(),
      filePath,
      route: `/${filePath.replace(/\.[^/.]+$/, '').replace(/^app\/|^pages\/|^src\/pages\//, '')}`,
      title: null,
      canvasState: null,
      lastSyncedAt: null,
      lastModifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
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
    return { success: true };
  }

  async getCanvasState(filePath: string): Promise<any | null> {
    const metadata = await metadataService.getPageMetadata(filePath);
    return metadata?.canvasState || null;
  }
}

export const pageService = new PageService();

