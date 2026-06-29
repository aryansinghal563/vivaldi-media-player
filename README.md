# Vivaldi Mini Media Dock

A compact, artwork-aware media controller for Vivaldi's vertical tab bar.

This mod adds a docked media card to the browser UI with playback controls, seek and volume handling, media cycling, artwork-driven theming, and a real-time canvas visualizer that reacts to playback while preserving a calm idle state when nothing is playing.

## Highlights

- Compact dock that expands on hover or click
- Artwork-based theming for the card, controls, badge, and accents
- Play, pause, previous, next, mute, focus-tab, and dismiss controls
- Drag-to-seek with a hover time preview tooltip
- Mouse-wheel gestures:
  - wheel over artwork to cycle active media items
  - wheel over the card to adjust volume
- Middle-click play and pause support
- Playback-rate display in the subtitle when media is not at `1x`
- Optional floating music-note trail while media is playing
- Optional window-scoped mode so the dock only shows media from the current Vivaldi window
- Real-time audio visualizer with beat and vocal tracking
- Graceful fallback for DRM or capture-restricted media, where the dock remains usable and the background simply stays calm

## What makes this version different

Compared with the original forum modification, this version substantially expands the feature set and internal handling:

- richer artwork-driven visual treatment
- seek and volume interaction improvements
- touchpad-aware wheel handling
- page-aware volume behavior for YouTube and YouTube Music
- playback-state smoothing and stale-update suppression
- favicon and artwork fallback logic
- canvas-based fluid background rendering instead of a static decorative gradient
- performance-minded visualizer updates and cleanup paths

## Repository contents

| File | Purpose |
|---|---|
| `vivaldi-mini-media-dock.js` | Main mod script |
| `README.md` | Setup and usage notes |
| `LICENSE` | Apache 2.0 license |

## Requirements

- Vivaldi browser
- Vertical tabs layout
- A custom-UI-mod workflow where you already inject scripts into Vivaldi's `window.html`

If you are new to Vivaldi UI modifications, start with the forum guidance linked below before editing browser UI files.

## Installation

For the general Vivaldi UI-mod workflow, refer to:

- Vivaldi forum thread: <https://forum.vivaldi.net/topic/16684/inspecting-the-vivaldi-ui-with-devtools>

Typical install flow:

1. Back up your current modified Vivaldi UI files.
2. Place `vivaldi-mini-media-dock.js` in the folder you use for custom UI assets.
3. Reference it from your modified `window.html`:

```html
<script src="vivaldi-mini-media-dock.js"></script>
```

4. Restart Vivaldi or reload the modified UI using your usual workflow.
5. Open media in a tab and confirm the dock appears in the vertical tab bar area.

## Default behavior

By default, the dock is compact and shows the essentials first:

- artwork
- title
- subtitle

When expanded, it reveals the interactive controls and progress UI.

## Controls and interactions

| Interaction | Result |
|---|---|
| Hover card | Expands the dock when `expandOn: "hover"` |
| Click card | Can expand the dock when `expandOn: "click"` |
| Click artwork | Cycle through visible media items |
| Wheel over artwork | Cycle media items |
| Wheel over card | Adjust volume |
| Middle-click card | Toggle play and pause |
| Drag progress bar | Seek with live preview |
| Click time label | Toggle elapsed vs remaining time |
| Go to tab button | Focus the media tab |
| Close button | Stop or dismiss the current item |

## Configuration

Most customization lives in the `SETTINGS` object near the top of `vivaldi-mini-media-dock.js`.

Example:

```js
const SETTINGS = {
  expandOn: "hover",
  visualizer: true,
  showMusicNotes: true,
  windowScopedMedia: false,
};
```

Useful settings include:

| Setting | Meaning |
|---|---|
| `expandOn` | Expand on `"hover"` or `"click"` |
| `expandDelayMs` | Delay before hover expansion |
| `collapseDelayMs` | Delay before collapse after mouse leave |
| `scrollGestures` | Enable wheel gestures for media cycling and volume |
| `volumeWheelStep` | Volume change per wheel notch |
| `cycleWheelPixels` | Scroll distance needed to cycle artwork once |
| `visualizer` | Enable the live audio visualizer |
| `visualizerIntensity` | Scale how dramatic the visualizer feels |
| `visualizerRateHz` | Page-side analysis rate |
| `visualizerReducedMotion` | Disable visualizer when the OS requests reduced motion |
| `middleClickPlayPause` | Toggle playback with middle-click |
| `showMusicNotes` | Show or hide the floating note trail |
| `showPlaybackRate` | Show playback rate in the subtitle |
| `windowScopedMedia` | Restrict the dock to media from the current Vivaldi window |
| `staleMinutes` | Auto-drop paused items after a configurable idle period |
| `borderOpacity` | Card outline strength |
| `innerTopHighlight` | Toggle the subtle top highlight |
| `artTintBg` | Artwork influence on background tint |
| `artTintAccent` | Artwork influence on accent color |

## Visualizer notes

The visualizer is intentionally scoped to the dock card only.

It uses a canvas-based turbulence render and audio analysis driven from the playing page, including:

- loudness-driven motion and contrast
- beat-triggered kick pulses
- vocal-band tracking
- smoother idle motion when audio is quiet

Design goals visible in the script:

- keep playback safe by using passive analysis paths
- stop analysis when media is paused, dismissed, or no longer active
- respect `prefers-reduced-motion`
- degrade safely when media capture is unavailable

## Site-specific behavior

This mod includes special handling for YouTube and YouTube Music volume behavior so the dock stays better aligned with the page player state instead of fighting the site UI.

## Compatibility and limitations

- Designed primarily for Vivaldi with vertical tabs.
- Some DRM-protected or capture-restricted media can block audio analysis.
- When analysis cannot run, playback controls still work and the background falls back to its calmer non-reactive look.
- This repo is currently distributed as a direct script mod, not as a packaged extension.

## Credits

This project is based on the original Global Media Controls Panel modification shared on the Vivaldi Forums.

Original forum thread:

- <https://forum.vivaldi.net/topic/66803/global-media-controls-panel>

The current version has been heavily modified, expanded, and partially rewritten over multiple iterations.

## License

Apache License 2.0. See `LICENSE` for details.
