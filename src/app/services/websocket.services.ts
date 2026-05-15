import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../app/config/environments';

@Injectable({
  providedIn: 'root' // Enforces the Singleton pattern so only one connection exists
})
export class WebsocketService {
  private stompClient: Client;
  
  // ========================================================
  // 1. RXJS STREAMS (The Public API for your Components)
  // ========================================================
  
  // Stream for the Bar Chart updates
  private latencySubject = new Subject<number>();
  public latencyStream$: Observable<number> = this.latencySubject.asObservable();

  // Stream for the Live Terminal updates
  private incidentSubject = new Subject<string>();
  public incidentStream$: Observable<string> = this.incidentSubject.asObservable();

  constructor() {
    // ========================================================
    // 2. STOMP CLIENT CONFIGURATION
    // ========================================================
    this.stompClient = new Client({
      // Use the environment variable to easily switch between local and production
      brokerURL: environment.wsUrl || 'ws://localhost:8080/ws-monitoring',
      
      // Auto-reconnect logic ensures high availability if the backend restarts
      reconnectDelay: 5000, 
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // ========================================================
    // 3. CONNECTION & SUBSCRIPTION LOGIC
    // ========================================================
    this.stompClient.onConnect = () => {
      console.log('[WebSocket] Connected to Command Center Broker');
      
      // Subscribe to the Latency channel
      this.stompClient.subscribe('/topic/latency-stream', (message: Message) => {
        const latency = parseInt(message.body, 10);
        this.latencySubject.next(latency);
      });

      // Subscribe to the Incident Terminal channel
      this.stompClient.subscribe('/topic/incident-logs', (message: Message) => {
        this.incidentSubject.next(message.body);
      });
    };

    // Error handling
    this.stompClient.onStompError = (frame) => {
      console.error('[WebSocket] Broker reported error: ' + frame.headers['message']);
      console.error('[WebSocket] Additional details: ' + frame.body);
    };
    
    this.stompClient.onWebSocketError = (event) => {
      console.error('[WebSocket] Connection error:', event);
    };
  }

  // ========================================================
  // 4. LIFECYCLE METHODS
  // ========================================================

  /**
   * Called by the DashboardComponent on initialization.
   */
  public connect(): void {
    if (!this.stompClient.active) {
      console.log('[WebSocket] Initiating connection...');
      this.stompClient.activate();
    }
  }

  /**
   * Called by the DashboardComponent on destruction to prevent memory leaks.
   */
  public disconnect(): void {
    if (this.stompClient.active) {
      console.log('[WebSocket] Deactivating connection...');
      this.stompClient.deactivate();
    }
  }
}