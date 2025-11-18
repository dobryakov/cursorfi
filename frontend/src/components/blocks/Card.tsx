import React from 'react';
import { useNode } from '@craftjs/core';

interface CardProps {
  title?: string;
  content?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Card({ title, content, className = '', children }: CardProps) {
  const {
    connectors: { connect, drag },
    isSelected,
  } = useNode((state) => ({
    isSelected: state.events.selected,
  }));

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`card border border-gray-300 rounded-lg p-4 ${className} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {title && <h3 className="font-semibold mb-2">{title}</h3>}
      {content && <p>{content}</p>}
      {children}
    </div>
  );
}

Card.craft = {
  displayName: 'Card',
  props: {
    title: '',
    content: '',
    className: '',
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
};

