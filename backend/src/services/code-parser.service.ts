import * as ts from 'typescript';
import { fileService } from './file.service';
import { CanvasState, CanvasNode } from '../types/canvas-state';

interface ASTNode {
  kind: ts.SyntaxKind;
  text: string;
  pos: number;
  end: number;
  children?: ASTNode[];
  [key: string]: any;
}

class CodeParserService {
  /**
   * Parse TSX/JSX file to TypeScript AST
   */
  async parseToAST(filePath: string): Promise<ts.SourceFile | null> {
    try {
      const { content, exists } = await fileService.read(filePath);
      if (!exists || !content) {
        return null;
      }

      // Create TypeScript source file
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true,
        filePath.endsWith('.tsx') || filePath.endsWith('.jsx') 
          ? ts.ScriptKind.TSX 
          : filePath.endsWith('.ts') || filePath.endsWith('.js')
          ? ts.ScriptKind.TS
          : ts.ScriptKind.Unknown
      );

      return sourceFile;
    } catch (error) {
      console.error(`Error parsing ${filePath} to AST:`, error);
      return null;
    }
  }

  /**
   * Parse code file to JSON DSL (craft.js format)
   * Reconstructs canvas state from code AST
   */
  async parseToJSONDSL(filePath: string): Promise<CanvasState | null> {
    try {
      const sourceFile = await this.parseToAST(filePath);
      if (!sourceFile) {
        console.error(`[CodeParser] Failed to parse AST for ${filePath}`);
        return null;
      }

      const canvasState: CanvasState = {
        nodes: {},
        events: [],
        selectedNodeId: null,
        viewport: {
          zoom: 1,
          panX: 0,
          panY: 0,
        },
      };

      // Find root component/export
      const rootNode = this.findRootComponent(sourceFile);
      if (!rootNode) {
        console.error(`[CodeParser] Failed to find root component in ${filePath}`);
        // Return empty state instead of null to show canvas
        return canvasState;
      }
      
      console.log(`[CodeParser] Found root component in ${filePath}, kind: ${rootNode.kind}`);

      // Build canvas nodes from AST
      const rootId = 'ROOT';
      const nodes = this.buildCanvasNodes(rootNode, sourceFile, rootId, null);
      
      console.log(`[CodeParser] Built ${Object.keys(nodes).length} nodes for ${filePath}`);
      
      // Set root node as canvas
      if (nodes[rootId]) {
        nodes[rootId].isCanvas = true;
      }

      canvasState.nodes = nodes;

      if (Object.keys(nodes).length === 0) {
        console.warn(`[CodeParser] No nodes built for ${filePath}, returning empty state`);
      }

      return canvasState;
    } catch (error) {
      console.error(`Error parsing ${filePath} to JSON DSL:`, error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      return null;
    }
  }

  private findRootComponent(sourceFile: ts.SourceFile): ts.Node | null {
    // Look for default export function/arrow function
    const visit = (node: ts.Node): ts.Node | null => {
      // Check for default export function: export default function HomePage()
      if (ts.isFunctionDeclaration(node)) {
        const hasExport = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
        const hasDefault = node.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword);
        if (hasExport && hasDefault) {
          return node;
        }
      }
      
      // Check for variable declaration with arrow function: export default const HomePage = () => {}
      if (ts.isVariableStatement(node)) {
        if (node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
          for (const decl of node.declarationList.declarations) {
            if (decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))) {
              return decl.initializer;
            }
          }
        }
      }
      
      // Check for export default assignment
      if (ts.isExportAssignment(node) && node.isExportEquals === false) {
        if (ts.isFunctionExpression(node.expression) || ts.isArrowFunction(node.expression)) {
          return node.expression;
        }
        // Could be identifier pointing to function
        return node.expression;
      }
      
      const child = ts.forEachChild(node, visit);
      if (child) return child;
      
      return null;
    };

    return visit(sourceFile);
  }

  private buildCanvasNodes(
    node: ts.Node,
    sourceFile: ts.SourceFile,
    nodeId: string,
    parentId: string | null
  ): Record<string, CanvasNode> {
    const nodes: Record<string, CanvasNode> = {};
    const rootChildren: string[] = [];

    // Extract component type
    let componentType = 'Container';
    let className = '';

    // Visit JSX elements - recursively build the node tree
    const visit = (n: ts.Node, parentId: string, childIndex: number): string | null => {
      if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) {
        const tagName = this.getJSXTagName(n, sourceFile);
        const jsxProps = this.extractJSXProps(n, sourceFile);
        
        // Create unique child ID
        const childId = `${parentId}_${childIndex}`;
        
        // Track root children
        if (parentId === nodeId) {
          rootChildren.push(childId);
        }

        // Extract className if present
        let nodeClassName = '';
        if (jsxProps.className) {
          nodeClassName = jsxProps.className;
          delete jsxProps.className;
        }

        // First create the node with empty children array
        const childNode: CanvasNode = {
          id: childId,
          type: {
            resolvedName: tagName,
          },
          isCanvas: this.isCanvasNode(tagName),
          props: {
            ...jsxProps,
            className: nodeClassName || '',
          },
          displayName: tagName,
          custom: {},
          nodes: [],
          parent: parentId,
        };

        nodes[childId] = childNode;

        // Recursively visit children and collect their IDs
        const childNodeIds: string[] = [];
        if (ts.isJsxElement(n)) {
          let index = 0;
          n.children.forEach((child) => {
            if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
              const visitedChildId = visit(child, childId, index++);
              if (visitedChildId) {
                childNodeIds.push(visitedChildId);
              }
            } else if (ts.isJsxExpression(child) && child.expression) {
              // Handle JSX expressions
              if (ts.isJsxElement(child.expression as ts.Node) || ts.isJsxSelfClosingElement(child.expression as ts.Node)) {
                const visitedChildId = visit(child.expression as ts.Node, childId, index++);
                if (visitedChildId) {
                  childNodeIds.push(visitedChildId);
                }
              }
            }
          });
        }

        // Update children array for this node
        childNode.nodes = childNodeIds;
        
        return childId;
      } else {
        // Visit children of non-JSX nodes
        let index = 0;
        let firstChildId: string | null = null;
        ts.forEachChild(n, (child) => {
          const visitedChildId = visit(child, parentId, index++);
          if (visitedChildId && !firstChildId) {
            firstChildId = visitedChildId;
          }
        });
        return firstChildId;
      }
    };

    // Start building from root
    if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      // Visit function body
      const body = ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) 
        ? node.body 
        : (node as ts.ArrowFunction).body;
      
      if (body && ts.isBlock(body)) {
        let childIndex = 0;
        body.statements.forEach((stmt) => {
          if (ts.isReturnStatement(stmt) && stmt.expression) {
            visit(stmt.expression, nodeId, childIndex++);
          }
        });
      } else if (body) {
        visit(body, nodeId, 0);
      }
    } else {
      visit(node, nodeId, 0);
    }

    // Create root node with only direct children
    // Filter children to include only those that have this node as parent
    const rootDirectChildren: string[] = [];
    Object.entries(nodes).forEach(([nId, node]) => {
      if ((node as any).parent === nodeId) {
        rootDirectChildren.push(nId);
      }
    });
    
    nodes[nodeId] = {
      id: nodeId,
      type: {
        resolvedName: componentType,
      },
      isCanvas: true,
      props: {
        className: className || '',
      },
      displayName: componentType,
      custom: {},
      nodes: rootDirectChildren.sort(),
      parent: parentId,
    };

    return nodes;
  }

  private getJSXTagName(node: ts.JsxElement | ts.JsxSelfClosingElement, sourceFile: ts.SourceFile): string {
    const tagNode = ts.isJsxElement(node) ? node.openingElement : node;
    
    if (ts.isIdentifier(tagNode.tagName)) {
      const tagName = tagNode.tagName.text;
      // Map HTML tags to CraftJS components
      const tagMap: Record<string, string> = {
        'div': 'Container',
        'h1': 'Heading',
        'h2': 'Heading',
        'h3': 'Heading',
        'h4': 'Heading',
        'h5': 'Heading',
        'h6': 'Heading',
        'p': 'Text',
        'button': 'Button',
        'input': 'Input',
        'img': 'Image',
        'a': 'Link',
        'ul': 'List',
        'ol': 'List',
        'li': 'List',
        'hr': 'Divider',
      };
      return tagMap[tagName] || tagName;
    }
    
    if (ts.isPropertyAccessExpression(tagNode.tagName)) {
      return tagNode.tagName.expression.getText(sourceFile) + '.' + tagNode.tagName.name.text;
    }

    return 'Container';
  }

  private extractJSXProps(node: ts.JsxElement | ts.JsxSelfClosingElement, sourceFile: ts.SourceFile): Record<string, any> {
    const tagNode = ts.isJsxElement(node) ? node.openingElement : node;
    const props: Record<string, any> = {};

    if (tagNode.attributes) {
      tagNode.attributes.properties.forEach((attr) => {
        if (ts.isJsxAttribute(attr)) {
          const name = attr.name.text;
          let value: any = true;

          if (attr.initializer) {
            if (ts.isStringLiteral(attr.initializer)) {
              value = attr.initializer.text;
            } else if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
              // Try to extract expression value
              if (ts.isStringLiteral(attr.initializer.expression)) {
                value = attr.initializer.expression.text;
              } else {
                // For complex expressions, keep the original text
                value = attr.initializer.expression.getText(sourceFile);
              }
            }
          }

          props[name] = value;
        }
      });
    }

    return props;
  }

  private isCanvasNode(tagName: string): boolean {
    // Common container components that can contain children
    const canvasComponents = ['div', 'Container', 'section', 'main', 'article', 'aside', 'header', 'footer', 'nav'];
    return canvasComponents.includes(tagName);
  }

  /**
   * Extract element tracking data (data-cf-id mapping)
   */
  extractElementTracking(sourceFile: ts.SourceFile): Map<string, { filePath: string; line: number; column: number }> {
    const tracking = new Map<string, { filePath: string; line: number; column: number }>();

    const visit = (node: ts.Node): void => {
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tagNode = ts.isJsxElement(node) ? node.openingElement : node;
        
        // Look for data-cf-id attribute
        if (tagNode.attributes) {
          tagNode.attributes.properties.forEach((attr) => {
            if (ts.isJsxAttribute(attr) && attr.name.text === 'data-cf-id') {
              if (attr.initializer && ts.isStringLiteral(attr.initializer)) {
                const id = attr.initializer.text;
                const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.pos);
                tracking.set(id, {
                  filePath: sourceFile.fileName,
                  line: line + 1,
                  column: character + 1,
                });
              }
            }
          });
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return tracking;
  }
}

export const codeParserService = new CodeParserService();
