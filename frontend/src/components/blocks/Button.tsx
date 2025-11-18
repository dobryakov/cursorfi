import React from 'react';
import { useNode } from '@craftjs/core';

interface ButtonProps {
  text: string;
  className?: string;
  onClick?: () => void;
}

export function Button({ text = 'Button', className = '', onClick }: ButtonProps) {
  const {
    connectors: { connect, drag },
    isSelected,
  } = useNode((state) => ({
    isSelected: state.events.selected,
  }));

  return (
    <button
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      onClick={onClick}
      className={`button px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${className} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {text}
    </button>
  );
}

Button.craft = {
  displayName: 'Button',
  props: {
    text: 'Button',
    className: '',
  },
  rules: {
    canDrag: () => true,
  },
};

