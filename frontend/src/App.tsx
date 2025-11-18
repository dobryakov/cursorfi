import { useEffect } from 'react';
import { websocketClient } from './lib/websocket';

function App() {
  useEffect(() => {
    // Connect WebSocket on mount
    websocketClient.connect();

    return () => {
      websocketClient.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">CursorFi Visual Editor</h1>
        <p className="mt-2 text-gray-600">Editor coming soon...</p>
      </div>
    </div>
  );
}

export default App;

