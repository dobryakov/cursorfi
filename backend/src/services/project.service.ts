import { frameworkDetectorService } from './framework-detector.service';

interface ProjectMetadata {
  id: string;
  path: string;
  framework: 'nextjs' | 'vite' | 'astro' | null;
  frameworkVariant: string | null;
  componentPaths: string[];
  createdAt: string;
  updatedAt: string;
}

class ProjectService {
  // In Docker container, project is mounted at /app/project
  // CURSORFI_PROJECT_PATH on host is mounted to /app/project in container
  private projectPath = '/app/project';
  private metadata: ProjectMetadata | null = null;

  async initialize(path?: string): Promise<ProjectMetadata> {
    if (path) {
      this.projectPath = path;
    }

    const framework = await frameworkDetectorService.detect(this.projectPath);
    
    this.metadata = {
      id: crypto.randomUUID(),
      path: this.projectPath,
      framework: framework.type,
      frameworkVariant: framework.variant,
      componentPaths: framework.componentPaths,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.metadata;
  }

  async getMetadata(): Promise<ProjectMetadata | null> {
    if (!this.metadata) {
      await this.initialize();
    }
    return this.metadata;
  }
}

export const projectService = new ProjectService();

