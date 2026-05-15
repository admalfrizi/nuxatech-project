export interface ServiceHealthSummary {
  id: string;
  name: string;
  category: string;
  urlOrIp: string;
  status: 'UP' | 'DOWN' | 'UNKNOWN';
}

export interface LiveHealthStream {
  globalAverageLatencyMs: number;
  isStreamActive: boolean;
  historicalLatencies: number[];
}

export interface MonitorHealthStats {
  systemStatus: string;
  checkInterval: string;
  uptime: string;
  heapMemoryUsagePercent: number;
}