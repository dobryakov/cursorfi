import React from 'react';
import { useNode } from '@craftjs/core';

interface ListProps {
  items?: string[];
  ordered?: boolean;
  className?: string;
}

export function List({ items = ['Item 1', 'Item 2', 'Item 3'], ordered = false, className = '' }: ListProps) {
  const {
    connectors: { connect, drag },
    isSelected,
  } = useNode((state) => ({
    isSelected: state.events.selected,
  }));

  const Tag = ordered ? 'ol' : 'ul';

  return (
    <Tag
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`list ${className} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </Tag>
  );
}

List.craft = {
  displayName: 'List',
  props: {
    items: ['Item 1', 'Item 2', 'Item 3'],
    ordered: false,
    className: '',
  },
  rules: {
    canDrag: () => true,
  },
};

