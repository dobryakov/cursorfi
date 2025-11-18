import React from 'react';
import { useEditor, useNode } from '@craftjs/core';

export function PropertiesPanel() {
  const { selected, actions, query } = useEditor((state) => ({
    selected: state.events.selected,
  }));

  const selectedNodeId = selected ? Object.keys(selected)[0] : null;
  
  if (!selectedNodeId) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Properties</h3>
        <div className="text-gray-500 text-sm">
          Select an element to edit its properties
        </div>
      </div>
    );
  }

  // Safely get node - it might not exist yet
  let node;
  let nodeData;
  
  try {
    node = query.node(selectedNodeId).get();
    nodeData = node?.data;
  } catch (error) {
    console.error('[PropertiesPanel] Error getting node:', error);
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Properties</h3>
        <div className="text-gray-500 text-sm">
          Error loading node properties
        </div>
      </div>
    );
  }

  if (!node || !nodeData) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Properties</h3>
        <div className="text-gray-500 text-sm">
          Node not found
        </div>
      </div>
    );
  }

  const handlePropChange = (propName: string, value: any) => {
    actions.setProp(selectedNodeId, (props: any) => {
      props[propName] = value;
    });
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Properties</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Component Type
          </label>
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            {nodeData.displayName || nodeData.type?.resolvedName || 'Unknown'}
          </div>
        </div>

        {/* Render props based on component type */}
        {nodeData.props && (
          <div className="space-y-3">
            {Object.entries(nodeData.props).map(([key, value]) => {
              // Skip internal props
              if (key === 'children' || key.startsWith('_')) {
                return null;
              }

              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  {typeof value === 'string' ? (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handlePropChange(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : typeof value === 'number' ? (
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handlePropChange(key, Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : typeof value === 'boolean' ? (
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handlePropChange(key, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                      {JSON.stringify(value)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Common className editor */}
        {nodeData.props?.className !== undefined && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CSS Classes
            </label>
            <input
              type="text"
              value={nodeData.props.className || ''}
              onChange={(e) => handlePropChange('className', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="e.g., flex gap-4 p-4"
            />
          </div>
        )}
      </div>
    </div>
  );
}

