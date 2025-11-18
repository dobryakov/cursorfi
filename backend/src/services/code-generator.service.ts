import * as ts from 'typescript';
import * as prettier from 'prettier';
import { CanvasState, CanvasNode } from '../types/canvas-state';
import { fileService } from './file.service';

class CodeGeneratorService {
  /**
   * Generate code from AST
   * Uses TypeScript compiler API to convert AST to formatted code
   */
  async generateFromAST(sourceFile: ts.SourceFile, newAST: ts.SourceFile): Promise<string> {
    try {
      // Create printer to convert AST to code
      const printer = ts.createPrinter({
        removeComments: false,
        preserveSourceMap: false,
      });

      // Generate code string
      let code = printer.printFile(newAST);

      // Format with Prettier if available
      try {
        code = await prettier.format(code, {
          parser: sourceFile.fileName.endsWith('.tsx') || sourceFile.fileName.endsWith('.jsx') 
            ? 'typescript' 
            : 'typescript',
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'es5',
        });
      } catch (prettierError) {
        // If Prettier fails, use TypeScript formatter
        console.warn('Prettier formatting failed, using TypeScript formatter:', prettierError);
      }

      return code;
    } catch (error) {
      console.error('Error generating code from AST:', error);
      throw error;
    }
  }

  /**
   * Generate code from JSON DSL (craft.js state)
   * Converts canvas state to TSX/JSX code
   */
  async generateFromJSONDSL(
    filePath: string,
    canvasState: CanvasState,
    preserveUserCode: boolean = true
  ): Promise<string> {
    try {
      // If preserving user code, read existing file and modify only className
      let originalCode = '';
      let sourceFile: ts.SourceFile | null = null;

      if (preserveUserCode) {
        const fileContent = await fileService.read(filePath);
        if (fileContent.exists && fileContent.content) {
          originalCode = fileContent.content;
          sourceFile = ts.createSourceFile(
            filePath,
            originalCode,
            ts.ScriptTarget.Latest,
            true,
            filePath.endsWith('.tsx') || filePath.endsWith('.jsx')
              ? ts.ScriptKind.TSX
              : ts.ScriptKind.TS
          );
        }
      }

      // Generate code from canvas state
      const code = this.canvasStateToCode(canvasState, sourceFile, originalCode);

      // Validate generated code
      await this.validateCode(code, filePath);

      return code;
    } catch (error) {
      console.error(`Error generating code from JSON DSL for ${filePath}:`, error);
      throw error;
    }
  }

  private canvasStateToCode(
    canvasState: CanvasState,
    sourceFile: ts.SourceFile | null,
    originalCode: string
  ): string {
    // Find root node
    const rootNode = Object.values(canvasState.nodes).find((node) => !node.parent);
    if (!rootNode) {
      return originalCode || this.generateDefaultComponent();
    }

    // Generate JSX from canvas nodes
    const jsx = this.nodeToJSX(rootNode, canvasState);

    // If we have original source file, try to preserve structure
    if (sourceFile && originalCode) {
      return this.mergeWithOriginalCode(originalCode, sourceFile, jsx);
    }

    // Generate new component
    return this.generateComponent(jsx);
  }

  private nodeToJSX(node: CanvasNode, canvasState: CanvasState, depth: number = 0): string {
    const indent = '  '.repeat(depth);
    const componentType = node.type.resolvedName;
    const props = node.props || {};
    const className = props.className || '';

    // Build props string
    const propsStrings: string[] = [];
    
    // Add data-cf-id for element tracking
    propsStrings.push(`data-cf-id="${node.id}"`);

    // Add className if present
    if (className) {
      propsStrings.push(`className="${className}"`);
    }

    // Add other props (excluding className)
    Object.entries(props).forEach(([key, value]) => {
      if (key !== 'className' && key !== 'data-cf-id') {
        if (typeof value === 'string') {
          propsStrings.push(`${key}="${value}"`);
        } else if (typeof value === 'boolean' && value) {
          propsStrings.push(key);
        } else {
          propsStrings.push(`${key}={${JSON.stringify(value)}}`);
        }
      }
    });

    const propsString = propsStrings.length > 0 ? ' ' + propsStrings.join(' ') : '';

    // Handle children
    const children = node.nodes || [];
    
    if (children.length === 0) {
      // Self-closing tag
      return `${indent}<${componentType}${propsString} />`;
    }

    // Open tag
    let jsx = `${indent}<${componentType}${propsString}>\n`;

    // Add child nodes
    children.forEach((childId) => {
      const childNode = canvasState.nodes[childId];
      if (childNode) {
        jsx += this.nodeToJSX(childNode, canvasState, depth + 1) + '\n';
      }
    });

    // Close tag
    jsx += `${indent}</${componentType}>`;

    return jsx;
  }

