import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../app/config/environments';
import { LiveHealthStream, MonitorHealthStats } from '../models/dashboard/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  private readonly API_URL = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getLiveHealthStream(): Observable<LiveHealthStream> {
    return this.http.get<LiveHealthStream>(`${this.API_URL}/dashboard/live-health`);
  }

  getMonitorHealth(): Observable<MonitorHealthStats> {
    return this.http.get<MonitorHealthStats>(`${this.API_URL}/dashboard/monitor-health`);
  }

  // Triggers the manual check and returns the result map
  forceCheckService(serviceId: string): Observable<any> {
    return this.http.post(`${this.API_URL}/health/force-check/${serviceId}`, {});
  }
}