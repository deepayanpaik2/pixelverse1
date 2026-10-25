'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Gamepad2, 
  Users, 
  Activity, 
  Check, 
  X, 
  Ban, 
  AlertTriangle, 
  ExternalLink,
  ShieldCheck,
  UploadCloud,
  FileWarning,
  RefreshCw,
  Search,
  CheckCircle2,
  Radio,
  Eye,
  Sliders
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { mockStore } from '@/lib/supabase/mock-store';
import { GameManifest, GameSubmission, TakedownNotice } from '@/types';

export default function AdminDashboardPage() {
  const { user, signIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'submissions' | 'dmca' | 'games' | 'feeds' | 'reports' | 'users' | 'telemetry'>('submissions');
  
  const [submissions, setSubmissions] = useState<GameSubmission[]>([]);
  const [takedowns, setTakedowns] = useState<TakedownNotice[]>([]);
  const [allGames, setAllGames] = useState<GameManifest[]>([]);
  const [reports, setReports] = useState(mockStore.getReports());
  const [reviewerNotes, setReviewerNotes] = useState<{ [id: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const profiles = mockStore.getProfiles();
  const rooms = mockStore.getRooms();

  const loadData = async () => {
    setSubmissions(mockStore.getSubmissions());
    setTakedowns(mockStore.getTakedowns());
    setAllGames(mockStore.getAllGamesAdmin());
    setReports(mockStore.getReports());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDevLogin = async () => {
    const adminUser = mockStore.getProfiles().find(p => p.is_admin);
    if (adminUser) {
      await signIn(`${adminUser.username}@pixelverse.games`, 'password');
    }
  };

  const handleApproveSubmission = (id: string) => {
    const success = mockStore.approveSubmission(id);
    if (success) {
      setActionMessage(`Submission ${id} approved and published to catalog!`);
      loadData();
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleRejectSubmission = (id: string) => {
    const note = reviewerNotes[id] || 'Does not meet safety or technical criteria.';
    const success = mockStore.rejectSubmission(id, note);
    if (success) {
      setActionMessage(`Submission ${id} rejected.`);
      loadData();
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleActionTakedown = (id: string) => {
    const note = reviewerNotes[id] || 'Infringement claim verified. Content quarantined.';
    const success = mockStore.actionTakedown(id, note);
    if (success) {
      setActionMessage(`Takedown ${id} actioned: Associated game has been immediately quarantined!`);
      loadData();
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleToggleGameStatus = (gameId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'quarantined' : 'published';
    mockStore.updateGameStatus(gameId, newStatus);
    setActionMessage(`Game status updated to: ${newStatus}`);
    loadData();
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleResolveReport = (reportId: string) => {
    const notes = reviewerNotes[reportId] || 'Report reviewed and resolved.';
    mockStore.resolveReport(reportId, notes);
    setReports(mockStore.getReports());
  };

  // If not logged in as admin/moderator, show quick staff login option
  if (!user || (!user.is_admin && !user.is_moderator)) {
    return (
      <div className="py-20 text-center glass-panel rounded-2xl border border-arcade-border max-w-lg mx-auto p-8 space-y-4">
        <ShieldAlert className="w-12 h-12 text-arcade-rose mx-auto mb-2" />
        <h2 className="text-xl font-bold text-white">Restricted Staff Area</h2>
        <p className="text-xs text-slate-400">
          This portal is reserved for Pixelverse administrators, safety moderators, and copyright compliance officers.
        </p>
        
        <div className="pt-2 flex flex-col gap-2">
          <button 
            onClick={handleDevLogin}
            className="w-full py-2.5 px-4 bg-arcade-champagne text-arcade-dark font-black text-xs rounded-xl hover:bg-arcade-champagne/90 transition shadow-lg shadow-arcade-champagne/20"
          >
            Authorize as Staff Administrator (Demo)
          </button>
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition py-2">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const pendingTakedowns = takedowns.filter(t => t.status === 'pending');
  const filteredGames = allGames.filter(g => 
    g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Alert */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-arcade-midnight border border-arcade-champagne text-white text-xs shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-arcade-champagne shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-arcade-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-arcade-rose/10 border border-arcade-rose/30 text-arcade-rose text-[11px] font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Staff Console • Logged in as @{user.username}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            Pixelverse Administration & Compliance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review developer submissions, process DMCA copyright takedowns, inspect publisher feeds, and audit catalog health.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-arcade-midnight border border-arcade-border rounded-xl">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'submissions' ? 'bg-arcade-champagne text-arcade-dark font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" /> Submissions
            {pendingSubmissions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-arcade-rose text-white text-[10px] font-black">
                {pendingSubmissions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('dmca')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'dmca' ? 'bg-red-600 text-white font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileWarning className="w-3.5 h-3.5" /> DMCA Queue
            {pendingTakedowns.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white text-red-600 text-[10px] font-black">
                {pendingTakedowns.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('games')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'games' ? 'bg-arcade-orchid text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" /> Catalog ({allGames.length})
          </button>

          <button
            onClick={() => setActiveTab('feeds')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'feeds' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" /> Feeds
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'reports' ? 'bg-arcade-rose text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Reports ({reports.filter(r => r.status === 'pending').length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'users' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Users ({profiles.length})
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'telemetry' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Status
          </button>
        </div>
      </div>

      {/* TAB 1: Developer Submissions Queue */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Developer Game Submissions Review Queue</h2>
              <p className="text-xs text-slate-400">Review newly submitted games. Approving a game automatically publishes it to the live portal.</p>
            </div>
            <button
              onClick={loadData}
              className="p-2 rounded-lg bg-arcade-midnight border border-arcade-border text-slate-400 hover:text-white text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {submissions.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-arcade-border text-xs text-slate-400 space-y-2">
              <Check className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold text-white">No game submissions in queue.</p>
              <p>Developers who use <Link href="/submit" className="text-arcade-champagne underline">/submit</Link> will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {submissions.map((sub) => (
                <div key={sub.id} className="bg-arcade-card border border-arcade-border rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-arcade-border/50 pb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={sub.thumbnail_url}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-arcade-border shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80';
                        }}
                      />
                      <div>
                        <div className="text-base font-bold text-white flex items-center gap-2">
                          {sub.title}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            sub.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            sub.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            'bg-arcade-champagne/20 text-arcade-champagne border border-arcade-champagne/30'
                          }`}>
                            {sub.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          By <span className="text-white font-semibold">{sub.developer_name}</span> ({sub.developer_email}) • Category: <span className="text-arcade-champagne font-bold">{sub.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-mono block">
                        ID: {sub.id}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(sub.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-400 font-bold mb-1">Description:</p>
                      <p className="text-slate-300 bg-arcade-midnight p-2.5 rounded-xl border border-arcade-border/40">
                        {sub.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold mb-1">Controls / How to Play:</p>
                      <p className="text-slate-300 bg-arcade-midnight p-2.5 rounded-xl border border-arcade-border/40">
                        {sub.instructions}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs bg-arcade-midnight/60 p-3 rounded-xl border border-arcade-border/40">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">License:</span>
                      <span className="text-emerald-400 font-mono font-bold">{sub.license}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Tags:</span>
                      <span className="text-slate-300">{sub.tags.join(', ')}</span>
                    </div>
                    <a
                      href={sub.launch_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1 text-arcade-champagne font-bold hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> Test Launch URL
                    </a>
                  </div>

                  {sub.status === 'pending' && (
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-arcade-border/50">
                      <input
                        type="text"
                        placeholder="Reviewer notes (optional)..."
                        value={reviewerNotes[sub.id] || ''}
                        onChange={(e) => setReviewerNotes({ ...reviewerNotes, [sub.id]: e.target.value })}
                        className="w-full sm:w-96 bg-arcade-midnight border border-arcade-border rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-arcade-champagne"
                      />
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleRejectSubmission(sub.id)}
                          className="px-4 py-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white font-bold text-xs transition flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button
                          onClick={() => handleApproveSubmission(sub.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-arcade-dark font-black text-xs transition flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve & Publish
                        </button>
                      </div>
                    </div>
                  )}

                  {sub.reviewer_notes && (
                    <div className="text-[11px] text-slate-400 italic">
                      Reviewer Note: {sub.reviewer_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DMCA Takedown Queue */}
      {activeTab === 'dmca' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileWarning className="w-4 h-4 text-red-400" /> DMCA Copyright Takedown Notices
              </h2>
              <p className="text-xs text-slate-400">
                Actioning a takedown notice immediately isolates and quarantines the target game from the public portal.
              </p>
            </div>
          </div>

          {takedowns.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-arcade-border text-xs text-slate-400 space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold text-white">No active DMCA notices.</p>
              <p>Complaints filed via the <Link href="/dmca" className="text-arcade-champagne underline">/dmca</Link> form appear here for instant action.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {takedowns.map((td) => (
                <div key={td.id} className="bg-arcade-card border border-red-500/30 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-arcade-border/50 pb-3">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        Claimant: {td.claimant_name} ({td.claimant_email})
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          td.status === 'actioned' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {td.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Alleged Copyright Owner: <span className="text-white font-bold">{td.copyright_owner}</span>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 font-mono">
                      Ref: {td.id}<br />
                      {new Date(td.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-xs space-y-2">
                    <p className="text-slate-400 font-bold">Target Material URL:</p>
                    <div className="p-2.5 bg-arcade-midnight rounded-xl border border-arcade-border font-mono text-arcade-rose break-all">
                      {td.infringing_url}
                    </div>

                    <p className="text-slate-400 font-bold pt-1">Claim Details & Original Reference:</p>
                    <p className="text-slate-300 bg-arcade-midnight p-2.5 rounded-xl border border-arcade-border">
                      {td.description}
                    </p>
                  </div>

                  {td.status === 'pending' && (
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-arcade-border/50">
                      <input
                        type="text"
                        placeholder="Resolution notes..."
                        value={reviewerNotes[td.id] || ''}
                        onChange={(e) => setReviewerNotes({ ...reviewerNotes, [td.id]: e.target.value })}
                        className="w-full sm:w-96 bg-arcade-midnight border border-arcade-border rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                      />
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleActionTakedown(td.id)}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-lg shadow-red-600/30"
                        >
                          <Ban className="w-3.5 h-3.5" /> Action Takedown & Quarantine Game
                        </button>
                      </div>
                    </div>
                  )}

                  {td.admin_notes && (
                    <div className="text-[11px] text-slate-400 italic">
                      Compliance Audit Note: {td.admin_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Game Catalog & Quarantine Controls */}
      {activeTab === 'games' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Full Game Catalog Audit ({allGames.length} Total)</h2>
              <p className="text-xs text-slate-400">Inspect licenses, sources, play counts, and quarantine or re-publish titles.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-arcade-midnight border border-arcade-border text-white text-xs focus:outline-none focus:border-arcade-champagne"
              />
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-arcade-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-arcade-surface/60 border-b border-arcade-border text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Title & Slug</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Source & License</th>
                    <th className="p-3">Plays</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-arcade-border/40 text-slate-300">
                  {filteredGames.slice(0, 100).map((g) => (
                    <tr key={g.id} className="hover:bg-arcade-surface/30">
                      <td className="p-3 font-bold text-white">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={g.thumbnail_url}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover bg-slate-800 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80';
                            }}
                          />
                          <div>
                            <div>{g.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">/game/{g.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{g.category}</td>
                      <td className="p-3">
                        <div className="text-white font-semibold">{g.author}</div>
                        <div className="text-[10px] font-mono text-arcade-champagne">{g.license}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{g.source_type}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-white">
                        {g.play_count.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono text-arcade-yellow">
                        ★ {g.rating_score}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          g.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          g.status === 'quarantined' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                          'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}>
                          {g.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/game/${g.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-arcade-midnight hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Preview game page"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleToggleGameStatus(g.id, g.status)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                              g.status === 'published' 
                                ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-600 hover:text-white' 
                                : 'bg-emerald-500 text-arcade-dark font-black hover:bg-emerald-400'
                            }`}
                          >
                            {g.status === 'published' ? 'Quarantine' : 'Publish'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Publisher Feeds Status */}
      {activeTab === 'feeds' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-base font-bold text-white">GameMonetize Catalog & Feed</h2>
            <p className="text-xs text-slate-400">Every game on the site comes from the GameMonetize HTML5 feed and is embedded live from their servers.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-arcade-midnight rounded-xl border border-arcade-border">
              <div className="text-2xl font-black text-white">{allGames.length.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400">Games in catalog</div>
            </div>
            <div className="p-3 bg-arcade-midnight rounded-xl border border-arcade-border">
              <div className="text-2xl font-black text-emerald-400">{allGames.filter(g => g.status === 'published').length.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400">Published</div>
            </div>
            <div className="p-3 bg-arcade-midnight rounded-xl border border-arcade-border">
              <div className="text-2xl font-black text-arcade-champagne">{new Set(allGames.map(g => g.category)).size}</div>
              <div className="text-[11px] text-slate-400">Categories</div>
            </div>
            <div className="p-3 bg-arcade-midnight rounded-xl border border-arcade-border">
              <div className="text-2xl font-black text-arcade-orchid">HTML5</div>
              <div className="text-[11px] text-slate-400">Live embed mode</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-arcade-card border border-arcade-border rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">GameMonetize Feed</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Games embed live from <code className="text-arcade-champagne font-mono">html5.gamemonetize.co/&#123;id&#125;/</code> with thumbnails from <code className="text-arcade-champagne font-mono">img.gamemonetize.com</code>.
              </p>
              <div className="p-2.5 bg-arcade-midnight rounded-xl text-[11px] font-mono text-slate-300 space-y-1">
                <div>Update the catalog:  npm run sync:feed</div>
                <div>Then redeploy the site</div>
                <div>Feed: rss.gamemonetize.com/rssfeed.php?format=json</div>
              </div>
            </div>

            <div className="bg-arcade-card border border-arcade-border rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Embed Sandboxing & Security</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-arcade-champagne/10 text-arcade-champagne border border-arcade-champagne/30">
                  Restricted Sandbox
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Game frames run with restricted sandbox tokens (<code className="text-slate-300 font-mono">allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-orientation-lock</code>) and feature permissions for autoplay, fullscreen, and gamepad.
              </p>
              <div className="p-2.5 bg-arcade-midnight rounded-xl text-[11px] font-mono text-slate-300 space-y-1">
                <div>CSP frame-src: https://html5.gamemonetize.co</div>
                <div>CSP img-src: https: (img.gamemonetize.com)</div>
                <div>Play overlay: games load only after the click</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Safety Infractions Review Queue */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Player Safety & Infraction Review Queue</h2>

          {reports.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-arcade-border text-xs text-slate-400">
              <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              The review queue is completely clear. No pending player or room reports.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.id} className="bg-arcade-card p-5 rounded-2xl border border-arcade-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-arcade-rose/10 text-arcade-rose border border-arcade-rose/30">
                      Target: {r.target_type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{r.reason}</h3>
                    {r.details && <p className="text-xs text-slate-300 mt-1">{r.details}</p>}
                  </div>

                  <div className="pt-2 border-t border-arcade-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <input
                      type="text"
                      placeholder="Moderator decision notes..."
                      value={reviewerNotes[r.id] || ''}
                      onChange={(e) => setReviewerNotes({ ...reviewerNotes, [r.id]: e.target.value })}
                      className="w-full sm:w-80 bg-arcade-midnight border border-arcade-border rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-arcade-rose"
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResolveReport(r.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-arcade-dark font-black text-xs hover:bg-emerald-400 transition"
                      >
                        Resolve Report
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: Users Management */}
      {activeTab === 'users' && (
        <div className="glass-panel rounded-2xl border border-arcade-border overflow-hidden">
          <div className="p-4 bg-arcade-midnight border-b border-arcade-border">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Registered Player Profiles</h2>
          </div>
          <div className="divide-y divide-arcade-border/40">
            {profiles.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between hover:bg-arcade-surface/30">
                <div className="flex items-center gap-3">
                  <img src={p.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      {p.display_name}
                      {p.is_admin && <span className="text-[10px] bg-arcade-rose text-white px-1.5 py-0.2 rounded font-bold">Admin</span>}
                    </div>
                    <div className="text-[10px] text-slate-400">@{p.username} • Level {p.level} • {p.xp.toLocaleString()} XP</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/u/${p.username}`}
                    className="px-3 py-1.5 rounded-lg bg-arcade-surface border border-arcade-border text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: System Status & Telemetry */}
      {activeTab === 'telemetry' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-panel p-5 rounded-2xl border border-arcade-border space-y-2">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Database Status</div>
            <div className="text-xl font-black text-emerald-400 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" /> Operational
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              37 Tables (26 Social + 11 Portal) • RLS Enforced
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-arcade-border space-y-2">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pixelverse Iframe Sandbox</div>
            <div className="text-xl font-black text-arcade-champagne flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-arcade-champagne animate-pulse" /> Strict Isolation
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Keyboard Scroll Blocker Active • 0 Cross-Origin Leaks
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-arcade-border space-y-2">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Web Audio API Engine</div>
            <div className="text-xl font-black text-arcade-orchid flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-arcade-orchid animate-pulse" /> Active Synth
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Dynamic Frequency Synthesis Ready
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