  private generateComponent(jsx: string): string {
    return `export default function Page() {
  return (
${jsx.split('\n').map(line => '    ' + line).join('\n')}
  );
}
`;
  }

  private generateDefaultComponent(): string {
    return `export default function Page() {
  return (
    <div className="container">
      <h1>New Page</h1>
    </div>
  );
}
`;
  }

  private mergeWithOriginalCode(
    originalCode: string,
    sourceFile: ts.SourceFile,
    newJSX: string
  ): string {
    // For now, simple approach: replace return statement JSX
    // In full implementation, this would use AST manipulation to preserve user code
    // and only modify className attributes

    // Try to find return statement and replace its JSX
    const returnMatch = originalCode.match(/(return\s*\()([\s\S]*?)(\);)/);
    if (returnMatch) {
      const beforeReturn = originalCode.substring(0, returnMatch.index || 0);
      const afterReturn = originalCode.substring((returnMatch.index || 0) + returnMatch[0].length);
      return beforeReturn + `return (\n${newJSX.split('\n').map(line => '    ' + line).join('\n')}\n  );` + afterReturn;
    }

    // Fallback: generate new component
    return this.generateComponent(newJSX);
  }

  /**
   * Validate generated code for syntax errors
   */
  private async validateCode(code: string, filePath: string): Promise<void> {
    try {
      const sourceFile = ts.createSourceFile(
        filePath,
        code,
        ts.ScriptTarget.Latest,
        true,
        filePath.endsWith('.tsx') || filePath.endsWith('.jsx')
          ? ts.ScriptKind.TSX
          : ts.ScriptKind.TS
      );

      // Check for syntax errors
      const diagnostics = ts.getPreEmitDiagnostics(
        ts.createProgram([filePath], {
          target: ts.ScriptTarget.Latest,
          module: ts.ModuleKind.ESNext,
          jsx: ts.JsxEmit.React,
          esModuleInterop: true,
        }, {
          getSourceFile: (fileName) => fileName === filePath ? sourceFile : undefined,
          writeFile: () => {},
          getCurrentDirectory: () => '/',
          getDirectories: () => [],
          fileExists: (fileName) => fileName === filePath,
          readFile: (fileName) => fileName === filePath ? code : undefined,
          getCanonicalFileName: (fileName) => fileName,
          useCaseSensitiveFileNames: () => true,
          getNewLine: () => '\n',
        })
      );

      if (diagnostics.length > 0) {
        const errors = diagnostics
          .filter((d) => d.category === ts.DiagnosticCategory.Error)
          .map((d) => {
            const message = ts.flattenDiagnosticMessageText(d.messageText, '\n');
            const file = d.file;
            const line = file ? file.getLineAndCharacterOfPosition(d.start || 0) : undefined;
            return `Error ${line ? `at ${line.line + 1}:${line.character + 1}` : ''}: ${message}`;
          });

        if (errors.length > 0) {
          throw new Error(`Generated code has syntax errors:\n${errors.join('\n')}`);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('syntax errors')) {
        throw error;
      }
      // If validation itself fails, log warning but don't block
      console.warn('Code validation failed:', error);
    }
  }

  /**
   * Create AST node factory helper
   */
  createASTNode(): ts.NodeFactory {
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
    };
    return ts.createNodeFactory(ts.createSourceFile('temp.ts', '', ts.ScriptTarget.Latest));
  }
}

export const codeGeneratorService = new CodeGeneratorService();

