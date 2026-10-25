'use client';

import React, { useRef, useState } from 'react';
import { Camera, Shuffle, Upload, X } from 'lucide-react';
import { DEFAULT_AVATAR, validateImageFile } from '@/lib/avatar';

interface Props {
  /** what is shown right now: a blob/object URL, a stored URL or a generated avatar */
  preview: string;
  seed: string;
  onFile: (file: File, previewUrl: string) => void;
  onGenerated: (url: string) => void;
  onError?: (msg: string) => void;
  size?: number;
}

export function AvatarPicker({ preview, seed, onFile, onGenerated, onError, size = 112 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const pick = (file?: File | null) => {
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) { onError?.(problem); return; }
    onFile(file, URL.createObjectURL(file));
  };

  const shuffle = () => onGenerated(DEFAULT_AVATAR(`${seed || 'player'}-${Math.random().toString(36).slice(2, 8)}`));

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files?.[0]); }}
        className={`relative group rounded-3xl p-1 transition-all duration-300 ${
          dragging ? 'bg-arcade-champagne scale-105 shadow-champagne-glow' : 'bg-gradient-to-br from-arcade-champagne via-arcade-orchid to-arcade-rose'
        }`}
        style={{ width: size, height: size }}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative w-full h-full rounded-[20px] overflow-hidden bg-arcade-midnight block"
          aria-label="Upload profile picture"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview || DEFAULT_AVATAR(seed)} alt="Your profile picture" className="w-full h-full object-cover" />
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity text-white text-[10px] font-bold">
            <Camera className="w-5 h-5" /> Change
          </span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }}
      />

      <div className="flex items-center gap-2 text-[11px] font-bold">
        <button type="button" onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-arcade-surface border border-arcade-border text-slate-200 hover:border-arcade-champagne hover:text-arcade-champagne transition-colors">
          <Upload className="w-3 h-3" /> Upload photo
        </button>
        <button type="button" onClick={shuffle}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-arcade-surface border border-arcade-border text-slate-200 hover:border-arcade-orchid hover:text-arcade-orchid transition-colors">
          <Shuffle className="w-3 h-3" /> Random
        </button>
      </div>
      <p className="text-[10px] text-slate-500 text-center">PNG, JPG, WEBP or GIF. Drag a picture onto the frame. It is auto-cropped to a square.</p>
    </div>
  );
}
