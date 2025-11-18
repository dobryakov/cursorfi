/**
 * T140: Metrics collection (sync latency, throughput, errors)
 * Provides metrics for monitoring sync operations
 */

interface Metric {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp: Date;
}

interface SyncMetrics {
  latency: number[];
  throughput: number;
  errors: number;
  lastReset: Date;
}

class MetricsCollector {
  private metrics: Map<string, Metric[]> = new Map();
  private syncMetrics: SyncMetrics = {
    latency: [],
    throughput: 0,
    errors: 0,
    lastReset: new Date(),
  };

  /**
   * Record a metric
   */
  record(name: string, value: number, tags?: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      tags,
      timestamp: new Date(),
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricsList = this.metrics.get(name)!;
    metricsList.push(metric);

    // Keep only last 1000 metrics per name
    if (metricsList.length > 1000) {
      metricsList.shift();
    }
  }

  /**
   * Record sync operation latency
   */
  recordSyncLatency(latencyMs: number): void {
    this.syncMetrics.latency.push(latencyMs);
    if (this.syncMetrics.latency.length > 100) {
      this.syncMetrics.latency.shift();
    }
    this.syncMetrics.throughput++;
  }

  /**
   * Record sync error
   */
  recordSyncError(): void {
    this.syncMetrics.errors++;
  }

  /**
   * Get sync metrics
   */
  getSyncMetrics(): {
    avgLatency: number;
    p95Latency: number;
    throughput: number;
    errors: number;
    errorRate: number;
  } {
    const latencies = this.syncMetrics.latency;
    const sorted = [...latencies].sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);

    return {
      avgLatency: latencies.length > 0
        ? latencies.reduce((a, b) => a + b, 0) / latencies.length
        : 0,
      p95Latency: sorted[p95Index] || 0,
      throughput: this.syncMetrics.throughput,
      errors: this.syncMetrics.errors,
      errorRate: this.syncMetrics.throughput > 0
        ? this.syncMetrics.errors / this.syncMetrics.throughput
        : 0,
    };
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics.clear();
    this.syncMetrics = {
      latency: [],
      throughput: 0,
      errors: 0,
      lastReset: new Date(),
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, Metric[]> {
    return new Map(this.metrics);
  }
}

export const metricsCollector = new MetricsCollector();

