import { readFile, writeFile, access, constants } from 'node:fs/promises';
import { join } from 'node:path';

const PROJECT_PATH = process.env.CURSORFI_PROJECT_PATH || '/app/project';

class FileService {
  private getAbsolutePath(relativePath: string): string {
    return join(PROJECT_PATH, relativePath);
  }

  async read(path: string): Promise<{ content: string; exists: boolean }> {
    try {
      const absolutePath = this.getAbsolutePath(path);
      await access(absolutePath, constants.F_OK);
      const content = await readFile(absolutePath, 'utf-8');
      return { content, exists: true };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { content: '', exists: false };
      }
      throw error;
    }
  }

  async write(path: string, content: string): Promise<{ success: boolean; path: string }> {
    const absolutePath = this.getAbsolutePath(path);
    await writeFile(absolutePath, content, 'utf-8');
    return { success: true, path: absolutePath };
  }

  async exists(path: string): Promise<boolean> {
    try {
      const absolutePath = this.getAbsolutePath(path);
      await access(absolutePath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
}

export const fileService = new FileService();

