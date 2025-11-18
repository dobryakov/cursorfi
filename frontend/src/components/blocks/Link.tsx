import React from 'react';
import { useNode } from '@craftjs/core';

interface LinkProps {
  href: string;
  text: string;
  className?: string;
}

export function Link({ href = '#', text = 'Link', className = '' }: LinkProps) {
  const {
    connectors: { connect, drag },
    isSelected,
  } = useNode((state) => ({
    isSelected: state.events.selected,
  }));

  return (
    <a
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      href={href}
      className={`link text-blue-600 hover:underline ${className} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {text}
    </a>
  );
}

Link.craft = {
  displayName: 'Link',
  props: {
    href: '#',
    text: 'Link',
    className: '',
  },
  rules: {
    canDrag: () => true,
  },
};

