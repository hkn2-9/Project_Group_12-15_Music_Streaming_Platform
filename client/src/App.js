// client/src/App.js  (complete file, replaces your current App.js)

import { useEffect, useState } from "react";
import axios from "axios";
import Player from "./Player";
import Sidebar from "./Sidebar";
import "./App.css";

const API = "http://localhost:8000";
const MAX_RECENT = 20;

// Like useState, but remembered in this browser between visits.
function useStoredState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch (err) {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      /* storage unavailable: the list just won't be remembered */
    }
  }, [key, value]);

  return [value, setValue];
}

function App() {
  const [tracks, setTracks] = useState([]);
  const [library, setLibrary] = useStoredState("choppedify.library", []); // track ids
  const [recent, setRecent] = useStoredState("choppedify.recent", []); // track ids, newest first
  // Each playlist: { id, name, trackIds: [] }
  const [playlists, setPlaylists] = useStoredState("choppedify.playlists", []);
  const [openPlaylistId, setOpenPlaylistId] = useState(null); // null = show all songs
  const [playRequest, setPlayRequest] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/api/tracks`, { withCredentials: true })
      .then((res) => setTracks(res.data))
      .catch((err) => console.error("Could not load tracks:", err));
  }, []);

  const toggleLibrary = (track) =>
    setLibrary((prev) =>
      prev.includes(track.id) ? prev.filter((id) => id !== track.id) : [track.id, ...prev]
    );

  const handlePlayed = (track) =>
    setRecent((prev) => [track.id, ...prev.filter((id) => id !== track.id)].slice(0, MAX_RECENT));

  // Clicking a song in the sidebar asks the player to play it.
  const handleSelect = (track) => setPlayRequest({ track, at: Date.now() });

  // ---- Playlists ----
  const createPlaylist = (name, firstTrack) => {
    const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const clean = name.trim().slice(0, 60) || "Untitled playlist";
    setPlaylists((prev) => [
      ...prev,
      { id, name: clean, trackIds: firstTrack ? [firstTrack.id] : [] },
    ]);
    return id;
  };

  const togglePlaylistTrack = (playlistId, track) =>
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id !== playlistId
          ? p
          : {
              ...p,
              trackIds: p.trackIds.includes(track.id)
                ? p.trackIds.filter((id) => id !== track.id)
                : [...p.trackIds, track.id],
            }
      )
    );

  const deletePlaylist = (id) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
    if (openPlaylistId === id) setOpenPlaylistId(null);
  };

  // Creating from the sidebar also opens the new playlist.
  const createAndOpenPlaylist = (name) => setOpenPlaylistId(createPlaylist(name));

  // The songs shown in the main list: everything, or just the open playlist (in its own order).
  const byId = new Map(tracks.map((t) => [t.id, t]));
  const openPlaylist = playlists.find((p) => p.id === openPlaylistId) || null;
  const visibleTracks = openPlaylist
    ? openPlaylist.trackIds.map((id) => byId.get(id)).filter(Boolean)
    : tracks;

  return (
    <div className="app-layout">
      <Sidebar
        tracks={tracks}
        library={library}
        recent={recent}
        playlists={playlists}
        openPlaylistId={openPlaylist ? openPlaylist.id : null}
        currentId={recent[0]}
        onSelect={handleSelect}
        onToggleLibrary={toggleLibrary}
        onClearRecent={() => setRecent([])}
        onOpenPlaylist={setOpenPlaylistId}
        onCreatePlaylist={createAndOpenPlaylist}
        onDeletePlaylist={deletePlaylist}
      />
      <main className="main-content">
        <Player
          tracks={visibleTracks}
          library={library}
          playlists={playlists}
          playRequest={playRequest}
          listTitle={openPlaylist ? openPlaylist.name : "All songs"}
          isPlaylist={Boolean(openPlaylist)}
          onBack={() => setOpenPlaylistId(null)}
          onPlayed={handlePlayed}
          onToggleLibrary={toggleLibrary}
          onTogglePlaylist={togglePlaylistTrack}
          onCreatePlaylist={createPlaylist}
        />
      </main>
    </div>
  );
}

export default App;