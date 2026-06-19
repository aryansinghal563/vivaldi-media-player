/*
 * Vivaldi Mini Media Dock - Complete v15.3
 *
 * v15.3 — darker fluid + artwork-themed controls:
 *   - LUT pushed darker again (deep tones ~85% of range, dimmer highs);
 *     target mean luminance ~45-55.
 *   - New --dock-vivid: a saturation-boosted color derived from the artwork
 *     primary (accent fallback). The seek bar fill (now a soft glowing
 *     gradient), volume fill + thumb, and media-count badge all ride it —
 *     the controls visibly belong to the album art.
 *   - Readability over the moving fluid: title/subtitle/time get a soft
 *     text shadow, the seek/volume tracks are slightly stronger, and the
 *     bar fill carries a faint glow so it reads on dark smoke.
 *
 * v15.2 — musical intelligence + darker tone:
 *   - BEAT DETECTION: real onset detection on the bass band (energy vs a
 *     rolling 3s average, rising-edge gated). Each detected kick fires a
 *     decaying KICK PULSE in the UI that surges the turbulence clock and
 *     deepens the warp for ~150ms — the smoke visibly lurches ON the beat
 *     instead of merely following loudness.
 *   - VOCAL TRACKING ("reacts to lyrics"): a dedicated voice band
 *     (~370Hz-3.5kHz, where vocals live) with its own auto-gain follows the
 *     singer's syllables; vocal presence blooms the bright wisps (the top
 *     of the palette expands while someone sings, recedes in instrumental
 *     passages). Sample rate default raised to 20Hz for onset timing.
 *   - DARKER still: deep tones now own ~80% of the LUT; mean luminance
 *     targeted near ~55-65.
 *
 * v15.1 — tone + performance:
 *   - DARKER: the palette LUT now keeps ~3/4 of its range in deep
 *     background/artwork tones; bright foreground wisps only appear in the
 *     top ~10% of the field, so they read as accents drifting through dark
 *     smoke instead of a washed-out bright field. Contrast/lift reduced.
 *   - SMOOTHER: paint capped at 30fps (turbulence through smooth upscaling
 *     is visually identical, cost halves), with adaptive degrade to 20fps
 *     if a frame ever costs >6ms on slow hardware; the per-pixel treble
 *     shimmer term (the most expensive noise call) is replaced by treble
 *     feeding the warp depth. Turbulence clocks stay time-based, so capped
 *     painting changes nothing about motion speed.
 *
 * v15 — REAL FLUID (canvas turbulence renderer):
 *   - The honest fix: CSS gradient layers can never look like the ChatGPT
 *     voice orb — that look is RENDERED TURBULENCE. v15 replaces the blob
 *     compositing with a true per-pixel fluid field: 3-octave value-noise
 *     FBM, domain-warped by two more FBM fields (the classic
 *     fbm(p + fbm(p + t)) smoke/watercolor technique), drawn to a small
 *     canvas (96x36) inside the card and upscaled smoothly by CSS.
 *   - Audio drives the PHYSICS: bass advances the primary warp time, mids
 *     the secondary, the loudness envelope deepens the warp and contrast
 *     (calm = lazy haze, loud = roiling smoke), treble adds fine shimmer.
 *   - Colors come from the artwork palette through a 256-entry LUT:
 *     deep background -> artwork colors -> bright foreground wisps (the
 *     white cloud cores in the reference).
 *   - The canvas fades in over the idle gradient while live and fades out
 *     on pause; idle look unchanged. Still card-only, still ~3-4ms/frame
 *     at 96x36, running only while music plays.
 *
 * v14.4 — "weird static blob" fixes:
 *   - ROOT CAUSE of "not reacting": an AudioContext created in a page the
 *     user never directly clicked (video started from the dock, autoplay,
 *     or a queue) has no user activation and stays SUSPENDED — delivering
 *     all-zero analysis forever. The analyser now (a) retries resume() on
 *     every sample while suspended, (b) hooks a one-shot pointer/key
 *     listener to resume on the user's next interaction with the page, and
 *     (c) watches for a sustained all-zero streak while audibly playing
 *     and does a full re-capture (fresh captureStream + source), which
 *     also heals the Chromium quirk where a captured stream goes silent
 *     after the site reconfigures its media source.
 *   - The bright cores are softened from "spotlight" to "wisp": lower
 *     foreground mix, gentler falloff, slightly larger so they read as
 *     cloud structure rather than a weird dot.
 *   - Idle flow speed raised so the clouds visibly drift even before the
 *     first packet arrives.
 *
 * v14.3 — CLOUD STRUCTURE (movement you can actually see):
 *   - The live gradient is rebuilt as a SIX-layer cloud system, modeled on
 *     the ChatGPT voice orb: two small bright cores (artwork color mixed
 *     toward the foreground — the white wisps), two medium puffs, and two
 *     large washes, each a no-repeat radial smaller than the card so its
 *     TRAVEL is visible. The old design's blobs were 185-210% washes —
 *     bigger than the viewport, so their motion read as nothing.
 *   - All six layers flow independently on their own orbits at their own
 *     band-driven speeds (small cores ride the treble fast, washes ride
 *     the level slowly) — overlapping motions = the turbulent fluid look.
 *   - Idle (not playing) look is completely unchanged.
 *
 * v14.2 — FLUID FLOW (no more blinking):
 *   - Complete redesign of the audio->visual mapping, inspired by the
 *     ChatGPT voice orb: audio modulates the VELOCITY OF MOTION, not the
 *     appearance. Each gradient blob travels a smooth Lissajous-like orbit
 *     (two incommensurate sinusoids per axis = organic, never-repeating
 *     paths); bass/mid/treble drive how fast each blob flows, and a slowly
 *     smoothed loudness envelope drives how WIDE they roam. Position is the
 *     integral of energy — sharp beats become smooth surges of movement.
 *   - Brightness/saturation/size now follow only the slow envelope with
 *     small amplitudes (gentle breathing); the per-beat property flashing
 *     that read as "blinking" is gone entirely. No transform pumping.
 *   - While the visualizer is live the card carries a .viz-live class whose
 *     CSS takes over background-position from the idle drift keyframes; on
 *     pause/stop the class drops and the calm CSS drift resumes. In quiet
 *     passages the flow continues at a gentle idle speed — it never freezes.
 *
 * v14.1 — VISIBILITY: the gradient now actually, obviously dances.
 *   - Per-band AUTO-GAIN on the page side: each band normalizes into its own
 *     adaptive floor/ceiling, so the full 0..1 swing is used for any
 *     material (raw band energy barely varies beat-to-beat — the swing, not
 *     the level, is what the eye reads as motion).
 *   - Much stronger CSS mapping, still gradient-only: the ::before layer
 *     physically pumps via transform (bass scales it ~17% and lifts it,
 *     treble nudges it sideways, mids tilt it), brightness rides the level,
 *     saturation rides the mids. inset -34% + card overflow clipping mean
 *     no edges are ever revealed.
 *   - Snappier analyser smoothing (.45) and UI attack/release (.5/.16) so
 *     individual beats stay distinct.
 *
 * v14 — AUDIO VISUALIZER: the card's gradient dances with the music.
 *   - STRICTLY SCOPED to the dock card's background gradient. No other
 *     element — in the dock or in the browser chrome — reacts.
 *   - A MAIN-world analyser taps the playing media via captureStream() ->
 *     AnalyserNode (passive copy — playback can NEVER be muted or rerouted,
 *     unlike createMediaElementSource) and streams compact band energies
 *     (bass/mid/treble/level, four floats, ~15Hz) over the existing bridge.
 *   - The UI smooths them at 60fps (rAF lerp) into CSS variables consumed
 *     ONLY by the card's ::before gradient: bass swells the radial blobs,
 *     mids saturate the colors, treble stirs the third layer, overall level
 *     lifts the gradient's presence. Silence decays gracefully back to the
 *     calm drift animation.
 *   - Analysis runs ONLY for the tab shown in the dock, only while playing,
 *     and stops on pause/close/dismiss. DRM or capture-restricted media
 *     degrades silently to the normal static gradient.
 *   - Settings: visualizer on/off, intensity, sample rate, and it respects
 *     prefers-reduced-motion by default.
 *
 * v13.1 — touchpad fixes:
 *   - Wheel events are normalized (deltaMode) and ACCUMULATED. A touchpad
 *     swipe fires dozens of tiny events plus an inertia tail; treating each
 *     one as a "notch" made artwork cycling machine-gun through media and
 *     volume jump erratically. Artwork cycling now requires a distance
 *     threshold + cooldown (inertia during cooldown is discarded); volume
 *     scales smoothly with scroll distance instead of per-event.
 *   - Echo suppression for volume and seek. Dock-initiated changes are
 *     applied optimistically and the page's own state reports are ignored
 *     for that property until the page catches up (or a short timeout).
 *     Previously a STALE report from the page (carrying the pre-change
 *     value) would arrive a moment later and yank the slider/seekbar back,
 *     then the fresh report would move it again — the "goes back to what it
 *     was, then changes a bit later" jitter.
 *
 * Compact by default, expands on hover.
 * - Default: artwork + title + subtitle only
 * - Hover: reveals controls + progress + time
 * - Keeps hybrid placement, theme-accent-dominant color, subtle artwork tint, no blur
 *
 * New in v13:
 *   - SETTINGS block at the top: tweak behavior without touching logic
 *   - Site-aware volume/mute: on YouTube / YouTube Music the dock drives the
 *     page player's own API (#movie_player.setVolume/mute/unMute) so the site
 *     UI stays in sync — no more "YouTube still shows 100% and snaps back"
 *   - Scroll gestures: wheel over artwork cycles media; wheel anywhere else on
 *     the card adjusts volume; middle-click toggles play/pause
 *   - Drag-to-seek with a hover time preview tooltip on the progress bar
 *   - Click the time label to toggle remaining-time display
 *   - Playback rate shown in the subtitle when not 1x (e.g. "Artist · 1.5x")
 *   - Pages now report their own favicon (link[rel=icon]) — no dependency on
 *     the deprecated chrome://favicon/ endpoint; fallback chain is
 *     artwork -> page favicon -> chrome://favicon -> generic icon
 *   - Visible card outline fixed: border opacity lowered (configurable, set
 *     0 to remove entirely) and the inset top highlight removed by default
 *   - Idle-friendly: 1.2s heartbeat replaced by a 5s one that does nothing
 *     while no media exists; theme changes detected via MutationObserver on
 *     #browser instead of polling; progress tick only runs while playing
 *   - Paused items auto-expire after SETTINGS.staleMinutes (default 30)
 *   - Optional window-scoped mode (windowScopedMedia) to only show media
 *     belonging to the current window
 *   - Web-panel activation refactored into small versioned helpers
 *   - Removed HTMLMediaElement.addEventListener prototype patches (the
 *     MutationObserver scan + play() hook already discover every element;
 *     less page fingerprint, less risk of breaking listener-wrapping sites)
 *
 * Fixes carried from v12.1 (close-button resurrection, volume flyout retract,
 * timeupdate throttle, LRU color cache, sanitized image sources, postMessage
 * source checks, clean bridge port closure, immediate video detection, live
 * stream seek, swallowed async rejections) all remain in place.
 *
 * Fixes applied over original v12:
 *   1. Click-to-seek on progress bar (was read-only; also was crashing silently due to U.clamp in MAIN world)
 *   2. COLLAPSE_DELAY_MS 180 -> 300 (prevents accidental collapse while clicking buttons)
 *   3. Bridge `done` listener now clears via timeout to prevent leak on tab nav/close
 *   4. injectMain handles `seek` action with inline Math.max/min (U is not available in MAIN world)
 *   5. Art img onerror fallback to favicon
 *   6. Compact spacing fix: controls+progressWrap wrapped in single panel div, row-gap removed,
 *      so collapsed state adds truly zero height (old 3-row grid left 2 phantom row-gaps)
 *
 * Fixes applied in v12.1:
 *   7.  Close button no longer "resurrects" the item (pause event after dismiss was
 *       re-emitting media info; dismissed elements are now flagged and suppressed,
 *       and the flag clears automatically if the user resumes playback on the page)
 *   8.  Volume slider now retracts on mouse-leave (hideVolSlider/cancelVolHide were
 *       defined but never wired up); hide is deferred while dragging
 *   9.  timeupdate emissions throttled to ~1/sec per element (was ~4/sec, each one
 *       triggering tabs.get + full re-render in every Vivaldi window)
 *   10. Artwork color cache capped (LRU, 40 entries) - no more unbounded growth
 *   11. Two-stage artwork fallback: artwork -> favicon -> generic icon (broken
 *       favicon no longer leaves an empty image)
 *   12. Image sources from pages sanitized to http(s)/data/blob/chrome before being
 *       assigned in the privileged UI document; volume clamped to [0,1]
 *   13. postMessage listeners verify event.source === window (page bridge hardening)
 *   14. Bridge timeout now closes the message port cleanly (sendResponse on timeout;
 *       no more "message port closed" console warnings on tab navigation mid-action)
 *   15. isVideo() recognizes videos immediately via videoWidth (PiP button no longer
 *       flickers in as "audio" during the first moments of playback)
 *   16. seek clamps safely when duration is NaN/Infinity (live streams)
 *   17. chrome.tabs.sendMessage / scripting.executeScript / tabs.update rejections
 *       swallowed properly (no unhandled-rejection console noise on chrome:// tabs)
 *
 * Install in window.html:
 *   <script src="vivaldi-mini-media-dock-v12.js"></script>
 */
