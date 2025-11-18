import { CanvasNode } from '../types/canvas-state';

interface Position {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

interface LayoutContext {
  parent: CanvasNode | null;
  siblings: CanvasNode[];
  position: Position;
}

class TailwindGeneratorService {
  /**
   * Generate semantic Tailwind classes for a canvas node
   * Ensures no arbitrary values are generated
   */
  generateClasses(node: CanvasNode, context: LayoutContext): string {
    const classes: string[] = [];

    // Add positioning classes
    const positioningClasses = this.generatePositioningClasses(context.position);
    classes.push(...positioningClasses);

    // Add layout classes (grid or flex)
    const layoutClasses = this.generateLayoutClasses(node, context);
    classes.push(...layoutClasses);

    // Add spacing classes
    const spacingClasses = this.generateSpacingClasses(node, context);
    classes.push(...spacingClasses);

    // Add sizing classes
    const sizingClasses = this.generateSizingClasses(context.position);
    classes.push(...sizingClasses);

    // Remove duplicates and empty strings
    return classes.filter((c, i, arr) => c && arr.indexOf(c) === i).join(' ');
  }

  /**
   * Generate translate-x/y classes for positioning
   * Uses semantic Tailwind translate utilities (translate-x-0, translate-x-1, etc.)
   */
  generateTranslateClasses(x: number, y: number): string[] {
    const classes: string[] = [];

    // Convert pixels to Tailwind spacing scale
    // Tailwind spacing scale: 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96
    // Each unit = 0.25rem = 4px (default)

    if (x !== 0) {
      const xValue = this.pixelsToTailwindSpacing(x);
      if (xValue > 0) {
        classes.push(`translate-x-${xValue}`);
      } else if (xValue < 0) {
        classes.push(`-translate-x-${Math.abs(xValue)}`);
      }
    }

    if (y !== 0) {
      const yValue = this.pixelsToTailwindSpacing(y);
      if (yValue > 0) {
        classes.push(`translate-y-${yValue}`);
      } else if (yValue < 0) {
        classes.push(`-translate-y-${Math.abs(yValue)}`);
      }
    }

    return classes;
  }

  /**
   * Generate grid-cols and grid positioning classes
   */
  generateGridClasses(
    columns: number,
    gap: number = 4,
    position?: { row?: number; col?: number }
  ): string[] {
    const classes: string[] = ['grid'];

    // Grid columns (1-12 supported by default Tailwind)
    if (columns >= 1 && columns <= 12) {
      classes.push(`grid-cols-${columns}`);
    } else if (columns > 12) {
      // For more than 12 columns, use grid-cols-12 (max)
      classes.push('grid-cols-12');
    } else {
      classes.push('grid-cols-1');
    }

    // Grid gap
    const gapValue = this.pixelsToTailwindSpacing(gap);
    if (gapValue > 0) {
      classes.push(`gap-${gapValue}`);
    }

    // Grid position (row-start, col-start)
    if (position) {
      if (position.row !== undefined && position.row >= 1) {
        classes.push(`row-start-${position.row}`);
      }
      if (position.col !== undefined && position.col >= 1) {
        classes.push(`col-start-${position.col}`);
      }
    }

    return classes;
  }

  /**
   * Generate flex utilities for flex layouts
   */
  generateFlexClasses(
    direction: 'row' | 'column' = 'row',
    justify: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' = 'start',
    align: 'start' | 'center' | 'end' | 'stretch' | 'baseline' = 'start',
    wrap: boolean = false,
    gap: number = 4
  ): string[] {
    const classes: string[] = ['flex'];

    // Flex direction
    if (direction === 'column') {
      classes.push('flex-col');
    }

    // Justify content
    switch (justify) {
      case 'start':
        classes.push('justify-start');
        break;
      case 'center':
        classes.push('justify-center');
        break;
      case 'end':
        classes.push('justify-end');
        break;
      case 'between':
        classes.push('justify-between');
        break;
      case 'around':
        classes.push('justify-around');
        break;
      case 'evenly':
        classes.push('justify-evenly');
        break;
    }

    // Align items
    switch (align) {
      case 'start':
        classes.push('items-start');
        break;
      case 'center':
        classes.push('items-center');
        break;
      case 'end':
        classes.push('items-end');
        break;
      case 'stretch':
        classes.push('items-stretch');
        break;
      case 'baseline':
        classes.push('items-baseline');
        break;
    }

    // Flex wrap
    if (wrap) {
      classes.push('flex-wrap');
    }

    // Gap
    const gapValue = this.pixelsToTailwindSpacing(gap);
    if (gapValue > 0) {
      classes.push(`gap-${gapValue}`);
    }

    return classes;
  }

