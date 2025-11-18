import React from 'react';
import { useNode } from '@craftjs/core';

interface TextProps {
  text: string;
  className?: string;
}

export function Text({ text = 'Text', className = '' }: TextProps) {
  const {
    connectors: { connect, drag },
    isSelected,
  } = useNode((state) => ({
    isSelected: state.events.selected,
  }));

  return (
    <p
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`text ${className} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {text}
    </p>
  );
}

Text.craft = {
  displayName: 'Text',
  props: {
    text: 'Text',
    className: '',
  },
  rules: {
    canDrag: () => true,
  },
};

