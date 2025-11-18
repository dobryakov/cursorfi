import React from 'react';
import { useNode } from '@craftjs/core';

interface InputProps {
  placeholder?: string;
  type?: string;
  className?: string;
}

export function Input({ placeholder = 'Enter text...', type = 'text', className = '' }: InputProps) {
  const {
    connectors: { connect, drag },
    isSelected,
  } = useNode((state) => ({
    isSelected: state.events.selected,
  }));

  return (
    <input
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      type={type}
      placeholder={placeholder}
      className={`input px-3 py-2 border border-gray-300 rounded ${className} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    />
  );
}

Input.craft = {
  displayName: 'Input',
  props: {
    placeholder: 'Enter text...',
    type: 'text',
    className: '',
  },
  rules: {
    canDrag: () => true,
  },
};

