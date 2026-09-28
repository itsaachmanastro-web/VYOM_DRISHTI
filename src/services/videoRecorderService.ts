export interface LocalRecordingMetadata {
  id: string;
  filename: string;
  durationSec: number;
  sizeBytes: number;
  format: 'video/webm' | 'video/mp4';
  createdAt: string;
  url: string;
}

export class VideoRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;
  private startTime: number = 0;
  private currentStream: MediaStream | null = null;

  public startRecording(sourceCanvasOrStream: HTMLCanvasElement | MediaStream): boolean {
    try {
      this.recordedChunks = [];
      let stream: MediaStream;

      if (sourceCanvasOrStream instanceof HTMLCanvasElement) {
        stream = sourceCanvasOrStream.captureStream(30);
      } else {
        stream = sourceCanvasOrStream;
      }

      this.currentStream = stream;
      const options = { mimeType: 'video/webm;codecs=vp9' };
      
      if (MediaRecorder.isTypeSupported(options.mimeType)) {
        this.mediaRecorder = new MediaRecorder(stream, options);
      } else {
        this.mediaRecorder = new MediaRecorder(stream);
      }

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(500); // 500ms time slices
      this.isRecording = true;
      this.startTime = Date.now();
      return true;
    } catch (e) {
      console.error('Failed to initialize local video recording:', e);
      return false;
    }
  }

  public stopRecording(): Promise<LocalRecordingMetadata | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const durationSec = Math.round((Date.now() - this.startTime) / 1000);
        const filename = `VYOM_DRISHTI_REC_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
        const url = URL.createObjectURL(blob);

        const metadata: LocalRecordingMetadata = {
          id: `rec-${Date.now()}`,
          filename,
          durationSec,
          sizeBytes: blob.size,
          format: 'video/webm',
          createdAt: new Date().toISOString(),
          url
        };

        this.isRecording = false;
        resolve(metadata);
      };

      this.mediaRecorder.stop();
    });
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  public getRecordedBytes(): number {
    return this.recordedChunks.reduce((acc, chunk) => acc + chunk.size, 0);
  }
}

export const videoRecorderService = new VideoRecorderService();
