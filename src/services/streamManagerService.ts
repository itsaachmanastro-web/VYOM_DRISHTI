import { StreamingStatus } from '../types/mission';

export interface StreamConfig {
  endpointUrl: string;
  protocol: 'RTSP' | 'WEBRTC' | 'MJPEG' | 'HLS';
  port: number;
  autoReconnect: boolean;
  bitrateKbps: number;
}

export class StreamManagerService {
  private config: StreamConfig = {
    endpointUrl: 'rtsp://192.168.1.120:554/live/payload-rack-cam-01',
    protocol: 'RTSP',
    port: 554,
    autoReconnect: true,
    bitrateKbps: 4500
  };

  private status: StreamingStatus = 'DISCONNECTED';
  private statusListeners: ((status: StreamingStatus) => void)[] = [];

  public getConfig(): StreamConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<StreamConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public async connectStream(): Promise<boolean> {
    this.setStatus('CONNECTING');

    // Simulate network handshake with on-board IP Camera / RTSP Gateway
    return new Promise((resolve) => {
      setTimeout(() => {
        this.setStatus('STREAMING');
        resolve(true);
      }, 800);
    });
  }

  public disconnectStream() {
    this.setStatus('DISCONNECTED');
  }

  public getStatus(): StreamingStatus {
    return this.status;
  }

  public onStatusChange(callback: (status: StreamingStatus) => void): () => void {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== callback);
    };
  }

  private setStatus(status: StreamingStatus) {
    this.status = status;
    this.statusListeners.forEach(l => l(status));
  }
}

export const streamManagerService = new StreamManagerService();
