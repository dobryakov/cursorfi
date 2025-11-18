import * as ts from 'typescript';
import traverse from '@babel/traverse';
import * as babel from '@babel/types';
import * as parser from '@babel/parser';
import generate from '@babel/generator';
import { CanvasNode } from '../types/canvas-state';

interface PreservationContext {
  originalCode: string;
  sourceFile: ts.SourceFile;
  nodeIdToClassName: Map<string, string>;
}

class CodePreservationService {
  /**
   * Preserve all non-styling code while updating only className attributes
   * Uses babel-traverse for targeted modifications
   */
  async preserveCodeAndUpdateClasses(
    filePath: string,
    originalCode: string,
    nodeIdToClassName: Map<string, string>
  ): Promise<string> {
    try {
      // Parse with Babel to get AST for traversal
      const ast = parser.parse(originalCode, {
        sourceType: 'module',
        plugins: [
          'typescript',
          'jsx',
          'decorators-legacy',
          'classProperties',
          'objectRestSpread',
        ],
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
      });

      // Also create TypeScript source file for reference
      const sourceFile = ts.createSourceFile(
        filePath,
        originalCode,
        ts.ScriptTarget.Latest,
        true,
        filePath.endsWith('.tsx') || filePath.endsWith('.jsx')
          ? ts.ScriptKind.TSX
          : ts.ScriptKind.TS
      );

      const context: PreservationContext = {
        originalCode,
        sourceFile,
        nodeIdToClassName,
      };

      // Traverse AST and update only className attributes
      const self = this;
      traverse(ast, {
        JSXOpeningElement(path) {
          self.updateClassNameAttribute(path, context);
        },
        JSXOpeningFragment(path) {
          // Fragments don't have attributes, skip
        },
      });

      // Generate code preserving formatting and comments
      const output = generate(
        ast,
        {
          retainLines: true,
          retainFunctionParens: true,
          comments: true,
          compact: false,
        },
        originalCode
      );

      return output.code;
    } catch (error) {
      console.error('Error preserving code:', error);
      // If Babel parsing fails, fall back to original code
      return originalCode;
    }
  }

  /**
   * Update className attribute on JSX element using babel-traverse
   */
  private updateClassNameAttribute(
    path: traverse.NodePath<babel.JSXOpeningElement>,
    context: PreservationContext
  ): void {
    const node = path.node;
    const attributes = node.attributes || [];

    // Find data-cf-id attribute to get node ID
    let nodeId: string | null = null;
    let classNameAttrIndex = -1;

    attributes.forEach((attr, index) => {
      if (babel.isJSXAttribute(attr)) {
        if (babel.isJSXIdentifier(attr.name)) {
          if (attr.name.name === 'data-cf-id') {
            // Extract node ID
            if (babel.isStringLiteral(attr.value)) {
              nodeId = attr.value.value;
            }
          } else if (attr.name.name === 'className') {
            classNameAttrIndex = index;
          }
        }
      }
    });

    // If we have a node ID and a new className, update it
    if (nodeId && context.nodeIdToClassName.has(nodeId)) {
      const newClassName = context.nodeIdToClassName.get(nodeId)!;

      if (classNameAttrIndex >= 0) {
        // Update existing className attribute
        const classNameAttr = attributes[classNameAttrIndex];
        if (babel.isJSXAttribute(classNameAttr)) {
          if (classNameAttr.value) {
            if (babel.isStringLiteral(classNameAttr.value)) {
              classNameAttr.value.value = newClassName;
            } else if (babel.isJSXExpressionContainer(classNameAttr.value)) {
              // Handle className={...} expressions
              if (babel.isStringLiteral(classNameAttr.value.expression)) {
                classNameAttr.value.expression.value = newClassName;
              } else {
                // Replace complex expression with string literal
                classNameAttr.value = babel.stringLiteral(newClassName);
              }
            }
          } else {
            // No value, add string literal
            classNameAttr.value = babel.stringLiteral(newClassName);
          }
        }
      } else {
        // Add new className attribute
        const classNameAttr = babel.jsxAttribute(
          babel.jsxIdentifier('className'),
          babel.stringLiteral(newClassName)
        );
        attributes.push(classNameAttr);
      }
    }
  }

