import React from 'react';

export default function HomePage() {
  return (
    <div data-cf-id="root" className="container mx-auto p-8">
      <h1 data-cf-id="heading" className="text-4xl font-bold mb-4">
        Welcome to CursorFi Visual Editor
      </h1>
      <p data-cf-id="description" className="text-lg text-gray-600 mb-8">
        This is a test page to demonstrate the visual editor functionality.
        You can edit this page visually using the editor interface.
      </p>
      <div data-cf-id="button-container" className="flex gap-4">
        <button data-cf-id="button-1" className="bg-blue-500 text-white px-6 py-2 rounded">
          Get Started
        </button>
        <button data-cf-id="button-2" className="bg-gray-200 text-gray-800 px-6 py-2 rounded">
          Learn More
        </button>
      </div>
    </div>
  );
}

