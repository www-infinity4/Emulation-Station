# 🎮 Emulation Station

A fully browser-based, multi-system emulation station.  
Paste **any ROM URL** (or upload a local file) and play instantly — no installs, no plugins.  
On-screen virtual controls sit **below** the game screen so the action is always visible.

---

## Supported Systems

| Category | Systems |
|----------|---------|
| **Atari** | 2600 · 5200 · 7800 · Lynx · Jaguar |
| **Commodore** | C64 · C128 · VIC-20 · Amiga |
| **Nintendo** | NES · SNES · Game Boy · GBC · GBA · N64 · DS |
| **Sega** | Master System · Genesis · Game Gear · Sega CD · 32X · Saturn · Dreamcast |
| **Sony** | PlayStation 1 |
| **Arcade** | MAME 2003 · MAME 2003+ · Final Burn Alpha |
| **Other** | Neo Geo Pocket · WonderSwan · TurboGrafx-16 · 3DO · MSX · PC-FX |

Emulation is powered by **[EmulatorJS](https://emulatorjs.org/)** (loaded from CDN).

---

## Quick Start

1. Open `index.html` in any modern browser (or serve with any static web server).
2. Choose a **system** from the dropdown or click a system card.
3. Paste a **ROM URL** into the URL field *or* click **Choose ROM file** to upload a local copy.
4. Hit **▶ Play Now**.

The emulator opens in `emulator.html` with:
- The game screen filling the viewport.
- A **virtual gamepad below the screen** (touchscreen / mouse).
- A top bar with Fullscreen, Save State, and Load State controls.
- On desktop, use **keyboard shortcuts** (see table below) or click the 🎮 FAB to show the on-screen pad.

### Keyboard Controls (Player 1)

| Action | Key |
|--------|-----|
| D-pad  | Arrow keys |
| A      | X |
| B      | Z |
| X      | S |
| Y      | A |
| Start  | Enter |
| Select | Shift |
| L1     | Q |
| R1     | W |
| L2     | E |
| R2     | R |
| Fullscreen | F |

---

## File Structure

```
index.html     – System launcher / ROM URL input
emulator.html  – EmulatorJS player + virtual gamepad
styles.css     – Shared dark retro-gaming theme
app.js         – System definitions, helpers, virtual-gamepad input
```

---

## ROM Sources & CORS

EmulatorJS fetches ROMs via the browser.  
The ROM server must send a **permissive `Access-Control-Allow-Origin`** header.  
If a direct URL doesn't work, download the ROM and use the **local-file upload** option instead.

---

## Local Development

```bash
# Any static server works, e.g. Python:
python3 -m http.server 8080
# Then open http://localhost:8080
```

---

## Credits

- Emulation cores: [EmulatorJS](https://emulatorjs.org/) / [libretro](https://www.libretro.com/)
- UI & integration: Emulation Station project
