export function generateElementId(): string {
  return `cf-${crypto.randomUUID()}`;
}

export function getElementIdFromNode(node: any): string | null {
  if (!node) return null;
  
  // Check data-cf-id attribute
  if (node.props?.custom?.dataCfId) {
    return node.props.custom.dataCfId;
  }
  
  // Check custom.data-cf-id
  if (node.custom?.['data-cf-id']) {
    return node.custom['data-cf-id'];
  }
  
  // Fallback to node ID
  return node.id || null;
}

export function setElementId(node: any, id: string): void {
  if (!node) return;
  
  if (!node.custom) {
    node.custom = {};
  }
  
  node.custom['data-cf-id'] = id;
  
  if (node.props) {
    if (!node.props.custom) {
      node.props.custom = {};
    }
    node.props.custom.dataCfId = id;
  }
}

/**
 * T118: Map canvas element to file path and line number
 * Used for "Open in Cursor" functionality
 * 
 * @param elementId - The element ID (data-cf-id)
 * @param node - The craft.js node data
 * @param currentFilePath - The current page's file path (from Editor)
 * @returns File path and line number, or null if not available
 */
export function mapElementToFilePath(
  elementId: string,
  node: any,
  currentFilePath: string | undefined
): { filePath: string; lineNumber: number } | null {
  if (!currentFilePath) {
    return null;
  }

  // Extract line number from node's custom metadata if available
  // Line numbers are stored during code parsing (code-parser.service.ts)
  const lineNumber = node?.custom?.['data-cf-line'] || 
                     node?.custom?.lineNumber || 
                     node?.props?.custom?.lineNumber ||
                     1; // Default to line 1 if not available

  return {
    filePath: currentFilePath,
    lineNumber: typeof lineNumber === 'number' ? lineNumber : 1,
  };
}

