import React from 'react';
import { useNode } from '@craftjs/core';

interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  featured?: boolean;
}

interface PricingProps {
  title?: string;
  subtitle?: string;
  plans?: PricingPlan[];
  className?: string;
}

/**
 * T126: Pricing section component
 * Pre-built component with dark mode and responsive design
 */
export function Pricing({
  title = 'Pricing Plans',
  subtitle = 'Choose the plan that works for you',
  plans = [
    {
      name: 'Basic',
      price: '$9',
      period: '/month',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      ctaText: 'Get Started',
      ctaLink: '#',
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      features: ['All Basic features', 'Feature 4', 'Feature 5', 'Feature 6'],
      ctaText: 'Get Started',
      ctaLink: '#',
      featured: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: '/month',
      features: ['All Pro features', 'Feature 7', 'Feature 8', 'Feature 9', 'Feature 10'],
      ctaText: 'Contact Us',
      ctaLink: '#',
    },
  ],
  className = '',
}: PricingProps) {
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
      className={`pricing py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800 ${className} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 ${
                plan.featured ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {plan.featured && (
                <div className="text-center mb-4">
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                    Popular
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                {plan.period && (
                  <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>
                )}
              </div>
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-gray-700 dark:text-gray-300">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href={plan.ctaLink}
                className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                  plan.featured
                    ? 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                }`}
              >
                {plan.ctaText}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

Pricing.craft = {
  displayName: 'Pricing',
  props: {
    title: 'Pricing Plans',
    subtitle: 'Choose the plan that works for you',
    plans: [
      {
        name: 'Basic',
        price: '$9',
        period: '/month',
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
        ctaText: 'Get Started',
        ctaLink: '#',
      },
      {
        name: 'Pro',
        price: '$29',
        period: '/month',
        features: ['All Basic features', 'Feature 4', 'Feature 5', 'Feature 6'],
        ctaText: 'Get Started',
        ctaLink: '#',
        featured: true,
      },
      {
        name: 'Enterprise',
        price: '$99',
        period: '/month',
        features: ['All Pro features', 'Feature 7', 'Feature 8', 'Feature 9', 'Feature 10'],
        ctaText: 'Contact Us',
        ctaLink: '#',
      },
    ],
    className: '',
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
  },
};

