import React from 'react';
import { useEditor } from '@craftjs/core';
import { Frame } from '@craftjs/core';

export function Canvas() {
  const { actions, query, selected } = useEditor((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div className="h-full bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg min-h-[600px] p-8">
        <Frame>
          {/* Canvas content will be rendered here by craft.js */}
        </Frame>
      </div>
    </div>
  );
}

