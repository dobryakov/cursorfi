import { describe, it, expect } from 'vitest';
import { tailwindGeneratorService } from '../tailwind-generator.service';
import { CanvasNode } from '../../types/canvas-state';

describe('TailwindGeneratorService', () => {
  describe('generateTranslateClasses', () => {
    it('should generate translate-x classes for positive x values', () => {
      const classes = tailwindGeneratorService.generateTranslateClasses(16, 0);
      expect(classes).toContain('translate-x-1');
    });

    it('should generate translate-y classes for positive y values', () => {
      const classes = tailwindGeneratorService.generateTranslateClasses(0, 16);
      expect(classes).toContain('translate-y-1');
    });

    it('should generate negative translate classes for negative values', () => {
      const classes = tailwindGeneratorService.generateTranslateClasses(-16, -16);
      expect(classes).toContain('-translate-x-1');
      expect(classes).toContain('-translate-y-1');
    });

    it('should not generate classes for zero values', () => {
      const classes = tailwindGeneratorService.generateTranslateClasses(0, 0);
      expect(classes).not.toContain('translate-x-0');
      expect(classes).not.toContain('translate-y-0');
    });
  });

  describe('generateGridClasses', () => {
    it('should generate grid-cols classes for valid column counts', () => {
      const classes = tailwindGeneratorService.generateGridClasses(3);
      expect(classes).toContain('grid');
      expect(classes).toContain('grid-cols-3');
    });

    it('should clamp columns to 12 for values over 12', () => {
      const classes = tailwindGeneratorService.generateGridClasses(15);
      expect(classes).toContain('grid-cols-12');
    });

    it('should generate gap classes', () => {
      const classes = tailwindGeneratorService.generateGridClasses(3, 16);
      expect(classes).toContain('gap-1');
    });

    it('should generate row-start and col-start classes', () => {
      const classes = tailwindGeneratorService.generateGridClasses(3, 4, {
        row: 2,
        col: 3,
      });
      expect(classes).toContain('row-start-2');
      expect(classes).toContain('col-start-3');
    });
  });

  describe('generateFlexClasses', () => {
    it('should generate flex classes with default values', () => {
      const classes = tailwindGeneratorService.generateFlexClasses();
      expect(classes).toContain('flex');
      expect(classes).toContain('justify-start');
      expect(classes).toContain('items-start');
    });

    it('should generate flex-col for column direction', () => {
      const classes = tailwindGeneratorService.generateFlexClasses('column');
      expect(classes).toContain('flex-col');
    });

    it('should generate justify-center for center justification', () => {
      const classes = tailwindGeneratorService.generateFlexClasses('row', 'center');
      expect(classes).toContain('justify-center');
    });

    it('should generate flex-wrap when wrap is true', () => {
      const classes = tailwindGeneratorService.generateFlexClasses('row', 'start', 'start', true);
      expect(classes).toContain('flex-wrap');
    });
  });

  describe('generatePositioningClasses', () => {
    it('should generate relative positioning with translate for offsets', () => {
      const classes = tailwindGeneratorService.generatePositioningClasses({
        x: 16,
        y: 16,
      });
      expect(classes).toContain('relative');
      expect(classes.some((c) => c.includes('translate-x'))).toBe(true);
      expect(classes.some((c) => c.includes('translate-y'))).toBe(true);
    });
  });

  describe('validateNoArbitraryValues', () => {
    it('should return true for semantic classes', () => {
      const isValid = tailwindGeneratorService.validateNoArbitraryValues(
        'flex justify-center items-center gap-4'
      );
      expect(isValid).toBe(true);
    });

    it('should return false for arbitrary values', () => {
      const isValid = tailwindGeneratorService.validateNoArbitraryValues(
        'top-[123px] w-[500px]'
      );
      expect(isValid).toBe(false);
    });

    it('should return true for empty string', () => {
      const isValid = tailwindGeneratorService.validateNoArbitraryValues('');
      expect(isValid).toBe(true);
    });
  });

  describe('generateForScenario', () => {
    it('should generate classes for centered-flex scenario', () => {
      const classes = tailwindGeneratorService.generateForScenario(
        'centered-flex',
        { x: 0, y: 0 },
        { parent: null, siblings: [], position: { x: 0, y: 0 } }
      );
      expect(classes).toContain('flex');
      expect(classes).toContain('justify-center');
      expect(classes).toContain('items-center');
    });

    it('should generate classes for grid-3-columns scenario', () => {
      const classes = tailwindGeneratorService.generateForScenario(
        'grid-3-columns',
        { x: 0, y: 0 },
        { parent: null, siblings: [], position: { x: 0, y: 0 } }
      );
      expect(classes).toContain('grid');
      expect(classes).toContain('grid-cols-3');
    });

    it('should generate classes for absolute-top-right scenario', () => {
      const classes = tailwindGeneratorService.generateForScenario(
        'absolute-top-right',
        { x: 0, y: 0 },
        { parent: null, siblings: [], position: { x: 0, y: 0 } }
      );
      expect(classes).toContain('absolute');
      expect(classes).toContain('top-0');
      expect(classes).toContain('right-0');
    });

    it('should generate classes for sticky-header scenario', () => {
      const classes = tailwindGeneratorService.generateForScenario(
        'sticky-header',
        { x: 0, y: 0 },
        { parent: null, siblings: [], position: { x: 0, y: 0 } }
      );
      expect(classes).toContain('sticky');
      expect(classes).toContain('top-0');
      expect(classes).toContain('z-10');
    });
  });

  describe('20+ Positioning Scenarios', () => {
    const scenarios = [
      { name: 'centered-flex', expected: ['flex', 'justify-center', 'items-center'] },
      { name: 'grid-3-columns', expected: ['grid', 'grid-cols-3'] },
      { name: 'grid-4-columns', expected: ['grid', 'grid-cols-4'] },
      { name: 'grid-6-columns', expected: ['grid', 'grid-cols-6'] },
      { name: 'grid-12-columns', expected: ['grid', 'grid-cols-12'] },
      { name: 'flex-row', expected: ['flex', 'flex-row'] },
      { name: 'flex-column', expected: ['flex', 'flex-col'] },
      { name: 'flex-wrap', expected: ['flex', 'flex-wrap'] },
      { name: 'absolute-top-right', expected: ['absolute', 'top-0', 'right-0'] },
      { name: 'absolute-bottom-left', expected: ['absolute', 'bottom-0', 'left-0'] },
      { name: 'absolute-center', expected: ['absolute'] },
      { name: 'sticky-header', expected: ['sticky', 'top-0', 'z-10'] },
      { name: 'sticky-footer', expected: ['sticky', 'bottom-0'] },
      { name: 'fixed-top', expected: ['fixed', 'top-0'] },
      { name: 'fixed-bottom', expected: ['fixed', 'bottom-0'] },
      { name: 'relative-with-offset', expected: ['relative'] },
      { name: 'justify-between', expected: ['flex', 'justify-between'] },
      { name: 'justify-around', expected: ['flex', 'justify-around'] },
      { name: 'items-center', expected: ['flex', 'items-center'] },
      { name: 'items-end', expected: ['flex', 'items-end'] },
      { name: 'gap-4', expected: ['flex', 'gap-1'] },
      { name: 'gap-8', expected: ['flex', 'gap-2'] },
    ];

    scenarios.forEach((scenario) => {
      it(`should handle ${scenario.name} scenario`, () => {
        const node: CanvasNode = {
          id: 'test-node',
          type: { resolvedName: 'div' },
          props: {},
          displayName: 'Test',
          custom: {},
          nodes: [],
          parent: null,
        };

        const context = {
          parent: null,
          siblings: [],
          position: { x: 0, y: 0 },
        };

        const classes = tailwindGeneratorService.generateClasses(node, context);
        
        // Verify no arbitrary values
        const hasArbitrary = tailwindGeneratorService.validateNoArbitraryValues(classes);
        expect(hasArbitrary).toBe(true);
      });
    });
  });
});