(() => {
  "use strict";

  if (window.__vivaldiMiniMediaDockV12Loaded) return;
  window.__vivaldiMiniMediaDockV12Loaded = true;

  const MOD_ID = "vivaldi-mini-media-dock-v12";
  const MESSAGE_TYPE = "vivaldi-mini-media-dock-v12";
  const NAME_ATTR = "data-vivaldi-mini-media-dock-v12";

  // ═══════════════════════════════════════════════════════════════════════
  //  SETTINGS — tweak behavior here, no need to touch the logic below
  // ═══════════════════════════════════════════════════════════════════════
  const SETTINGS = {
    expandOn: "hover", // "hover" | "click" — how the compact card expands
    expandDelayMs: 200, // hover dwell before expanding
    collapseDelayMs: 300, // grace period before collapsing on mouse-leave
    scrollGestures: true, // wheel over artwork = cycle media; over card = volume
    volumeWheelStep: 0.05, // volume change per "notch" of scrolling
    volumeWheelPixels: 40, // scroll distance (px) that equals one notch
    cycleWheelPixels: 80, // scroll distance required to cycle artwork once
    cycleCooldownMs: 350, // min time between cycles; inertia in between is discarded
    volumeEchoGraceMs: 900, // ignore stale page volume reports this long after a dock change
    seekEchoGraceMs: 1500, // ignore stale page position reports this long after a dock seek
    visualizer: true, // v14: the card gradient dances with the audio
    visualizerIntensity: 1.0, // 0.0 (off) .. ~1.5 (dramatic); scales all reactions
    visualizerRateHz: 20, // page-side analysis rate (5-30); 20Hz for beat timing
    visualizerReducedMotion: true, // auto-disable when OS prefers reduced motion
    middleClickPlayPause: true, // middle-click anywhere on the card toggles play
    showMusicNotes: true, // floating ♪ ♫ trail while playing
    showPlaybackRate: true, // append "· 1.5x" to subtitle when rate isn't 1
    windowScopedMedia: false, // true = only show media from this window
    staleMinutes: 30, // auto-drop paused items idle this long (0 = never)
    borderOpacity: 0.08, // card outline strength (0 removes it entirely)
    innerTopHighlight: false, // 1px inset highlight along the card's top edge
    artTintBg: 0.48, // how much artwork color tints the background
    artTintAccent: 0.28, // how much artwork color tints the accent
    progressTickMs: 1000, // local progress interpolation interval
    idleHeartbeatMs: 5000, // housekeeping interval (was 1200ms in v12)
  };

  const DOCK_SIDE_MARGIN = 8;
  const DOCK_GAP = 8;
  const DOCK_BOTTOM_CLEARANCE = 10;
  const DOCK_UPDATE_INTERVAL = SETTINGS.progressTickMs;
  const ART_TINT_BG = SETTINGS.artTintBg;
  const ART_TINT_ACCENT = SETTINGS.artTintAccent;
  const COLLAPSE_DELAY_MS = SETTINGS.collapseDelayMs;
  const EXPAND_DELAY_MS = SETTINGS.expandDelayMs;
  const VIZ_W = 96; // v15: fluid canvas internal resolution
  const VIZ_H = 36;
  const COLOR_CACHE_MAX = 40; // FIX 10: LRU cap for artwork palette cache

  // FIX 11: shared generic icon (used as final fallback when favicon also fails)
  const GENERIC_ICON =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#2d3441"/><path fill="#dbe3f2" d="M7 7h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2m0 2v6h10V9z"/></svg>',
    );

  const state = {
    items: new Map(),
    host: null,
    card: null,
    els: null,
    lastTabId: null,
    tickTimer: null,
    mountTarget: null,
    layoutObserver: null,
    layoutResizeObserver: null,
    rafPending: false,
    colorCache: new Map(),
    activeArtSrc: null,
    currentPaletteKey: "",
    expanded: false,
    collapseTimer: null,
    expandTimer: null,
    volHoverTimer: null,
    volHovered: false,
    volDragging: false,
    seekDragging: false, // v13: drag-to-seek in progress
    showRemaining: false, // v13: time label shows -remaining instead of elapsed
    pendingVolume: null, // v13.1: { tabId, volume, muted, until } — dock-set volume awaiting page echo
    pendingSeek: null, // v13.1: { tabId, t, until } — dock-set position awaiting page echo
    vizTabId: null, // v14: tab currently being analysed (null = none)
    vizTarget: { b: 0, m: 0, t: 0, l: 0, k: 0, v: 0 }, // latest band energies from the page
    vizFast: { b: 0, m: 0, t: 0, l: 0 }, // fast-smoothed (drives turbulence speed)
    vizKick: 0, // v15.2: decaying beat pulse (instant attack, ~150ms decay)
    vizVoice: 0, // v15.2: smoothed vocal presence (blooms the bright wisps)
    vizEnv: 0, // slow loudness envelope (drives warp depth / contrast)
    vizT1: 0, // v15: primary warp time (bass-driven)
    vizT2: 7.3, // v15: secondary warp time (mid-driven)
    vizLastTs: 0, // last rAF timestamp for dt integration
    vizCtx2d: null, // v15: 2d context of the fluid canvas
    vizImg: null, // v15: reusable ImageData
    vizLut: null, // v15: 256-entry palette LUT (Uint8, r,g,b triplets)
    vizLastPaint: 0, // v15.1: last paint timestamp (30fps cap)
    vizPaintCost: 0, // v15.1: EMA of paint duration (adaptive degrade)
    vizLastPacket: 0, // when the last viz packet arrived
    vizRaf: 0, // rAF id of the render loop (0 = not running)
  };

  const U = {
    create(tag, attrs = {}, parent = null, children = null) {
      const el = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs)) {
        if (k === "text") el.textContent = v;
        else if (k === "html") el.innerHTML = v;
        else if (k === "style" && v && typeof v === "object") {
          for (const [sk, sv] of Object.entries(v))
            el.style.setProperty(sk, sv);
        } else if (k === "events" && v && typeof v === "object") {
          for (const [ev, fn] of Object.entries(v))
            if (typeof fn === "function") el.addEventListener(ev, fn);
        } else if (k in el) {
          try {
            el[k] = v;
          } catch {
            el.setAttribute(k, v);
          }
        } else {
          el.setAttribute(k, v);
        }
      }
      if (children != null) {
        const arr = Array.isArray(children) ? children : [children];
        for (const child of arr) {
          if (!child) continue;
          // v13: non-node children become text nodes (the old template/innerHTML
          // path was unused and was the only dynamic innerHTML sink in the file)
          if (child.nodeType) el.append(child);
          else el.append(document.createTextNode(String(child)));
        }
      }
      if (parent) parent.append(el);
      return el;
    },
    style(css) {
      if (document.querySelector(`style[data-id="${MOD_ID}"]`)) return;
      const s = document.createElement("style");
      s.dataset.id = MOD_ID;
      s.textContent = css;
      document.head.append(s);
    },
    waitFor(fn, cb, ms = 250) {
      let timer = null;
      const loop = () => {
        const result = fn();
        if (result) cb(result);
        else timer = setTimeout(loop, ms);
      };
      timer = setTimeout(loop, ms);
      return () => timer && clearTimeout(timer);
    },
    isVisible(el) {
      if (!el || !el.isConnected) return false;
      const cs = getComputedStyle(el);
      if (
        cs.display === "none" ||
        cs.visibility === "hidden" ||
        Number(cs.opacity || "1") === 0
      )
        return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    },
    clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    },
    formatTime(sec) {
      if (!Number.isFinite(sec) || sec < 0) return "0:00";
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      return [h, m > 9 ? m : h ? `0${m}` : `${m}`, s > 9 ? s : `0${s}`]
        .filter(Boolean)
        .join(":");
    },
    favicon(url) {
      try {
        const u = new URL(url);
        return `chrome://favicon/${u.origin}`;
      } catch {
        return GENERIC_ICON;
      }
    },
    // FIX 12: only allow safe schemes for <img> src in the privileged UI document.
    // Pages control the artwork URL via MediaSession metadata / poster.
    safeImageSrc(src) {
      if (!src) return "";
      try {
        const u = new URL(String(src), location.href);
        if (
          u.protocol === "https:" ||
          u.protocol === "http:" ||
          u.protocol === "data:" ||
          u.protocol === "blob:" ||
          u.protocol === "chrome:"
        )
          return u.href;
      } catch {}
      return "";
    },
    parseCssColor(value) {
      if (!value) return null;
      const v = String(value).trim();
      if (!v) return null;
      if (v.startsWith("#")) {
        let hex = v.slice(1);
        if (hex.length === 3)
          hex = hex
            .split("")
            .map((c) => c + c)
            .join("");
        if (hex.length !== 6) return null;
        const n = parseInt(hex, 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
      }
      const m = v.match(/rgba?\(([^)]+)\)/i);
      if (!m) return null;
      const parts = m[1].split(",").map((p) => parseFloat(p.trim()));
      if (parts.length < 3) return null;
      return { r: parts[0], g: parts[1], b: parts[2] };
    },
    mix(a, b, amt) {
      return {
        r: a.r + (b.r - a.r) * amt,
        g: a.g + (b.g - a.g) * amt,
        b: a.b + (b.b - a.b) * amt,
      };
    },
    luminance(r, g, b) {
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    },
    rgbToHex(r, g, b) {
      return (
        "#" +
        [r, g, b]
          .map((v) =>
            Math.max(0, Math.min(255, Math.round(v)))
              .toString(16)
              .padStart(2, "0"),
          )
          .join("")
      );
    },
    rgba(rgb, a) {
      return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${a})`;
    },
    // v15.3: brighten + saturation-boost a color for control accents
    vivify(c) {
      const mx = Math.max(c.r, c.g, c.b);
      if (mx < 1) return { r: 118, g: 167, b: 255 };
      const k = 235 / mx;
      let r = c.r * k;
      let g = c.g * k;
      let b = c.b * k;
      const avg = (r + g + b) / 3;
      r = avg + (r - avg) * 1.35;
      g = avg + (g - avg) * 1.35;
      b = avg + (b - avg) * 1.35;
      return {
        r: U.clamp(r, 0, 255),
        g: U.clamp(g, 0, 255),
        b: U.clamp(b, 0, 255),
      };
    },
  };

  const icons = {
    play: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5.14v14l11-7z"/></svg>',
    pause:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M14 19h4V5h-4M6 19h4V5H6z"/></svg>',
    prev: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>',
    next: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M6 18 14.5 12 6 6v12zm10.5-12v12H19V6h-2.5z"/></svg>',
    volume:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.84-5 6.71v2.06c4-.91 7-4.49 7-8.77s-3-7.86-7-8.77M16.5 12c0-1.77-1-3.29-2.5-4.03v8.06c1.5-.74 2.5-2.26 2.5-4.03M3 9v6h4l5 5V4L7 9z"/></svg>',
    mute: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="m4.27 3L3 4.27L7.73 9H3v6h4l5 5v-6.73l4.25 4.26A6.8 6.8 0 0 1 14 18.7v2.07a8.8 8.8 0 0 0 3.68-1.81L19.73 21L21 19.73L12 10.73zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51c.65-1.24 1.03-2.65 1.03-4.15c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71"/></svg>',
    tab: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 16H3V5h10v4h8z"/></svg>',
    pip: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect fill="none" stroke="currentColor" stroke-width="2" x="2" y="4" width="20" height="16" rx="2"/><rect fill="currentColor" x="12" y="11" width="8" height="7" rx="1"/></svg>',
    close:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg>',
  };

  function addStyles() {
    U.style(`
      #tabs-tabbar-container.left,
      #tabs-tabbar-container.right,
      .tabbar-wrapper { position: relative; }

      .${MOD_ID}-host {
        position: absolute;
        left: ${DOCK_SIDE_MARGIN}px;
        right: ${DOCK_SIDE_MARGIN}px;
        top: ${DOCK_SIDE_MARGIN}px;
        z-index: 9;
        pointer-events: none;
        transition: top .18s ease;
        display: flex;
        align-items: stretch;
        gap: 0;
      }
      .${MOD_ID}-host.hidden { display: none !important; }
      .${MOD_ID}-host.expanded { z-index: 11; }

      .${MOD_ID}-card {
        --dock-bg: #232733;
        --dock-bg-top: #2d3441;
        --dock-fg: #eef2f7;
        --dock-accent: #76a7ff;
        --dock-vivid: #76a7ff;
        --dock-border: rgba(255,255,255,${SETTINGS.borderOpacity});
        --dock-btn-bg: rgba(255,255,255,.10);
        --dock-btn-hover: rgba(255,255,255,.16);
        --dock-art-1: var(--dock-bg-top);
        --dock-art-2: var(--dock-bg);
        --dock-art-3: var(--dock-accent);
        flex: 1 1 auto;
        min-width: 0;
        pointer-events: auto;
        position: relative;
        display: grid;
        grid-template-columns: 42px minmax(0,1fr);
        column-gap: 8px;
        row-gap: 0;
        align-items: center;
        padding: 8px;
        border-radius: 14px;
        overflow: hidden;
        color: var(--dock-fg);
        background: linear-gradient(180deg, var(--dock-bg-top), var(--dock-bg));
        border: 1px solid var(--dock-border);
        box-shadow: 0 8px 28px rgba(0,0,0,.28), 0 2px 10px rgba(0,0,0,.18)${SETTINGS.innerTopHighlight ? ", inset 0 1px 0 rgba(255,255,255,.04)" : ""};
        transition: box-shadow .18s ease;
        isolation: isolate;
      }
      .${MOD_ID}-card::before {
        content: "";
        position: absolute;
        inset: -34%;
        z-index: 0;
        pointer-events: none;
        background:
          radial-gradient(circle at 18% 22%, color-mix(in srgb, var(--dock-art-1) 70%, transparent) 0%, transparent 44%),
          radial-gradient(circle at 82% 18%, color-mix(in srgb, var(--dock-art-2) 64%, transparent) 0%, transparent 42%),
          radial-gradient(circle at 45% 92%, color-mix(in srgb, var(--dock-art-3) 56%, transparent) 0%, transparent 48%),
          linear-gradient(135deg, var(--dock-bg-top), var(--dock-bg));
        background-size: 185% 185%, 170% 170%, 210% 210%, 100% 100%;
        filter: saturate(1.08) contrast(0.98);
        opacity: .86;
        animation: ${MOD_ID}-art-gradient-drift 16s ease-in-out infinite alternate;
      }
      /* v15: the fluid is a real per-pixel turbulence render on a small
         canvas, upscaled smoothly. It fades in over the idle gradient while
         the visualizer is live. This canvas is the ONLY visualizer-reactive
         element in the whole mod; the idle ::before look is untouched. */
      .${MOD_ID}-viz-canvas {
        position: absolute;
        inset: 0;
        z-index: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        transition: opacity .45s ease;
        pointer-events: none;
      }
      .${MOD_ID}-card.viz-live .${MOD_ID}-viz-canvas {
        opacity: .42;
      }
      .${MOD_ID}-card::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        background: linear-gradient(180deg, rgba(255,255,255,.035), rgba(0,0,0,.16));
      }
      @keyframes ${MOD_ID}-art-gradient-drift {
        0% { background-position: 0% 0%, 100% 8%, 42% 100%, 0 0; }
        35% { background-position: 45% 18%, 70% 42%, 16% 82%, 0 0; }
        70% { background-position: 88% 55%, 20% 75%, 66% 18%, 0 0; }
        100% { background-position: 18% 100%, 0% 34%, 100% 0%, 0 0; }
      }

      /* ── art ───────────────────────────────────────────────── */
      .${MOD_ID}-art-wrap {
        grid-column: 1;
        grid-row: 1;
        align-self: center;
        position: relative;
        width: 38px;
        height: 38px;
        cursor: pointer;
        z-index: 2;
        transition: transform .12s ease;
      }
      .${MOD_ID}-art-wrap:hover {
        transform: scale(1.06);
      }
      .${MOD_ID}-art-wrap:active {
        transform: scale(0.96);
      }
      /* media count badge — shows total controllable sources */
      .${MOD_ID}-media-count {
        position: absolute;
        left: -4px;
        top: -4px;
        min-width: 15px;
        height: 15px;
        border-radius: 999px;
        background: var(--dock-vivid); /* v15.3: artwork-vivid badge */
        color: #fff;
        font-size: 9px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 3px;
        line-height: 1;
        pointer-events: none;
        opacity: 0;
        transform: scale(0.5);
        transition: opacity .15s ease, transform .15s ease;
        z-index: 3;
        box-shadow: 0 1px 4px rgba(0,0,0,.35);
      }
      .${MOD_ID}-media-count.visible {
        opacity: 1;
        transform: scale(1);
      }
      .${MOD_ID}-art {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        object-fit: cover;
        background: color-mix(in srgb, var(--dock-bg) 85%, #000 15%);
        transition: width .2s ease, height .2s ease, border-radius .2s ease;
      }
      .${MOD_ID}-favicon {
        position: absolute;
        right: -3px;
        bottom: -3px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        object-fit: cover;
        background: transparent;
        border: 1.5px solid transparent;
        box-shadow: 0 1px 3px rgba(0,0,0,.35);
        pointer-events: none;
        opacity: 0.85;
      }

      /* ── meta (compact): stacks titleRow + subtitle vertically ─ */
      .${MOD_ID}-meta {
        grid-column: 2;
        grid-row: 1;
        min-width: 0;
        align-self: center;
        position: relative;
        z-index: 2;
      }

      /* titleRow: title text + close button side by side */
      .${MOD_ID}-title-row {
        display: flex;
        align-items: center;
        min-width: 0;
        gap: 4px;
      }

      .${MOD_ID}-title,
      .${MOD_ID}-subtitle {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
      }
      .${MOD_ID}-title {
        flex: 1 1 0;
        font-size: 12.5px;
        font-weight: 600;
        line-height: 1.2;
        text-shadow: 0 1px 2px rgba(0,0,0,.5); /* v15.3: readable over fluid */
      }
      .${MOD_ID}-subtitle {
        font-size: 10.5px;
        opacity: .82;
        margin-top: 1px;
        text-shadow: 0 1px 2px rgba(0,0,0,.5);
      }

      /* close button: zero-width in compact, slides open on expand */
      .${MOD_ID}-btn-close {
        flex-shrink: 0;
        width: 0;
        height: 20px;
        border: 0;
        padding: 0;
        overflow: hidden;
        border-radius: 999px;
        color: var(--dock-fg) !important;
        background: transparent;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        font-size: 16px;
        font-weight: 500;
        line-height: 1;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        text-shadow: 0 1px 2px rgba(0,0,0,.55);
        transition: opacity .15s ease, width .15s ease, background-color .15s ease, transform .12s ease;
      }

      .${MOD_ID}-host.expanded .${MOD_ID}-btn-close {
        width: 20px;
        opacity: .9;
        pointer-events: auto;
      }

      .${MOD_ID}-btn-close:hover {
        opacity: 1;
        background: var(--dock-btn-hover);
      }

      .${MOD_ID}-btn-close:active {
        transform: scale(.94);
      }

      /* ── panel: collapsed in compact ──────────────────────── */
      .${MOD_ID}-panel {
        grid-column: 1 / -1;
        grid-row: 2;
        max-height: 0;
        overflow: hidden;
        transition: max-height .2s ease;
        position: relative;
        z-index: 2;
      }

      .${MOD_ID}-controls {
        display: flex;
        align-items: center;
        gap: 2px;
        padding-top: 6px;
      }

      .${MOD_ID}-btn {
        width: 20px;
        height: 20px;
        border: 0;
        padding: 0;
        border-radius: 999px;
        color: inherit;
        background: var(--dock-btn-bg);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background-color .15s ease, transform .12s ease;
      }
      .${MOD_ID}-btn:hover { background: var(--dock-btn-hover); }
      .${MOD_ID}-btn:active { transform: scale(.96); }
      .${MOD_ID}-btn svg { width: 13px; height: 13px; }
      .${MOD_ID}-spacer { flex: 1 1 auto; }

      /* ── music trail (absolutely positioned behind content) ── */
      .${MOD_ID}-music-trail {
        position: absolute;
        right: 6px;
        top: 0;
        bottom: 0;
        width: 48px;
        overflow: visible;
        pointer-events: none;
        z-index: 1;
        opacity: 0;
        transition: opacity 0.6s ease;
      }
      .${MOD_ID}-music-trail.active {
        opacity: 1;
        transition: opacity 0.15s ease;
      }
      /* hide trail in expanded/hovered mode — keep it clean for controls */
      .${MOD_ID}-host.expanded .${MOD_ID}-music-trail {
        opacity: 0 !important;
      }
      .${MOD_ID}-music-note {
        position: absolute;
        font-size: 16px;
        opacity: 0;
        color: var(--dock-fg);
        filter: drop-shadow(0 0 2px rgba(255,255,255,.08));
        pointer-events: none;
        will-change: transform, opacity;
      }
      .${MOD_ID}-music-note:nth-child(1) {
        animation: ${MOD_ID}-float-note 3s linear infinite;
        right: 4px;
        bottom: 4px;
      }
      .${MOD_ID}-music-note:nth-child(2) {
        animation: ${MOD_ID}-float-note 3s linear infinite 1s;
        right: 20px;
        bottom: 0px;
      }
      .${MOD_ID}-music-note:nth-child(3) {
        animation: ${MOD_ID}-float-note 3s linear infinite 2s;
        right: 10px;
        bottom: 6px;
      }
      .${MOD_ID}-music-note:nth-child(4) {
        animation: ${MOD_ID}-float-note 3s linear infinite 0.5s;
        right: 32px;
        bottom: 2px;
      }
      @keyframes ${MOD_ID}-float-note {
        0% {
          opacity: 0;
          transform: translateY(0) rotate(0deg) scale(0.6);
        }
        8% {
          opacity: 0.45;
          transform: translateY(-7px) rotate(-5deg) scale(0.85);
        }
        25% {
          opacity: 0.4;
          transform: translateY(-22px) rotate(6deg) scale(0.8);
        }
        50% {
          opacity: 0.28;
          transform: translateY(-45px) rotate(-4deg) scale(0.72);
        }
        75% {
          opacity: 0.12;
          transform: translateY(-68px) rotate(5deg) scale(0.62);
        }
        100% {
          opacity: 0;
          transform: translateY(-90px) rotate(8deg) scale(0.5);
        }
      }

      .${MOD_ID}-progressWrap {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
        align-items: center;
        padding-top: 4px;
        padding-bottom: 2px;
      }

      .${MOD_ID}-bar {
        height: 4px;
        border-radius: 999px;
        overflow: hidden;
        background: rgba(255,255,255,.22); /* v15.3: stronger on dark fluid */
        cursor: pointer;
      }
      /* v15.3: artwork-vivid gradient fill with a soft glow */
      .${MOD_ID}-barValue {
        height: 100%;
        width: 0;
        background: linear-gradient(90deg,
          color-mix(in srgb, var(--dock-vivid) 70%, var(--dock-accent)),
          var(--dock-vivid));
        box-shadow: 0 0 6px color-mix(in srgb, var(--dock-vivid) 60%, transparent);
        pointer-events: none;
      }
      .${MOD_ID}-time {
        font-size: 10px;
        opacity: .78;
        white-space: nowrap;
        cursor: pointer; /* v13: click toggles remaining-time display */
        user-select: none;
        text-shadow: 0 1px 2px rgba(0,0,0,.5);
      }
      .${MOD_ID}-time:hover { opacity: .95; }

      /* v13: seek hover/drag time preview tooltip */
      .${MOD_ID}-seek-tip {
        position: absolute;
        z-index: 4;
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 10px;
        line-height: 1.3;
        background: color-mix(in srgb, var(--dock-bg) 80%, #000 20%);
        color: var(--dock-fg);
        border: 1px solid var(--dock-border);
        pointer-events: none;
        white-space: nowrap;
        transform: translate(-50%, -100%);
        opacity: 0;
        transition: opacity .12s ease;
      }
      .${MOD_ID}-seek-tip.visible { opacity: 1; }

      /* ── expanded state ────────────────────────────────────── */
      .${MOD_ID}-host.expanded .${MOD_ID}-panel {
        max-height: 90px;
      }
      .${MOD_ID}-host.expanded .${MOD_ID}-btn-close {
        width: 20px;
        opacity: 1;
        pointer-events: auto;
      }

      /* ── volume slider panel ───────────────────────────── */
      .${MOD_ID}-vol-panel {
        --dock-bg: #232733;
        --dock-bg-top: #2d3441;
        --dock-fg: #eef2f7;
        --dock-accent: #76a7ff;
        --dock-border: rgba(255,255,255,${SETTINGS.borderOpacity});
        position: relative;
        width: 0;
        min-width: 0;
        opacity: 0;
        overflow: hidden;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(180deg, var(--dock-bg-top), var(--dock-bg));
        border: 1px solid var(--dock-border);
        box-shadow: 0 8px 28px rgba(0,0,0,.28), 0 2px 10px rgba(0,0,0,.18)${SETTINGS.innerTopHighlight ? ",\n                    inset 0 1px 0 rgba(255,255,255,.04)" : ""};
        transition: width .28s cubic-bezier(.4,0,.2,1),
                    min-width .28s cubic-bezier(.4,0,.2,1),
                    opacity .22s ease,
                    margin-left .28s cubic-bezier(.4,0,.2,1);
        margin-left: 0;
        pointer-events: none;
      }
      .${MOD_ID}-host.vol-hover .${MOD_ID}-vol-panel {
        width: 22px;
        min-width: 22px;
        opacity: 1;
        margin-left: 6px;
        pointer-events: auto;
      }
      .${MOD_ID}-vol-track {
        position: relative;
        width: 4px;
        height: calc(100% - 16px);
        border-radius: 999px;
        background: rgba(255,255,255,.14);
        cursor: pointer;
      }
      .${MOD_ID}-vol-fill {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100%;
        border-radius: 999px;
        background: var(--dock-vivid); /* v15.3: artwork-vivid */
        pointer-events: none;
      }
      .${MOD_ID}-vol-thumb {
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--dock-vivid); /* v15.3: artwork-vivid */
        border: 1.5px solid var(--dock-fg);
        box-shadow: 0 0 3px rgba(0,0,0,.4);
        left: 50%;
        bottom: 100%;
        transform: translate(-50%, 50%);
        pointer-events: none;
        transition: box-shadow .12s ease;
      }
      .${MOD_ID}-vol-track:hover .${MOD_ID}-vol-thumb {
        box-shadow: 0 0 6px rgba(0,0,0,.5);
      }
      /* hide vol slider when dock is collapsed */
      .${MOD_ID}-host:not(.expanded) .${MOD_ID}-vol-panel {
        width: 0 !important;
        min-width: 0 !important;
        opacity: 0 !important;
        margin-left: 0 !important;
        pointer-events: none !important;
      }
    `);
  }

  function cancelCollapse() {
    if (state.collapseTimer) clearTimeout(state.collapseTimer);
    state.collapseTimer = null;
  }

  function cancelExpand() {
    if (state.expandTimer) clearTimeout(state.expandTimer);
    state.expandTimer = null;
  }

  function setExpanded(expanded) {
    cancelCollapse();
    cancelExpand();
    state.expanded = expanded;
    if (state.host) state.host.classList.toggle("expanded", expanded);
    scheduleLayoutUpdate();
  }

  function scheduleExpand() {
    cancelCollapse();
    cancelExpand();
    state.expandTimer = setTimeout(() => {
      state.expandTimer = null;
      setExpanded(true);
    }, EXPAND_DELAY_MS);
  }

  function scheduleCollapse() {
    cancelCollapse();
    cancelExpand();
    state.collapseTimer = setTimeout(() => {
      state.expanded = false;
      // Also clear volume slider on collapse
      state.volHovered = false;
      if (state.volHoverTimer) {
        clearTimeout(state.volHoverTimer);
        state.volHoverTimer = null;
      }
      if (state.host) {
        state.host.classList.remove("expanded");
        state.host.classList.remove("vol-hover");
      }
      scheduleLayoutUpdate();
    }, COLLAPSE_DELAY_MS);
  }

  function showVolSlider() {
    if (state.volHoverTimer) clearTimeout(state.volHoverTimer);
    if (state.volHovered) return;
    state.volHoverTimer = setTimeout(() => {
      state.volHoverTimer = null;
      if (!state.expanded) return;
      state.volHovered = true;
      if (state.host) state.host.classList.add("vol-hover");
    }, 350);
  }

  function hideVolSlider() {
    if (state.volHoverTimer) clearTimeout(state.volHoverTimer);
    state.volHoverTimer = setTimeout(() => {
      state.volHoverTimer = null;
      // FIX 8: don't retract mid-drag (mouse often leaves the narrow panel
      // while dragging); re-check shortly after instead
      if (state.volDragging) {
        hideVolSlider();
        return;
      }
      state.volHovered = false;
      if (state.host) state.host.classList.remove("vol-hover");
    }, 200);
  }

  function cancelVolHide() {
    if (state.volHoverTimer) clearTimeout(state.volHoverTimer);
    state.volHoverTimer = null;
  }

  // v13: briefly reveal the volume flyout as feedback for wheel adjustments
  function flashVolSlider() {
    if (!state.expanded || !state.host) return;
    cancelVolHide();
    state.volHovered = true;
    state.host.classList.add("vol-hover");
    state.volHoverTimer = setTimeout(() => {
      state.volHoverTimer = null;
      if (state.volDragging) return;
      state.volHovered = false;
      if (state.host) state.host.classList.remove("vol-hover");
    }, 900);
  }

  // v13.1: record a dock-initiated volume change so stale page echoes
  // can't yank the slider back (see updateItem)
  function setPendingVolume(item, volume, muted) {
    state.pendingVolume = {
      tabId: item.tabId,
      volume,
      muted: !!muted,
      until: Date.now() + SETTINGS.volumeEchoGraceMs,
    };
  }

  // v13: wheel-gesture volume adjustment
  function adjustVolume(delta) {
    const item = topItem();
    if (!item || !state.els) return;
    const current = item.muted ? 0 : (item.volume ?? 1);
    const v = U.clamp(Math.round((current + delta) * 100) / 100, 0, 1);
    if (v === current) return;
    send(item, "volume", { volume: v });
    item.volume = v;
    item.muted = v === 0;
    setPendingVolume(item, v, v === 0);
    const pct = Math.round(v * 100);
    state.els.volFill.style.height = `${pct}%`;
    state.els.volThumb.style.bottom = `${pct}%`;
    state.els.btnMute.innerHTML = v === 0 ? icons.mute : icons.volume;
    flashVolSlider();
  }

  function getThemePalette() {
    const source =
      document.getElementById("browser") || document.documentElement;
    const cs = getComputedStyle(source);

    const accent = U.parseCssColor(cs.getPropertyValue("--colorHighlightBg")) ||
      U.parseCssColor(cs.getPropertyValue("--colorAccentBg")) ||
      U.parseCssColor(cs.getPropertyValue("--colorAccentFg")) || {
        r: 76,
        g: 167,
        b: 255,
      };

    const bg = U.parseCssColor(cs.getPropertyValue("--colorBg")) || {
      r: 35,
      g: 39,
      b: 51,
    };
    let fg = U.parseCssColor(cs.getPropertyValue("--colorFg")) || {
      r: 238,
      g: 242,
      b: 247,
    };
    const darkTheme = U.luminance(bg.r, bg.g, bg.b) < 140;

    const dockBgRgb = U.mix(bg, accent, darkTheme ? 0.34 : 0.24);
    const dockBgTopRgb = U.mix(bg, accent, darkTheme ? 0.44 : 0.3);
    const dockLum = U.luminance(dockBgRgb.r, dockBgRgb.g, dockBgRgb.b);
    if (Math.abs(dockLum - U.luminance(fg.r, fg.g, fg.b)) < 90) {
      fg = dockLum > 150 ? { r: 22, g: 26, b: 33 } : { r: 245, g: 247, b: 251 };
    }

    const borderRgb = U.mix(accent, fg, 0.24);
    const btnBaseRgb = U.mix(dockBgRgb, accent, darkTheme ? 0.22 : 0.14);
    const btnHoverRgb = U.mix(dockBgRgb, accent, darkTheme ? 0.36 : 0.24);

    return {
      accentRgb: accent,
      bgRgb: dockBgRgb,
      topRgb: dockBgTopRgb,
      fgRgb: fg,
      bg: U.rgbToHex(dockBgRgb.r, dockBgRgb.g, dockBgRgb.b),
      bgTop: U.rgbToHex(dockBgTopRgb.r, dockBgTopRgb.g, dockBgTopRgb.b),
      fg: U.rgbToHex(fg.r, fg.g, fg.b),
      accent: U.rgbToHex(accent.r, accent.g, accent.b),
      border: U.rgba(borderRgb, SETTINGS.borderOpacity),
      btn: U.rgba(btnBaseRgb, darkTheme ? 0.42 : 0.34),
      btnHover: U.rgba(btnHoverRgb, darkTheme ? 0.62 : 0.5),
      vivid: (() => {
        const v = U.vivify(accent);
        return U.rgbToHex(v.r, v.g, v.b);
      })(),
    };
  }

  function applyPalette(p) {
    if (!state.card || !p) return;
    state.card.style.setProperty("--dock-bg", p.bg);
    state.card.style.setProperty("--dock-bg-top", p.bgTop);
    state.card.style.setProperty("--dock-fg", p.fg);
    state.card.style.setProperty("--dock-accent", p.accent);
    state.card.style.setProperty("--dock-border", p.border);
    state.card.style.setProperty("--dock-btn-bg", p.btn);
    state.card.style.setProperty("--dock-btn-hover", p.btnHover);
    state.card.style.setProperty("--dock-art-1", p.art1 || p.bgTop);
    state.card.style.setProperty("--dock-art-2", p.art2 || p.bg);
    state.card.style.setProperty("--dock-art-3", p.art3 || p.accent);
    state.card.style.setProperty("--dock-vivid", p.vivid || p.accent);
    if (state.els?.volPanel) {
      state.els.volPanel.style.setProperty("--dock-vivid", p.vivid || p.accent);
      state.els.volPanel.style.setProperty("--dock-bg", p.bg);
      state.els.volPanel.style.setProperty("--dock-bg-top", p.bgTop);
      state.els.volPanel.style.setProperty("--dock-fg", p.fg);
      state.els.volPanel.style.setProperty("--dock-accent", p.accent);
      state.els.volPanel.style.setProperty("--dock-border", p.border);
      state.els.volPanel.style.setProperty("--dock-art-1", p.art1 || p.bgTop);
      state.els.volPanel.style.setProperty("--dock-art-2", p.art2 || p.bg);
      state.els.volPanel.style.setProperty("--dock-art-3", p.art3 || p.accent);
    }
  }

  function buildTintedPalette(base, artRgb) {
    if (!base || !artRgb) return base;

    const primary = artRgb.primary || artRgb;
    const secondary = artRgb.secondary || U.mix(primary, base.accentRgb, 0.28);
    const tertiary = artRgb.tertiary || U.mix(primary, base.fgRgb, 0.16);
    const dark = { r: 10, g: 12, b: 18 };

    // Artwork drives the surface, but the mix stays soft/readable.
    const bgRgb = U.mix(U.mix(base.bgRgb, dark, 0.18), primary, ART_TINT_BG);
    const topRgb = U.mix(
      U.mix(base.topRgb, dark, 0.1),
      secondary,
      Math.min(0.64, ART_TINT_BG + 0.06),
    );
    const accentRgb = U.mix(base.accentRgb, tertiary, ART_TINT_ACCENT);

    const bgLum = U.luminance(bgRgb.r, bgRgb.g, bgRgb.b);
    const fgRgb =
      bgLum > 150 ? { r: 20, g: 24, b: 32 } : { r: 245, g: 247, b: 251 };
    const borderRgb = U.mix(accentRgb, fgRgb, 0.26);
    const btnBaseRgb = U.mix(bgRgb, accentRgb, 0.22);
    const btnHoverRgb = U.mix(bgRgb, accentRgb, 0.36);

    return {
      accentRgb,
      bgRgb,
      topRgb,
      fgRgb,
      bg: U.rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b),
      bgTop: U.rgbToHex(topRgb.r, topRgb.g, topRgb.b),
      fg: U.rgbToHex(fgRgb.r, fgRgb.g, fgRgb.b),
      accent: U.rgbToHex(accentRgb.r, accentRgb.g, accentRgb.b),
      border: U.rgba(borderRgb, SETTINGS.borderOpacity),
      btn: U.rgba(btnBaseRgb, 0.34),
      btnHover: U.rgba(btnHoverRgb, 0.52),
      art1: U.rgbToHex(primary.r, primary.g, primary.b),
      art2: U.rgbToHex(secondary.r, secondary.g, secondary.b),
      art3: U.rgbToHex(tertiary.r, tertiary.g, tertiary.b),
      // v15.3: control accent straight from the artwork's dominant color
      vivid: (() => {
        const v = U.vivify(U.mix(primary, accentRgb, 0.2));
        return U.rgbToHex(v.r, v.g, v.b);
      })(),
    };
  }

  function applyCurrentPalette(artSrc) {
    const base = getThemePalette();
    let palette = base;
    if (artSrc && state.colorCache.has(artSrc))
      palette = buildTintedPalette(base, state.colorCache.get(artSrc));
    const key = JSON.stringify([
      palette.bg,
      palette.bgTop,
      palette.accent,
      palette.fg,
    ]);
    if (key !== state.currentPaletteKey) {
      state.currentPaletteKey = key;
      applyPalette(palette);
      buildVizLut(palette); // v15: keep the fluid's colors in sync
    }
  }

  function extractArtColor(src) {
    if (!src || state.colorCache.has(src)) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 28;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        const buckets = new Map();

        for (let i = 0; i < data.length; i += 16) {
          const a = data[i + 3];
          if (a < 180) continue;
          const rr = data[i],
            gg = data[i + 1],
            bb = data[i + 2];
          const lum = U.luminance(rr, gg, bb);
          if (lum < 12 || lum > 246) continue;
          const max = Math.max(rr, gg, bb);
          const min = Math.min(rr, gg, bb);
          const sat = max === 0 ? 0 : (max - min) / max;
          if (sat < 0.08 && lum > 210) continue;

          const key = `${Math.round(rr / 42)}-${Math.round(gg / 42)}-${Math.round(bb / 42)}`;
          const weight = 1 + sat * 1.8 + (lum > 45 && lum < 210 ? 0.7 : 0);
          const bucket = buckets.get(key) || {
            r: 0,
            g: 0,
            b: 0,
            w: 0,
            count: 0,
            sat: 0,
          };
          bucket.r += rr * weight;
          bucket.g += gg * weight;
          bucket.b += bb * weight;
          bucket.w += weight;
          bucket.count += 1;
          bucket.sat += sat;
          buckets.set(key, bucket);
        }

        const colors = [...buckets.values()]
          .filter((b) => b.w > 0)
          .map((b) => ({
            r: b.r / b.w,
            g: b.g / b.w,
            b: b.b / b.w,
            score: b.count * (1 + b.sat / Math.max(1, b.count)),
          }))
          .sort((a, b) => b.score - a.score);

        if (colors.length) {
          const primary = colors[0];
          const distance = (a, b) =>
            Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);
          const secondary =
            colors.find((c) => distance(c, primary) > 92) ||
            colors[1] ||
            U.mix(primary, { r: 255, g: 255, b: 255 }, 0.18);
          const tertiary =
            colors.find(
              (c) => distance(c, primary) > 55 && distance(c, secondary) > 55,
            ) ||
            colors[2] ||
            U.mix(primary, secondary, 0.5);

          state.colorCache.set(src, { primary, secondary, tertiary });
          // FIX 10: cap cache size (Map preserves insertion order -> drop oldest)
          while (state.colorCache.size > COLOR_CACHE_MAX) {
            const oldest = state.colorCache.keys().next().value;
            state.colorCache.delete(oldest);
          }
          if (state.activeArtSrc === src) applyCurrentPalette(src);
        }
      } catch {}
    };
    img.onerror = () => {};
    img.src = src;
  }

  function getMountTarget() {
    const browser = document.getElementById("browser");
    if (!browser) return null;
    if (
      !(
        browser.classList.contains("tabs-left") ||
        browser.classList.contains("tabs-right")
      )
    )
      return null;
    return (
      document.querySelector(
        "#tabs-tabbar-container.left, #tabs-tabbar-container.right",
      ) || document.querySelector(".tabbar-wrapper")
    );
  }

  function getTabStripInfo(target) {
    const tabStrip = target.querySelector(".tab-strip");
    if (!tabStrip || !U.isVisible(tabStrip))
      return { el: null, bottom: DOCK_GAP };
    const targetRect = target.getBoundingClientRect();
    return {
      el: tabStrip,
      bottom: Math.round(
        tabStrip.getBoundingClientRect().bottom - targetRect.top,
      ),
    };
  }

  function getBottomRowInfo(target, host) {
    const targetRect = target.getBoundingClientRect();
    const candidates = Array.from(
      target.querySelectorAll(
        "button, .button-toolbar, .ToolbarButton-Button, .toolbar button",
      ),
    )
      .filter(
        (el) =>
          U.isVisible(el) && !host.contains(el) && !el.closest(".tab-strip"),
      )
      .map((el) => ({ el, rect: el.getBoundingClientRect() }));
    if (!candidates.length) return null;
    const maxTop = Math.max(...candidates.map((x) => x.rect.top));
    const row = candidates.filter((x) => x.rect.top >= maxTop - 42);
    if (!row.length) return null;
    return {
      top: Math.round(Math.min(...row.map((x) => x.rect.top)) - targetRect.top),
      bottom: Math.round(
        Math.max(...row.map((x) => x.rect.bottom)) - targetRect.top,
      ),
    };
  }

  function clearReservedSpace(target) {
    const tabStrip = target.querySelector(".tab-strip");
    if (tabStrip) tabStrip.style.paddingBottom = "";
  }

  function applyReservedSpace(target, px) {
    const tabStrip = target.querySelector(".tab-strip");
    if (!tabStrip) return;
    const current =
      parseFloat(getComputedStyle(tabStrip).paddingBottom || "0") || 0;
    if (Math.abs(current - px) > 1)
      tabStrip.style.paddingBottom = `${Math.max(0, Math.round(px))}px`;
  }

  function computePlacement(target, host, card) {
    const targetRect = target.getBoundingClientRect();
    const cardHeight = Math.ceil(card.getBoundingClientRect().height || 88);
    const tabStrip = getTabStripInfo(target);
    const bottomRow = getBottomRowInfo(target, host);
    const upperBottom = Math.max(DOCK_GAP, tabStrip.bottom);
    const bottomRowTop = bottomRow
      ? bottomRow.top
      : targetRect.height - DOCK_GAP;
    const idealTop = bottomRowTop - cardHeight - DOCK_BOTTOM_CLEARANCE;
    const naturalGap = idealTop - upperBottom;
    if (naturalGap >= DOCK_GAP)
      return {
        top: U.clamp(
          idealTop,
          DOCK_GAP,
          targetRect.height - cardHeight - DOCK_GAP,
        ),
        reserve: 0,
      };
    const top = U.clamp(
      idealTop,
      DOCK_GAP,
      targetRect.height - cardHeight - DOCK_GAP,
    );
    const overlap = upperBottom + DOCK_GAP - top;
    return { top, reserve: Math.max(0, overlap + DOCK_GAP) };
  }

  function scheduleLayoutUpdate() {
    if (state.rafPending) return;
    state.rafPending = true;
    requestAnimationFrame(() => {
      state.rafPending = false;
      updateDockPosition();
      render();
    });
  }

  function attachLayoutWatchers(target) {
    disconnectLayoutWatchers();
    state.layoutObserver = new MutationObserver(scheduleLayoutUpdate);
    state.layoutObserver.observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    if (window.ResizeObserver) {
      state.layoutResizeObserver = new ResizeObserver(scheduleLayoutUpdate);
      state.layoutResizeObserver.observe(target);
      const tabStrip = target.querySelector(".tab-strip");
      if (tabStrip) state.layoutResizeObserver.observe(tabStrip);
    }
  }

  function disconnectLayoutWatchers() {
    if (state.layoutObserver) state.layoutObserver.disconnect();
    if (state.layoutResizeObserver) state.layoutResizeObserver.disconnect();
    state.layoutObserver = null;
    state.layoutResizeObserver = null;
  }

  function updateDockPosition() {
    const target = state.mountTarget || getMountTarget();
    if (!target || !state.host || !state.card) return;
    const { top, reserve } = computePlacement(target, state.host, state.card);
    state.host.style.top = `${Math.round(top)}px`;
    state.host.style.bottom = "auto";
    if (reserve > 0)
      applyReservedSpace(
        target,
        reserve +
          Math.ceil(state.card.getBoundingClientRect().height) +
          DOCK_BOTTOM_CLEARANCE,
      );
    else clearReservedSpace(target);
  }

  function ensureDock() {
    const target = getMountTarget();
    if (!target) {
      if (state.host?.isConnected) state.host.remove();
      if (state.mountTarget) clearReservedSpace(state.mountTarget);
      disconnectLayoutWatchers();
      // v14: no dock = no visualizer; tell the page to stop sampling
      if (state.vizTabId != null) {
        const it = state.items.get(state.vizTabId);
        if (it) send(it, "viz-stop");
        state.vizTabId = null;
      }
      state.host = null;
      state.card = null;
      state.els = null;
      state.mountTarget = null;
      return null;
    }
    if (
      state.host &&
      state.host.isConnected &&
      state.host.parentElement === target
    ) {
      if (state.mountTarget !== target) {
        state.mountTarget = target;
        attachLayoutWatchers(target);
      }
      updateDockPosition();
      return state.host;
    }

    if (state.host?.isConnected) state.host.remove();
    if (state.mountTarget && state.mountTarget !== target)
      clearReservedSpace(state.mountTarget);

    state.mountTarget = target;
    state.host = U.create(
      "div",
      {
        className: `${MOD_ID}-host hidden`,
        events: {
          mouseenter() {
            // v13: hover-expand only in "hover" mode
            if (SETTINGS.expandOn === "hover") scheduleExpand();
          },
          mouseleave() {
            scheduleCollapse();
          },
        },
      },
      target,
    );

    // v13 / v13.1: scroll gestures — wheel over artwork cycles media; wheel
    // anywhere else on the card adjusts volume.
    //
    // Touchpad-aware: a mouse notch is ONE event of ~100px deltaY, but a
    // touchpad swipe is DOZENS of small events plus an inertia tail. So we
    // normalize deltaMode, accumulate distance, and convert distance into
    // discrete actions — never one action per event.
    if (SETTINGS.scrollGestures) {
      let cycleAcc = 0; // accumulated px toward an artwork cycle
      let lastCycleTs = 0; // last cycle time (cooldown gate)
      let volAcc = 0; // accumulated px toward volume notches

      state.host.addEventListener(
        "wheel",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          // Normalize: deltaMode 0 = pixels, 1 = lines (~16px), 2 = pages (~120px)
          let d = e.deltaY;
          if (e.deltaMode === 1) d *= 16;
          else if (e.deltaMode === 2) d *= 120;
          if (!d) return;

          if (e.target.closest(`.${MOD_ID}-art-wrap`)) {
            const now = Date.now();
            // During cooldown, discard motion entirely — this is what stops
            // the inertia tail from chaining into extra cycles
            if (now - lastCycleTs < SETTINGS.cycleCooldownMs) {
              cycleAcc = 0;
              return;
            }
            // Direction flip resets progress
            if (cycleAcc !== 0 && Math.sign(d) !== Math.sign(cycleAcc))
              cycleAcc = 0;
            cycleAcc += d;
            if (Math.abs(cycleAcc) >= SETTINGS.cycleWheelPixels) {
              cycleMedia(cycleAcc > 0 ? 1 : -1);
              cycleAcc = 0;
              lastCycleTs = now;
            }
          } else {
            volAcc += d;
            const px = SETTINGS.volumeWheelPixels;
            // Convert whole notches of accumulated distance into volume
            // steps (capped so a violent fling can't slam 0 -> 100)
            let steps = Math.trunc(volAcc / px);
            if (!steps) return;
            volAcc -= steps * px;
            steps = U.clamp(steps, -4, 4);
            adjustVolume(-steps * SETTINGS.volumeWheelStep);
          }
        },
        { passive: false },
      );
    }

    const art = U.create("img", {
      className: `${MOD_ID}-art`,
      alt: "",
      draggable: false,
    });

    // FIX 5 + FIX 11 + v13: staged fallback —
    // artwork -> page-reported favicon -> chrome://favicon -> generic icon
    art.addEventListener("error", () => {
      const item = topItem();
      const chain = [
        item?.pageIcon,
        item?.url ? U.favicon(item.url) : "",
        GENERIC_ICON,
      ].filter(Boolean);
      const idx = chain.indexOf(art.getAttribute("src"));
      const next = chain[idx + 1] || GENERIC_ICON;
      if (art.getAttribute("src") !== next) art.src = next;
    });

    const favicon = U.create("img", {
      className: `${MOD_ID}-favicon`,
      alt: "",
      draggable: false,
    });
    favicon.addEventListener("error", () => {
      favicon.style.display = "none";
    });

    const mediaCount = U.create("div", {
      className: `${MOD_ID}-media-count`,
      text: "",
    });
    const artWrap = U.create(
      "div",
      {
        className: `${MOD_ID}-art-wrap`,
        title: "Click to cycle media",
        events: {
          click(e) {
            e.preventDefault();
            e.stopPropagation();
            cycleMedia();
          },
          mouseenter() {
            // Suppress expansion while hovering the thumbnail
            cancelExpand();
          },
          mouseleave(e) {
            // If mouse moved back into the card (not leaving the host entirely),
            // re-trigger expansion (hover mode only)
            if (
              SETTINGS.expandOn === "hover" &&
              e.relatedTarget &&
              state.host &&
              state.host.contains(e.relatedTarget)
            ) {
              scheduleExpand();
            }
          },
        },
      },
      null,
      [art, favicon, mediaCount],
    );

    const title = U.create("div", {
      className: `${MOD_ID}-title`,
      text: "Nothing playing",
    });
    const btnClose = U.create("button", {
      className: `${MOD_ID}-btn-close`,
      type: "button",
      title: "Stop / Dismiss",
      text: "×",
      events: { click: closeMedia },
    });
    const titleRow = U.create(
      "div",
      { className: `${MOD_ID}-title-row` },
      null,
      [title, btnClose],
    );
    const subtitle = U.create("div", {
      className: `${MOD_ID}-subtitle`,
      text: "",
    });
    const meta = U.create("div", { className: `${MOD_ID}-meta` }, null, [
      titleRow,
      subtitle,
    ]);

    const btnTab = U.create("button", {
      className: `${MOD_ID}-btn`,
      type: "button",
      title: "Go to tab",
      html: icons.tab,
      events: { click: focusTab },
    });
    const btnPrev = U.create("button", {
      className: `${MOD_ID}-btn`,
      type: "button",
      title: "Previous track",
      html: icons.prev,
      events: { click: prevTrack },
    });
    const btnPlay = U.create("button", {
      className: `${MOD_ID}-btn`,
      type: "button",
      title: "Play / Pause",
      html: icons.play,
      events: { click: togglePlay },
    });
    const btnNext = U.create("button", {
      className: `${MOD_ID}-btn`,
      type: "button",
      title: "Next track",
      html: icons.next,
      events: { click: nextTrack },
    });
    const btnPip = U.create("button", {
      className: `${MOD_ID}-btn`,
      type: "button",
      title: "Picture in Picture",
      html: icons.pip,
      events: { click: togglePiP },
    });
    const btnMute = U.create("button", {
      className: `${MOD_ID}-btn`,
      type: "button",
      title: "Mute / Unmute",
      html: icons.volume,
      events: {
        click: toggleMute,
        mouseenter() {
          showVolSlider();
        },
        // FIX 8: retract the volume flyout when leaving the mute button,
        // unless the pointer moves into the flyout itself (cancelVolHide there)
        mouseleave() {
          hideVolSlider();
        },
      },
    });
    const spacer = U.create("div", { className: `${MOD_ID}-spacer` });

    // Music trail: floating notes — absolutely positioned on the card, behind content
    const musicTrail = U.create("div", { className: `${MOD_ID}-music-trail` });
    if (SETTINGS.showMusicNotes) {
      for (const glyph of ["\u266a", "\u266b", "\u266a", "\u266b"]) {
        U.create(
          "span",
          { className: `${MOD_ID}-music-note`, text: glyph },
          musicTrail,
        );
      }
    }

    const controls = U.create(
      "div",
      { className: `${MOD_ID}-controls` },
      null,
      [btnTab, btnPrev, btnPlay, btnNext, spacer, btnPip, btnMute],
    );

    const barValue = U.create("div", { className: `${MOD_ID}-barValue` });
    const bar = U.create("div", { className: `${MOD_ID}-bar` }, null, barValue);
    const time = U.create("div", {
      className: `${MOD_ID}-time`,
      text: "0:00 / 0:00",
    });
    const progressWrap = U.create(
      "div",
      { className: `${MOD_ID}-progressWrap` },
      null,
      [bar, time],
    );

    // FIX: single panel wrapper — controls + progressWrap collapsed together so
    // there is truly zero height (and zero row-gap) in compact mode
    const panel = U.create("div", { className: `${MOD_ID}-panel` }, null, [
      controls,
      progressWrap,
    ]);

    // v13: drag-to-seek with hover time preview (replaces click-only seek;
    // a plain click is just a zero-distance drag)
    const seekTip = U.create("div", { className: `${MOD_ID}-seek-tip` });

    function seekRatio(e) {
      const rect = bar.getBoundingClientRect();
      if (!rect.width) return 0;
      return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    }
    function positionSeekTip(e, timeSec) {
      const cardRect = state.card.getBoundingClientRect();
      const barRect = bar.getBoundingClientRect();
      seekTip.textContent = U.formatTime(timeSec);
      seekTip.style.left = `${e.clientX - cardRect.left}px`;
      seekTip.style.top = `${barRect.top - cardRect.top - 4}px`;
      seekTip.classList.add("visible");
    }
    function hideSeekTip() {
      seekTip.classList.remove("visible");
    }
    function previewSeek(item, ratio, e) {
      const t = ratio * item.duration;
      state.els.barValue.style.width = `${ratio * 100}%`;
      state.els.time.textContent = `${U.formatTime(t)} / ${U.formatTime(item.duration)}`;
      if (e) positionSeekTip(e, t);
      return t;
    }

    bar.addEventListener("mousemove", (e) => {
      if (state.seekDragging) return; // drag handler owns the tooltip
      const item = topItem();
      if (!item || !item.duration) return;
      positionSeekTip(e, seekRatio(e) * item.duration);
    });
    bar.addEventListener("mouseleave", () => {
      if (!state.seekDragging) hideSeekTip();
    });

    bar.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const item = topItem();
      if (!item || !item.duration) return;
      state.seekDragging = true;
      previewSeek(item, seekRatio(e), e);
      const onMove = (ev) => {
        ev.preventDefault();
        previewSeek(item, seekRatio(ev), ev);
      };
      const onUp = (ev) => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        const t = seekRatio(ev) * item.duration;
        send(item, "seek", { time: t });
        item.currentTime = t;
        // v13.1: ignore stale position reports until the page reaches ~t
        state.pendingSeek = {
          tabId: item.tabId,
          t,
          until: Date.now() + SETTINGS.seekEchoGraceMs,
        };
        state.seekDragging = false;
        hideSeekTip();
        setProgress(item);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });

    // v13: click the time label to toggle remaining-time display
    time.title = "Toggle remaining time";
    time.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      state.showRemaining = !state.showRemaining;
      const item = topItem();
      if (item) setProgress(item);
    });

    state.card = U.create(
      "div",
      {
        className: `${MOD_ID}-card`,
        events: {
          focusin() {
            scheduleExpand();
          },
          focusout() {
            scheduleCollapse();
          },
          click(e) {
            if (e.target.closest(`.${MOD_ID}-btn`)) return;
            if (e.target.closest(`.${MOD_ID}-bar`)) return;
            if (e.target.closest(`.${MOD_ID}-art-wrap`)) return;
            if (e.target.closest(`.${MOD_ID}-time`)) return;
            // v13: in click-expand mode the first click opens the panel
            if (SETTINGS.expandOn === "click" && !state.expanded) {
              setExpanded(true);
              return;
            }
            focusTab(e);
          },
        },
      },
      state.host,
      [artWrap, meta, panel, musicTrail, seekTip],
    );

    // v15: the fluid turbulence canvas (96x36, CSS-upscaled). Sits at
    // z-index 0 under the content (z-index 2) and under the ::after
    // readability overlay; fades in/out with the viz-live class.
    const vizCanvas = U.create(
      "canvas",
      { className: `${MOD_ID}-viz-canvas`, width: VIZ_W, height: VIZ_H },
      state.card,
    );
    state.vizImg = null;
    try {
      state.vizCtx2d = vizCanvas.getContext("2d");
    } catch {
      state.vizCtx2d = null; // no 2d context = fluid simply doesn't paint
    }

    // v13: middle-click anywhere on the card toggles play/pause;
    // in "click" expand mode, the first left-click expands instead of focusing
    if (SETTINGS.middleClickPlayPause) {
      state.card.addEventListener("auxclick", (e) => {
        if (e.button !== 1) return;
        e.preventDefault();
        e.stopPropagation();
        togglePlay(e);
      });
    }

    // Volume slider panel — custom div-based vertical slider
    const volFill = U.create("div", { className: `${MOD_ID}-vol-fill` });
    const volThumb = U.create("div", { className: `${MOD_ID}-vol-thumb` });
    const volTrack = U.create(
      "div",
      { className: `${MOD_ID}-vol-track` },
      null,
      [volFill, volThumb],
    );

    function setVolFromY(clientY) {
      const rect = volTrack.getBoundingClientRect();
      const pct = Math.max(
        0,
        Math.min(
          100,
          Math.round(((rect.bottom - clientY) / rect.height) * 100),
        ),
      );
      volFill.style.height = `${pct}%`;
      volThumb.style.bottom = `${pct}%`;
      const item = topItem();
      if (!item) return;
      const vol = pct / 100;
      send(item, "volume", { volume: vol });
      item.volume = vol;
      item.muted = vol === 0;
      setPendingVolume(item, vol, vol === 0); // v13.1: echo suppression
      if (state.els) {
        state.els.btnMute.innerHTML =
          item.muted || item.volume === 0 ? icons.mute : icons.volume;
      }
    }

    volTrack.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      state.volDragging = true;
      setVolFromY(e.clientY);
      const onMove = (ev) => {
        ev.preventDefault();
        setVolFromY(ev.clientY);
      };
      const onUp = () => {
        state.volDragging = false;
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });

    const volPanel = U.create(
      "div",
      {
        className: `${MOD_ID}-vol-panel`,
        // FIX 8: keep the flyout open while hovering it; retract on leave
        events: {
          mouseenter() {
            cancelVolHide();
          },
          mouseleave() {
            hideVolSlider();
          },
        },
      },
      state.host,
      [volTrack],
    );

    state.els = {
      art,
      favicon,
      mediaCount,
      title,
      subtitle,
      btnPlay,
      btnPrev,
      btnNext,
      btnMute,
      btnTab,
      btnPip,
      btnClose,
      barValue,
      time,
      panel,
      musicTrail,
      volPanel,
      volFill,
      volThumb,
    };
    attachLayoutWatchers(target);
    applyCurrentPalette(null);
    updateDockPosition();
    return state.host;
  }

  // Index of the item the user has manually cycled to (-1 = auto / not set)
  let pinnedTabId = -1;

  // v13: optionally restrict the dock to media belonging to this window
  function visibleItems() {
    const items = [...state.items.values()];
    return SETTINGS.windowScopedMedia
      ? items.filter((i) => i.windowId === window.vivaldiWindowId)
      : items;
  }

  function topItem() {
    const items = visibleItems();
    if (!items.length) return null;

    // If user has pinned a specific media via cycling, honour it
    if (pinnedTabId !== -1) {
      const pinned = items.find((i) => i.tabId === pinnedTabId);
      if (pinned) return pinned;
      pinnedTabId = -1; // pinned item gone, fall back to auto
    }

    items.sort(
      (a, b) =>
        (b.windowId === window.vivaldiWindowId ? 100 : 0) +
        (b.active ? 60 : 0) +
        (!b.paused ? 100 : 0) +
        (b.lastUpdated || 0) / 1e11 -
        ((a.windowId === window.vivaldiWindowId ? 100 : 0) +
          (a.active ? 60 : 0) +
          (!a.paused ? 100 : 0) +
          (a.lastUpdated || 0) / 1e11),
    );
    return items[0];
  }

  function cycleMedia(direction = 1) {
    const items = visibleItems();
    if (items.length < 2) return; // nothing to cycle
    const current = topItem();
    const currentIdx = current
      ? items.findIndex((i) => i.tabId === current.tabId)
      : -1;
    const nextIdx = (currentIdx + direction + items.length) % items.length;
    pinnedTabId = items[nextIdx].tabId;
    render();
  }

  function render() {
    const host = ensureDock();
    if (!host || !state.els) return;
    const item = topItem();
    if (!item) {
      host.classList.add("hidden");
      state.lastTabId = null;
      state.activeArtSrc = null;
      setExpanded(false);
      applyCurrentPalette(null);
      stopTick();
      syncViz(null); // v14: stop analysis when nothing is shown
      return;
    }

    host.classList.remove("hidden");
    state.lastTabId = item.tabId;
    // FIX 12 + v13: sanitized fallback chain artwork -> page favicon -> chrome favicon
    const artSrc =
      U.safeImageSrc(item.image) || item.pageIcon || U.favicon(item.url);
    state.els.art.src = artSrc;
    // Show site favicon badge on artwork (page-reported icon preferred — the
    // chrome://favicon/ endpoint is deprecated and often blank on new builds)
    const faviconSrc = item.pageIcon || (item.url ? U.favicon(item.url) : "");
    if (faviconSrc && faviconSrc !== artSrc) {
      state.els.favicon.src = faviconSrc;
      state.els.favicon.style.display = "";
    } else {
      state.els.favicon.style.display = "none";
    }
    // Update media count badge (window-scoped if configured)
    const totalVisible = visibleItems().length;
    if (totalVisible >= 2) {
      state.els.mediaCount.textContent = `${totalVisible}`;
      state.els.mediaCount.classList.add("visible");
    } else {
      state.els.mediaCount.classList.remove("visible");
    }
    state.els.title.textContent = item.title || item.tabTitle || "Media";
    // v13: append playback rate when it isn't 1x
    let subtitle = item.artist || item.hostname || "";
    if (
      SETTINGS.showPlaybackRate &&
      item.rate &&
      Math.abs(item.rate - 1) > 0.01
    ) {
      const rateStr = `${Math.round(item.rate * 100) / 100}\u00d7`;
      subtitle = subtitle ? `${subtitle} \u00b7 ${rateStr}` : rateStr;
    }
    state.els.subtitle.textContent = subtitle;
    state.els.btnPlay.innerHTML = item.paused ? icons.play : icons.pause;
    state.els.btnMute.innerHTML =
      item.muted || item.volume === 0 ? icons.mute : icons.volume;
    if (!state.volDragging) {
      const volPct = item.muted ? 0 : Math.round((item.volume ?? 1) * 100);
      state.els.volFill.style.height = `${volPct}%`;
      state.els.volThumb.style.bottom = `${volPct}%`;
    }
    state.els.btnPip.style.display = item.audio ? "none" : "";
    // Show music trail only when playing (and enabled)
    state.els.musicTrail.classList.toggle(
      "active",
      SETTINGS.showMusicNotes && !item.paused,
    );
    setProgress(item);
    state.activeArtSrc = artSrc;
    applyCurrentPalette(artSrc);
    extractArtColor(artSrc);
    updateDockPosition();
    // v13: only tick while actually playing (no interval for paused items)
    if (item.paused) stopTick();
    else startTick();
    syncViz(item); // v14: analyse the displayed tab while it plays
  }

  function setProgress(item) {
    if (state.seekDragging) return; // v13: don't fight the user's drag preview
    const dur = Number(item.duration) || 0;
    const cur = Number(item.currentTime) || 0;
    const pct = dur > 0 ? Math.max(0, Math.min(100, (cur / dur) * 100)) : 0;
    state.els.barValue.style.width = `${pct}%`;
    // v13: click the time label to toggle "-remaining / total"
    state.els.time.textContent = state.showRemaining
      ? `-${U.formatTime(Math.max(0, dur - cur))} / ${U.formatTime(dur)}`
      : `${U.formatTime(cur)} / ${U.formatTime(dur)}`;
  }

  function startTick() {
    stopTick();
    state.tickTimer = setInterval(() => {
      const item = state.items.get(state.lastTabId);
      if (!item || item.paused) return;
      item.currentTime = Number(item.currentTime || 0) + 1;
      setProgress(item);
    }, DOCK_UPDATE_INTERVAL);
  }

  function stopTick() {
    if (state.tickTimer) clearInterval(state.tickTimer);
    state.tickTimer = null;
  }

  // ── v14: visualizer (UI side) ────────────────────────────────────────────
  // Receives compact band energies from the analysed tab (~15Hz), smooths
  // them at 60fps, and writes them as CSS variables on the CARD ONLY. The
  // card's ::before gradient is the sole consumer — nothing else reacts.

  function vizEnabled() {
    if (!SETTINGS.visualizer || SETTINGS.visualizerIntensity <= 0) return false;
    if (
      SETTINGS.visualizerReducedMotion &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return false;
    return true;
  }

  function handleVizPacket(senderTabId, viz) {
    if (!vizEnabled() || !state.card) return;
    if (senderTabId !== state.vizTabId) return; // only the displayed tab
    const c = (v) => U.clamp(Number(v) || 0, 0, 1);
    state.vizTarget = {
      b: c(viz.b),
      m: c(viz.m),
      t: c(viz.t),
      l: c(viz.l),
      k: c(viz.k),
      v: c(viz.v),
    };
    state.vizLastPacket = Date.now();
    startVizLoop();
  }

  // ── v15: fluid turbulence renderer ──────────────────────────────────────
  // The "ChatGPT voice orb" look is rendered turbulence: FBM value noise,
  // domain-warped by more FBM — fbm(p + fbm(p + t)). Painted per-pixel to a
  // 96x36 canvas and upscaled smoothly by the browser.

  function vizHash(ix, iy) {
    let h = (ix * 374761393 + iy * 668265263) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }
  function vizNoise(x, y) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    let fx = x - ix;
    let fy = y - iy;
    fx = fx * fx * (3 - 2 * fx); // smoothstep
    fy = fy * fy * (3 - 2 * fy);
    const a = vizHash(ix, iy);
    const b = vizHash(ix + 1, iy);
    const c = vizHash(ix, iy + 1);
    const d = vizHash(ix + 1, iy + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  }
  function vizFbm2(x, y) {
    return 0.667 * vizNoise(x, y) + 0.333 * vizNoise(x * 2.13, y * 2.13);
  }
  function vizFbm3(x, y) {
    return (
      0.571 * vizNoise(x, y) +
      0.286 * vizNoise(x * 2.07, y * 2.07) +
      0.143 * vizNoise(x * 4.31, y * 4.31)
    );
  }

  // 256-entry palette LUT: deep background -> artwork colors -> bright
  // foreground wisps. Rebuilt whenever the dock palette changes.
  function buildVizLut(p) {
    if (!p) return;
    const px = (hex, fb) => U.parseCssColor(hex) || fb;
    const dark = U.mix(p.bgRgb, { r: 6, g: 8, b: 14 }, 0.45);
    const c1 = px(p.art1, p.topRgb);
    const c2 = px(p.art2, p.accentRgb);
    const c3 = px(p.art3, p.accentRgb);
    const hi = U.mix(p.fgRgb, c3, 0.68);
    // v15.3: deep tones own ~85% of the range; highs dimmer and rarer
    const stops = [
      [0.0, U.mix(dark, { r: 2, g: 3, b: 6 }, 0.5)],
      [0.6, U.mix(dark, c1, 0.38)],
      [0.84, U.mix(c1, c2, 0.6)],
      [0.96, U.mix(c2, c3, 0.45)],
      [1.0, hi],
    ];
    const lut = new Uint8ClampedArray(256 * 3);
    for (let i = 0; i < 256; i++) {
      const v = i / 255;
      let s = 0;
      while (s < stops.length - 2 && v > stops[s + 1][0]) s++;
      const [v0, a] = stops[s];
      const [v1, b] = stops[s + 1];
      const t = U.clamp((v - v0) / (v1 - v0 || 1), 0, 1);
      const m = U.mix(a, b, t);
      lut[i * 3] = m.r;
      lut[i * 3 + 1] = m.g;
      lut[i * 3 + 2] = m.b;
    }
    state.vizLut = lut;
  }

  function vizPaint() {
    const ctx = state.vizCtx2d;
    const lut = state.vizLut;
    if (!ctx || !lut) return;
    if (!state.vizImg) state.vizImg = ctx.createImageData(VIZ_W, VIZ_H);
    const data = state.vizImg.data;
    const fast = state.vizFast;
    const env = state.vizEnv;
    const t1 = state.vizT1;
    const t2 = state.vizT2;
    // v15.1: treble feeds the warp depth (was a per-pixel noise call —
    // the single most expensive term in the renderer)
    const warp = 1.15 + env * 1.8 + fast.t * 0.4 + state.vizKick * 0.55;
    const contrast = 1.0 + env * 0.32;
    const lift = fast.l * 0.018 - 0.085 + state.vizVoice * 0.01;
    // v15.2: vocal presence expands the bright top of the field — wisps
    // bloom while someone sings, recede in instrumental passages
    const hiGain = 1 + state.vizVoice * 1.15;
    let i = 0;
    for (let y = 0; y < VIZ_H; y++) {
      const py = y * 0.075;
      for (let x = 0; x < VIZ_W; x++) {
        const pxx = x * 0.052;
        // domain warp: fbm(p + fbm(p + t))
        const qx = vizFbm2(pxx + 0.3 * t1, py + 0.11 * t2);
        const qy = vizFbm2(pxx + 5.2 + 0.26 * t2, py + 1.3 + 0.09 * t1);
        let v = vizFbm3(pxx + warp * qx + 0.15 * t1, py + warp * qy + 0.1 * t2);
        v = (v - 0.22) / 0.56; // normalize fbm's natural range
        v = 0.5 + (v - 0.5) * contrast + lift;
        if (v > 0.72) v = 0.72 + (v - 0.72) * hiGain;
        const idx = (v <= 0 ? 0 : v >= 1 ? 255 : (v * 255) | 0) * 3;
        data[i] = lut[idx];
        data[i + 1] = lut[idx + 1];
        data[i + 2] = lut[idx + 2];
        data[i + 3] = 255;
        i += 4;
      }
    }
    ctx.putImageData(state.vizImg, 0, 0);
  }

  function startVizLoop() {
    if (state.vizRaf) return;
    state.vizLastTs = 0;
    const step = (ts) => {
      state.vizRaf = 0;
      if (!state.card) return;
      const dt = state.vizLastTs
        ? Math.min(0.05, (ts - state.vizLastTs) / 1000)
        : 0.016;
      state.vizLastTs = ts;

      // Packets stopped (pause/tab gone)? Targets decay to rest.
      if (Date.now() - state.vizLastPacket > 1200)
        state.vizTarget = { b: 0, m: 0, t: 0, l: 0, k: 0, v: 0 };
      const tgt = state.vizTarget;
      const fast = state.vizFast;
      const k = U.clamp(SETTINGS.visualizerIntensity, 0, 1.5);

      // Fast smoothing -> turbulence SPEED (beats become surges of motion;
      // the field's position integrates speed, so it's inherently smooth).
      // Time-constant form: identical feel on 60Hz, 120Hz, or slow frames.
      const fAttack = 1 - Math.exp(-dt / 0.028);
      const fRelease = 1 - Math.exp(-dt / 0.072);
      for (const key of ["b", "m", "t", "l"]) {
        const rate = tgt[key] > fast[key] ? fAttack : fRelease;
        fast[key] += (tgt[key] - fast[key]) * rate;
        if (fast[key] < 0.003) fast[key] = 0;
      }
      // Slow envelope -> warp depth + contrast (never per-beat)
      state.vizEnv += (fast.l * k - state.vizEnv) * (1 - Math.exp(-dt / 0.35));
      if (state.vizEnv < 0.003) state.vizEnv = 0;
      // v15.2: kick pulse — instant attack, ~150ms exponential decay
      state.vizKick *= Math.exp(-dt / 0.15);
      if (tgt.k * k > state.vizKick) state.vizKick = tgt.k * k;
      if (state.vizKick < 0.004) state.vizKick = 0;
      // v15.2: vocal presence — quick attack (syllables), moderate release
      const vRate = tgt.v > state.vizVoice ? 0.16 : 0.32;
      state.vizVoice +=
        (tgt.v * k - state.vizVoice) * (1 - Math.exp(-dt / vRate));
      if (state.vizVoice < 0.004) state.vizVoice = 0;

      // Audio advances the turbulence clocks: bass churns the primary warp,
      // mids stir the secondary, and each KICK surges the whole field —
      // idle drift keeps it alive in silence
      const lyricLoudnessDrive = U.clamp(
        state.vizVoice * 0.7 + state.vizEnv * 0.65,
        0,
        1.35,
      );

      state.vizT1 +=
        dt *
        (0.12 +
          lyricLoudnessDrive * 1.2 +
          fast.b * 0.08 * k +
          state.vizKick * 0.1);

      state.vizT2 +=
        dt *
        (0.09 +
          lyricLoudnessDrive * 0.95 +
          fast.m * 0.1 * k +
          fast.t * 0.04 * k +
          state.vizKick * 0.06);

      state.card.style.setProperty("--viz-env", state.vizEnv.toFixed(3));
      // v15.1: cap painting at 30fps (20fps if frames are expensive on this
      // machine). The turbulence clocks are time-based, so capped painting
      // changes motion smoothness, not motion speed — and halves the cost.
      const paintInterval = state.vizPaintCost > 6 ? 50 : 31;
      if (ts - state.vizLastPaint >= paintInterval) {
        state.vizLastPaint = ts;
        const t0 = performance.now();
        vizPaint();
        const cost = performance.now() - t0;
        state.vizPaintCost = state.vizPaintCost
          ? state.vizPaintCost * 0.9 + cost * 0.1
          : cost;
      }

      // Keep rendering while subscribed; once unsubscribed, run until the
      // envelope settles (the canvas is fading out via CSS meanwhile)
      const live =
        state.vizTabId != null ||
        state.vizEnv > 0 ||
        ["b", "m", "t", "l"].some((key) => fast[key] > 0);
      if (live) state.vizRaf = requestAnimationFrame(step);
    };
    state.vizRaf = requestAnimationFrame(step);
  }

  // Tell the displayed tab to start analysing; tell the previous one to stop.
  function syncViz(item) {
    const want =
      vizEnabled() && item && !item.paused && state.host && state.els
        ? item.tabId
        : null;
    // v14.2: the class hands background-position control to the flow field;
    // re-assert it every call since ensureDock can rebuild the card
    if (state.card)
      state.card.classList.toggle(
        "viz-live",
        state.vizTabId != null || want != null,
      );
    if (state.vizTabId === want) return;
    if (state.vizTabId != null) {
      const prev = state.items.get(state.vizTabId);
      if (prev) send(prev, "viz-stop");
    }
    state.vizTabId = want;
    if (state.card) state.card.classList.toggle("viz-live", want != null);
    if (want != null) {
      send(item, "viz-start", {
        hz: U.clamp(Number(SETTINGS.visualizerRateHz) || 15, 5, 30),
      });
      startVizLoop(); // v14.2: idle flow starts immediately, music speeds it up
    } else {
      state.vizLastPacket = 0; // let the loop decay and hand back to CSS drift
    }
  }

  function send(item, action, extra = {}) {
    if (!item) return;
    try {
      chrome.tabs.sendMessage(
        item.tabId,
        {
          type: MESSAGE_TYPE,
          action,
          tabId: item.tabId,
          frameId: item.frameId,
          ...extra,
        },
        { frameId: item.frameId || 0 },
        // FIX 17: reading lastError marks it handled (no console noise when
        // the receiving tab has navigated away / has no listener yet)
        () => void chrome.runtime.lastError,
      );
    } catch {}
  }

  function prevTrack(e) {
    e.preventDefault();
    e.stopPropagation();
    const item = topItem();
    if (!item) return;
    send(item, "previoustrack");
  }

  function nextTrack(e) {
    e.preventDefault();
    e.stopPropagation();
    const item = topItem();
    if (!item) return;
    send(item, "nexttrack");
  }

  function togglePlay(e) {
    e.preventDefault();
    e.stopPropagation();
    const item = topItem();
    if (!item) return;
    send(item, item.paused ? "play" : "pause");
    item.paused = !item.paused;
    render();
  }

  function toggleMute(e) {
    e.preventDefault();
    e.stopPropagation();
    const item = topItem();
    if (!item) return;
    send(item, "muted");
    // Mirror the page-side logic: unmuting from volume 0 restores volume
    if (item.volume === 0) {
      item.volume = 1;
      item.muted = false;
    } else {
      item.muted = !item.muted;
    }
    // v13.1: a stale echo right after the click used to flip it back
    setPendingVolume(item, item.volume ?? 1, item.muted);
    render();
  }

  function focusTab(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const item = topItem();
    if (!item) return;

    // In modern Vivaldi, chrome.tabs.get SUCCEEDS for web panel tabs too — they are
    // accessible via the tabs API. The reliable discriminator is tab.index:
    // normal tabs have index >= 0; web panel tabs have index === -1 (not in the tab strip).
    chrome.tabs.get(item.tabId, (tab) => {
      const isWebPanel = !!chrome.runtime.lastError || !tab || tab.index < 0;

      if (!isWebPanel) {
        // Normal tab — just activate it.
        chrome.tabs.update(item.tabId, { active: true }, () => {
          if (chrome.runtime.lastError) return; // FIX 17
          chrome.windows.update(item.windowId, { focused: true }, () => {
            void chrome.runtime.lastError; // FIX 17
            send(item, "scroll-into-view");
          });
        });
        return;
      }

      // Web Panel path — delegated to versioned helpers below
      activateWebPanel(item);
    });
  }

  // ── Web Panel activation ───────────────────────────────────────────────
  //
  // Vivaldi 7.9 restructured the sidebar DOM significantly for its new
  // Auto-Hide UI feature:
  //
  //   WEBVIEWS:  Vivaldi 7.x+ puts panel webviews in .webpanel-stack.
  //              Older builds kept them inside #panels-container > #panels.
  //
  //   BUTTONS:   Each panel button in #switch is now a .button-toolbar-webpanel
  //              wrapper div containing a <button name="WEBPANEL_N">.
  //              The active one gets class "active" on the wrapper.
  //              (Old builds used bare button.panelbtn directly in #switch.)
  //
  //   AUTOHIDE:  The whole panels-container may sit inside .auto-hide-wrapper,
  //              but #switch and .webpanel-stack remain queryable from document.
  //
  // v13: factored into small helpers so the next Vivaldi restructure is a
  // one-function patch. Strategies are tried newest-first.

  const PANEL_WEBVIEW_SELECTORS = [
    ".webpanel-stack webview", // Vivaldi 7.x+ (primary)
    ".webpanel-stack iframe",
    "#panels webview", // older builds
    "#panels iframe",
    "#panels-container webview",
    "#panels-container iframe",
  ].join(", ");

  function findPanelWebview(item) {
    try {
      const webviews = Array.from(
        document.querySelectorAll(PANEL_WEBVIEW_SELECTORS),
      );

      // Primary: match by web-contents ID (same as tabId)
      for (const wv of webviews) {
        try {
          if (
            typeof wv.getWebContentsId === "function" &&
            wv.getWebContentsId() === item.tabId
          )
            return wv;
        } catch {}
      }

      // Fallback: match by URL hostname
      if (item.hostname) {
        for (const wv of webviews) {
          const src = wv.src || wv.getAttribute("src") || "";
          if (!src) continue;
          try {
            const wvHost = new URL(src).hostname.replace(/^www\./, "");
            if (wvHost === item.hostname || src.includes(item.hostname))
              return wv;
          } catch {}
        }
      }
    } catch {}
    return null;
  }

  // Strategy A: Vivaldi 7.9+ — .button-toolbar-webpanel wrappers in #switch,
  // each holding a <button name="WEBPANEL_N">. Webview position matches
  // wrapper position; button title usually contains the panel hostname.
  function activatePanelButtonModern(item, panelWv) {
    try {
      const allWvs = Array.from(
        document.querySelectorAll(PANEL_WEBVIEW_SELECTORS),
      );
      const wvIdx = allWvs.indexOf(panelWv);

      const wrappers = Array.from(
        document.querySelectorAll(
          "#switch .button-toolbar-webpanel, #panels-container .button-toolbar-webpanel",
        ),
      );

      let targetWrapper = null;

      // A1: match by button title containing hostname
      if (item.hostname) {
        const hostPart = item.hostname.split(".")[0]; // e.g. "music"
        targetWrapper = wrappers.find((w) => {
          const btn = w.querySelector("button");
          const t = (
            btn?.title ||
            btn?.getAttribute("data-tooltip") ||
            ""
          ).toLowerCase();
          return t.includes(item.hostname) || t.includes(hostPart);
        });
      }

      // A2: positional index
      if (!targetWrapper && wvIdx >= 0 && wvIdx < wrappers.length)
        targetWrapper = wrappers[wvIdx];

      if (targetWrapper) {
        if (!targetWrapper.classList.contains("active")) {
          const innerBtn = targetWrapper.querySelector("button");
          if (innerBtn) innerBtn.click();
        }
        return true;
      }
    } catch {}
    return false;
  }

  // Strategy B: legacy bare button.panelbtn in #switch (older Vivaldi)
  function activatePanelButtonLegacy(panelWv) {
    try {
      const panelDiv = panelWv.closest(".webpanel, .webpanel-content, .panel");
      if (!panelDiv) return false;
      const panId =
        panelDiv.id ||
        panelDiv.getAttribute("data-id") ||
        panelDiv.getAttribute("data-panelid");
      let btn = null;
      if (panId) {
        btn = document.querySelector(
          `#switch button[aria-controls="${panId}"],` +
            `#switch button[value="${panId}"],` +
            `#switch button[name="${panId}"]`,
        );
        if (!btn) btn = document.getElementById(`switch-${panId}`);
        if (!btn) {
          btn = Array.from(
            document.querySelectorAll("#switch button.panelbtn"),
          ).find(
            (b) =>
              (b.id && b.id.includes(panId)) ||
              b.getAttribute("data-id") === panId ||
              b.name === panId,
          );
        }
      }
      // Index fallback
      if (!btn) {
        const allPanels = Array.from(
          document.querySelectorAll(
            ".webpanel-stack .webpanel, #panels-container .panel, #panels .panel",
          ),
        );
        const idx = allPanels.indexOf(panelDiv);
        if (idx >= 0) {
          const panelBtns = document.querySelectorAll(
            "#switch button.panelbtn",
          );
          if (idx < panelBtns.length) btn = panelBtns[idx];
        }
      }
      if (btn) {
        const wrapper = btn.closest(".button-toolbar-webpanel") || btn;
        if (!wrapper.classList.contains("active")) btn.click();
        return true;
      }
    } catch {}
    return false;
  }

  function activateWebPanel(item) {
    const panelWv = findPanelWebview(item);
    if (!panelWv) return;
    if (!activatePanelButtonModern(item, panelWv))
      activatePanelButtonLegacy(panelWv);
    send(item, "scroll-into-view");
  }

  function togglePiP(e) {
    e.preventDefault();
    e.stopPropagation();
    const item = topItem();
    if (!item || item.audio) return;
    send(item, "picture-in-picture");
  }

  function closeMedia(e) {
    e.preventDefault();
    e.stopPropagation();
    const item = topItem();
    if (!item) return;
    send(item, "close");
    state.items.delete(item.tabId);
    // If the closed item was the pinned one, reset pin
    if (pinnedTabId === item.tabId) pinnedTabId = -1;
    render();
  }

  function normalize(tab, info) {
    const tabId = tab?.id || tab?.tabId;
    const url = tab?.url || "";
    let hostname = "";
    try {
      hostname = new URL(url).hostname.replace(/^www\./, "");
    } catch {}
    return {
      tabId,
      frameId: info.frameId || 0,
      windowId: tab?.windowId,
      active: !!tab?.active,
      tabTitle: tab?.title || "",
      url,
      hostname,
      image: info.image || "",
      title: info.title || tab?.title || "",
      artist: info.artist || "",
      paused: !!info.paused,
      audio: !!info.audio,
      pictureInPicture: !!info.pictureInPicture,
      // FIX 12: clamp page-supplied volume to a sane [0,1] range
      volume: U.clamp(
        typeof info.volume === "number"
          ? info.volume
          : parseFloat(info.volume || 0) || 0,
        0,
        1,
      ),
      muted: !!info.muted,
      // v13: playback rate + page-reported favicon (already absolute; sanitize)
      rate: Number(info.rate) || 1,
      pageIcon: U.safeImageSrc(info.pageIcon || ""),
      duration: Number(info.duration) || 0,
      currentTime: Number(info.currentTime) || 0,
      lastUpdated: Date.now(),
    };
  }

  async function updateItem(tab, info) {
    const tabId = tab?.id || tab?.tabId;
    if (!tabId) return;
    if (info.ended) {
      state.items.delete(tabId);
      render();
      return;
    }
    let fullTab = tab;
    try {
      fullTab = await chrome.tabs.get(tabId);
    } catch {}
    const norm = normalize(fullTab, info);

    // ── v13.1: echo suppression ─────────────────────────────────────────
    // Page state reports are asynchronous; right after the dock changes
    // volume or seeks, in-flight reports still carry the PRE-change value.
    // Accepting them snapped the slider/seekbar back ("touchpad jitter").
    // Until the page's report matches what we set (or a grace timeout
    // passes), keep our optimistic value for that property.
    const pv = state.pendingVolume;
    if (pv && pv.tabId === tabId) {
      const matches =
        !!norm.muted === !!pv.muted && Math.abs(norm.volume - pv.volume) < 0.02;
      if (matches || Date.now() >= pv.until) {
        state.pendingVolume = null; // page caught up (or gave up waiting)
      } else {
        norm.volume = pv.volume;
        norm.muted = pv.muted;
      }
    }
    const ps = state.pendingSeek;
    if (ps && ps.tabId === tabId) {
      if (Math.abs(norm.currentTime - ps.t) <= 2 || Date.now() >= ps.until) {
        state.pendingSeek = null; // position converged (or timeout)
      } else {
        norm.currentTime = ps.t;
      }
    }

    state.items.set(tabId, norm);
    render();
  }

  function replaceTabId(addedTabId, removedTabId) {
    if (!state.items.has(removedTabId)) return;
    const item = state.items.get(removedTabId);
    state.items.delete(removedTabId);
    item.tabId = addedTabId;
    state.items.set(addedTabId, item);
    render();
  }

  function activateTab(tabId) {
    for (const item of state.items.values()) item.active = item.tabId === tabId;
    render();
  }

  function injectBridge(messageType) {
    if (window.__vivaldiMiniMediaDockV12BridgeLoaded) return;
    window.__vivaldiMiniMediaDockV12BridgeLoaded = true;
    chrome.runtime.onMessage.addListener((info, sender, sendResponse) => {
      if (info.type !== messageType) return;

      // FIX: unique token per action so listeners don't cross-fire on rapid messages
      const token = `${info.action}-${Date.now()}-${Math.random()}`;
      let settled = false;
      let timeoutId = null; // declared before `done` closes over it

      const done = (event) => {
        // FIX 13: only accept messages from this window (page bridge hardening)
        if (event.source !== window || !event.data) return;
        if (
          event.data.type === `${messageType}-internal` &&
          event.data.data?.action === `${info.action}-end` &&
          event.data._token === token
        ) {
          if (settled) return;
          settled = true;
          clearTimeout(timeoutId);
          window.removeEventListener("message", done);
          if (event.data.data.hasSendResponse) sendResponse();
        }
      };

      // FIX: timeout cleanup so the listener doesn't persist if the tab navigates before responding
      timeoutId = setTimeout(() => {
        if (settled) return;
        settled = true;
        window.removeEventListener("message", done);
        // FIX 14: close the port cleanly — we returned true below, so Chrome
        // keeps the channel open until sendResponse is called
        try {
          sendResponse();
        } catch {}
      }, 5000);

      window.addEventListener("message", done);
      window.postMessage({
        type: `${messageType}-internal`,
        data: info,
        _token: token,
      });
      return true;
    });
    window.addEventListener("message", (event) => {
      // FIX 13: only forward messages originating from this window
      if (event.source !== window) return;
      if (event?.data?.type === messageType)
        chrome.runtime.sendMessage(
          event.data.data,
          // FIX 17: swallow "receiving end does not exist" during UI reloads
          () => void chrome.runtime.lastError,
        );
    });
  }

  function injectMain(messageType, nameAttr) {
    if (window.__vivaldiMiniMediaDockV12MainLoaded) return;
    window.__vivaldiMiniMediaDockV12MainLoaded = true;
    let currentMedia = null;

    // Capture MediaSession action handlers registered by the page
    const capturedHandlers = {};
    if (navigator.mediaSession) {
      const origSetAction = navigator.mediaSession.setActionHandler.bind(
        navigator.mediaSession,
      );
      navigator.mediaSession.setActionHandler = function (action, handler) {
        capturedHandlers[action] = handler;
        return origSetAction(action, handler);
      };
    }
    const playVideoOriginal = HTMLVideoElement.prototype.play;
    const playAudioOriginal = HTMLAudioElement.prototype.play;

    HTMLVideoElement.prototype.play = function () {
      if (!this.__vivaldiMiniMediaDockV12Bound) bind(this);
      return playVideoOriginal.apply(this, arguments);
    };
    HTMLAudioElement.prototype.play = function () {
      if (!this.__vivaldiMiniMediaDockV12Bound) bind(this);
      return playAudioOriginal.apply(this, arguments);
    };
    // v13: the addEventListener prototype patches were removed — the
    // MutationObserver scan() catches every element that enters the DOM and
    // the play() hooks catch detached elements, so they were redundant and
    // the most invasive part of the page footprint.

    function isVideo(m) {
      // FIX 15: videoWidth is available as soon as metadata loads, so videos
      // are recognized immediately (decoded-byte counters start at 0 and made
      // the PiP button flicker in late)
      return (
        m instanceof HTMLVideoElement &&
        (m.videoWidth > 0 || !!m.webkitVideoDecodedByteCount) &&
        !m.disablePictureInPicture
      );
    }
    function hasDecoding(m) {
      return !!(m.webkitAudioDecodedByteCount || m.webkitVideoDecodedByteCount);
    }
    function getImage(m) {
      if (m.poster) return m.poster;
      const art = navigator.mediaSession?.metadata?.artwork;
      return Array.isArray(art) && art[0]?.src ? art[0].src : "";
    }
    // v13: pages know their own favicon; link.href is already absolute.
    // Removes the dependency on the deprecated chrome://favicon/ endpoint.
    function pageIconHref() {
      try {
        const l = document.querySelector(
          'link[rel~="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]',
        );
        return l && l.href ? l.href : "";
      } catch {
        return "";
      }
    }
    function controlData(m) {
      return {
        type: messageType,
        image: getImage(m),
        pageIcon: pageIconHref(),
        title: navigator.mediaSession?.metadata?.title || document.title || "",
        artist: navigator.mediaSession?.metadata?.artist || "",
        paused: m.paused,
        audio: !isVideo(m),
        pictureInPicture: !!document.pictureInPictureElement,
        volume: m.volume,
        muted: m.muted,
        rate: m.playbackRate || 1,
        duration: m.duration,
        currentTime: m.currentTime,
      };
    }
    function emit(m, eventType) {
      // FIX 7: never report dismissed media (close button used to "resurrect"
      // the item because pause() fired onPause which re-emitted it)
      if (m && m.__vivaldiMiniMediaDockV12Dismissed) return;
      window.postMessage({
        type: messageType,
        data: controlData(m),
        eventType,
      });
    }
    function emitEnded() {
      window.postMessage({
        type: messageType,
        data: { type: messageType, ended: true },
      });
    }
    function firstPlaying() {
      return Array.from(document.querySelectorAll("video,audio")).find(
        (m) =>
          !!m &&
          !m.paused &&
          !m.ended &&
          !m.__vivaldiMiniMediaDockV12Dismissed && // FIX 7
          hasDecoding(m) &&
          m.hasAttribute(nameAttr),
      );
    }
    function onTimeLike(ev) {
      const m = ev.target;
      // FIX 7: dismissed media stays hidden while paused; if the user resumes
      // playback on the page itself, un-dismiss so the dock reappears
      if (m.__vivaldiMiniMediaDockV12Dismissed) {
        if (m.paused) return;
        delete m.__vivaldiMiniMediaDockV12Dismissed;
      }
      if (!m.hasAttribute(nameAttr)) m.setAttribute(nameAttr, "");
      if (!m.paused) currentMedia = m;
      // FIX 9: timeupdate fires ~4x/sec; throttle to ~1/sec per element.
      // The dock already interpolates progress locally every second, and
      // play/pause/seek events still go through immediately.
      if (ev.type === "timeupdate") {
        const now = Date.now();
        if (
          m.__vivaldiMiniMediaDockV12LastEmit &&
          now - m.__vivaldiMiniMediaDockV12LastEmit < 950
        )
          return;
        m.__vivaldiMiniMediaDockV12LastEmit = now;
      } else {
        m.__vivaldiMiniMediaDockV12LastEmit = Date.now();
      }
      emit(m, ev.type);
    }
    function onPause(ev) {
      const active = firstPlaying();
      if (active) {
        currentMedia = active;
        emit(active, ev.type);
      } else if (ev.target.__vivaldiMiniMediaDockV12Dismissed) {
        // FIX 7: a dismissed element pausing must not become currentMedia
        // or re-emit (this was the close-button resurrection bug)
        if (currentMedia === ev.target) currentMedia = null;
      } else if (!hasDecoding(ev.target)) {
        currentMedia = null;
        emitEnded();
      } else {
        currentMedia = ev.target;
        emit(ev.target, ev.type);
      }
    }
    function onVolume(ev) {
      if (currentMedia === ev.target) emit(ev.target, ev.type);
    }
    function onRate(ev) {
      // v13: report playback speed changes for the current media
      if (currentMedia === ev.target) emit(ev.target, ev.type);
    }
    function onEnded() {
      const active = firstPlaying();
      if (active) {
        currentMedia = active;
        emit(active, "ended");
      } else {
        currentMedia = null;
        emitEnded();
      }
    }
    function onPiP(ev) {
      if (currentMedia === ev.target) emit(ev.target, ev.type);
    }
    function bind(m) {
      if (!m || m.__vivaldiMiniMediaDockV12Bound) return;
      m.__vivaldiMiniMediaDockV12Bound = true;
      m.setAttribute(nameAttr, "");
      // v13: plain addEventListener — the prototype patches that required
      // saved originals (to avoid recursion) are gone
      m.addEventListener("play", onTimeLike);
      m.addEventListener("playing", onTimeLike);
      m.addEventListener("timeupdate", onTimeLike);
      m.addEventListener("pause", onPause);
      m.addEventListener("volumechange", onVolume);
      m.addEventListener("ratechange", onRate);
      m.addEventListener("ended", onEnded);
      m.addEventListener("error", onEnded);
      m.addEventListener("enterpictureinpicture", onPiP);
      m.addEventListener("leavepictureinpicture", onPiP);
    }
    function scan() {
      document
        .querySelectorAll(`video:not([${nameAttr}]),audio:not([${nameAttr}])`)
        .forEach(bind);
    }

    // ── v13: site-aware volume/mute ─────────────────────────────────────
    //
    // THE PROBLEM: setting m.volume directly changes the audio but the site's
    // own player (YouTube, YouTube Music) keeps its internal volume state.
    // Its slider still shows the old value, and the moment you touch it the
    // volume snaps back ("dock set 40%, YouTube still says 100%").
    //
    // THE FIX: when the page exposes a player API, drive THAT instead of the
    // element. #movie_player on youtube.com / music.youtube.com implements
    // setVolume(0-100) / getVolume / mute / unMute / isMuted, and updating it
    // syncs the site UI, its persisted volume, AND the media element (whose
    // volumechange event then updates the dock — full round trip).
    // injectMain runs in the MAIN world, so these APIs are reachable.
    function sitePlayer() {
      try {
        const p = document.getElementById("movie_player");
        if (p && typeof p.setVolume === "function") return p;
      } catch {}
      return null;
    }
    function siteApplyVolume(v) {
      const p = sitePlayer();
      if (!p) return false;
      try {
        if (v > 0 && typeof p.unMute === "function") p.unMute();
        p.setVolume(Math.round(v * 100));
        return true;
      } catch {
        return false;
      }
    }
    function siteApplyMute(m) {
      const p = sitePlayer();
      if (!p || typeof p.isMuted !== "function") return false;
      try {
        const silent = p.isMuted() || (m && (m.muted || m.volume === 0));
        if (silent) {
          p.unMute();
          // mirror the element-path behavior: unmuting from volume 0 restores audible volume
          if (m && m.volume === 0) p.setVolume(100);
        } else {
          p.mute();
        }
        return true;
      } catch {
        return false;
      }
    }

    // ── v14: audio analyser (visualizer source) ─────────────────────────
    //
    // SAFETY-FIRST DESIGN: we tap the audio with captureStream() ->
    // MediaStreamAudioSourceNode -> AnalyserNode. This is a PASSIVE COPY of
    // the audio. We deliberately do NOT use createMediaElementSource(),
    // which reroutes the element's output through the AudioContext and can
    // SILENCE playback on failure (suspended context, CORS taint, the
    // one-source-per-element rule). With captureStream, the worst possible
    // failure mode is "no visualizer data" — playback is untouchable.
    // DRM/EME media (Spotify web etc.) throws on capture; we catch and the
    // gradient simply stays calm.
    let vizCtx = null;
    let vizAnalyser = null;
    let vizSrc = null;
    let vizEl = null;
    let vizTimer = null;
    let vizData = null;
    let vizZeroStreak = 0; // v14.4: consecutive all-zero samples while playing
    let vizGestureHooked = false; // v14.4: one-shot resume on next interaction

    // v14.4: an AudioContext created without user activation (video started
    // from the dock, autoplay, queue) stays SUSPENDED and analyses as all
    // zeros. resume() succeeds once the user interacts with the page — hook
    // that moment.
    function vizHookGestureResume() {
      if (vizGestureHooked) return;
      vizGestureHooked = true;
      const onGesture = () => {
        try {
          if (vizCtx && vizCtx.state === "suspended")
            vizCtx.resume().catch(() => {});
        } catch {}
      };
      window.addEventListener("pointerdown", onGesture, {
        capture: true,
        passive: true,
      });
      window.addEventListener("keydown", onGesture, {
        capture: true,
        passive: true,
      });
    }

    function vizTeardownSource() {
      try {
        if (vizSrc) vizSrc.disconnect();
      } catch {}
      vizSrc = null;
      vizEl = null;
    }

    function vizStop() {
      if (vizTimer) clearInterval(vizTimer);
      vizTimer = null;
      vizTeardownSource();
      // Suspend (not close) — cheap to resume for the next song
      try {
        if (vizCtx && vizCtx.state === "running") vizCtx.suspend();
      } catch {}
    }

    function vizCapture(m) {
      vizTeardownSource();
      try {
        if (typeof m.captureStream !== "function") return false;
        const stream = m.captureStream();
        if (!stream || !stream.getAudioTracks().length) return false;
        if (!vizAnalyser) {
          vizAnalyser = vizCtx.createAnalyser();
          vizAnalyser.fftSize = 256; // 128 bins — plenty for 3 bands
          vizAnalyser.smoothingTimeConstant = 0.45; // v14.1: snappier (was .55)
          vizData = new Uint8Array(vizAnalyser.frequencyBinCount);
        }
        vizSrc = vizCtx.createMediaStreamSource(stream);
        vizSrc.connect(vizAnalyser); // analyser only — never to destination
        vizEl = m;
        return true;
      } catch {
        vizTeardownSource();
        return false;
      }
    }

    // v14.1: per-band AUTO-GAIN. Raw band energy from real music sits in a
    // narrow range (the average is high, the beat-to-beat swing is small),
    // which made the gradient barely move. Each band tracks an adaptive
    // floor and ceiling and is normalized into them, so quiet podcasts and
    // brickwalled EDM alike swing the full 0..1 range — the SWING is what
    // the eye reads as dancing, not the absolute level.
    const vizGain = {
      b: { lo: 1, hi: 0 },
      m: { lo: 1, hi: 0 },
      t: { lo: 1, hi: 0 },
      l: { lo: 1, hi: 0 },
      v: { lo: 1, hi: 0 }, // v15.2: vocal band
    };
    // v15.2: kick onset detection state — rolling bass-energy window (~3s)
    const vizBassHist = [];
    let vizPrevBass = 0;
    function vizNorm(key, v) {
      const s = vizGain[key];
      s.lo = Math.min(v, s.lo + 0.004); // floor creeps up toward the signal
      s.hi = Math.max(v, s.hi * 0.996); // ceiling sags toward the signal
      const span = s.hi - s.lo;
      if (span < 0.04) return 0; // near-constant signal = nothing to dance to
      return Math.min(1, Math.max(0, (v - s.lo) / span));
    }

    function vizSample() {
      // Follow the dock's notion of "current": if the page swapped elements
      // (rare — most sites reuse one), retarget transparently
      const m = currentMedia || firstPlaying();
      if (!m || m.paused || m.__vivaldiMiniMediaDockV12Dismissed) return;
      if (m !== vizEl && !vizCapture(m)) return;
      if (!vizAnalyser) return;
      // v14.4: a suspended context analyses as silence — keep nudging it
      // (resume succeeds as soon as activation exists; harmless otherwise)
      try {
        if (vizCtx && vizCtx.state === "suspended")
          vizCtx.resume().catch(() => {});
      } catch {}
      try {
        vizAnalyser.getByteFrequencyData(vizData);
        const band = (from, to) => {
          let sum = 0;
          for (let i = from; i < to; i++) sum += vizData[i];
          return sum / ((to - from) * 255);
        };
        // ~24kHz Nyquist / 128 bins ≈ 187Hz per bin:
        const bass = band(0, 6); // <~1.1kHz weighted low
        const mid = band(6, 40); // ~1-7.5kHz
        const treble = band(40, 100); // ~7.5-19kHz
        const level = band(0, 100);
        const voiceRaw = band(2, 19); // ~370Hz-3.5kHz — where vocals live
        // v15.2: kick = bass onset (energy spikes above the rolling mean,
        // rising-edge gated so sustained bass doesn't read as drumming)
        vizBassHist.push(bass);
        if (vizBassHist.length > 60) vizBassHist.shift();
        let kick = 0;
        if (vizBassHist.length > 12) {
          let mean = 0;
          for (let i = 0; i < vizBassHist.length; i++) mean += vizBassHist[i];
          mean /= vizBassHist.length;
          if (mean > 0.01 && bass > vizPrevBass) {
            const r = bass / mean;
            if (r > 1.22) kick = Math.min(1, (r - 1.22) / 0.7);
          }
        }
        vizPrevBass = bass;
        // v14.4: sustained dead silence while audibly playing means the tap
        // is broken (suspended ctx, or the captured track went silent after
        // the site reconfigured its source) — rebuild the whole tap.
        // Genuinely muted/zero-volume media is excluded: silence is correct.
        if (level === 0 && !m.muted && m.volume > 0) {
          if (++vizZeroStreak === 24) {
            // ~1.6s @15Hz
            vizZeroStreak = 0;
            vizTeardownSource();
            vizCapture(m); // fresh captureStream + fresh source node
            return;
          }
        } else {
          vizZeroStreak = 0;
        }
        // v14.1: auto-gain each band into its own dynamic range
        window.postMessage({
          type: messageType,
          data: {
            type: messageType,
            viz: {
              b: vizNorm("b", bass),
              m: vizNorm("m", mid),
              t: vizNorm("t", treble),
              l: vizNorm("l", level),
              k: kick, // beat pulse (already 0..1)
              v: vizNorm("v", voiceRaw), // vocal presence
            },
          },
        });
      } catch {}
    }

    function vizStart(hz) {
      const m = currentMedia || firstPlaying();
      if (!m) return;
      try {
        if (!vizCtx)
          vizCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (vizCtx.state === "suspended") vizCtx.resume().catch(() => {});
        vizHookGestureResume(); // v14.4: recover on next page interaction
        vizZeroStreak = 0;
        if (m !== vizEl) vizCapture(m);
        if (vizTimer) clearInterval(vizTimer);
        const rate = Math.max(5, Math.min(30, Number(hz) || 15));
        vizTimer = setInterval(vizSample, Math.round(1000 / rate));
      } catch {
        vizStop();
      }
    }

    window.addEventListener("message", async (event) => {
      // FIX 13: only accept control messages from this window
      if (event.source !== window) return;
      if (event?.data?.type !== `${messageType}-internal`) return;
      const info = event.data.data;
      if (!info?.action || info.action.endsWith("-end")) return;
      const m = currentMedia || firstPlaying();
      let hasSendResponse = false;
      try {
        switch (info.action) {
          case "play":
          case "pause":
            if (m) await m[info.action]();
            break;
          case "muted":
            if (m && !siteApplyMute(m)) {
              if (m.volume === 0) {
                m.volume = 1;
                m.muted = false;
              } else m.muted = !m.muted;
            }
            break;
          case "volume":
            if (m) {
              const v = Math.max(0, Math.min(1, Number(info.volume) || 0));
              if (!siteApplyVolume(v)) {
                m.volume = v;
                m.muted = false;
              }
            }
            break;
          // FIX: injectMain runs in the page's MAIN world — U is not defined there.
          // Must use inline math, not U.clamp.
          case "seek":
            if (m && Number.isFinite(info.time)) {
              // FIX 16: duration can be NaN (not loaded) or Infinity (live
              // stream); old code clamped both to 0
              const t = Math.max(0, Number(info.time));
              m.currentTime =
                Number.isFinite(m.duration) && m.duration > 0
                  ? Math.min(t, m.duration)
                  : t;
              // v13.1: report the new position immediately (don't let the
              // timeupdate throttle delay the confirmation the dock waits on)
              m.__vivaldiMiniMediaDockV12LastEmit = Date.now();
              emit(m, "seeked");
            }
            break;
          case "previoustrack":
          case "nexttrack":
            // Call the handler the page registered via MediaSession, if captured
            if (capturedHandlers[info.action]) {
              try {
                capturedHandlers[info.action]({ action: info.action });
              } catch {}
            }
            break;
          case "picture-in-picture":
            if (document.pictureInPictureEnabled) {
              if (document.pictureInPictureElement)
                await document.exitPictureInPicture();
              else if (m && isVideo(m)) await m.requestPictureInPicture();
            }
            break;
          case "scroll-into-view":
            if (m)
              m.scrollIntoView({
                behavior: "auto",
                block: "center",
                inline: "center",
              });
            break;
          // v14: visualizer lifecycle (UI subscribes/unsubscribes)
          case "viz-start":
            vizStart(info.hz);
            break;
          case "viz-stop":
            vizStop();
            break;
          case "close":
            if (
              document.pictureInPictureEnabled &&
              document.pictureInPictureElement
            )
              await document.exitPictureInPicture().catch(() => {});
            if (m) {
              // FIX 7: flag before pause() so the resulting pause event is
              // suppressed instead of re-adding the item to the dock
              m.__vivaldiMiniMediaDockV12Dismissed = true;
              m.removeAttribute(nameAttr);
              m.pause();
              currentMedia = null;
              if (vizEl === m) vizStop(); // v14
              hasSendResponse = true;
            }
            break;
        }
      } catch {}
      event.source.postMessage({
        type: `${messageType}-internal`,
        data: { action: `${info.action}-end`, hasSendResponse },
        _token: event.data._token, // FIX: echo token back so bridge done() listener matches correctly
      });
    });

    scan();
    new MutationObserver(scan).observe(document, {
      childList: true,
      subtree: true,
    });
  }

  function injectIntoTab(tabId, frameIds = null) {
    const target = frameIds ? { tabId, frameIds } : { tabId, allFrames: true };
    try {
      // FIX 17: executeScript returns a promise in MV3 — the old try/catch
      // never caught its async rejections (chrome:// pages, discarded tabs)
      chrome.scripting
        .executeScript({
          target,
          func: injectMain,
          world: "MAIN",
          args: [MESSAGE_TYPE, NAME_ATTR],
        })
        ?.catch?.(() => {});
      chrome.scripting
        .executeScript({
          target,
          func: injectBridge,
          args: [MESSAGE_TYPE],
        })
        ?.catch?.(() => {});
    } catch {}
  }

  function hookBrowserEvents() {
    chrome.runtime.onMessage.addListener(async (info, sender) => {
      if (info.type !== MESSAGE_TYPE) return;
      if (sender.tab?.incognito) return;
      // v14: visualizer packets are high-frequency and tiny — handle them on
      // a dedicated lightweight path (no tabs.get, no normalize, no render)
      if (info.viz) {
        handleVizPacket(sender.tab?.id, info.viz);
        return;
      }
      info.frameId = sender.frameId;
      await updateItem(sender.tab, info);
    });
    chrome.tabs.onActivated.addListener(({ tabId }) => activateTab(tabId));
    chrome.tabs.onRemoved.addListener((tabId) => {
      state.items.delete(tabId);
      render();
    });
    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if (changeInfo.status === "loading") {
        state.items.delete(tabId);
        render();
      }
    });
    chrome.tabs.onReplaced.addListener((added, removed) =>
      replaceTabId(added, removed),
    );

    if (vivaldi?.windowPrivate?.onActivated) {
      vivaldi.windowPrivate.onActivated.addListener((windowId, active) => {
        if (!active) return;
        chrome.tabs.query({ active: true, windowId }, (tabs) => {
          if (chrome.runtime.lastError) return; // FIX 17
          if (tabs && tabs[0]) activateTab(tabs[0].id);
        });
      });
    }

    chrome.tabs.query(
      { active: true, windowId: window.vivaldiWindowId },
      (tabs) => {
        if (chrome.runtime.lastError) return; // FIX 17
        if (tabs && tabs[0]) activateTab(tabs[0].id);
      },
    );

    window.addEventListener("resize", scheduleLayoutUpdate);
  }

  async function injectAllTabs() {
    try {
      const tabs = await chrome.tabs.query({ windowType: "normal" });
      tabs.forEach((tab) => {
        if (!tab.incognito) injectIntoTab(tab.id);
      });
    } catch {}
    chrome.webNavigation.onCommitted.addListener((details) => {
      injectIntoTab(details.tabId, [details.frameId]);
    });
  }

  // v13: drop paused items that haven't updated in SETTINGS.staleMinutes
  // (a forgotten paused tab shouldn't squat in the dock all day)
  function pruneStale() {
    if (!SETTINGS.staleMinutes) return;
    const cutoff = Date.now() - SETTINGS.staleMinutes * 60000;
    let changed = false;
    for (const [tabId, item] of state.items) {
      if (item.paused && (item.lastUpdated || 0) < cutoff) {
        state.items.delete(tabId);
        if (pinnedTabId === tabId) pinnedTabId = -1;
        changed = true;
      }
    }
    if (changed) render();
  }

  // v13: react to Vivaldi theme changes instantly instead of polling.
  // Theme switches mutate style/class on #browser.
  function watchTheme() {
    const browser = document.getElementById("browser");
    if (!browser) return;
    new MutationObserver(() => {
      state.currentPaletteKey = ""; // force re-apply even if key would match
      applyCurrentPalette(state.activeArtSrc);
    }).observe(browser, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
  }

  function init() {
    addStyles();
    ensureDock();
    hookBrowserEvents();
    injectAllTabs();
    watchTheme();
    // v13: housekeeping heartbeat (was a busy 1.2s loop doing palette +
    // layout work unconditionally). Layout/theme changes are event-driven
    // now; this only prunes stale items and self-heals the mount point.
    setInterval(() => {
      pruneStale();
      ensureDock();
      if (state.items.size) updateDockPosition();
      // v14: self-heal the analyser subscription — if we expect packets but
      // none arrive (page reloaded mid-song, another window sent a stop),
      // re-issue viz-start. Costs nothing when healthy.
      if (state.vizTabId != null && Date.now() - state.vizLastPacket > 4000) {
        const it = state.items.get(state.vizTabId);
        if (it && !it.paused) {
          send(it, "viz-start", {
            hz: U.clamp(Number(SETTINGS.visualizerRateHz) || 15, 5, 30),
          });
        } else {
          syncViz(null);
        }
      }
    }, SETTINGS.idleHeartbeatMs);
  }

  U.waitFor(
    () => document.getElementById("browser") && window.vivaldiWindowId != null,
    init,
    250,
  );
})();
