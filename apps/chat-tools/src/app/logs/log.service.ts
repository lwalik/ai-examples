import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { LogEntry, LogsResponse, LogStats, LogTypeDistribution, LogVolumeData } from './log.model';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private logsUrl = '/assets/logs.json';
  private readonly http = inject(HttpClient);

  getLogs(): Observable<LogsResponse> {
    return this.http.get<LogsResponse>(this.logsUrl);
  }

  getRecentLogs(): Observable<LogEntry[]> {
    return this.getLogs().pipe(
      map(response => response.recentLogs)
    );
  }

  getLastLogs(count = 10): Observable<LogEntry[]> {
    return this.getRecentLogs().pipe(
      map(logs => {
        // Sort by timestamp descending (latest first) and take the first N
        return [...logs]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, count);
      })
    );
  }

  getLogVolumeData(): Observable<LogVolumeData[]> {
    return this.getRecentLogs().pipe(
      map(logs => {
        // Initialize dictionary with all 24 hours (00:00 to 23:00) with count 0
        const hourCounts: Record<string, number> = {};
        for (let hour = 0; hour < 24; hour++) {
          const hourStr = hour.toString().padStart(2, '0');
          hourCounts[`${hourStr}`] = 0;
        }

        // Reduce logs to count by hour
        const counts = logs.reduce((acc, log) => {
          // Extract hour from timestamp
          const date = new Date(log.timestamp);
          const hour = date.getHours().toString().padStart(2, '0');
          const hourKey = `${hour}`;
          
          if (acc[hourKey] !== undefined) {
            acc[hourKey]++;
          }
          
          return acc;
        }, hourCounts);

        // Convert dictionary to array of LogVolumeData
        return Object.entries(counts)
          .map(([hour, count]) => ({ hour, count }))
          .sort((a, b) => a.hour.localeCompare(b.hour));
      })
    );
  }

  getLogTypes(): Observable<LogTypeDistribution[]> {
    return this.getRecentLogs().pipe(
      map(logs => {
        // Initialize counter for each log type
        const typeCounts: Record<string, number> = {
          'INFO': 0,
          'WARN': 0,
          'ERROR': 0,
          'DEBUG': 0
        };

        // Reduce logs to count by type
        const counts = logs.reduce((acc, log) => {
          const level = log.level;
          if (acc[level] !== undefined) {
            acc[level]++;
          }
          return acc;
        }, typeCounts);

        // Calculate total logs
        const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

        // Map to color classes and display names
        const colorMap: Record<string, string> = {
          'INFO': 'bg-blue-500',
          'WARN': 'bg-yellow-500',
          'ERROR': 'bg-red-500',
          'DEBUG': 'bg-gray-500'
        };

        const nameMap: Record<string, string> = {
          'INFO': 'Info',
          'WARN': 'Warning',
          'ERROR': 'Error',
          'DEBUG': 'Debug'
        };

        // Convert to LogTypeDistribution array with percentages
        return Object.entries(counts)
          .map(([level, count]) => ({
            name: nameMap[level] || level,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0,
            color: colorMap[level] || 'bg-gray-500'
          }))
          .sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending
      })
    );
  }

  getStats(): Observable<LogStats> {
    return this.getRecentLogs().pipe(
      map(logs => {
        const total = logs.length;
        const errors = logs.filter(log => log.level === 'ERROR').length;
        const warnings = logs.filter(log => log.level === 'WARN').length;
        const successRate = total > 0 ? ((total - errors) / total) * 100 : 0;

        return {
          totalLogs: total,
          errors,
          warnings,
          successRate: Math.round(successRate * 10) / 10 // Round to 1 decimal place
        };
      })
    );
  }
}
