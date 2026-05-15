import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs/internal/Subscription";
import { DashboardApiService } from "../../services/dashboard-api.services";
import { WebsocketService } from "../../services/websocket.services";
import { LiveHealthStream, MonitorHealthStats } from "../../models/dashboard/dashboard.model";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {

    liveHealth: LiveHealthStream | null = null;
    monitorHealth: MonitorHealthStats | null = null;
    incidentLogs: string[] = [];
    
    private wsLatencySub!: Subscription;
    private wsIncidentSub!: Subscription;

    constructor(
        private apiService: DashboardApiService,
        private wsService: WebsocketService
    ) {}

    ngOnInit(): void {
        this.apiService.getLiveHealthStream().subscribe({
            next: (data) => {
                this.liveHealth = data;
                // Only connect the WebSocket AFTER the HTTP data arrives to prevent race conditions
                this.initializeLiveStreams(); 
            },
            error: (err) => console.error('Failed to load dashboard data', err)
        });
    }

    private initializeLiveStreams(): void {
        this.wsService.connect();

        this.wsLatencySub = this.wsService.latencyStream$.subscribe(newLatency => {
            if (this.liveHealth) {
                this.liveHealth.historicalLatencies.shift();
                this.liveHealth.historicalLatencies.push(newLatency);
                this.liveHealth.globalAverageLatencyMs = newLatency;
            }
        });

        // Listen to Incident Logs
        this.wsIncidentSub = this.wsService.incidentStream$.subscribe(newLog => {
            this.incidentLogs.unshift(newLog);
            if (this.incidentLogs.length > 50) this.incidentLogs.pop();
        });
    }

    // onForceCheck(serviceId: string): void {
    //     this.apiService.forceCheckService(serviceId).subscribe({
    //     next: (res) => {
    //         // Update the specific row in the table with the new status
    //         const target = this.liveHealth?.inventory.find(s => s.id === serviceId);
    //         if (target) {
    //         target.status = res.newStatus;
    //         }
    //     },
    //     error: (err) => console.error('Force check failed', err)
    //     });
    // }

    ngOnDestroy(): void {
        throw new Error("Method not implemented.");
    }

}