import { websocketService } from './websocket.service';
import { projectService } from './project.service';
import { codeParserService } from './code-parser.service';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname, basename } from 'node:path';
import * as ts from 'typescript';

const PROJECT_PATH = process.env.CURSORFI_PROJECT_PATH || '/app/project';

interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue: any | null;
  description: string | null;
}

interface ComponentMetadata {
  id: string;
  name: string;
  filePath: string;
  props: ComponentProp[];
  isBuiltIn: boolean;
  category: string | null;
  lastScannedAt: string;
}

class ComponentScannerService {
  /**
   * T102: Component cache in memory (Map<filePath, ComponentMetadata>)
   */
  private components: Map<string, ComponentMetadata> = new Map();

  /**
   * T099: Scan project for components with parallel file processing
   * T100: Extract component metadata (name, file path)
   * T101: Extract component props using TypeScript Compiler API
   */
  async scan(): Promise<{ componentCount: number }> {
    const projectMetadata = await projectService.getMetadata();
    if (!projectMetadata) {
      return { componentCount: 0 };
    }

    // Get component paths from project metadata
    const componentPaths = projectMetadata.componentPaths || ['src/components', 'components'];
    
    // Find all component files
    const componentFiles: string[] = [];
    for (const componentPath of componentPaths) {
      const fullPath = join(PROJECT_PATH, componentPath);
      if (existsSync(fullPath)) {
        const files = this.findComponentFiles(fullPath, componentPath);
        componentFiles.push(...files);
      }
    }

    // T099: Process files in parallel batches
    const batchSize = 20;
    const batches: string[][] = [];
    for (let i = 0; i < componentFiles.length; i += batchSize) {
      batches.push(componentFiles.slice(i, i + batchSize));
    }

    // Process batches in parallel
    const scanPromises = batches.map(batch => 
      Promise.all(batch.map(filePath => this.scanComponentFile(filePath)))
    );

    await Promise.all(scanPromises);

    const componentCount = this.components.size;

    // T106: Emit componentScanComplete WebSocket event
    websocketService.broadcast({
      type: 'componentScanComplete',
      data: {
        componentCount,
        timestamp: new Date().toISOString(),
      },
    });

    return { componentCount };
  }

  /**
   * Find all component files recursively
   */
  private findComponentFiles(dir: string, basePath: string): string[] {
    const files: string[] = [];
    const componentExtensions = ['.tsx', '.jsx', '.ts', '.js'];

    const scanDirectory = (currentDir: string): void => {
      if (!existsSync(currentDir)) return;

      try {
        const entries = readdirSync(currentDir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(currentDir, entry.name);
          
          // Skip node_modules and other ignored directories
          if (entry.name === 'node_modules' || entry.name.startsWith('.') || entry.name === 'dist' || entry.name === 'build') {
            continue;
          }

          if (entry.isDirectory()) {
            scanDirectory(fullPath);
          } else if (entry.isFile()) {
            const ext = extname(entry.name);
            if (componentExtensions.includes(ext)) {
              const relativePath = relative(PROJECT_PATH, fullPath);
              files.push(relativePath);
            }
          }
        }
      } catch (error) {
        console.error(`Error scanning directory ${currentDir}:`, error);
      }
    };

    scanDirectory(dir);
    return files;
  }

  /**
   * T100, T101: Scan a single component file and extract metadata
   */
  private async scanComponentFile(filePath: string): Promise<void> {
    try {
      const sourceFile = await codeParserService.parseToAST(filePath);
      if (!sourceFile) {
        return;
      }

      // Extract component name and props
      const componentInfo = this.extractComponentInfo(sourceFile, filePath);
      if (!componentInfo) {
        return;
      }

      // T102: Cache component metadata
      const metadata: ComponentMetadata = {
        id: crypto.randomUUID(),
        name: componentInfo.name,
        filePath,
        props: componentInfo.props,
        isBuiltIn: false,
        category: this.inferCategory(filePath),
        lastScannedAt: new Date().toISOString(),
      };

      this.components.set(filePath, metadata);
    } catch (error) {
      console.error(`Error scanning component file ${filePath}:`, error);
    }
  }

