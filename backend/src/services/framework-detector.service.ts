import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

interface FrameworkInfo {
  type: 'nextjs' | 'vite' | 'astro' | null;
  variant: string | null;
  componentPaths: string[];
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

