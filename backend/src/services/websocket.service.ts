interface WebSocketMessage {
  type: string;
  data: any;
}

type WebSocketClient = {
  id: string;
  send: (data: string) => void;
  readyState: number;
};

class WebSocketService {
  private clients: Map<string, WebSocketClient> = new Map();

  addClient(id: string, client: WebSocketClient): void {
    this.clients.set(id, client);
    console.log(`WebSocket client connected. Total clients: ${this.clients.size}`);
  }

  removeClient(id: string): void {
    this.clients.delete(id);
    console.log(`WebSocket client disconnected. Total clients: ${this.clients.size}`);
  }

  broadcast(message: WebSocketMessage): void {
    if (this.clients.size === 0) {
      return;
    }

    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    this.clients.forEach((client, id) => {
      try {
        if (client.readyState === 1) { // OPEN
          client.send(messageStr);
          sentCount++;
        }
      } catch (error) {
        console.error('Error broadcasting to client:', error);
        this.removeClient(id);
      }
    });

    if (sentCount > 0) {
      console.log(`Broadcasted ${message.type} to ${sentCount} client(s)`);
    }
  }

  sendToClient(id: string, message: WebSocketMessage): void {
    const client = this.clients.get(id);
    if (!client) {
      return;
    }

    try {
      if (client.readyState === 1) { // OPEN
        client.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error('Error sending to client:', error);
      this.removeClient(id);
    }
  }
}

export const websocketService = new WebSocketService();

