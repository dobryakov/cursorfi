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
      console.error(`Error parsing file ${filePath}:`, error);
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
        return canvasState;
      }

      // Build canvas nodes from AST
      const rootId = 'ROOT';
      const nodes = this.buildCanvasNodes(rootNode, sourceFile, rootId, null);
      
      // Set root node as canvas
      if (nodes[rootId]) {
        nodes[rootId].isCanvas = true;
      }

      canvasState.nodes = nodes;

      return canvasState;
    } catch (error) {
      console.error(`Error parsing ${filePath} to JSON DSL:`, error);
      return null;
    }
  }

  private findRootComponent(sourceFile: ts.SourceFile): ts.Node | null {
    // Look for default export function/arrow function
    const visit = (node: ts.Node): ts.Node | null => {
      if (ts.isFunctionDeclaration(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword && m.kind === ts.SyntaxKind.DefaultKeyword)) {
        return node;
      }
      if (ts.isVariableDeclaration(node) && node.initializer) {
        if (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) {
          return node.initializer;
        }
      }
      if (ts.isExportAssignment(node)) {
        return node.expression;
      }
      
      return ts.forEachChild(node, visit) || null;
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
    const children: string[] = [];

    // Extract component type
    let componentType = 'Container';
    let props: Record<string, any> = {};
    let className = '';

    // Visit JSX elements
    const visit = (n: ts.Node, id: string, pId: string | null): void => {
      if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) {
        const tagName = this.getJSXTagName(n, sourceFile);
        const jsxProps = this.extractJSXProps(n, sourceFile);
        
        const childId = `${id}_${children.length}`;
        children.push(childId);

        // Extract className if present
        if (jsxProps.className) {
          className = jsxProps.className;
          delete jsxProps.className;
        }

        nodes[childId] = {
          id: childId,
          type: {
            resolvedName: tagName,
          },
          isCanvas: this.isCanvasNode(tagName),
          props: {
            ...jsxProps,
            className: className || '',
          },
          displayName: tagName,
          custom: {},
          nodes: [],
          parent: pId,
        };

        // Recursively visit children
        if (ts.isJsxElement(n)) {
          n.children.forEach((child, index) => {
            if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
              visit(child, childId, childId);
            } else if (ts.isJsxExpression(child) && child.expression) {
              // Handle JSX expressions
              if (ts.isJsxElement(child.expression as ts.Node) || ts.isJsxSelfClosingElement(child.expression as ts.Node)) {
                visit(child.expression as ts.Node, childId, childId);
              }
            }
          });
        }

        // Update children array
        if (nodes[childId]) {
          nodes[childId].nodes = children.filter(c => c.startsWith(`${childId}_`));
        }
      } else {
        // Visit children
        ts.forEachChild(n, (child) => {
          visit(child, id, pId);
        });
      }
    };

    // Start building from root
    if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      // Visit function body
      const body = ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) 
        ? node.body 
        : (node as ts.ArrowFunction).body;
      
      if (body && ts.isBlock(body)) {
        body.statements.forEach((stmt) => {
          if (ts.isReturnStatement(stmt) && stmt.expression) {
            visit(stmt.expression, nodeId, parentId);
          }
        });
      } else if (body) {
        visit(body, nodeId, parentId);
      }
    } else {
      visit(node, nodeId, parentId);
    }

    // Create root node
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
      nodes: children,
      parent: parentId,
    };

    return nodes;
  }

  private getJSXTagName(node: ts.JsxElement | ts.JsxSelfClosingElement, sourceFile: ts.SourceFile): string {
    const tagNode = ts.isJsxElement(node) ? node.openingElement : node;
    
    if (ts.isIdentifier(tagNode.tagName)) {
      return tagNode.tagName.text;
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

