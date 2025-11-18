import React, { useState, useMemo, useEffect } from 'react';
import { useEditor } from '@craftjs/core';
import { Search } from 'lucide-react';
import { trpc } from '../lib/trpc';
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

interface ComponentItem {
  name: string;
  displayName: string;
  category: string;
  component?: React.ComponentType<any>;
  icon?: string;
  filePath?: string;
  isBuiltIn: boolean;
}

const BUILT_IN_COMPONENTS: ComponentItem[] = [
  { name: 'Container', displayName: 'Container', category: 'Layout', component: Container, isBuiltIn: true },
  { name: 'Heading', displayName: 'Heading', category: 'Typography', component: Heading, isBuiltIn: true },
  { name: 'Text', displayName: 'Text', category: 'Typography', component: Text, isBuiltIn: true },
  { name: 'Button', displayName: 'Button', category: 'Form', component: Button, isBuiltIn: true },
  { name: 'Input', displayName: 'Input', category: 'Form', component: Input, isBuiltIn: true },
  { name: 'Image', displayName: 'Image', category: 'Media', component: Image, isBuiltIn: true },
  { name: 'Card', displayName: 'Card', category: 'Layout', component: Card, isBuiltIn: true },
  { name: 'List', displayName: 'List', category: 'Content', component: List, isBuiltIn: true },
  { name: 'Link', displayName: 'Link', category: 'Navigation', component: Link, isBuiltIn: true },
  { name: 'Divider', displayName: 'Divider', category: 'Layout', component: Divider, isBuiltIn: true },
];

export function ComponentLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userComponents, setUserComponents] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { connectors } = useEditor();

  // T107: Load user-defined components from backend
  useEffect(() => {
    const loadComponents = async () => {
      try {
        setLoading(true);
        const components = await trpc.component.list.query();
        
        // Convert backend component metadata to ComponentItem format
        const userComponentItems: ComponentItem[] = components.map(comp => ({
          name: comp.name,
          displayName: comp.name,
          category: comp.category || 'Custom',
          filePath: comp.filePath,
          isBuiltIn: false,
        }));
        
        setUserComponents(userComponentItems);
      } catch (error) {
        console.error('Failed to load user components:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComponents();

    // Listen for component scan complete events
    const handleComponentScan = () => {
      loadComponents();
    };

    // Subscribe to WebSocket events for component scan complete
    // This would be handled by the websocket service
    window.addEventListener('componentScanComplete', handleComponentScan);
    
    return () => {
      window.removeEventListener('componentScanComplete', handleComponentScan);
    };
  }, []);

  // Combine built-in and user components
  const allComponents = useMemo(() => {
    return [...BUILT_IN_COMPONENTS, ...userComponents];
  }, [userComponents]);

  const categories = useMemo(() => {
    const cats = new Set(allComponents.map(c => c.category));
    return Array.from(cats).sort();
  }, [allComponents]);

  const filteredComponents = useMemo(() => {
    return allComponents.filter(comp => {
      const matchesSearch = comp.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           comp.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || comp.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allComponents, searchQuery, selectedCategory]);

  const handleDragStart = (component: ComponentItem) => (e: React.DragEvent) => {
    e.dataTransfer.setData('craftjs/component', component.name);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Components</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 text-sm rounded-md ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-gray-500 py-8">
            Loading components...
          </div>
        ) : filteredComponents.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No components found
          </div>
        ) : (
          <div className="space-y-4">
            {/* Built-in Components Section */}
            {filteredComponents.filter(c => c.isBuiltIn).length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Built-in Components</h3>
                <div className="grid grid-cols-1 gap-2">
                  {filteredComponents.filter(c => c.isBuiltIn).map(comp => {
                    const Component = comp.component;
                    return (
                      <div
                        key={comp.name}
                        ref={(ref) => {
                          if (ref && Component) {
                            connectors.create(ref, Component);
                          }
                        }}
                        className="p-3 border border-gray-200 rounded-md hover:border-blue-500 hover:bg-blue-50 cursor-move transition-colors"
                        draggable={!!Component}
                        onDragStart={handleDragStart(comp)}
                      >
                        <div className="font-medium text-sm">{comp.displayName}</div>
                        <div className="text-xs text-gray-500 mt-1">{comp.category}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* User Components Section */}
            {filteredComponents.filter(c => !c.isBuiltIn).length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Your Components</h3>
                <div className="grid grid-cols-1 gap-2">
                  {filteredComponents.filter(c => !c.isBuiltIn).map(comp => (
                    <div
                      key={comp.name}
                      className="p-3 border border-gray-200 rounded-md hover:border-blue-500 hover:bg-blue-50 cursor-move transition-colors"
                      draggable
                      onDragStart={handleDragStart(comp)}
                      title={comp.filePath}
                    >
                      <div className="font-medium text-sm">{comp.displayName}</div>
                      <div className="text-xs text-gray-500 mt-1">{comp.category}</div>
                      {comp.filePath && (
                        <div className="text-xs text-gray-400 mt-1 truncate">{comp.filePath}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

