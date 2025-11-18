import React from 'react';
import { useNode } from '@craftjs/core';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  logo?: string;
  logoText?: string;
  description?: string;
  columns?: FooterColumn[];
  copyright?: string;
  socialLinks?: Array<{ name: string; href: string; icon?: string }>;
  className?: string;
}

/**
 * T130: Footer component
 * Pre-built component with dark mode and responsive design
 */
export function Footer({
  logo,
  logoText = 'Brand',
  description = 'Building amazing experiences',
  columns = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Documentation', href: '/docs' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Careers', href: '/careers' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
      ],
    },
  ],
  copyright = `© ${new Date().getFullYear()} ${logoText}. All rights reserved.`,
  socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com' },
    { name: 'GitHub', href: 'https://github.com' },
    { name: 'LinkedIn', href: 'https://linkedin.com' },
  ],
  className = '',
}: FooterProps) {
  const {
    connectors: { connect, drag },
    isSelected,
  } = useNode((state) => ({
    isSelected: state.events.selected,
  }));

  return (
    <footer
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`footer bg-gray-900 dark:bg-black text-gray-300 ${className} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            {logo ? (
              <img src={logo} alt={logoText} className="h-8 w-auto mb-4" />
            ) : (
              <h3 className="text-2xl font-bold text-white mb-4">{logoText}</h3>
            )}
            <p className="text-gray-400 mb-4">{description}</p>
            {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={social.name}
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 3.48-2.049 4.667-1.153 1.188-2.715 1.857-4.519 1.857-.847 0-1.669-.107-2.465-.32a8.008 8.008 0 01-1.813-.747l-.747.747v2.133h-2.133V6.933h6.4v2.133H8.32c.32.32.64.64.96.96.64.64 1.28 1.28 1.92 1.92.64.64 1.28 1.28 1.92 1.92.64.64 1.28 1.28 1.92 1.92.32.32.64.64.96.96h2.133V8.16h-2.133z" />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>
          {columns.map((column, columnIndex) => (
            <div key={columnIndex}>
              <h4 className="text-white font-semibold mb-4">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}

Footer.craft = {
  displayName: 'Footer',
  props: {
    logo: '',
    logoText: 'Brand',
    description: 'Building amazing experiences',
    columns: [
      {
        title: 'Product',
        links: [
          { label: 'Features', href: '/features' },
          { label: 'Pricing', href: '/pricing' },
          { label: 'Documentation', href: '/docs' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Blog', href: '/blog' },
          { label: 'Careers', href: '/careers' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { label: 'Privacy', href: '/privacy' },
          { label: 'Terms', href: '/terms' },
          { label: 'Cookie Policy', href: '/cookies' },
        ],
      },
    ],
    copyright: `© ${new Date().getFullYear()} Brand. All rights reserved.`,
    socialLinks: [
      { name: 'Twitter', href: 'https://twitter.com' },
      { name: 'GitHub', href: 'https://github.com' },
      { name: 'LinkedIn', href: 'https://linkedin.com' },
    ],
    className: '',
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
  },
};

