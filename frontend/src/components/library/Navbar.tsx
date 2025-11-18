import React from 'react';
import { useNode } from '@craftjs/core';

interface NavbarProps {
  logo?: string;
  logoText?: string;
  links?: Array<{ label: string; href: string }>;
  ctaText?: string;
  ctaLink?: string;
  className?: string;
}

/**
 * T125: Navbar component
 * Pre-built component with dark mode and responsive design
 */
export function Navbar({
  logo,
  logoText = 'Brand',
  links = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  ctaText = 'Sign Up',
  ctaLink = '#',
  className = '',
}: NavbarProps) {
  const {
    connectors: { connect, drag },
    isSelected,
  } = useNode((state) => ({
    isSelected: state.events.selected,
  }));

  return (
    <nav
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`navbar bg-white dark:bg-gray-900 shadow-md ${className} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {logo ? (
              <img src={logo} alt={logoText} className="h-8 w-auto" />
            ) : (
              <span className="text-xl font-bold text-gray-900 dark:text-white">{logoText}</span>
            )}
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href={ctaLink}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {ctaText}
            </a>
          </div>
          <button className="md:hidden text-gray-700 dark:text-gray-300">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

Navbar.craft = {
  displayName: 'Navbar',
  props: {
    logo: '',
    logoText: 'Brand',
    links: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    ctaText: 'Sign Up',
    ctaLink: '#',
    className: '',
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
  },
};

