import { HubConnection, HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';

class SignalRService {
  private connection: HubConnection | null = null;
  private notificationCallbacks: ((data: any) => void)[] = [];
  private unreadCountCallbacks: ((count: number) => void)[] = [];

  /**
   * Initialize and connect to SignalR hub
   * Call this after user authenticates
   */
  async connect(token: string): Promise<void> {
    if (this.connection) {
      return; // Already connected
    }

    this.connection = new HubConnectionBuilder()
      .withUrl('http://localhost:5269/hub/notifications', {
        accessTokenFactory: () => token,
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (context) => {
          // Exponential backoff: 0, 1s, 3s, 7s, 15s, 31s, 60s
          const count = context.previousRetryCount;
          if (count === 0) return 0;
          if (count === 1) return 1000;
          return Math.min(1000 * Math.pow(2, count - 1), 60000);
        },
      })
      .configureLogging(LogLevel.Information)
      .build();

    // Register event handlers
    this.connection.on('ReceiveNotification', (notification: any) => {
      console.log('📬 New notification:', notification);
      this.notificationCallbacks.forEach(callback => callback(notification));
    });

    this.connection.on('UnreadCountChanged', (count: number) => {
      console.log('🔔 Unread count updated:', count);
      this.unreadCountCallbacks.forEach(callback => callback(count));
    });

    this.connection.onreconnecting((error) => {
      console.warn('⚠️ SignalR reconnecting...', error?.message);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('✅ SignalR reconnected. Connection ID:', connectionId);
    });

    this.connection.onclose((error) => {
      console.error('❌ SignalR disconnected:', error?.message);
    });

    try {
      await this.connection.start();
      console.log('✅ SignalR connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect SignalR:', error);
      throw error;
    }
  }

  /**
   * Disconnect from SignalR hub
   * Call this when user logs out
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('✅ SignalR disconnected');
      } catch (error) {
        console.error('❌ Error disconnecting SignalR:', error);
      } finally {
        this.connection = null;
      }
    }
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connection?.state === 'Connected';
  }

  /**
   * Subscribe to notification events
   * @param callback - Function to call when notification arrives
   * @returns Unsubscribe function
   */
  onNotification(callback: (data: any) => void) {
    this.notificationCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Subscribe to unread count changes
   * @param callback - Function to call when unread count changes
   * @returns Unsubscribe function
   */
  onUnreadCountChanged(callback: (count: number) => void) {
    this.unreadCountCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.unreadCountCallbacks = this.unreadCountCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Send a message to the server
   * (Server-side implementation required)
   */
  async sendMessage(method: string, ...args: any[]): Promise<any> {
    if (!this.connection) {
      throw new Error('SignalR not connected');
    }
    return this.connection.invoke(method, ...args);
  }
}

// Singleton instance
export const signalRService = new SignalRService();

export default signalRService;
