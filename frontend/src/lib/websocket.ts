import { websocketService } from '../services/websocket.service';

const getWebSocketUrl = () => {
  if (typeof window !== 'undefined') {
    // Connect directly to backend on port 4001 (port forwarded)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname;
    // Backend WebSocket server runs on port 4001
    const backendPort = '4001';
    return `${protocol}//${hostname}:${backendPort}/ws`;
  }
  // Server-side fallback (should not be used in browser)
  return 'ws://backend:4001/ws';
};

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private shouldReconnect = true;

  connect(): void {
    // If already connected, don't create a new connection
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected, skipping...');
      return;
    }

    // If already connecting, wait for it to complete
    if (this.isConnecting || this.ws?.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket already connecting, skipping...');
      return;
    }

    // Clean up any existing connection that's not connecting
    if (this.ws && this.ws.readyState !== WebSocket.CONNECTING) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnecting = true;
    this.shouldReconnect = true;

    try {
      const url = getWebSocketUrl();
      console.log('Attempting to connect WebSocket to:', url);
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket connected successfully to:', url);
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        websocketService.handleConnect();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          websocketService.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.error('WebSocket URL was:', url);
        console.error('WebSocket readyState:', this.ws?.readyState);
        this.isConnecting = false;
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          url: url
        });
        this.isConnecting = false;
        websocketService.handleDisconnect();
        
        // Only attempt reconnect if:
        // 1. We should reconnect (not manually disconnected)
        // 2. Connection was not cleanly closed (not by us)
        // Code 1000 = normal closure, 1001 = going away
        if (this.shouldReconnect && event.code !== 1000 && event.code !== 1001) {
          this.attemptReconnect();
        } else {
          // Clean closure or manual disconnect, reset reconnect attempts
          this.reconnectAttempts = 0;
          this.ws = null;
        }
      };
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect();
    }, delay);
  }

  disconnect(): void {
    this.shouldReconnect = false; // Prevent reconnection when manually disconnecting
    if (this.ws) {
      // Close with normal closure code (1000) to indicate intentional disconnect
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Client disconnecting');
      }
      this.ws = null;
    }
    // Reset reconnect attempts when manually disconnecting
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}

export const websocketClient = new WebSocketClient();

