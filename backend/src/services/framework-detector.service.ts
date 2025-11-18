import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

interface FrameworkInfo {
  type: 'nextjs' | 'vite' | 'astro' | null;
  variant: string | null;
  componentPaths: string[];
}

export interface PageFile {
  filePath: string;
  route: string;
}

class FrameworkDetectorService {
  async detect(projectPath: string): Promise<FrameworkInfo> {
    // Check for Next.js
    if (existsSync(join(projectPath, 'next.config.js')) || 
        existsSync(join(projectPath, 'next.config.ts'))) {
      const appDirExists = existsSync(join(projectPath, 'app'));
      const pagesDirExists = existsSync(join(projectPath, 'pages'));
      
      return {
        type: 'nextjs',
        variant: appDirExists ? 'app-router' : pagesDirExists ? 'pages-router' : null,
        componentPaths: appDirExists 
          ? ['app', 'app/components']
          : ['components', 'src/components'],
      };
    }

    // Check for Astro
    if (existsSync(join(projectPath, 'astro.config.mjs')) ||
        existsSync(join(projectPath, 'astro.config.ts'))) {
      return {
        type: 'astro',
        variant: null,
        componentPaths: ['src/components'],
      };
    }

    // Check for Vite
    if (existsSync(join(projectPath, 'vite.config.js')) ||
        existsSync(join(projectPath, 'vite.config.ts'))) {
      const packageJson = this.readPackageJson(projectPath);
      const isReact = packageJson?.dependencies?.react || packageJson?.devDependencies?.react;
      
      return {
        type: 'vite',
        variant: isReact ? 'react' : null,
        componentPaths: ['src/components', 'src/pages'],
      };
    }

    // Default to Vite/React if no specific framework detected
    return {
      type: 'vite',
      variant: 'react',
      componentPaths: ['src/components', 'src/pages'],
    };
  }