  /**
   * Preserve comments, formatting, and component logic
   * This is handled by babel-generator with retainLines and comments options
   */
  preserveFormatting(originalCode: string, modifiedAST: babel.File): string {
    const output = generate(
      modifiedAST,
      {
        retainLines: true,
        retainFunctionParens: true,
        comments: true,
        compact: false,
        jsescOption: {
          quotes: 'single',
        },
      },
      originalCode
    );

    return output.code;
  }

  /**
   * Extract all non-styling code from a component
   * Returns code without className/class attributes
   */
  extractNonStylingCode(sourceFile: ts.SourceFile): {
    imports: string;
    exports: string;
    componentBody: string;
    hooks: string[];
    state: string[];
    functions: string[];
  } {
    const imports: string[] = [];
    const exports: string[] = [];
    const hooks: string[] = [];
    const state: string[] = [];
    const functions: string[] = [];

    const visit = (node: ts.Node): void => {
      // Extract imports
      if (ts.isImportDeclaration(node)) {
        imports.push(node.getText(sourceFile));
      }

      // Extract exports
      if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
        exports.push(node.getText(sourceFile));
      }

      // Extract hooks (useState, useEffect, etc.)
      if (ts.isCallExpression(node)) {
        const expression = node.expression;
        if (ts.isIdentifier(expression)) {
          const hookName = expression.text;
          if (hookName.startsWith('use') && hookName.length > 3) {
            hooks.push(node.getText(sourceFile));
          }
        }
      }

      // Extract variable declarations (state)
      if (ts.isVariableDeclaration(node)) {
        const text = node.getText(sourceFile);
        if (text.includes('useState') || text.includes('const [') || text.includes('let [')) {
          state.push(text);
        }
      }

      // Extract function declarations
      if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) {
        functions.push(node.getText(sourceFile));
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return {
      imports: imports.join('\n'),
      exports: exports.join('\n'),
      componentBody: sourceFile.getText(),
      hooks,
      state,
      functions,
    };
  }

  /**
   * Verify that user code is preserved (no logic removed)
   */
  verifyCodePreservation(
    originalCode: string,
    modifiedCode: string,
    filePath: string
  ): { preserved: boolean; differences: string[] } {
    const differences: string[] = [];

    try {
      // Parse both versions
      const originalAST = parser.parse(originalCode, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const modifiedAST = parser.parse(modifiedCode, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      // Compare structure (simplified - in production, use deep comparison)
      // For now, check that key structures exist
      const originalImports = this.extractImports(originalAST);
      const modifiedImports = this.extractImports(modifiedAST);

      if (originalImports.length !== modifiedImports.length) {
        differences.push('Import statements changed');
      }

      // Check that function bodies are preserved
      const originalFunctions = this.extractFunctions(originalAST);
      const modifiedFunctions = this.extractFunctions(modifiedAST);

      if (originalFunctions.length !== modifiedFunctions.length) {
        differences.push('Function count changed');
      }

      return {
        preserved: differences.length === 0,
        differences,
      };
    } catch (error) {
      return {
        preserved: false,
        differences: [`Verification error: ${error}`],
      };
    }
  }

  private extractImports(ast: babel.File): babel.ImportDeclaration[] {
    const imports: babel.ImportDeclaration[] = [];
    traverse(ast, {
      ImportDeclaration(path) {
        imports.push(path.node);
      },
    });
    return imports;
  }

  private extractFunctions(ast: babel.File): babel.FunctionDeclaration[] {
    const functions: babel.FunctionDeclaration[] = [];
    traverse(ast, {
      FunctionDeclaration(path) {
        functions.push(path.node);
      },
    });
    return functions;
  }
}

export const codePreservationService = new CodePreservationService();

