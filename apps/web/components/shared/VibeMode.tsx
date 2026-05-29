'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Track {
  id: string;
  name: string;
  artist: string;
  youtubeId: string;
}

// ─── Lo-fi Playlist ────────────────────────────────────────────────────────────
const TRACKS: Track[] = [
  {
    id: '1',
    name: 'lo-fi hip hop radio',
    artist: 'Lofi Girl',
    youtubeId: 'jfKfPfyJRdk',
  },
  {
    id: '2',
    name: 'synthwave radio',
    artist: 'Lofi Girl',
    youtubeId: '4xDzrJKXOOY',
  },
  {
    id: '3',
    name: 'beats to code/relax to',
    artist: 'ChilledCow',
    youtubeId: 'lTRiuFIWV54',
  },
  {
    id: '4',
    name: 'chill study beats',
    artist: 'Ambient Mix',
    youtubeId: 'MVPTGNGiI-4',
  },
];

// ─── Waveform Visualizer ───────────────────────────────────────────────────────
function WaveformBars({ isPlaying }: { isPlaying: boolean }) {
  const bars = [3, 7, 5, 9, 6, 4, 8, 5, 7, 3, 6, 8, 4];
  return (
    <div className="vibe-waveform" aria-hidden="true" aria-label="Audio waveform">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="vibe-waveform__bar"
          style={{ height: `${height * 2}px` }}
          animate={
            isPlaying
              ? {
                  scaleY: [1, 1.8, 0.6, 1.4, 1, 1.6, 0.8, 1],
                  opacity: [0.6, 1, 0.7, 1, 0.8, 1, 0.7, 0.6],
                }
              : { scaleY: 1, opacity: 0.3 }
          }
          transition={
            isPlaying
              ? {
                  duration: 1.2 + i * 0.1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.08,
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function VibeMode() {
  const [isActive, setIsActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(40);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);

  const currentTrack = TRACKS[trackIndex];

  // Build YouTube embed URL with autoplay
  const youtubeUrl = `https://www.youtube.com/embed/${currentTrack.youtubeId}?enablejsapi=1&autoplay=${isPlaying ? 1 : 0}&controls=0&loop=1&playlist=${currentTrack.youtubeId}&mute=0`;

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleSkip = useCallback(() => {
    setTrackIndex((i) => (i + 1) % TRACKS.length);
    setIsPlaying(true);
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  }, []);

  const handleActivate = useCallback(() => {
    setIsActive(true);
    setIsPlaying(true);
  }, []);

  if (!isActive) {
    return (
      <motion.button
        className="vibe-activate-btn"
        onClick={handleActivate}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.4 }}
        aria-label="Activate Vibe Mode - Lo-fi music player"
        id="vibe-mode-activate"
      >
        <span className="vibe-activate-icon">🎵</span>
        <span className="vibe-activate-label">Vibe Mode</span>
      </motion.button>
    );
  }

  return (
    <>
      {/* Hidden YouTube iframe */}
      <iframe
        ref={iframeRef}
        src={youtubeUrl}
        className="vibe-iframe"
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="Lo-fi music player"
        aria-hidden="true"
      />

      {/* Player UI */}
      <motion.div
        className="vibe-player"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        role="region"
        aria-label="Vibe Mode music player"
        id="vibe-mode-player"
      >
        {/* Glow backdrop */}
        <div className="vibe-player__glow" aria-hidden="true" />

        {/* Track info */}
        <div className="vibe-track-info">
          <div className="vibe-track-art" aria-hidden="true">
            <motion.span
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block' }}
            >
              🎵
            </motion.span>
          </div>
          <div className="vibe-track-meta">
            <div className="vibe-track-name">{currentTrack.name}</div>
            <div className="vibe-track-artist">{currentTrack.artist}</div>
          </div>
        </div>

        {/* Waveform */}
        <WaveformBars isPlaying={isPlaying} />

        {/* Controls */}
        <div className="vibe-controls">
          <motion.button
            className={`vibe-btn vibe-btn--play ${isPlaying ? 'vibe-btn--active' : ''}`}
            onClick={handlePlayPause}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
            id="vibe-play-pause"
          >
            {isPlaying ? '⏸' : '▶'}
          </motion.button>

          <motion.button
            className="vibe-btn"
            onClick={handleSkip}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Skip to next track"
            id="vibe-skip"
          >
            ⏭
          </motion.button>

          <motion.button
            className="vibe-btn vibe-btn--close"
            onClick={() => { setIsActive(false); setIsPlaying(false); }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Close Vibe Mode"
            id="vibe-close"
          >
            ✕
          </motion.button>
        </div>

        {/* Volume */}
        <div className="vibe-volume">
          <span className="vibe-volume__icon" aria-hidden="true">
            {volume === 0 ? '🔇' : volume < 40 ? '🔈' : volume < 70 ? '🔉' : '🔊'}
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={handleVolumeChange}
            className="vibe-volume__slider"
            aria-label="Volume"
            id="vibe-volume-slider"
          />
          <span className="vibe-volume__value">{volume}%</span>
        </div>
      </motion.div>

      <style jsx>{`
        /* Hidden iframe */
        .vibe-iframe {
          position: fixed;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
          bottom: 0;
          left: 0;
          z-index: -1;
        }

        /* Activate button */
        .vibe-activate-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 900;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(20, 20, 40, 0.9);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 50px;
          color: rgba(255,255,255,0.8);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
          transition: box-shadow 0.2s;
        }
        .vibe-activate-btn:hover {
          box-shadow: 0 4px 30px rgba(99, 102, 241, 0.3);
        }
        .vibe-activate-icon {
          font-size: 16px;
        }

        /* Player */
        .vibe-player {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 900;
          width: 280px;
          padding: 16px;
          background: rgba(8, 10, 22, 0.95);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .vibe-player__glow {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Track info */
        .vibe-track-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .vibe-track-art {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .vibe-track-meta {
          flex: 1;
          overflow: hidden;
        }
        .vibe-track-name {
          font-size: 12.5px;
          font-weight: 700;
          color: #e2e8f0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .vibe-track-artist {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          margin-top: 2px;
        }

        /* Waveform */
        .vibe-waveform {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          height: 24px;
        }
        .vibe-waveform__bar {
          width: 3px;
          background: linear-gradient(to top, #6366f1, #a78bfa);
          border-radius: 2px;
          transform-origin: bottom;
        }

        /* Controls */
        .vibe-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .vibe-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.8);
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .vibe-btn:hover {
          background: rgba(255,255,255,0.12);
        }
        .vibe-btn--play {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-color: transparent;
          font-size: 16px;
          color: #fff;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
        }
        .vibe-btn--active {
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.6);
        }
        .vibe-btn--close {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
        }

        /* Volume */
        .vibe-volume {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .vibe-volume__icon {
          font-size: 14px;
          flex-shrink: 0;
        }
        .vibe-volume__slider {
          flex: 1;
          -webkit-appearance: none;
          height: 3px;
          border-radius: 2px;
          background: rgba(255,255,255,0.15);
          outline: none;
          cursor: pointer;
        }
        .vibe-volume__slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #6366f1;
          box-shadow: 0 0 6px rgba(99,102,241,0.6);
          cursor: pointer;
        }
        .vibe-volume__value {
          font-size: 10px;
          color: rgba(255,255,255,0.35);
          min-width: 28px;
          text-align: right;
        }
      `}</style>
    </>
  );
}
