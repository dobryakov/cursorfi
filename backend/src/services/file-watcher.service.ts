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

    // Skip .cursorfi metadata files
    if (relativePath.includes('.cursorfi/')) {
      return;
    }

    // T108: Auto-scan component on file add/remove
    if ((eventType === 'add' || eventType === 'unlink') && /\.(tsx|jsx|ts|js)$/.test(filePath)) {
      // Check if it's a component file (not a page file)
      const isComponentFile = !relativePath.includes('/page.') && 
                              !relativePath.includes('/pages/') && 
                              !relativePath.includes('/app/') &&
                              (relativePath.includes('/components/') || 
                               relativePath.includes('/component/') ||
                               relativePath.includes('src/'));
      
      if (isComponentFile) {
        import('./component-scanner.service').then(({ componentScannerService }) => {
          componentScannerService.invalidateCache(relativePath, eventType);
        });
      }
    }

    // Emit fileChange WebSocket event (T070)
    websocketService.broadcast({
      type: 'fileChange',
      data: {
        filePath: relativePath,
        eventType,
        timestamp: new Date().toISOString(),
      },
    });

    // Trigger code-to-visual sync for page files (T069)
    if ((eventType === 'change' || eventType === 'add') && /\.(tsx|jsx)$/.test(filePath)) {
      // Only trigger for page files (check if it's a page file)
      if (relativePath.includes('/page.') || 
          relativePath.includes('/pages/') || 
          relativePath.includes('/app/')) {
        // Import sync service dynamically to avoid circular dependencies
        import('./sync.service').then(({ syncService }) => {
          syncService.trigger(relativePath, 'code-to-visual').catch((error) => {
            console.error(`Error triggering code-to-visual sync for ${relativePath}:`, error);
          });
        });
      }
    }
  }
}

export const fileWatcherService = new FileWatcherService();