  /**
   * T095: Detect Next.js App Router pages
   * Pages are in app/ directory: app/page.tsx, app/about/page.tsx, etc.
   */
  async detectNextJsAppRouterPages(projectPath: string): Promise<PageFile[]> {
    const appDir = join(projectPath, 'app');
    if (!existsSync(appDir)) {
      return [];
    }

    const pages: PageFile[] = [];
    const pageExtensions = ['.tsx', '.jsx', '.ts', '.js'];

    const scanDirectory = (dir: string, baseRoute: string = ''): void => {
      if (!existsSync(dir)) return;

      const entries = readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        const relativePath = relative(appDir, fullPath);
        
        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          scanDirectory(fullPath, baseRoute ? `${baseRoute}/${entry.name}` : entry.name);
        } else if (entry.isFile()) {
          const ext = extname(entry.name);
          if (pageExtensions.includes(ext)) {
            // Check if it's a page file (page.tsx, page.jsx, etc.)
            const nameWithoutExt = entry.name.replace(ext, '');
            if (nameWithoutExt === 'page' || nameWithoutExt === 'route') {
              const route = baseRoute ? `/${baseRoute}` : '/';
              pages.push({
                filePath: `app/${relativePath}`,
                route,
              });
            }
          }
        }
      }
    };

    scanDirectory(appDir);
    return pages;
  }

  /**
   * T096: Detect Next.js Pages Router pages
   * Pages are in pages/ directory: pages/index.tsx, pages/about.tsx, etc.
   */
  async detectNextJsPagesRouterPages(projectPath: string): Promise<PageFile[]> {
    const pagesDir = join(projectPath, 'pages');
    if (!existsSync(pagesDir)) {
      return [];
    }

    const pages: PageFile[] = [];
    const pageExtensions = ['.tsx', '.jsx', '.ts', '.js'];

    const scanDirectory = (dir: string, baseRoute: string = ''): void => {
      if (!existsSync(dir)) return;

      const entries = readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        const relativePath = relative(pagesDir, fullPath);
        
        if (entry.isDirectory()) {
          // Skip special Next.js directories
          if (entry.name.startsWith('_') || entry.name === 'api') {
            continue;
          }
          scanDirectory(fullPath, baseRoute ? `${baseRoute}/${entry.name}` : entry.name);
        } else if (entry.isFile()) {
          const ext = extname(entry.name);
          if (pageExtensions.includes(ext)) {
            const nameWithoutExt = entry.name.replace(ext, '');
            // index.tsx -> /, about.tsx -> /about
            const route = nameWithoutExt === 'index' 
              ? (baseRoute ? `/${baseRoute}` : '/')
              : baseRoute ? `/${baseRoute}/${nameWithoutExt}` : `/${nameWithoutExt}`;
            
            pages.push({
              filePath: `pages/${relativePath}`,
              route,
            });
          }
        }
      }
    };

    scanDirectory(pagesDir);
    return pages;
  }

  /**
   * T097: Detect Vite pages
   * Pages can be in src/pages/, src/routes/, or root src/
   */
  async detectVitePages(projectPath: string): Promise<PageFile[]> {
    const pages: PageFile[] = [];
    const pageExtensions = ['.tsx', '.jsx', '.ts', '.js'];
    
    // Check common Vite page locations
    const possibleDirs = [
      join(projectPath, 'src', 'pages'),
      join(projectPath, 'src', 'routes'),
      join(projectPath, 'src'),
    ];

    for (const dir of possibleDirs) {
      if (!existsSync(dir)) continue;

      const scanDirectory = (scanDir: string, baseRoute: string = ''): void => {
        if (!existsSync(scanDir)) return;

        const entries = readdirSync(scanDir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(scanDir, entry.name);
          const relativePath = relative(dir, fullPath);
          
          if (entry.isDirectory()) {
            scanDirectory(fullPath, baseRoute ? `${baseRoute}/${entry.name}` : entry.name);
          } else if (entry.isFile()) {
            const ext = extname(entry.name);
            if (pageExtensions.includes(ext)) {
              const nameWithoutExt = entry.name.replace(ext, '');
              // index.tsx -> /, about.tsx -> /about
              const route = nameWithoutExt === 'index' 
                ? (baseRoute ? `/${baseRoute}` : '/')
                : baseRoute ? `/${baseRoute}/${nameWithoutExt}` : `/${nameWithoutExt}`;
              
              // Determine file path relative to project root
              const filePath = relative(projectPath, fullPath);
              pages.push({
                filePath,
                route,
              });
            }
          }
        }
      };

      scanDirectory(dir);
      // Only scan first existing directory to avoid duplicates
      if (pages.length > 0) break;
    }

    return pages;
  }

  /**
   * T098: Detect Astro pages
   * Pages are in src/pages/ directory: src/pages/index.astro, src/pages/about.astro, etc.
   */
  async detectAstroPages(projectPath: string): Promise<PageFile[]> {
    const pagesDir = join(projectPath, 'src', 'pages');
    if (!existsSync(pagesDir)) {
      return [];
    }

    const pages: PageFile[] = [];
    const pageExtensions = ['.astro', '.tsx', '.jsx', '.ts', '.js'];

    const scanDirectory = (dir: string, baseRoute: string = ''): void => {
      if (!existsSync(dir)) return;

      const entries = readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        const relativePath = relative(pagesDir, fullPath);
        
        if (entry.isDirectory()) {
          scanDirectory(fullPath, baseRoute ? `${baseRoute}/${entry.name}` : entry.name);
        } else if (entry.isFile()) {
          const ext = extname(entry.name);
          if (pageExtensions.includes(ext)) {
            const nameWithoutExt = entry.name.replace(ext, '');
            // index.astro -> /, about.astro -> /about
            // [slug].astro -> /:slug (dynamic route)
            let route = nameWithoutExt;
            
            // Handle dynamic routes: [slug].astro -> /:slug
            route = route.replace(/\[([^\]]+)\]/g, ':$1');
            
            // Handle index files
            if (nameWithoutExt === 'index') {
              route = baseRoute ? `/${baseRoute}` : '/';
            } else {
              route = baseRoute ? `/${baseRoute}/${route}` : `/${route}`;
            }
            
            pages.push({
              filePath: `src/pages/${relativePath}`,
              route,
            });
          }
        }
      }
    };

    scanDirectory(pagesDir);
    return pages;
  }

  /**
   * Detect pages based on framework type
   */
  async detectPages(projectPath: string, frameworkType: 'nextjs' | 'vite' | 'astro' | null, variant: string | null): Promise<PageFile[]> {
    if (frameworkType === 'nextjs') {
      if (variant === 'app-router') {
        return await this.detectNextJsAppRouterPages(projectPath);
      } else if (variant === 'pages-router') {
        return await this.detectNextJsPagesRouterPages(projectPath);
      }
      // Try both if variant is unknown
      const appPages = await this.detectNextJsAppRouterPages(projectPath);
      const pagesPages = await this.detectNextJsPagesRouterPages(projectPath);
      return [...appPages, ...pagesPages];
    } else if (frameworkType === 'vite') {
      return await this.detectVitePages(projectPath);
    } else if (frameworkType === 'astro') {
      return await this.detectAstroPages(projectPath);
    }
    
    return [];
  }

  private readPackageJson(projectPath: string): any {
    try {
      const packageJsonPath = join(projectPath, 'package.json');
      if (existsSync(packageJsonPath)) {
        const content = readFileSync(packageJsonPath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Error reading package.json:', error);
    }
    return null;
  }
}

export const frameworkDetectorService = new FrameworkDetectorService();

