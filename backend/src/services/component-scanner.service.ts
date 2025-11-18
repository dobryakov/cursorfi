import { websocketService } from './websocket.service';

interface ComponentMetadata {
  id: string;
  name: string;
  filePath: string;
  props: any[];
  isBuiltIn: boolean;
  category: string | null;
  lastScannedAt: string;
}

class ComponentScannerService {
  private components: Map<string, ComponentMetadata> = new Map();

  async scan(): Promise<{ componentCount: number }> {
    // TODO: Implement actual component scanning
    // For now, return empty result
    const componentCount = this.components.size;

    websocketService.broadcast({
      type: 'componentScanComplete',
      data: {
        componentCount,
        timestamp: new Date().toISOString(),
      },
    });

    return { componentCount };
  }

  async list(): Promise<ComponentMetadata[]> {
    return Array.from(this.components.values());
  }

  async get(filePath: string): Promise<ComponentMetadata | null> {
    return this.components.get(filePath) || null;
  }
}

export const componentScannerService = new ComponentScannerService();

