// client/src/SpotifyPlayer.js
// Plays one Spotify track in the browser with the Web Playback SDK.
// Usage: <SpotifyPlayer spotifyId={track.spotify_id} />

import { useEffect, useRef, useState } from "react";
import axios from "axios";

const SERVER = "http://localhost:8000";

async function getToken() {
  const res = await axios.get(`${SERVER}/api/spotify/token`, { withCredentials: true });
  return res.data.accessToken;
}

export default function SpotifyPlayer({ spotifyId }) {
  // loading | login | ready | premium | error
  const [status, setStatus] = useState("loading");
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef(null);
  const deviceRef = useRef(null);
  const loadedIdRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    function startPlayer() {
      if (cancelled) return;
      const player = new window.Spotify.Player({
        name: "Choppedify",
        getOAuthToken: (cb) => getToken().then(cb),
        volume: 0.7,
      });

      player.addListener("ready", ({ device_id }) => {
        deviceRef.current = device_id;
        setStatus("ready");
      });
      player.addListener("not_ready", () => setStatus("loading"));
      player.addListener("player_state_changed", (state) => {
        if (state) setPlaying(!state.paused);
      });
      player.addListener("account_error", () => setStatus("premium"));
      ["initialization_error", "authentication_error", "playback_error"].forEach((evt) =>
        player.addListener(evt, ({ message }) => {
          console.error(evt, message);
          setStatus("error");
        })
      );

      player.connect();
      playerRef.current = player;
    }

    // Only load the SDK if the user is already logged in to Spotify.
    getToken()
      .then(() => {
        if (cancelled) return;
        if (window.Spotify) {
          startPlayer();
        } else {
          window.onSpotifyWebPlaybackSDKReady = startPlayer;
          if (!document.getElementById("spotify-sdk")) {
            const script = document.createElement("script");
            script.id = "spotify-sdk";
            script.src = "https://sdk.scdn.co/spotify-player.js";
            document.body.appendChild(script);
          }
        }
      })
      .catch(() => !cancelled && setStatus("login"));

    return () => {
      cancelled = true;
      if (playerRef.current) playerRef.current.disconnect();
      playerRef.current = null;
    };
  }, []);

  async function handlePlay() {
    const player = playerRef.current;
    if (!player) return;
    player.activateElement(); // lets browsers allow audio after a click

    // Same track already loaded: just toggle pause/resume.
    if (loadedIdRef.current === spotifyId) {
      player.togglePlay();
      return;
    }

    try {
      const token = await getToken();
      const res = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceRef.current}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: [`spotify:track:${spotifyId}`] }),
        }
      );
      if (!res.ok) throw new Error(`Play request failed (${res.status})`);
      loadedIdRef.current = spotifyId;
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  if (!spotifyId) return <p>No Spotify link for this track yet.</p>;
  if (status === "loading") return <p>Connecting to Spotify…</p>;
  if (status === "login")
    return <a href={`${SERVER}/auth/login`}>Log in with Spotify to play</a>;
  if (status === "premium")
    return <p>Playing music here needs a Spotify Premium account.</p>;
  if (status === "error")
    return <p>Spotify playback failed. Check the console, then refresh the page.</p>;

  return (
    <button onClick={handlePlay}>
      {playing && loadedIdRef.current === spotifyId ? "Pause" : "Play"}
    </button>
  );
}
