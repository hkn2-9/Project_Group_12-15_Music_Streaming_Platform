// client/src/AddToPlaylist.jsx  (new file)
// A "+" button that opens a small menu for adding a song to (or removing it from) playlists.

import { useEffect, useRef, useState } from "react";

function AddToPlaylist({ track, playlists, onToggle, onCreate }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const rootRef = useRef(null);

  // Close the menu when clicking elsewhere or pressing Escape.
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name, track);
    setName("");
  };

  return (
    // stopPropagation keeps clicks here from also playing the song row underneath
    <div className="playlist-add" ref={rootRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="heart-btn plus-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Add to playlist"
        aria-expanded={open}
      >
        +
      </button>

      {open && (
        <div className="playlist-menu" role="menu">
          <p className="playlist-menu-title">Add to playlist</p>
          {playlists.length === 0 && <p className="playlist-menu-empty">No playlists yet.</p>}
          <ul>
            {playlists.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="playlist-menu-item"
                  onClick={() => onToggle(p.id, track)}
                >
                  <span className="playlist-check">{p.trackIds.includes(track.id) ? "✓" : ""}</span>
                  <span>{p.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <form className="playlist-menu-new" onSubmit={submit}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New playlist"
              maxLength={60}
              aria-label="New playlist name"
            />
            <button type="submit">Add</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AddToPlaylist;