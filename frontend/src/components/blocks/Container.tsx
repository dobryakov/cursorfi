import React from 'react';
import { useNode } from '@craftjs/core';

interface ContainerProps {
  className?: string;
  children?: React.ReactNode;
}

export function Container({ className = '', children }: ContainerProps) {
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
      className={`container ${className} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {children}
    </div>
  );
}

Container.craft = {
  displayName: 'Container',
  props: {
    className: '',
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
};

