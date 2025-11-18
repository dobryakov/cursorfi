import React from 'react';
import { useNode } from '@craftjs/core';

interface DividerProps {
  className?: string;
}

export function Divider({ className = '' }: DividerProps) {
  const {
    connectors: { connect, drag },
    isSelected,
  } = useNode((state) => ({
    isSelected: state.events.selected,
  }));

  return (
    <hr
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`divider border-t border-gray-300 my-4 ${className} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    />
  );
}

Divider.craft = {
  displayName: 'Divider',
  props: {
    className: '',
  },
  rules: {
    canDrag: () => true,
  },
};

