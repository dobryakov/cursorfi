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

export function mapElementToFilePath(elementId: string, node: any): { filePath: string; lineNumber: number } | null {
  // TODO: Implement mapping from element ID to file path and line number
  // This will be used for "Open in Cursor" functionality
  return null;
}

