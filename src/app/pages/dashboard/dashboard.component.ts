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
    ngOnDestroy(): void {
        throw new Error("Method not implemented.");
    }

}