import chokidar from 'chokidar';
import { join } from 'node:path';
import { websocketService } from './websocket.service';

const PROJECT_PATH = process.env.CURSORFI_PROJECT_PATH || '/app/project';

class FileWatcherService {
  private watcher: chokidar.FSWatcher | null = null;
  private isWatching = false;

  private ignorePatterns = [
    '**/node_modules/**',
    '**/.next/**',
    '**/.vite/**',
    '**/.astro/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/.cursorfi/**',
    '**/*.log',
  ];

  start(): void {
    if (this.isWatching) {
      return;
    }

    const watchPaths = [
      join(PROJECT_PATH, 'src'),
      join(PROJECT_PATH, 'app'),
      join(PROJECT_PATH, 'pages'),
      join(PROJECT_PATH, 'components'),
    ];

    this.watcher = chokidar.watch(watchPaths, {
      ignored: this.ignorePatterns,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 100,
      },
      usePolling: false,
    });

    this.watcher
      .on('add', (filePath) => this.handleFileChange('add', filePath))
      .on('change', (filePath) => this.handleFileChange('change', filePath))
      .on('unlink', (filePath) => this.handleFileChange('unlink', filePath))
      .on('error', (error) => {
        console.error('File watcher error:', error);
      });

    this.isWatching = true;
    console.log('File watcher started');
  }

  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      this.isWatching = false;
      console.log('File watcher stopped');
    }
  }

  private handleFileChange(eventType: 'add' | 'change' | 'unlink', filePath: string): void {
    const relativePath = filePath.replace(PROJECT_PATH + '/', '');
    
    // Only watch relevant file types
    if (!/\.(ts|tsx|js|jsx|css|json)$/.test(filePath)) {
      return;
    }

    websocketService.broadcast({
      type: 'fileChange',
      data: {
        filePath: relativePath,
        eventType,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

export const fileWatcherService = new FileWatcherService();

