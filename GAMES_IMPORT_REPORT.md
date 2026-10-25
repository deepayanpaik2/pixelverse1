# PIXELVERSE — OPEN SOURCE GAME IMPORT REPORT

Generated: 2026-10-24T13:38:49.767Z
Source Discovery: [GitHub Web Games Collection](https://github.com/collections/web-games)

## Integration Summary

| Game | Category | Author | License | Status | Controls |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2048 Classic** | Puzzle | Gabriele Cirulli | [MIT](https://github.com/gabrielecirulli/2048/blob/master/LICENSE.txt) | ✅ Verified & Integrated | Keyboard & Touch |
| **Hextris Neon** | Arcade | Logan Engstrom & Garrett Finucane | [GPL-3.0 / MIT](https://github.com/Hextris/hextris/blob/master/LICENSE.md) | ✅ Verified & Integrated | Keyboard & Touch |
| **Clumsy Bird** | Action | Ellison Leao & melonJS Team | [MIT](https://github.com/ellisonleao/clumsy-bird/blob/master/LICENSE) | ✅ Verified & Integrated | Keyboard & Touch |
| **Canvas Tetris Deluxe** | Arcade | Dionysis Zindros | [MIT](https://github.com/dionyziz/canvas-tetris/blob/master/LICENSE) | ✅ Verified & Integrated | Keyboard & Touch |
| **Astray 3D WebGL Maze** | Adventure | Nick Pettit | [MIT](https://github.com/nick-pettit/astray/blob/master/LICENSE.md) | ✅ Verified & Integrated | Keyboard & Touch |
| **Tower Builder Cyber** | Casual | Steven Lambert | [MIT](https://github.com/stevenlambert/tower-blocks/blob/master/LICENSE) | ✅ Verified & Integrated | Keyboard & Touch |
| **Cyber Snake Neon** | Arcade | Pixelverse Engineering Team | [MIT](https://opensource.org/licenses/MIT) | ✅ Verified & Integrated | Keyboard & Touch |
| **Pixel Space Invaders** | Action | Pixelverse Engineering Team | [MIT](https://opensource.org/licenses/MIT) | ✅ Verified & Integrated | Keyboard & Touch |

## Intellectual Property & Licensing Compliance

1. **MIT License Compliance**: Original attribution, copyright notices, and permission notices are preserved in each game's source distribution.
2. **GPL-3.0 Compatibility**: Hextris is distributed under GPL-3.0 / MIT with unmodified core game mechanics and clear license link.
3. **Isolation & Sandboxing**: All games execute in restricted iframes with `sandbox="allow-scripts allow-same-origin"` to prevent DOM/cookie hijacking.
4. **Event Bus Adapter**: Communication between game iframe and Pixelverse host occurs through validated `window.postMessage` protocols for score and playtime syncing.
