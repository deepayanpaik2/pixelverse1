/**
 * Party room realtime engine  (100% free stack)
 *
 *  - Signaling, presence and text chat : Supabase Realtime (Broadcast + Presence)
 *  - Voice / video / screen share      : WebRTC, peer-to-peer mesh (best for up to ~6-8 people)
 *  - NAT traversal                     : free public STUN servers (+ optional free TURN, see .env)
 *
 * Roles: for every pair of people, the one with the smaller peer id is the
 * "initiator" and creates the offer. The other one only answers. That avoids
 * offer collisions without needing the full "perfect negotiation" dance.
 * Each connection always carries one audio and one video transceiver, so
 * switching mic / camera / screen is just `replaceTrack` (no renegotiation).
 */
import { supabase } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { closeRoom, loadMessages, saveMessage, type Identity } from './rooms';

export interface PeerState {
  id: string;
  name: string;
  color: string;
  audioOn: boolean;
  videoOn: boolean; // camera on
  screenOn: boolean; // sharing screen
  deafened: boolean;
  speaking: boolean;
  isLocal: boolean;
  isHost: boolean;
  joinedAt: number;
  stream: MediaStream | null;
  trackCount: number;
  connection: 'local' | 'connecting' | 'connected' | 'failed' | 'closed';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  name: string;
  color: string;
  text: string;
  ts: number;
}

export type RoomStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'full' | 'closed';

export interface RoomSnapshot {
  status: RoomStatus;
  error: string | null;
  micError: string | null;
  me: PeerState | null;
  peers: PeerState[]; // everyone, local user first
  messages: ChatMessage[];
  gameSignal: number; // increases whenever the host launches the game for everyone
}

type Meta = {
  id: string;
  name: string;
  color: string;
  audioOn: boolean;
  videoOn: boolean;
  screenOn: boolean;
  deafened: boolean;
  isHost: boolean;
  joinedAt: number;
};

interface Conn {
  id: string;
  pc: RTCPeerConnection;
  stream: MediaStream;
  initiator: boolean;
  pendingIce: RTCIceCandidateInit[];
  audioSender: RTCRtpSender | null;
  videoSender: RTCRtpSender | null;
  state: PeerState['connection'];
  meta: Meta | null;
  seen: boolean; // has appeared in presence at least once
}

interface Meter {
  analyser: AnalyserNode;
  data: Uint8Array;
  speaking: boolean;
  hold: number;
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] },
];
// Optional free TURN relay (helps people on strict networks / mobile data).
// Free options: Metered "Open Relay" or Cloudflare Calls TURN. Put the values in .env.local.
if (process.env.NEXT_PUBLIC_TURN_URL) {
  ICE_SERVERS.push({
    urls: process.env.NEXT_PUBLIC_TURN_URL.split(',').map((u) => u.trim()),
    username: process.env.NEXT_PUBLIC_TURN_USERNAME || '',
    credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || '',
  });
}

export class PartyRoomClient {
  private code: string;
  private identity: Identity;
  private maxParticipants: number;
  private hostClientId: string;

  private me: Meta;
  private channel: RealtimeChannel | null = null;
  private conns = new Map<string, Conn>();
  private listeners = new Set<() => void>();

  private audioTrack: MediaStreamTrack | null = null;
  private cameraTrack: MediaStreamTrack | null = null;
  private screenTrack: MediaStreamTrack | null = null;
  private outVideo: MediaStreamTrack | null = null;
  private localStream: MediaStream | null = null;

  private ac: AudioContext | null = null;
  private meters = new Map<string, Meter>();
  private meterTimer: ReturnType<typeof setInterval> | null = null;

  private messages: ChatMessage[] = [];
  private status: RoomStatus = 'idle';
  private error: string | null = null;
  private micError: string | null = null;
  private gameSignal = 0;
  private destroyed = false;
  private snap: RoomSnapshot;

