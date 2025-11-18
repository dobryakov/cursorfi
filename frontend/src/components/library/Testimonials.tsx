import React from 'react';
import { useNode } from '@craftjs/core';

interface Testimonial {
  name: string;
  role: string;
  company?: string;
  content: string;
  avatar?: string;
}

interface TestimonialsProps {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  className?: string;
}

/**
 * T127: Testimonials section component
 * Pre-built component with dark mode and responsive design
 */
export function Testimonials({
  title = 'What Our Customers Say',
  subtitle = 'Don\'t just take our word for it',
  testimonials = [
    {
      name: 'John Doe',
      role: 'CEO',
      company: 'Company Inc',
      content: 'This product has transformed our workflow. Highly recommended!',
    },
    {
      name: 'Jane Smith',
      role: 'Designer',
      company: 'Design Studio',
      content: 'Amazing experience. The best tool we\'ve used in years.',
    },
    {
      name: 'Bob Johnson',
      role: 'Developer',
      company: 'Tech Corp',
      content: 'Incredible features and excellent support. Worth every penny.',
    },
  ],
  className = '',
}: TestimonialsProps) {
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
      className={`testimonials py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 ${className} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-md"
            >
              <div className="mb-4">
                <div className="flex items-center mb-4">
                  {testimonial.avatar ? (
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full mr-4"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold mr-4">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                      {testimonial.company && ` at ${testimonial.company}`}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 italic">"{testimonial.content}"</p>
              <div className="mt-4 flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

Testimonials.craft = {
  displayName: 'Testimonials',
  props: {
    title: 'What Our Customers Say',
    subtitle: 'Don\'t just take our word for it',
    testimonials: [
      {
        name: 'John Doe',
        role: 'CEO',
        company: 'Company Inc',
        content: 'This product has transformed our workflow. Highly recommended!',
      },
      {
        name: 'Jane Smith',
        role: 'Designer',
        company: 'Design Studio',
        content: 'Amazing experience. The best tool we\'ve used in years.',
      },
      {
        name: 'Bob Johnson',
        role: 'Developer',
        company: 'Tech Corp',
        content: 'Incredible features and excellent support. Worth every penny.',
      },
    ],
    className: '',
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
  },
};

