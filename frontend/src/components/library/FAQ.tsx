import React, { useState } from 'react';
import { useNode } from '@craftjs/core';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  title?: string;
  subtitle?: string;
  items?: FAQItem[];
  className?: string;
}

/**
 * T128: FAQ section component
 * Pre-built component with dark mode and responsive design
 */
export function FAQ({
  title = 'Frequently Asked Questions',
  subtitle = 'Everything you need to know',
  items = [
    {
      question: 'What is this product?',
      answer: 'This is a powerful tool designed to help you achieve your goals efficiently.',
    },
    {
      question: 'How do I get started?',
      answer: 'Simply sign up for an account and follow our quick start guide.',
    },
    {
      question: 'What are the pricing options?',
      answer: 'We offer flexible pricing plans to suit different needs. Check our pricing page for details.',
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, we offer a 14-day free trial with full access to all features.',
    },
  ],
  className = '',
}: FAQProps) {
  const {
    connectors: { connect, drag },
    isSelected,
  } = useNode((state) => ({
    isSelected: state.events.selected,
  }));

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`faq py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800 ${className} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">{subtitle}</p>
        </div>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-white">
                  {item.question}
                </span>
                <svg
                  className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

FAQ.craft = {
  displayName: 'FAQ',
  props: {
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know',
    items: [
      {
        question: 'What is this product?',
        answer: 'This is a powerful tool designed to help you achieve your goals efficiently.',
      },
      {
        question: 'How do I get started?',
        answer: 'Simply sign up for an account and follow our quick start guide.',
      },
      {
        question: 'What are the pricing options?',
        answer: 'We offer flexible pricing plans to suit different needs. Check our pricing page for details.',
      },
      {
        question: 'Is there a free trial?',
        answer: 'Yes, we offer a 14-day free trial with full access to all features.',
      },
    ],
    className: '',
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
  },
};