  constructor(opts: { code: string; identity: Identity; maxParticipants: number; hostClientId: string }) {
    this.code = opts.code;
    this.identity = opts.identity;
    this.maxParticipants = opts.maxParticipants;
    this.hostClientId = opts.hostClientId;
    this.me = {
      id: crypto.randomUUID(),
      name: opts.identity.name,
      color: opts.identity.color,
      audioOn: false,
      videoOn: false,
      screenOn: false,
      deafened: false,
      isHost: opts.identity.clientId === opts.hostClientId,
      joinedAt: Date.now(),
    };
    this.snap = this.buildSnapshot();
  }

  get isHost(): boolean {
    return this.identity.clientId === this.hostClientId;
  }

  // ---------- React store API (useSyncExternalStore) ----------
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  getSnapshot = () => this.snap;

  private emit() {
    this.snap = this.buildSnapshot();
    this.listeners.forEach((l) => l());
  }

  private buildSnapshot(): RoomSnapshot {
    const toState = (m: Meta, conn: Conn | null): PeerState => {
      const isLocal = !conn;
      const stream = isLocal ? this.localStream : conn!.stream;
      return {
        id: m.id,
        name: m.name,
        color: m.color,
        audioOn: m.audioOn,
        videoOn: m.videoOn,
        screenOn: m.screenOn,
        deafened: m.deafened,
        speaking: !!this.meters.get(m.id)?.speaking && m.audioOn,
        isLocal,
        isHost: !!m.isHost,
        joinedAt: m.joinedAt,
        stream,
        trackCount: stream ? stream.getTracks().length : 0,
        connection: isLocal ? 'local' : conn!.state,
      };
    };
    const me = toState(this.me, null);
    const others: PeerState[] = [];
    this.conns.forEach((c) => {
      if (c.meta) others.push(toState(c.meta, c));
    });
    others.sort((a, b) => a.joinedAt - b.joinedAt);
    return {
      status: this.status,
      error: this.error,
      micError: this.micError,
      me,
      peers: [me, ...others],
      messages: this.messages,
      gameSignal: this.gameSignal,
    };
  }

