'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Tv,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MonitorOff,
  Headphones,
  HeadphoneOff,
  PhoneOff,
  Gamepad2,
  Send,
  Play,
  Copy,
  Check,
  ArrowLeft,
  Crown,
  Loader2,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { FEATURED_GAMES } from '@/lib/games';
import { getLaunchUrl } from '@/lib/games/launch';
import {
  getRoomByCode,
  getIdentity,
  heartbeat,
  normalizeCode,
  roomsBackendReady,
  saveGuestName,
  type PartyRoom,
} from '@/lib/party/rooms';
import { PartyRoomClient, type PeerState } from '@/lib/party/rtc';

/* ------------------------------------------------------------------ */
/* Participant tile                                                    */
/* ------------------------------------------------------------------ */
function Tile({ p, deafened, compact }: { p: PeerState; deafened: boolean; compact?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const showVideo = p.videoOn || p.screenOn;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (p.stream && p.trackCount > 0) {
      el.srcObject = new MediaStream(p.stream.getTracks());
      el.play().catch(() => {});
    } else {
      el.srcObject = null;
    }
  }, [p.stream, p.trackCount]);

  useEffect(() => {
    if (ref.current) ref.current.muted = p.isLocal || deafened;
  }, [p.isLocal, deafened]);

  const initials = p.name.trim().slice(0, 2).toUpperCase() || '?';

  return (
    <div
      className={`relative aspect-video rounded-xl overflow-hidden bg-arcade-midnight border transition-all ${
        p.speaking ? 'border-arcade-sage shadow-sage-glow' : 'border-arcade-border'
      } ${compact ? 'w-36 shrink-0' : ''}`}
    >
      {/* The video element is always mounted so remote audio keeps playing even with the camera off */}
      <video
        ref={ref}
        autoPlay
        playsInline
        className={`absolute inset-0 w-full h-full ${p.screenOn ? 'object-contain bg-black' : 'object-cover'} ${
          showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } ${p.isLocal && p.videoOn && !p.screenOn ? '-scale-x-100' : ''}`}
      />

      {!showVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`rounded-full flex items-center justify-center font-black text-arcade-dark ${
              compact ? 'w-10 h-10 text-sm' : 'w-16 h-16 sm:w-20 sm:h-20 text-xl sm:text-2xl'
            } ${p.speaking ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: p.color }}
          >
            {initials}
          </div>
        </div>
      )}

      {p.isHost && (
        <span className="absolute top-1.5 right-1.5 p-1 rounded-full bg-arcade-amber text-black" title="Room host">
          <Crown className="w-3 h-3" />
        </span>
      )}

      {!p.isLocal && p.connection !== 'connected' && (
        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-slate-200 flex items-center gap-1">
          {p.connection === 'failed' ? (
            <>
              <AlertTriangle className="w-3 h-3 text-arcade-rose" /> Failed
            </>
          ) : (
            <>
              <Loader2 className="w-3 h-3 animate-spin" /> Connecting
            </>
          )}
        </span>
      )}

      <div className="absolute bottom-0 inset-x-0 px-2 py-1 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between gap-1">
        <span className="text-[11px] font-bold text-white truncate">
          {p.name}
          {p.isLocal ? ' (You)' : ''}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {p.screenOn && <MonitorUp className="w-3 h-3 text-arcade-champagne" />}
          {p.deafened && <HeadphoneOff className="w-3 h-3 text-arcade-rose" />}
          {!p.audioOn && <MicOff className="w-3 h-3 text-arcade-rose" />}
        </span>
      </div>
    </div>
  );
}

function gridCols(n: number) {
  if (n <= 1) return 'grid-cols-1 max-w-xl mx-auto';
  if (n <= 4) return 'grid-cols-1 sm:grid-cols-2';
  if (n <= 6) return 'grid-cols-2 lg:grid-cols-3';
  return 'grid-cols-2 lg:grid-cols-4';
}

/* ------------------------------------------------------------------ */
/* In-room experience                                                  */
/* ------------------------------------------------------------------ */
function RoomView({ room, client, onLeft }: { room: PartyRoom; client: PartyRoomClient; onLeft: () => void }) {
  const snap = useSyncExternalStore(client.subscribe, client.getSnapshot, client.getSnapshot);
  const [tab, setTab] = useState<'lobby' | 'game'>('lobby');
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const lastGameSignal = useRef(0);
  const countRef = useRef(1);

  const game = FEATURED_GAMES.find((g) => g.id === room.selected_game_id);
  const me = snap.me;

  useEffect(() => {
    countRef.current = snap.peers.length;
  }, [snap.peers.length]);

  // Keep the room visible in the public list + show live member count
  useEffect(() => {
    if (snap.status !== 'connected') return;
    const beat = () => heartbeat(room.code, countRef.current).catch(() => {});
    beat();
    const t = setInterval(beat, 30000);
    return () => clearInterval(t);
  }, [snap.status, room.code]);

  // Host launched the game -> everyone jumps to the game tab
  useEffect(() => {
    if (snap.gameSignal > lastGameSignal.current) {
      lastGameSignal.current = snap.gameSignal;
      if (game) setTab('game');
    }
  }, [snap.gameSignal, game]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ block: 'end' });
  }, [snap.messages.length]);

  useEffect(() => {
    if (snap.status === 'closed' || snap.status === 'full' || snap.status === 'error') onLeft();
  }, [snap.status, onLeft]);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/rooms/${room.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    client.sendChat(text);
    setText('');
  };

  if (!me) return null;

  const btn = (active: boolean, danger = false) =>
    `flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
      danger
        ? 'bg-arcade-rose/15 border-arcade-rose/40 text-arcade-rose hover:bg-arcade-rose hover:text-white'
        : active
        ? 'bg-arcade-surface border-arcade-border text-slate-100 hover:border-arcade-sage'
        : 'bg-arcade-rose text-white border-arcade-rose shadow-rose-glow'
    }`;

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-arcade-border">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => {
              client.leave();
              onLeft();
            }}
            className="p-2 rounded-lg bg-arcade-surface border border-arcade-border text-slate-400 hover:text-white"
            title="Leave room"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-white truncate">{room.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-arcade-sage/10 text-arcade-sage border border-arcade-sage/30">
                {room.code}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Users className="w-3.5 h-3.5" /> {snap.peers.length}/{room.max_participants}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{room.description || 'Voice & video party room'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-arcade-surface border border-arcade-border text-xs font-bold text-slate-300 hover:text-arcade-champagne hover:border-arcade-champagne transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-arcade-sage" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Link copied!' : 'Invite'}
          </button>

          <div className="flex rounded-lg bg-arcade-surface p-1 border border-arcade-border">
            <button
              onClick={() => setTab('lobby')}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                tab === 'lobby' ? 'bg-arcade-sage text-arcade-dark' : 'text-slate-400 hover:text-white'
              }`}
            >
              Party
            </button>
            {game && (
              <button
                onClick={() => setTab('game')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1 ${
                  tab === 'game' ? 'bg-arcade-champagne text-arcade-dark' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" /> Play Game
              </button>
            )}
          </div>
        </div>
      </div>

      {snap.micError && (
        <div className="p-2.5 rounded-lg border border-arcade-amber/40 bg-arcade-amber/10 text-xs text-arcade-amber flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {snap.micError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main area */}
        <div className="lg:col-span-2 space-y-5 min-w-0">
          {tab === 'lobby' ? (
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-arcade-border space-y-4">
              <div className={`grid gap-3 ${gridCols(snap.peers.length)}`}>
                {snap.peers.map((p) => (
                  <Tile key={p.id} p={p} deafened={me.deafened} />
                ))}
              </div>
              {snap.peers.length === 1 && (
                <p className="text-center text-xs text-slate-400">
                  You&apos;re the only one here. Press <b>Invite</b> and send the link to your friends.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {snap.peers.map((p) => (
                  <Tile key={p.id} p={p} deafened={me.deafened} compact />
                ))}
              </div>
              <div className="glass-panel rounded-2xl overflow-hidden border border-arcade-border h-[62vh] min-h-[420px] flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 bg-arcade-midnight border-b border-arcade-border">
                  <span className="text-xs font-bold text-white">{game?.title}</span>
                  <button onClick={() => setTab('lobby')} className="text-xs font-bold text-arcade-sage hover:underline">
                    ← Back to party
                  </button>
                </div>
                <div className="flex-1 min-h-0 bg-black">
                  <iframe
                    src={game ? getLaunchUrl(game, typeof window !== 'undefined' ? window.location.origin : '') : undefined}
                    title={game?.title}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-pointer-lock allow-orientation-lock allow-presentation allow-modals"
                    allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope"
                    allowFullScreen
                    className="w-full h-full border-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-3 rounded-2xl bg-arcade-midnight border border-arcade-border">
            <button onClick={() => client.toggleMic()} className={btn(me.audioOn)} title="Microphone">
              {me.audioOn ? <Mic className="w-4 h-4 text-arcade-sage" /> : <MicOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{me.audioOn ? 'Mute' : 'Unmute'}</span>
            </button>
            <button onClick={() => client.toggleCamera()} className={btn(true)} title="Camera">
              {me.videoOn ? <Video className="w-4 h-4 text-arcade-champagne" /> : <VideoOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{me.videoOn ? 'Camera off' : 'Camera on'}</span>
            </button>
            <button onClick={() => client.toggleScreen()} className={btn(true)} title="Share your screen">
              {me.screenOn ? <MonitorOff className="w-4 h-4 text-arcade-rose" /> : <MonitorUp className="w-4 h-4 text-arcade-orchid" />}
              <span className="hidden sm:inline">{me.screenOn ? 'Stop sharing' : 'Share screen'}</span>
            </button>
            <button onClick={() => client.toggleDeafen()} className={btn(!me.deafened)} title="Deafen (stop hearing everyone)">
              {me.deafened ? <HeadphoneOff className="w-4 h-4" /> : <Headphones className="w-4 h-4 text-arcade-orchid" />}
              <span className="hidden sm:inline">{me.deafened ? 'Undeafen' : 'Deafen'}</span>
            </button>

            {client.isHost && game && (
              <button
                onClick={() => {
                  client.launchGameForAll();
                  setTab('game');
                }}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold bg-arcade-champagne text-arcade-dark shadow-champagne-glow hover:bg-white transition-colors"
              >
                <Play className="w-4 h-4 fill-current" /> <span className="hidden sm:inline">Launch game for everyone</span>
              </button>
            )}

            <button
              onClick={() => {
                if (client.isHost && snap.peers.length > 1 && !window.confirm('End this room for everyone?')) return;
                if (client.isHost) client.endRoom();
                else client.leave();
                onLeft();
              }}
              className={btn(true, true)}
            >
              <PhoneOff className="w-4 h-4" /> <span className="hidden sm:inline">{client.isHost ? 'End room' : 'Leave'}</span>
            </button>
          </div>

          {game && tab === 'lobby' && (
            <div className="glass-panel p-4 rounded-2xl border border-arcade-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img src={game.thumbnail_url} alt={game.title} className="w-14 h-14 rounded-xl object-cover border border-arcade-border" />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-arcade-champagne uppercase tracking-wider">Party Game</span>
                  <h3 className="text-base font-bold text-white truncate">{game.title}</h3>
                  <p className="text-xs text-slate-400">
                    {game.category} • {game.supported_players}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTab('game')}
                className="px-4 py-2 rounded-xl bg-arcade-surface border border-arcade-border text-xs font-bold text-white hover:border-arcade-champagne transition-colors flex items-center gap-2 shrink-0"
              >
                <Play className="w-4 h-4 fill-current" /> Open game
              </button>
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="glass-panel rounded-2xl border border-arcade-border h-[520px] lg:h-[640px] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-arcade-border bg-arcade-midnight flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Room Chat</span>
            <span className="text-[10px] text-slate-400">Live</span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {snap.messages.length === 0 && <p className="text-xs text-slate-500 text-center pt-6">No messages yet. Say hi 👋</p>}
            {snap.messages.map((m) => (
              <div key={m.id} className="text-xs space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold" style={{ color: m.color }}>
                    {m.name}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-300 bg-arcade-surface/60 p-2 rounded-lg border border-arcade-border/40 break-words">{m.text}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={send} className="p-2 border-t border-arcade-border bg-arcade-midnight flex gap-2">
            <input
              type="text"
              maxLength={500}
              placeholder="Send a message to the room..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 bg-arcade-surface border border-arcade-border rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-arcade-sage"
            />
            <button type="submit" className="p-2 rounded-lg bg-arcade-sage text-arcade-dark font-bold hover:bg-white transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page: load room -> join gate -> room                                */
/* ------------------------------------------------------------------ */
export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = normalizeCode((params?.id as string) || '');
  const { user } = useAuth();

  const [room, setRoom] = useState<PartyRoom | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'notfound' | 'error'>('loading');
  const [loadError, setLoadError] = useState('');
  const [name, setName] = useState('');
  const [wantMic, setWantMic] = useState(true);
  const [wantCam, setWantCam] = useState(false);
  const [joining, setJoining] = useState(false);
  const [client, setClient] = useState<PartyRoomClient | null>(null);
  const [endedMsg, setEndedMsg] = useState('');

  useEffect(() => {
    if (!roomsBackendReady()) {
      setLoadError('Supabase is not configured in .env.local.');
      setLoadState('error');
      return;
    }
    setName(getIdentity(user?.display_name).name);
    getRoomByCode(code)
      .then((r) => {
        if (!r || r.is_closed) setLoadState('notfound');
        else {
          setRoom(r);
          setLoadState('ready');
        }
      })
      .catch((e) => {
        setLoadError(e?.message || 'Could not load the room.');
        setLoadState('error');
      });
  }, [code, user?.display_name]);

  // Always disconnect when leaving the page / closing the tab
  useEffect(() => {
    if (!client) return;
    const bye = () => {
      client.leave();
    };
    window.addEventListener('pagehide', bye);
    return () => {
      window.removeEventListener('pagehide', bye);
      client.leave();
    };
  }, [client]);

  const join = async () => {
    if (!room || joining) return;
    setJoining(true);
    const finalName = (name.trim() || 'Guest').slice(0, 24);
    if (!user) saveGuestName(finalName);
    const identity = { ...getIdentity(user?.display_name), name: user?.display_name || finalName };
    const c = new PartyRoomClient({
      code: room.code,
      identity,
      maxParticipants: room.max_participants,
      hostClientId: room.host_client_id,
    });
    await c.join({ audio: wantMic, video: wantCam });
    setClient(c);
    setJoining(false);
  };

  const Message = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
    <div className="py-16 text-center glass-panel rounded-xl border border-arcade-border max-w-xl mx-auto">
      <div className="mx-auto mb-3 w-fit">{icon}</div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="text-xs text-slate-400 mt-1 px-6">{text}</p>
      <Link href="/rooms" className="mt-4 inline-block px-4 py-2 bg-arcade-sage text-arcade-dark font-bold text-xs rounded-lg">
        Browse Rooms
      </Link>
    </div>
  );

  if (loadState === 'loading')
    return (
      <div className="py-24 flex items-center justify-center gap-2 text-xs text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading room...
      </div>
    );
  if (loadState === 'notfound')
    return <Message icon={<Tv className="w-12 h-12 text-arcade-rose" />} title="Room Not Found" text="This room was closed or the code is wrong." />;
  if (loadState === 'error')
    return (
      <Message
        icon={<AlertTriangle className="w-12 h-12 text-arcade-amber" />}
        title="Could not open the room"
        text={loadError + ' Make sure you ran the 00004_party_rooms.sql migration in Supabase.'}
      />
    );
  if (!room) return null;

  if (endedMsg)
    return <Message icon={<PhoneOff className="w-12 h-12 text-arcade-rose" />} title="You left the room" text={endedMsg} />;

  if (!client) {
    return (
      <div className="max-w-md mx-auto glass-panel p-6 rounded-2xl border border-arcade-border space-y-5">
        <div className="text-center space-y-1">
          <Tv className="w-10 h-10 text-arcade-sage mx-auto" />
          <h1 className="text-xl font-black text-white">{room.name}</h1>
          <p className="text-xs text-slate-400">
            Hosted by <b className="text-slate-200">{room.host_name}</b> • Code{' '}
            <span className="font-mono text-arcade-sage">{room.code}</span>
          </p>
          {room.description && <p className="text-xs text-slate-400">{room.description}</p>}
        </div>

        {!user && (
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Your name</label>
            <input
              type="text"
              maxLength={24}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-arcade-midnight border border-arcade-border rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-arcade-sage"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setWantMic(!wantMic)}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors ${
              wantMic ? 'bg-arcade-sage/15 border-arcade-sage text-arcade-sage' : 'bg-arcade-midnight border-arcade-border text-slate-400'
            }`}
          >
            {wantMic ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />} Microphone
          </button>
          <button
            onClick={() => setWantCam(!wantCam)}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors ${
              wantCam ? 'bg-arcade-champagne/15 border-arcade-champagne text-arcade-champagne' : 'bg-arcade-midnight border-arcade-border text-slate-400'
            }`}
          >
            {wantCam ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />} Camera
          </button>
        </div>

        <button
          onClick={join}
          disabled={joining}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-arcade-sage text-arcade-dark font-black text-sm shadow-sage-glow hover:bg-white transition-colors disabled:opacity-60"
        >
          {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          {joining ? 'Joining...' : 'Join Room'}
        </button>
        <p className="text-[11px] text-slate-500 text-center">Your browser will ask for permission. You can join as a listener with both off.</p>
      </div>
    );
  }

  return (
    <RoomView
      room={room}
      client={client}
      onLeft={() => {
        const snapNow = client.getSnapshot();
        setEndedMsg(snapNow.error || 'Thanks for hanging out!');
        setClient(null);
        router.prefetch('/rooms');
      }}
    />
  );
}
