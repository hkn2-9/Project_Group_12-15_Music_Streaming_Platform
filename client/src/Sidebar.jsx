// client/src/Sidebar.jsx  (complete file, replaces your current Sidebar.jsx)

import { useState } from "react";

function SongList({ items, currentId, onSelect, onRemove }) {
  return (
    <ul className="sidebar-list">
      {items.map((t) => (
        <li key={t.id} className={`sidebar-item${t.id === currentId ? " active" : ""}`}>
          <button className="sidebar-play" onClick={() => onSelect(t)}>
            <span className="sidebar-title">{t.title}</span>
            <span className="sidebar-artist">{t.artist}</span>
          </button>
          {onRemove && (
            <button
              className="sidebar-remove"
              onClick={() => onRemove(t)}
              aria-label={`Remove ${t.title} from library`}
            >
              ✕
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function Sidebar({
  tracks,
  library,
  recent,
  playlists,
  openPlaylistId,
  currentId,
  onSelect,
  onToggleLibrary,
  onClearRecent,
  onOpenPlaylist,
  onCreatePlaylist,
  onDeletePlaylist,
}) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const byId = new Map(tracks.map((t) => [t.id, t]));
  const libraryTracks = library.map((id) => byId.get(id)).filter(Boolean);
  const recentTracks = recent.map((id) => byId.get(id)).filter(Boolean);

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreatePlaylist(name);
    setName("");
    setCreating(false);
  };

  return (
    <aside className="sidebar">
      <h1 className="title">Choppedify</h1>

      <section className="sidebar-section">
        <h2 className="sidebar-heading">
          <span>Playlists</span>
          <button className="sidebar-clear" onClick={() => setCreating((c) => !c)}>
            {creating ? "Cancel" : "New"}
          </button>
        </h2>

        {creating && (
          <form className="playlist-new" onSubmit={submit}>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Playlist name"
              maxLength={60}
              aria-label="Playlist name"
            />
            <button type="submit">Create</button>
          </form>
        )}

        <ul className="sidebar-list">
          <li className={`sidebar-item${openPlaylistId === null ? " active" : ""}`}>
            <button className="sidebar-play" onClick={() => onOpenPlaylist(null)}>
              <span className="sidebar-title">All songs</span>
            </button>
          </li>
          {playlists.map((p) => {
            const count = p.trackIds.filter((id) => byId.has(id)).length;
            return (
              <li
                key={p.id}
                className={`sidebar-item${openPlaylistId === p.id ? " active" : ""}`}
              >
                <button className="sidebar-play" onClick={() => onOpenPlaylist(p.id)}>
                  <span className="sidebar-title">{p.name}</span>
                  <span className="sidebar-artist">
                    {count} {count === 1 ? "song" : "songs"}
                  </span>
                </button>
                <button
                  className="sidebar-remove"
                  onClick={() => {
                    if (window.confirm(`Delete the playlist "${p.name}"?`)) onDeletePlaylist(p.id);
                  }}
                  aria-label={`Delete playlist ${p.name}`}
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="sidebar-section">
        <h2 className="sidebar-heading">Your library</h2>
        {libraryTracks.length === 0 ? (
          <p className="sidebar-empty">Tap the heart on a song to save it here.</p>
        ) : (
          <SongList
            items={libraryTracks}
            currentId={currentId}
            onSelect={onSelect}
            onRemove={onToggleLibrary}
          />
        )}
      </section>

      <section className="sidebar-section">
        <h2 className="sidebar-heading">
          <span>Recently played</span>
          {recentTracks.length > 0 && (
            <button className="sidebar-clear" onClick={onClearRecent}>
              Clear
            </button>
          )}
        </h2>
        {recentTracks.length === 0 ? (
          <p className="sidebar-empty">Songs you play will show up here.</p>
        ) : (
          <SongList items={recentTracks} currentId={currentId} onSelect={onSelect} />
        )}
      </section>
    </aside>
  );
}

export default Sidebar;