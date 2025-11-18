import type { WebSocketMessage } from '../../../backend/src/types/websocket.types';

type MessageHandler = (message: WebSocketMessage) => void;

class WebSocketService {
  private handlers: Map<string, Set<MessageHandler>> = new Map();

  on(eventType: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  handleConnect(): void {
    console.log('WebSocket service: connected');
  }

  handleDisconnect(): void {
    console.log('WebSocket service: disconnected');
  }

  handleMessage(message: WebSocketMessage): void {
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
        }
      });
    }
  }
}

export const websocketService = new WebSocketService();

