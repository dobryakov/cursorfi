import React, { useState, useEffect, useRef } from 'react';
import { Editor as CraftEditor } from '@craftjs/core';
import { Canvas } from './Canvas';
import { ComponentLibrary } from './ComponentLibrary';
import { PropertiesPanel } from './PropertiesPanel';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { useCanvasStore } from '../store/canvas.store';
import { trpc } from '../lib/trpc';
import { useCanvasSync } from '../hooks/useCanvasSync';

// Import all block components
import { Container } from './blocks/Container';
import { Heading } from './blocks/Heading';
import { Button } from './blocks/Button';
import { Text } from './blocks/Text';
import { Image } from './blocks/Image';
import { Input } from './blocks/Input';
import { Card } from './blocks/Card';
import { List } from './blocks/List';
import { Link } from './blocks/Link';
import { Divider } from './blocks/Divider';

// Import library components (T124-T130, T134)
import { Hero } from './library/Hero';
import { Navbar } from './library/Navbar';
import { Pricing } from './library/Pricing';
import { Testimonials } from './library/Testimonials';
import { FAQ } from './library/FAQ';
import { CTA } from './library/CTA';
import { Footer } from './library/Footer';

interface EditorProps {
  filePath?: string;
}

export function Editor({ filePath }: EditorProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [initialState, setInitialState] = useState<any>(null);
  const editorRef = useRef<any>(null);
  const { setState } = useCanvasStore();
  
  // T067, T072: Use canvas sync hook for two-way synchronization
  useCanvasSync({ filePath, debounceMs: 400 });

  useEffect(() => {
    if (!filePath) {
      setLoading(false);
      return;
    }

    const loadPage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const page = await trpc.page.get.query({ filePath });
        if (page?.canvasState) {
          // Convert canvas state to craft.js format
          const craftState = page.canvasState.nodes || {};
          setInitialState(craftState);
          setState(page.canvasState);
        } else {
          setInitialState(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load page'));
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [filePath, setState]);

  const handleRetry = () => {
    if (filePath) {
      window.location.reload();
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <CraftEditor
      ref={editorRef}
      resolver={{
        Container,
        Heading,
        Button,
        Text,
        Image,
        Input,
        Card,
        List,
        Link,
        Divider,
        // Library components (T134)
        Hero,
        Navbar,
        Pricing,
        Testimonials,
        FAQ,
        CTA,
        Footer,
      }}
      onRender={({ render }) => render}
    >
      <div className="flex h-screen bg-gray-50">
        {/* Component Library Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-white overflow-y-auto">
          <ComponentLibrary />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto">
          <Canvas />
        </div>

        {/* Properties Panel */}
        <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
          <PropertiesPanel />
        </div>
      </div>
    </CraftEditor>
  );
}

