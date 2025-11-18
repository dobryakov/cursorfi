import React from 'react';
import { useNode } from '@craftjs/core';

interface CTAProps {
  title?: string;
  subtitle?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  className?: string;
}

/**
 * T129: CTA (Call-to-Action) section component
 * Pre-built component with dark mode and responsive design
 */
export function CTA({
  title = 'Ready to get started?',
  subtitle = 'Join thousands of satisfied customers today',
  primaryCtaText = 'Get Started',
  primaryCtaLink = '#',
  secondaryCtaText = 'Learn More',
  secondaryCtaLink = '#',
  className = '',
}: CTAProps) {
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
      className={`cta py-20 px-4 sm:px-6 lg:px-8 bg-blue-600 dark:bg-blue-800 ${className} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          {title}
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={primaryCtaLink}
            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            {primaryCtaText}
          </a>
          {secondaryCtaText && (
            <a
              href={secondaryCtaLink}
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              {secondaryCtaText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

CTA.craft = {
  displayName: 'CTA',
  props: {
    title: 'Ready to get started?',
    subtitle: 'Join thousands of satisfied customers today',
    primaryCtaText: 'Get Started',
    primaryCtaLink: '#',
    secondaryCtaText: 'Learn More',
    secondaryCtaLink: '#',
    className: '',
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
  },
};