  /**
   * Generate absolute, relative, fixed, sticky positioning classes
   */
  generatePositioningClasses(position: Position): string[] {
    const classes: string[] = [];

    // Position type (default to relative if not specified)
    // This would come from node props or context
    // For now, we'll generate based on position values

    // If position has x/y offsets, use relative positioning with translate
    if (position.x !== 0 || position.y !== 0) {
      classes.push('relative');
      const translateClasses = this.generateTranslateClasses(position.x, position.y);
      classes.push(...translateClasses);
    }

    return classes;
  }

  /**
   * Automatic layout selection (grid vs flex) based on element relationships
   */
  generateLayoutClasses(node: CanvasNode, context: LayoutContext): string[] {
    const children = node.nodes || [];
    const childCount = children.length;

    // If no children, no layout needed
    if (childCount === 0) {
      return [];
    }

    // Determine layout based on context
    // For now, use flex by default, grid if explicitly needed
    // In a full implementation, this would analyze element relationships

    // Check if parent has grid layout
    if (context.parent?.props?.className?.includes('grid')) {
      return []; // Child inherits grid context
    }

    // Default to flex layout
    return this.generateFlexClasses('row', 'start', 'start', false, 4);
  }

  /**
   * Generate spacing classes (padding, margin)
   */
  generateSpacingClasses(node: CanvasNode, context: LayoutContext): string[] {
    const classes: string[] = [];

    // Extract spacing from node props if available
    const props = node.props || {};
    
    // Padding
    if (props.padding) {
      const padding = this.pixelsToTailwindSpacing(props.padding);
      if (padding > 0) {
        classes.push(`p-${padding}`);
      }
    }

    // Margin
    if (props.margin) {
      const margin = this.pixelsToTailwindSpacing(props.margin);
      if (margin > 0) {
        classes.push(`m-${margin}`);
      }
    }

    return classes;
  }

  /**
   * Generate sizing classes (width, height)
   */
  generateSizingClasses(position: Position): string[] {
    const classes: string[] = [];

    // Width
    if (position.width !== undefined) {
      if (position.width === 100) {
        classes.push('w-full');
      } else if (position.width === 50) {
        classes.push('w-1/2');
      } else if (position.width === 33.333) {
        classes.push('w-1/3');
      } else if (position.width === 66.666) {
        classes.push('w-2/3');
      } else if (position.width === 25) {
        classes.push('w-1/4');
      } else if (position.width === 75) {
        classes.push('w-3/4');
      } else {
        // Use closest semantic width class
        const widthValue = this.pixelsToTailwindSpacing(position.width);
        if (widthValue > 0) {
          classes.push(`w-${widthValue}`);
        }
      }
    }

    // Height
    if (position.height !== undefined) {
      if (position.height === 100) {
        classes.push('h-full');
      } else {
        const heightValue = this.pixelsToTailwindSpacing(position.height);
        if (heightValue > 0) {
          classes.push(`h-${heightValue}`);
        }
      }
    }

    return classes;
  }

  /**
   * Convert pixels to Tailwind spacing scale
   * Tailwind spacing: 0.25rem increments (4px default)
   * Returns the closest Tailwind spacing value
   */
  private pixelsToTailwindSpacing(pixels: number): number {
    // Convert pixels to rem (assuming 16px = 1rem)
    const rem = pixels / 16;
    // Convert rem to Tailwind units (1 unit = 0.25rem)
    const tailwindUnits = Math.round(rem / 0.25);
    
    // Clamp to valid Tailwind spacing values (-96 to 96 for negative support)
    // For positive values, clamp to 0-96
    // For negative values, clamp to -96-0
    if (tailwindUnits >= 0) {
      return Math.min(96, tailwindUnits);
    } else {
      return Math.max(-96, tailwindUnits);
    }
  }

  /**
   * Ensure no arbitrary Tailwind values are generated
   * Validates that all classes use semantic utilities
   */
  validateNoArbitraryValues(classes: string): boolean {
    const classList = classes.split(' ');
    
    // Check for arbitrary values pattern: [value]
    const arbitraryPattern = /\[.*?\]/;
    
    for (const className of classList) {
      if (arbitraryPattern.test(className)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Generate classes for a specific positioning scenario
   * Used for testing various positioning scenarios
   */
  generateForScenario(scenario: string, position: Position, context: LayoutContext): string {
    switch (scenario) {
      case 'centered-flex':
        return this.generateFlexClasses('row', 'center', 'center', false, 4).join(' ');
      
      case 'grid-3-columns':
        return this.generateGridClasses(3, 4).join(' ');
      
      case 'absolute-top-right':
        return 'absolute top-0 right-0';
      
      case 'sticky-header':
        return 'sticky top-0 z-10';
      
      case 'flex-wrap':
        return this.generateFlexClasses('row', 'start', 'start', true, 4).join(' ');
      
      default:
        return this.generateClasses({} as CanvasNode, context);
    }
  }
}

export const tailwindGeneratorService = new TailwindGeneratorService();

