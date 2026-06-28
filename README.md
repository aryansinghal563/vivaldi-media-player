# vivaldi-media-player
A compact media controller for Vivaldi's vertical tab bar featuring artwork-based theming, playback controls, audio visualization, and a real-time fluid background.

# Credits
This project is based on the original Global Media Controls Panel modification shared on the Vivaldi Forums.

Original forum thread:
https://forum.vivaldi.net/topic/66803/global-media-controls-panel

The current version has been heavily modified, expanded, and partially rewritten over multiple iterations, introducing features such as:

- Artwork-based dynamic theming
- Expandable mini dock UI
- Volume and seek controls
- Mouse gestures
- Audio visualization
- Beat and vocal detection
- Fluid background rendering
- Performance optimizations

Huge thanks to the original author and the Vivaldi modding community.

# Installation
For safe installation, you can refer this forum thread:
https://forum.vivaldi.net/topic/16684/inspecting-the-vivaldi-ui-with-devtools

# Configuration
Most options can be changed from the SETTINGS object near the top of the script.

```js
expandOn: "hover",
visualizer: true,
showMusicNotes: true,
windowScopedMedia: false
```

# Compatibility
Designed for Vivaldi with vertical tabs. Some DRM-protected media may disable audio analysis features.
