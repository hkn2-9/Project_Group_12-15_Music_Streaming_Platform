// client/src/Player.jsx  (complete file, replaces your current Player.jsx)
// Plays audio files from the server. The song list, library, and playlists come from App.js.

import { useEffect, useRef, useState } from "react";
import Reviews from "./Reviews";
import AddToPlaylist from "./AddToPlaylist";

const API = "http://localhost:8000";

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function Player({
  tracks,
  library,
  playlists,
  playRequest,
  listTitle,
  isPlaylist,
  onBack,
  onPlayed,
  onToggleLibrary,
  onTogglePlaylist,
  onCreatePlaylist,
}) {
  const [current, setCurrent] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const playTrack = async (track) => {
    const audio = audioRef.current;
    setCurrent(track);
    onPlayed(track); // adds it to "Recently played"
    audio.src = `${API}/audio/${encodeURIComponent(track.filename)}`;
    audio.load();
    try {
      await audio.play();
    } catch (err) {
      console.error("Playback failed:", err);
    }
  };

  // The sidebar asked for a song to be played.
  useEffect(() => {
    if (playRequest) playTrack(playRequest.track);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playRequest]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!current) return;
    if (audio.paused) audio.play();
    else audio.pause();
  };

  // Next/previous move through the list on screen (all songs, or the open playlist).
  const currentIndex = tracks.findIndex((t) => t.id === current?.id);

  const playNext = () => {
    if (tracks.length === 0) return;
    const next = currentIndex === -1 ? 0 : (currentIndex + 1) % tracks.length;
    playTrack(tracks[next]);
  };

  const playPrev = () => {
    if (tracks.length === 0) return;
    // If the song is more than 3 seconds in, restart it instead of going back
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const prev = currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1;
    playTrack(tracks[prev]);
  };

  const seek = (e) => {
    audioRef.current.currentTime = Number(e.target.value);
  };

  const isSaved = (track) => library.includes(track.id);

  const addMenu = (track) => (
    <AddToPlaylist
      track={track}
      playlists={playlists}
      onToggle={onTogglePlaylist}
      onCreate={onCreatePlaylist}
    />
  );

  return (
    <div className="player">
      <div className="list-head">
        <h2 className="list-title">{listTitle}</h2>
        <div className="list-actions">
          {isPlaylist && (
            <button className="list-back" onClick={onBack}>
              ← All songs
            </button>
          )}
          {isPlaylist && tracks.length > 0 && (
            <button className="list-play" onClick={() => playTrack(tracks[0])}>
              Play
            </button>
          )}
        </div>
      </div>

      {tracks.length === 0 && (
        <p className="list-empty">
          {isPlaylist
            ? "This playlist is empty. Go to All songs and use the + on a song to add it."
            : "No songs yet."}
        </p>
      )}

      <ul className="track-list">
        {tracks.map((t) => (
          <li
            key={t.id}
            className={`track ${current?.id === t.id ? "active" : ""}`}
            onClick={() => playTrack(t)}
          >
            <span>
              {t.title} - {t.artist}
            </span>
            {addMenu(t)}
            <button
              className={`heart-btn${isSaved(t) ? " saved" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleLibrary(t);
              }}
              aria-label={isSaved(t) ? "Remove from library" : "Save to library"}
            >
              {isSaved(t) ? "♥" : "♡"}
            </button>
          </li>
        ))}
      </ul>

      <div className="controls">
        <div className="control-buttons">
          <button
            className="skip-btn"
            onClick={playPrev}
            disabled={!current}
            aria-label="Previous"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <rect x="5" y="5" width="3" height="14" rx="1" />
              <path d="M19 5v14L9 12z" />
            </svg>
          </button>

          <button
            className="play-btn"
            onClick={togglePlay}
            disabled={!current}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            className="skip-btn"
            onClick={playNext}
            disabled={!current}
            aria-label="Next"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M5 5v14l10-7z" />
              <rect x="16" y="5" width="3" height="14" rx="1" />
            </svg>
          </button>
        </div>

        <div className="now-playing">
          <div className="now-head">
            <div className="now-title">{current ? current.title : "Nothing playing"}</div>
            {current && addMenu(current)}
            {current && (
              <button
                className={`heart-btn${isSaved(current) ? " saved" : ""}`}
                onClick={() => onToggleLibrary(current)}
                aria-label={isSaved(current) ? "Remove from library" : "Save to library"}
              >
                {isSaved(current) ? "♥" : "♡"}
              </button>
            )}
          </div>
          <div className="seek-row">
            <span>{formatTime(progress)}</span>
            <input
              type="range"
              className="seek-bar"
              min="0"
              max={duration || 0}
              step="0.1"
              value={progress}
              onChange={seek}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {current && <Reviews track={current} />}

      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setProgress(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={playNext}
      />
    </div>
  );
}

export default Player;