import React, { useState, useMemo } from 'react';
import { useEditor } from '@craftjs/core';
import { Search } from 'lucide-react';
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
  component: React.ComponentType<any>;
  icon?: string;
}

const COMPONENTS: ComponentItem[] = [
  { name: 'Container', displayName: 'Container', category: 'Layout', component: Container },
  { name: 'Heading', displayName: 'Heading', category: 'Typography', component: Heading },
  { name: 'Text', displayName: 'Text', category: 'Typography', component: Text },
  { name: 'Button', displayName: 'Button', category: 'Form', component: Button },
  { name: 'Input', displayName: 'Input', category: 'Form', component: Input },
  { name: 'Image', displayName: 'Image', category: 'Media', component: Image },
  { name: 'Card', displayName: 'Card', category: 'Layout', component: Card },
  { name: 'List', displayName: 'List', category: 'Content', component: List },
  { name: 'Link', displayName: 'Link', category: 'Navigation', component: Link },
  { name: 'Divider', displayName: 'Divider', category: 'Layout', component: Divider },
];

export function ComponentLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { connectors } = useEditor();

  const categories = useMemo(() => {
    const cats = new Set(COMPONENTS.map(c => c.category));
    return Array.from(cats).sort();
  }, []);

  const filteredComponents = useMemo(() => {
    return COMPONENTS.filter(comp => {
      const matchesSearch = comp.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           comp.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || comp.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

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
        {filteredComponents.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No components found
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {filteredComponents.map(comp => {
              const Component = comp.component;
              return (
                <div
                  key={comp.name}
                  ref={(ref) => {
                    if (ref) {
                      connectors.create(ref, Component);
                    }
                  }}
                  className="p-3 border border-gray-200 rounded-md hover:border-blue-500 hover:bg-blue-50 cursor-move transition-colors"
                  draggable
                  onDragStart={handleDragStart(comp)}
                >
                  <div className="font-medium text-sm">{comp.displayName}</div>
                  <div className="text-xs text-gray-500 mt-1">{comp.category}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

