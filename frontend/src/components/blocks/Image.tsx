import React from 'react';
import { useNode } from '@craftjs/core';

interface ImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export function Image({ src = '', alt = 'Image', className = '' }: ImageProps) {
  const {
    connectors: { connect, drag },
    isSelected,
  } = useNode((state) => ({
    isSelected: state.events.selected,
  }));

  return (
    <img
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      src={src}
      alt={alt}
      className={`image ${className} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    />
  );
}

Image.craft = {
  displayName: 'Image',
  props: {
    src: '',
    alt: 'Image',
    className: '',
  },
  rules: {
    canDrag: () => true,
  },
};