  /**
   * T101: Extract component name and props using TypeScript Compiler API
   */
  private extractComponentInfo(sourceFile: ts.SourceFile, filePath: string): { name: string; props: ComponentProp[] } | null {
    let componentName: string | null = null;
    const props: ComponentProp[] = [];

    // Try to find default export or named export
    const visit = (node: ts.Node): void => {
      // Check for default export function/arrow function
      if (ts.isFunctionDeclaration(node)) {
        const isDefaultExport = node.modifiers?.some(
          m => m.kind === ts.SyntaxKind.ExportKeyword
        ) && node.modifiers?.some(
          m => m.kind === ts.SyntaxKind.DefaultKeyword
        );

        if (isDefaultExport || !componentName) {
          componentName = node.name?.text || this.getComponentNameFromFile(filePath);
          
          // Extract props from function parameters
          if (node.parameters && node.parameters.length > 0) {
            const propsParam = node.parameters[0];
            if (ts.isParameter(propsParam) && propsParam.type) {
              const extractedProps = this.extractPropsFromType(propsParam.type, sourceFile);
              props.push(...extractedProps);
            }
          }
        }
      }

      // Check for arrow function/variable declaration with default export
      if (ts.isVariableStatement(node)) {
        const hasDefaultExport = node.modifiers?.some(
          m => m.kind === ts.SyntaxKind.ExportKeyword
        );
        
        if (hasDefaultExport) {
          node.declarationList.declarations.forEach(decl => {
            if (decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))) {
              if (!componentName) {
                componentName = ts.isIdentifier(decl.name) 
                  ? decl.name.text 
                  : this.getComponentNameFromFile(filePath);
              }

              const func = decl.initializer;
              if (func.parameters && func.parameters.length > 0) {
                const propsParam = func.parameters[0];
                if (ts.isParameter(propsParam) && propsParam.type) {
                  const extractedProps = this.extractPropsFromType(propsParam.type, sourceFile);
                  props.push(...extractedProps);
                }
              }
            }
          });
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    if (!componentName) {
      componentName = this.getComponentNameFromFile(filePath);
    }

    return componentName ? { name: componentName, props } : null;
  }

  /**
   * Extract props from TypeScript type annotation
   */
  private extractPropsFromType(typeNode: ts.TypeNode, sourceFile: ts.SourceFile): ComponentProp[] {
    const props: ComponentProp[] = [];

    if (ts.isTypeLiteralNode(typeNode)) {
      // Interface or type literal: { prop1: string; prop2?: number }
      typeNode.members.forEach(member => {
        if (ts.isPropertySignature(member) && ts.isIdentifier(member.name)) {
          const propName = member.name.text;
          const propType = member.type ? member.type.getText(sourceFile) : 'any';
          const required = !member.questionToken;
          
          props.push({
            name: propName,
            type: propType,
            required,
            defaultValue: null,
            description: null,
          });
        }
      });
    } else if (ts.isTypeReferenceNode(typeNode)) {
      // Type reference: ComponentProps, Props, etc.
      // For now, we can't extract props from type references without type checker
      // This would require a full TypeScript program/checker
      // For MVP, we'll return empty props array
    }

    return props;
  }

  /**
   * Get component name from file path
   */
  private getComponentNameFromFile(filePath: string): string {
    const fileName = basename(filePath);
    const nameWithoutExt = fileName.replace(/\.(tsx|jsx|ts|js)$/, '');
    // Convert kebab-case or snake_case to PascalCase
    return nameWithoutExt
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  /**
   * Infer component category from file path
   */
  private inferCategory(filePath: string): string | null {
    const lowerPath = filePath.toLowerCase();
    if (lowerPath.includes('button') || lowerPath.includes('btn')) return 'form';
    if (lowerPath.includes('input') || lowerPath.includes('field')) return 'form';
    if (lowerPath.includes('card')) return 'content';
    if (lowerPath.includes('modal') || lowerPath.includes('dialog')) return 'overlay';
    if (lowerPath.includes('nav') || lowerPath.includes('menu')) return 'navigation';
    if (lowerPath.includes('header') || lowerPath.includes('footer')) return 'layout';
    if (lowerPath.includes('list') || lowerPath.includes('item')) return 'content';
    return null;
  }

  /**
   * T103: Invalidate component cache on file add/remove events
   */
  invalidateCache(filePath: string, eventType: 'add' | 'unlink'): void {
    if (eventType === 'unlink') {
      this.components.delete(filePath);
    } else if (eventType === 'add') {
      // Re-scan the file
      this.scanComponentFile(filePath).catch(error => {
        console.error(`Error re-scanning component ${filePath}:`, error);
      });
    }
  }

  async list(): Promise<ComponentMetadata[]> {
    return Array.from(this.components.values());
  }

  async get(filePath: string): Promise<ComponentMetadata | null> {
    return this.components.get(filePath) || null;
  }
}

export const componentScannerService = new ComponentScannerService();

