import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../app/config/environments';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private stompClient: Client;
  
  private latencySubject = new Subject<number>();
  public latencyStream$: Observable<number> = this.latencySubject.asObservable();

  private incidentSubject = new Subject<string>();
  public incidentStream$: Observable<string> = this.incidentSubject.asObservable();

  constructor() {
    this.stompClient = new Client({
      brokerURL: environment.wsUrl || 'ws://localhost:8080/ws-monitoring',
      
      // Auto-reconnect logic ensures high availability if the backend restarts
      reconnectDelay: 5000, 
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = () => {
      console.log('[WebSocket] Connected to Command Center Broker');
      
      this.stompClient.subscribe('/topic/latency-stream', (message: Message) => {
        const latency = parseInt(message.body, 10);
        this.latencySubject.next(latency);
      });

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

  public connect(): void {
    if (!this.stompClient.active) {
      console.log('[WebSocket] Initiating connection...');
      this.stompClient.activate();
    }
  }

  public disconnect(): void {
    if (this.stompClient.active) {
      console.log('[WebSocket] Deactivating connection...');
      this.stompClient.deactivate();
    }
  }
}