  // ---------- Joining / leaving ----------
  async join(media: { audio: boolean; video: boolean }) {
    this.status = 'connecting';
    this.emit();

    try {
      this.ac = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.ac.resume().catch(() => {});
    } catch {
      this.ac = null;
    }

    if (media.audio) await this.acquireAudio();
    if (media.video) await this.acquireCamera();

    loadMessages(this.code)
      .then((rows) => {
        if (this.destroyed) return;
        const known = new Set(this.messages.map((m) => m.id));
        const old: ChatMessage[] = rows
          .filter((r) => !known.has(r.id))
          .map((r) => ({
            id: r.id,
            senderId: r.client_id,
            name: r.sender_name,
            color: '#94a3b8',
            text: r.body,
            ts: Date.parse(r.created_at),
          }));
        this.messages = [...old, ...this.messages];
        this.emit();
      })
      .catch(() => {});

    const channel = supabase.channel(`party:${this.code}`, {
      config: { broadcast: { self: false }, presence: { key: this.me.id } },
    });
    this.channel = channel;

    channel
      .on('presence', { event: 'sync' }, () => this.reconcile())
      .on('broadcast', { event: 'signal' }, ({ payload }) => {
        this.handleSignal(payload);
      })
      .on('broadcast', { event: 'chat' }, ({ payload }) => this.receiveChat(payload))
      .on('broadcast', { event: 'game' }, () => {
        this.gameSignal++;
        this.emit();
      })
      .on('broadcast', { event: 'closed' }, () => {
        this.status = 'closed';
        this.error = 'The host ended this room.';
        this.teardown();
        this.emit();
      })
      .subscribe(async (s) => {
        if (this.destroyed) return;
        if (s === 'SUBSCRIBED') {
          await channel.track({ ...this.me });
          this.status = 'connected';
          this.emit();
        } else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') {
          this.status = 'error';
          this.error = 'Could not connect to the realtime server. Check your internet and Supabase settings.';
          this.emit();
        }
      });
  }

  async leave() {
    this.teardown();
    this.status = 'closed';
    this.emit();
  }

  /** Host only: ends the room for everybody. */
  async endRoom() {
    if (!this.isHost) return;
    try {
      await this.channel?.send({ type: 'broadcast', event: 'closed', payload: {} });
      await closeRoom(this.code, this.identity.clientId);
    } catch {
      /* ignore */
    }
    await this.leave();
  }

  private teardown() {
    this.destroyed = true;
    if (this.meterTimer) clearInterval(this.meterTimer);
    this.meterTimer = null;
    this.conns.forEach((_, id) => this.closeConn(id));
    [this.audioTrack, this.cameraTrack, this.screenTrack].forEach((t) => t?.stop());
    this.audioTrack = this.cameraTrack = this.screenTrack = this.outVideo = null;
    this.localStream = null;
    if (this.channel) {
      try {
        this.channel.untrack();
      } catch {
        /* ignore */
      }
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.ac?.close().catch(() => {});
    this.ac = null;
    this.meters.clear();
  }

  // ---------- Presence -> connections ----------
  private reconcile() {
    if (this.destroyed || !this.channel) return;
    const state = this.channel.presenceState() as Record<string, any[]>;
    const metas: Meta[] = [];
    Object.keys(state).forEach((key) => {
      const arr = state[key];
      const m = arr && arr[arr.length - 1];
      if (m && m.id) metas.push(m as Meta);
    });

    // Capacity check: the newest people over the limit are the ones turned away.
    const ordered = [...metas].sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id));
    const myIndex = ordered.findIndex((m) => m.id === this.me.id);
    if (myIndex >= this.maxParticipants) {
      this.status = 'full';
      this.error = 'This room is full.';
      this.teardown();
      this.emit();
      return;
    }

    const present = new Set<string>();
    metas.forEach((m) => {
      if (m.id === this.me.id) return;
      present.add(m.id);
      let conn = this.conns.get(m.id);
      if (!conn) {
        conn = this.createConn(m.id, this.me.id < m.id);
        if (conn.initiator) {
          conn.meta = m;
          conn.seen = true;
          this.makeOffer(conn);
        }
      }
      conn.meta = m;
      conn.seen = true;
    });

    this.conns.forEach((c, id) => {
      if (c.seen && !present.has(id)) this.closeConn(id);
    });
    this.emit();
  }

  private createConn(id: string, initiator: boolean): Conn {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    const conn: Conn = {
      id,
      pc,
      stream: new MediaStream(),
      initiator,
      pendingIce: [],
      audioSender: null,
      videoSender: null,
      state: 'connecting',
      meta: null,
      seen: false,
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) this.signal(id, { type: 'ice', candidate: e.candidate.toJSON() });
    };
    pc.ontrack = (e) => {
      conn.stream.addTrack(e.track);
      if (e.track.kind === 'audio') this.watchAudio(id, e.track);
      this.emit();
    };
    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      conn.state = s === 'connected' ? 'connected' : s === 'failed' ? 'failed' : s === 'closed' ? 'closed' : 'connecting';
      if (s === 'failed' && conn.initiator && !this.destroyed) this.makeOffer(conn, true);
      this.emit();
    };

    if (initiator) {
      const a = pc.addTransceiver('audio', { direction: 'sendrecv' });
      const v = pc.addTransceiver('video', { direction: 'sendrecv' });
      conn.audioSender = a.sender;
      conn.videoSender = v.sender;
      a.sender.replaceTrack(this.audioTrack).catch(() => {});
      v.sender.replaceTrack(this.outVideo).catch(() => {});
    }

    this.conns.set(id, conn);
    return conn;
  }

  private closeConn(id: string) {
    const conn = this.conns.get(id);
    if (!conn) return;
    try {
      conn.pc.onicecandidate = null;
      conn.pc.ontrack = null;
      conn.pc.onconnectionstatechange = null;
      conn.pc.close();
    } catch {
      /* ignore */
    }
    this.meters.delete(id);
    this.conns.delete(id);
  }

  // ---------- Signaling ----------
  private signal(to: string, data: Record<string, unknown>) {
    this.channel?.send({ type: 'broadcast', event: 'signal', payload: { from: this.me.id, to, ...data } });
  }

  private async makeOffer(conn: Conn, iceRestart = false) {
    try {
      const offer = await conn.pc.createOffer(iceRestart ? { iceRestart: true } : undefined);
      await conn.pc.setLocalDescription(offer);
      this.signal(conn.id, { type: 'offer', sdp: { type: offer.type, sdp: offer.sdp } });
    } catch (e) {
      console.warn('[party] offer failed', e);
    }
  }

  private async handleSignal(p: any) {
    if (this.destroyed || !p || p.to !== this.me.id || !p.from) return;
    let conn = this.conns.get(p.from);
    if (!conn) conn = this.createConn(p.from, false);
    const pc = conn.pc;

    try {
      if (p.type === 'offer') {
        await pc.setRemoteDescription(p.sdp);
        this.prepareAnswererSenders(conn);
        await this.flushIce(conn);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.signal(p.from, { type: 'answer', sdp: { type: answer.type, sdp: answer.sdp } });
      } else if (p.type === 'answer') {
        await pc.setRemoteDescription(p.sdp);
        await this.flushIce(conn);
      } else if (p.type === 'ice' && p.candidate) {
        if (pc.remoteDescription) await pc.addIceCandidate(p.candidate);
        else conn.pendingIce.push(p.candidate);
      }
    } catch (e) {
      console.warn('[party] signal error', p.type, e);
    }
  }

  private prepareAnswererSenders(conn: Conn) {
    conn.pc.getTransceivers().forEach((t) => {
      try {
        t.direction = 'sendrecv';
      } catch {
        /* ignore */
      }
      if (t.receiver.track.kind === 'audio') {
        conn.audioSender = t.sender;
        t.sender.replaceTrack(this.audioTrack).catch(() => {});
      } else {
        conn.videoSender = t.sender;
        t.sender.replaceTrack(this.outVideo).catch(() => {});
      }
    });
  }

  private async flushIce(conn: Conn) {
    const list = conn.pendingIce.splice(0);
    for (const c of list) {
      try {
        await conn.pc.addIceCandidate(c);
      } catch {
        /* ignore */
      }
    }
  }

  // ---------- Local media ----------
  private async acquireAudio(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.micError = 'Microphone is not available here (it needs HTTPS or localhost).';
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      this.audioTrack = s.getAudioTracks()[0];
      this.me.audioOn = true;
      this.micError = null;
      this.watchAudio(this.me.id, this.audioTrack);
      this.conns.forEach((c) => c.audioSender?.replaceTrack(this.audioTrack).catch(() => {}));
    } catch {
      this.micError = 'Microphone blocked or not found. You can still listen and use text chat.';
    }
  }

  private async acquireCamera(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) return;
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 360 }, frameRate: { ideal: 24, max: 30 } },
      });
      this.cameraTrack = s.getVideoTracks()[0];
      this.cameraTrack.onended = () => {
        this.cameraTrack = null;
        this.refreshOutVideo();
      };
      this.refreshOutVideo();
    } catch {
      this.micError = 'Camera blocked or not found.';
    }
  }

  private refreshOutVideo() {
    const track = this.screenTrack || this.cameraTrack || null;
    this.outVideo = track;
    this.me.videoOn = !!this.cameraTrack;
    this.me.screenOn = !!this.screenTrack;
    this.localStream = track ? new MediaStream([track]) : null;
    this.conns.forEach((c) => c.videoSender?.replaceTrack(track).catch(() => {}));
    this.publish();
    this.emit();
  }

  private publish() {
    this.channel?.track({ ...this.me });
  }

  async toggleMic() {
    if (!this.audioTrack) {
      await this.acquireAudio();
    } else {
      this.audioTrack.enabled = !this.audioTrack.enabled;
      this.me.audioOn = this.audioTrack.enabled;
    }
    if (this.me.audioOn && this.me.deafened) this.me.deafened = false;
    this.publish();
    this.emit();
  }

  async toggleCamera() {
    if (this.cameraTrack) {
      this.cameraTrack.stop();
      this.cameraTrack = null;
      this.refreshOutVideo();
    } else {
      await this.acquireCamera();
    }
  }

  async toggleScreen() {
    if (this.screenTrack) {
      this.screenTrack.stop();
      this.screenTrack = null;
      this.refreshOutVideo();
      return;
    }
    if (!navigator.mediaDevices?.getDisplayMedia) {
      this.micError = 'Screen sharing is not supported on this device.';
      this.emit();
      return;
    }
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 24, max: 30 } }, audio: false });
      this.screenTrack = s.getVideoTracks()[0];
      this.screenTrack.onended = () => {
        this.screenTrack = null;
        this.refreshOutVideo();
      };
      this.refreshOutVideo();
    } catch {
      /* user cancelled the picker */
    }
  }

  toggleDeafen() {
    this.me.deafened = !this.me.deafened;
    if (this.me.deafened && this.audioTrack) {
      this.audioTrack.enabled = false;
      this.me.audioOn = false;
    }
    this.publish();
    this.emit();
  }

  // ---------- Speaking detection ----------
  private watchAudio(id: string, track: MediaStreamTrack) {
    if (!this.ac) return;
    try {
      const src = this.ac.createMediaStreamSource(new MediaStream([track]));
      const analyser = this.ac.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser); // not connected to speakers: playback happens in the <video> tile
      this.meters.set(id, { analyser, data: new Uint8Array(analyser.fftSize), speaking: false, hold: 0 });
      if (!this.meterTimer) this.meterTimer = setInterval(() => this.tickMeters(), 130);
    } catch {
      /* ignore */
    }
  }

  private tickMeters() {
    let changed = false;
    this.meters.forEach((m) => {
      m.analyser.getByteTimeDomainData(m.data as any);
      let sum = 0;
      for (let i = 0; i < m.data.length; i++) {
        const v = (m.data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / m.data.length);
      let speaking = m.speaking;
      if (rms > 0.03) {
        m.hold = 3;
        speaking = true;
      } else if (m.hold > 0) {
        m.hold--;
      } else {
        speaking = false;
      }
      if (speaking !== m.speaking) {
        m.speaking = speaking;
        changed = true;
      }
    });
    if (changed) this.emit();
  }

  // ---------- Chat & game ----------
  sendChat(text: string) {
    const clean = text.trim().slice(0, 500);
    if (!clean) return;
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: this.me.id,
      name: this.me.name,
      color: this.me.color,
      text: clean,
      ts: Date.now(),
    };
    this.pushMessage(msg);
    this.channel?.send({ type: 'broadcast', event: 'chat', payload: msg });
    saveMessage(this.code, msg.id, this.identity.clientId, msg.name, msg.text).catch(() => {});
  }

  private receiveChat(p: any) {
    if (!p || typeof p.text !== 'string' || !p.id) return;
    this.pushMessage({
      id: String(p.id),
      senderId: String(p.senderId || ''),
      name: String(p.name || 'Player').slice(0, 40),
      color: typeof p.color === 'string' ? p.color : '#94a3b8',
      text: p.text.slice(0, 500),
      ts: Number(p.ts) || Date.now(),
    });
  }

  private pushMessage(m: ChatMessage) {
    if (this.messages.some((x) => x.id === m.id)) return;
    this.messages = [...this.messages, m].slice(-200);
    this.emit();
  }

  /** Host: opens the party game for everyone in the room. */
  launchGameForAll() {
    this.channel?.send({ type: 'broadcast', event: 'game', payload: {} });
    this.gameSignal++;
    this.emit();
  }
}
