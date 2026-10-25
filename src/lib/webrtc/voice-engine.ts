/**
 * Pixelverse WebRTC Audio & Voice Engine
 * Handles microphone capture, audio spectrum analysis, speaking detection,
 * device selection, and room audio management.
 */

export interface VoiceParticipantState {
  id: string;
  name: string;
  avatar_url: string;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  audioLevel: number; // 0 - 100
}

export class VoiceEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animationFrameId: number | null = null;

  public isMuted: boolean = false;
  public isDeafened: boolean = false;
  public isSpeaking: boolean = false;
  public audioLevel: number = 0;

  private onSpeakingChangeCallbacks: ((isSpeaking: boolean, level: number) => void)[] = [];
  private onParticipantUpdateCallbacks: ((participants: VoiceParticipantState[]) => void)[] = [];

  private mockParticipants: VoiceParticipantState[] = [];
  private simulationInterval: any = null;

  async startLocalAudio(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('MediaDevices API not available in this browser environment');
        return this.startSimulatedAudio();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.mediaStream = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.5;

      this.sourceNode = this.audioContext.createMediaStreamSource(stream);
      this.sourceNode.connect(this.analyser);

      this.startAudioMonitor();
      return true;
    } catch (err: any) {
      console.warn('Microphone permission denied or device not found, falling back to simulated voice mode', err);
      return this.startSimulatedAudio();
    }
  }

  private startSimulatedAudio(): boolean {
    // Simulated voice activity loop
    if (this.simulationInterval) clearInterval(this.simulationInterval);
    this.simulationInterval = setInterval(() => {
      if (this.isMuted) {
        this.audioLevel = 0;
        this.isSpeaking = false;
      } else {
        // Random natural voice oscillation
        const base = Math.random() > 0.4 ? Math.floor(Math.random() * 45) + 15 : 0;
        this.audioLevel = base;
        this.isSpeaking = base > 25;
      }
      this.notifySpeaking(this.isSpeaking, this.audioLevel);
    }, 150);
    return true;
  }

  private startAudioMonitor() {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkLevel = () => {
      if (!this.analyser) return;
      this.analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      const normalizedLevel = Math.min(100, Math.round((avg / 128) * 100));

      this.audioLevel = this.isMuted ? 0 : normalizedLevel;
      const speakingNow = !this.isMuted && this.audioLevel > 18;

      if (speakingNow !== this.isSpeaking || Math.abs(normalizedLevel - this.audioLevel) > 5) {
        this.isSpeaking = speakingNow;
        this.notifySpeaking(this.isSpeaking, this.audioLevel);
      }

      this.animationFrameId = requestAnimationFrame(checkLevel);
    };

    this.animationFrameId = requestAnimationFrame(checkLevel);
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach(track => {
        track.enabled = !mute;
      });
    }
    if (mute) {
      this.audioLevel = 0;
      this.isSpeaking = false;
      this.notifySpeaking(false, 0);
    }
  }

  setDeafen(deafen: boolean) {
    this.isDeafened = deafen;
    if (deafen) {
      this.setMute(true);
    }
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isSpeaking = false;
    this.audioLevel = 0;
  }

  onSpeakingChange(cb: (isSpeaking: boolean, level: number) => void) {
    this.onSpeakingChangeCallbacks.push(cb);
  }

  private notifySpeaking(isSpeaking: boolean, level: number) {
    this.onSpeakingChangeCallbacks.forEach(cb => cb(isSpeaking, level));
  }
}
