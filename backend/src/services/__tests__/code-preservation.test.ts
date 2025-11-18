import { describe, it, expect } from 'vitest';
import { codePreservationService } from '../code-preservation.service';

describe('CodePreservationService', () => {
  describe('preserveCodeAndUpdateClasses', () => {
    it('should preserve user code and update only className attributes', async () => {
      const originalCode = `
import React from 'react';

export default function Page() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);
  };
  
  return (
    <div data-cf-id="node-1" className="old-class">
      <button onClick={handleClick}>Click me</button>
      <p>Count: {count}</p>
    </div>
  );
}
`;

      const nodeIdToClassName = new Map<string, string>();
      nodeIdToClassName.set('node-1', 'new-class flex justify-center');

      const result = await codePreservationService.preserveCodeAndUpdateClasses(
        'test.tsx',
        originalCode,
        nodeIdToClassName
      );

      // Verify className was updated
      expect(result).toContain('new-class flex justify-center');
      
      // Verify user code is preserved
      expect(result).toContain('const [count, setCount] = useState(0)');
      expect(result).toContain('handleClick');
      expect(result).toContain('onClick={handleClick}');
      expect(result).toContain('Count: {count}');
    });

    it('should preserve comments in code', async () => {
      const originalCode = `
// This is a comment
export default function Page() {
  // Another comment
  return (
    <div data-cf-id="node-1" className="old">
      {/* JSX comment */}
      <p>Content</p>
    </div>
  );
}
`;

      const nodeIdToClassName = new Map<string, string>();
      nodeIdToClassName.set('node-1', 'new');

      const result = await codePreservationService.preserveCodeAndUpdateClasses(
        'test.tsx',
        originalCode,
        nodeIdToClassName
      );

      expect(result).toContain('// This is a comment');
      expect(result).toContain('// Another comment');
      expect(result).toContain('{/* JSX comment */}');
    });

    it('should preserve imports and exports', async () => {
      const originalCode = `
import React, { useState, useEffect } from 'react';
import { Button } from './components/Button';
import type { PageProps } from './types';

export default function Page(props: PageProps) {
  return (
    <div data-cf-id="node-1" className="container">
      <Button>Click</Button>
    </div>
  );
}
`;

      const nodeIdToClassName = new Map<string, string>();
      nodeIdToClassName.set('node-1', 'new-container');

      const result = await codePreservationService.preserveCodeAndUpdateClasses(
        'test.tsx',
        originalCode,
        nodeIdToClassName
      );

      expect(result).toContain("import React, { useState, useEffect } from 'react'");
      expect(result).toContain("import { Button } from './components/Button'");
      expect(result).toContain("import type { PageProps } from './types'");
      expect(result).toContain('export default function Page(props: PageProps)');
    });

    it('should preserve component logic and hooks', async () => {
      const originalCode = `
export default function Page() {
  const [state, setState] = useState({ count: 0 });
  
  useEffect(() => {
    console.log('Mounted');
    return () => console.log('Unmounted');
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/submit', { method: 'POST' });
  };
  
  return (
    <form data-cf-id="node-1" className="form" onSubmit={handleSubmit}>
      <input type="text" />
      <button type="submit">Submit</button>
    </form>
  );
}
`;

      const nodeIdToClassName = new Map<string, string>();
      nodeIdToClassName.set('node-1', 'new-form');

      const result = await codePreservationService.preserveCodeAndUpdateClasses(
        'test.tsx',
        originalCode,
        nodeIdToClassName
      );

      expect(result).toContain('useState');
      expect(result).toContain('useEffect');
      expect(result).toContain('handleSubmit');
      expect(result).toContain('async');
      expect(result).toContain('await fetch');
      expect(result).toContain('onSubmit={handleSubmit}');
    });

    it('should handle multiple elements with different node IDs', async () => {
      const originalCode = `
export default function Page() {
  return (
    <div data-cf-id="node-1" className="container">
      <div data-cf-id="node-2" className="header">
        <h1>Title</h1>
      </div>
      <div data-cf-id="node-3" className="content">
        <p>Content</p>
      </div>
    </div>
  );
}
`;

      const nodeIdToClassName = new Map<string, string>();
      nodeIdToClassName.set('node-1', 'new-container');
      nodeIdToClassName.set('node-2', 'new-header');
      nodeIdToClassName.set('node-3', 'new-content');

      const result = await codePreservationService.preserveCodeAndUpdateClasses(
        'test.tsx',
        originalCode,
        nodeIdToClassName
      );

      expect(result).toContain('new-container');
      expect(result).toContain('new-header');
      expect(result).toContain('new-content');
      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<p>Content</p>');
    });

    it('should preserve formatting and indentation', async () => {
      const originalCode = `export default function Page() {
  return (
    <div data-cf-id="node-1" className="test">
      <p>Content</p>
    </div>
  );
}`;

      const nodeIdToClassName = new Map<string, string>();
      nodeIdToClassName.set('node-1', 'new-test');

      const result = await codePreservationService.preserveCodeAndUpdateClasses(
        'test.tsx',
        originalCode,
        nodeIdToClassName
      );

      // Should maintain structure
      expect(result).toContain('export default function Page()');
      expect(result).toContain('return (');
      expect(result).toContain('<p>Content</p>');
    });

    it('should handle elements without data-cf-id', async () => {
      const originalCode = `
export default function Page() {
  return (
    <div className="container">
      <p>No data-cf-id</p>
    </div>
  );
}
`;

      const nodeIdToClassName = new Map<string, string>();
      nodeIdToClassName.set('node-1', 'new-class');

      const result = await codePreservationService.preserveCodeAndUpdateClasses(
        'test.tsx',
        originalCode,
        nodeIdToClassName
      );

      // Should not modify elements without data-cf-id
      expect(result).toContain('<p>No data-cf-id</p>');
    });

    it('should handle className expressions', async () => {
      const originalCode = `
export default function Page() {
  const className = "dynamic";
  return (
    <div data-cf-id="node-1" className={className}>
      Content
    </div>
  );
}
`;

      const nodeIdToClassName = new Map<string, string>();
      nodeIdToClassName.set('node-1', 'static-class');

      const result = await codePreservationService.preserveCodeAndUpdateClasses(
        'test.tsx',
        originalCode,
        nodeIdToClassName
      );

      // Should replace expression with string literal
      expect(result).toContain('className="static-class"');
      // Should preserve the variable declaration
      expect(result).toContain('const className = "dynamic"');
    });
  });

  describe('verifyCodePreservation', () => {
    it('should verify that code is preserved correctly', () => {
      const originalCode = `
import React from 'react';

export default function Page() {
  return <div>Test</div>;
}
`;

      const modifiedCode = `
import React from 'react';

export default function Page() {
  return <div className="new">Test</div>;
}
`;

      const result = codePreservationService.verifyCodePreservation(
        originalCode,
        modifiedCode,
        'test.tsx'
      );

      expect(result.preserved).toBe(true);
      expect(result.differences).toHaveLength(0);
    });

    it('should detect when imports are removed', () => {
      const originalCode = `
import React from 'react';
import { useState } from 'react';

export default function Page() {
  return <div>Test</div>;
}
`;

      const modifiedCode = `
export default function Page() {
  return <div>Test</div>;
}
`;

      const result = codePreservationService.verifyCodePreservation(
        originalCode,
        modifiedCode,
        'test.tsx'
      );

      expect(result.preserved).toBe(false);
      expect(result.differences.length).toBeGreaterThan(0);
    });
  });
});

