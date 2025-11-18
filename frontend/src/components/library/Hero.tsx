import React from 'react';
import { useNode } from '@craftjs/core';

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
  className?: string;
}

/**
 * T124: Hero section component
 * Pre-built component with dark mode and responsive design
 */
export function Hero({
  title = 'Welcome to Our Platform',
  subtitle = 'Build amazing experiences with our tools',
  ctaText = 'Get Started',
  ctaLink = '#',
  backgroundImage,
  className = '',
}: HeroProps) {
  const {
    connectors: { connect, drag },
    isSelected,
  } = useNode((state) => ({
    isSelected: state.events.selected,
  }));

  return (
    <section
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`hero relative py-20 px-4 sm:px-6 lg:px-8 ${className} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          {title}
        </h1>
        <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          {subtitle}
        </p>
        <a
          href={ctaLink}
          className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
}

Hero.craft = {
  displayName: 'Hero',
  props: {
    title: 'Welcome to Our Platform',
    subtitle: 'Build amazing experiences with our tools',
    ctaText: 'Get Started',
    ctaLink: '#',
    backgroundImage: '',
    className: '',
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
  },
};

