import React from 'react';
import { useNode } from '@craftjs/core';

interface HeadingProps {
  text: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function Heading({ text = 'Heading', level = 1, className = '' }: HeadingProps) {
  const {
    connectors: { connect, drag },
    isSelected,
  } = useNode((state) => ({
    isSelected: state.events.selected,
  }));

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`heading ${className} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {text}
    </Tag>
  );
}

Heading.craft = {
  displayName: 'Heading',
  props: {
    text: 'Heading',
    level: 1,
    className: '',
  },
  rules: {
    canDrag: () => true,
  },
};

