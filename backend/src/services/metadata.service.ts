import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

// In Docker container, project is always mounted at /app/project
// CURSORFI_PROJECT_PATH on host is mounted to /app/project in container
// Metadata is stored inside container at /app/.cursorfi (not in read-only project)
const PROJECT_PATH = '/app/project';
const METADATA_PATH = join('/app', '.cursorfi', 'pages.json');

interface PageMetadata {
  canvasState: any;
  lastModifiedAt: string;
  lastSyncedAt: string | null;
}

interface ProjectMetadata {
  pages: Record<string, PageMetadata>;
  lastSyncedAt: string;
  version: string;
}

class MetadataService {
  private async ensureMetadataDir(): Promise<void> {
    const metadataDir = dirname(METADATA_PATH);
    if (!existsSync(metadataDir)) {
      await mkdir(metadataDir, { recursive: true });
    }
  }

  async getPageMetadata(filePath: string): Promise<PageMetadata | null> {
    try {
      if (!existsSync(METADATA_PATH)) {
        return null;
      }

      const content = await readFile(METADATA_PATH, 'utf-8');
      const metadata: ProjectMetadata = JSON.parse(content);
      return metadata.pages[filePath] || null;
    } catch (error) {
      console.error('Error reading metadata:', error);
      return null;
    }
  }

  async savePageMetadata(filePath: string, pageMetadata: PageMetadata): Promise<void> {
    await this.ensureMetadataDir();

    let metadata: ProjectMetadata = {
      pages: {},
      lastSyncedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    if (existsSync(METADATA_PATH)) {
      try {
        const content = await readFile(METADATA_PATH, 'utf-8');
        metadata = JSON.parse(content);
      } catch (error) {
        console.error('Error reading existing metadata:', error);
      }
    }

    metadata.pages[filePath] = pageMetadata;
    metadata.lastSyncedAt = new Date().toISOString();

    await writeFile(METADATA_PATH, JSON.stringify(metadata, null, 2), 'utf-8');
  }

  async getAllMetadata(): Promise<ProjectMetadata | null> {
    try {
      if (!existsSync(METADATA_PATH)) {
        return null;
      }

      const content = await readFile(METADATA_PATH, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error reading metadata:', error);
      return null;
    }
  }
}

export const metadataService = new MetadataService();

