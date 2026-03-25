/**
 * app.js – Emulation Station core logic
 *
 * Covers:
 *   • All supported system definitions
 *   • URL / parameter helpers
 *   • localStorage "recent ROMs" persistence
 *   • Virtual gamepad keyboard-event simulation
 *   • GP Suite AI engine (Gitflow, Gitpulse, Gitarch, Gitsync, Gitscan)
 *   • Giro Brain rhythm calculator
 *   • Game Genie–style points / coins / level engine
 */

/* ── System definitions ─────────────────────────────────────────────────── */

const CATEGORIES = [
  { id: 'atari',     label: 'Atari',           color: '#ff6b35' },
  { id: 'commodore', label: 'Commodore',        color: '#4a8fe2' },
  { id: 'nintendo',  label: 'Nintendo',         color: '#e53935' },
  { id: 'sega',      label: 'Sega',             color: '#00bcd4' },
  { id: 'sony',      label: 'Sony',             color: '#0070d1' },
  { id: 'arcade',    label: 'Arcade / MAME',    color: '#9c27b0' },
  { id: 'other',     label: 'Other Systems',    color: '#78909c' },
];

const SYSTEMS = [
  // ── Atari ──────────────────────────────────────────────────────────────
  { id: 'atari2600',    name: 'Atari 2600',          core: 'atari2600',   cat: 'atari',     icon: '🕹️',  exts: '.a26 .bin .rom' },
  { id: 'atari5200',    name: 'Atari 5200',          core: 'a5200',       cat: 'atari',     icon: '🕹️',  exts: '.a52 .bin' },
  { id: 'atari7800',    name: 'Atari 7800',          core: 'atari7800',   cat: 'atari',     icon: '🕹️',  exts: '.a78 .bin' },
  { id: 'lynx',         name: 'Atari Lynx',          core: 'lynx',        cat: 'atari',     icon: '📟',  exts: '.lnx' },
  { id: 'jaguar',       name: 'Atari Jaguar',        core: 'jaguar',      cat: 'atari',     icon: '🐆',  exts: '.j64 .jag .bin' },

  // ── Commodore ─────────────────────────────────────────────────────────
  { id: 'c64',          name: 'Commodore 64',        core: 'vice_x64',    cat: 'commodore', icon: '💾',  exts: '.d64 .t64 .tap .prg' },
  { id: 'c128',         name: 'Commodore 128',       core: 'vice_x128',   cat: 'commodore', icon: '💾',  exts: '.d64 .d71 .d81' },
  { id: 'vic20',        name: 'VIC-20',              core: 'vice_xvic',   cat: 'commodore', icon: '💾',  exts: '.d64 .prg .tap' },
  { id: 'amiga',        name: 'Amiga',               core: 'puae',        cat: 'commodore', icon: '🖥️',  exts: '.adf .hdf .iso' },

  // ── Nintendo ──────────────────────────────────────────────────────────
  { id: 'nes',          name: 'NES',                 core: 'nes',         cat: 'nintendo',  icon: '🎮',  exts: '.nes .fds .nsf' },
  { id: 'snes',         name: 'Super Nintendo',      core: 'snes',        cat: 'nintendo',  icon: '🎮',  exts: '.smc .sfc .fig' },
  { id: 'gb',           name: 'Game Boy',            core: 'gb',          cat: 'nintendo',  icon: '📱',  exts: '.gb' },
  { id: 'gbc',          name: 'Game Boy Color',      core: 'gbc',         cat: 'nintendo',  icon: '📱',  exts: '.gbc' },
  { id: 'gba',          name: 'Game Boy Advance',    core: 'gba',         cat: 'nintendo',  icon: '📱',  exts: '.gba' },
  { id: 'n64',          name: 'Nintendo 64',         core: 'n64',         cat: 'nintendo',  icon: '🎮',  exts: '.z64 .n64 .v64' },
  { id: 'nds',          name: 'Nintendo DS',         core: 'nds',         cat: 'nintendo',  icon: '📟',  exts: '.nds' },

  // ── Sega ──────────────────────────────────────────────────────────────
  { id: 'segaMS',       name: 'Sega Master System',  core: 'segaMS',      cat: 'sega',      icon: '🎯',  exts: '.sms .bin' },
  { id: 'segaMD',       name: 'Sega Genesis',        core: 'segaMD',      cat: 'sega',      icon: '🎯',  exts: '.md .bin .smd .gen' },
  { id: 'segaGG',       name: 'Sega Game Gear',      core: 'segaGG',      cat: 'sega',      icon: '📱',  exts: '.gg' },
  { id: 'segaCD',       name: 'Sega CD',             core: 'segaCD',      cat: 'sega',      icon: '💿',  exts: '.iso .cue .chd' },
  { id: 'sega32x',      name: 'Sega 32X',            core: 'sega32x',     cat: 'sega',      icon: '🎯',  exts: '.32x .bin' },
  { id: 'segaSaturn',   name: 'Sega Saturn',         core: 'segaSaturn',  cat: 'sega',      icon: '🪐',  exts: '.iso .cue .chd' },
  { id: 'dc',           name: 'Dreamcast',           core: 'dc',          cat: 'sega',      icon: '💫',  exts: '.cdi .gdi .chd' },

  // ── Sony ──────────────────────────────────────────────────────────────
  { id: 'psx',          name: 'PlayStation',         core: 'psx',         cat: 'sony',      icon: '🔲',  exts: '.iso .cue .chd .pbp .bin' },

  // ── Arcade ────────────────────────────────────────────────────────────
  { id: 'mame2003',     name: 'Arcade (MAME 2003)',  core: 'mame2003',    cat: 'arcade',    icon: '🕹️',  exts: '.zip' },
  { id: 'mame2003plus', name: 'Arcade (MAME 2003+)', core: 'mame2003plus',cat: 'arcade',    icon: '🕹️',  exts: '.zip' },
  { id: 'fbalpha2012',  name: 'Final Burn Alpha',    core: 'fbalpha2012', cat: 'arcade',    icon: '🕹️',  exts: '.zip' },

  // ── Other ─────────────────────────────────────────────────────────────
  { id: 'ngp',          name: 'Neo Geo Pocket',      core: 'ngp',         cat: 'other',     icon: '🎮',  exts: '.ngp .ngc' },
  { id: 'ws',           name: 'WonderSwan',          core: 'ws',          cat: 'other',     icon: '📱',  exts: '.ws .wsc' },
  { id: 'pce',          name: 'TurboGrafx-16 / PC-E',core: 'pce',        cat: 'other',     icon: '🎮',  exts: '.pce .cue' },
  { id: '3do',          name: '3DO Interactive',     core: '3do',         cat: 'other',     icon: '💿',  exts: '.iso .cue' },
  { id: 'msx',          name: 'MSX',                 core: 'fmsx',        cat: 'other',     icon: '🖥️',  exts: '.rom .dsk' },
  { id: 'pcfx',         name: 'PC-FX',               core: 'pcfx',        cat: 'other',     icon: '💿',  exts: '.iso .cue' },
];

/** Return a system object by its id. */
function getSystem(id) {
  return SYSTEMS.find(s => s.id === id) || null;
}

/** Return a system object by its core name. */
function getSystemByCore(core) {
  return SYSTEMS.find(s => s.core === core) || null;
}

/* ── URL / navigation helpers ───────────────────────────────────────────── */

function getQueryParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    core:   p.get('core') || '',
    system: p.get('system') || '',
    rom:    p.get('rom') || '',
    name:   p.get('name') || '',
  };
}

/**
 * Navigate to the emulator page with the supplied parameters.
 * @param {string} core   – EmulatorJS core id (e.g. 'nes')
 * @param {string} rom    – ROM URL
 * @param {string} name   – Human-readable game name
 * @param {string} sysId  – System id (for display)
 */
function launchEmulator(core, rom, name, sysId) {
  if (!core) { showToast('Please select a system first.'); return; }
  if (!rom)  { showToast('Please enter a ROM URL or choose a local file.'); return; }

  const params = new URLSearchParams({ core, rom, name: name || 'Unknown Game', system: sysId || '' });
  window.location.href = 'emulator.html?' + params.toString();
}

/* ── Recent ROMs (localStorage) ─────────────────────────────────────────── */

const RECENT_KEY = 'es_recent_roms';
const MAX_RECENT  = 10;

function getRecentROMs() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; }
  catch { return []; }
}

function saveRecentROM(entry) {
  // entry: { name, core, rom, sysId, ts }
  let list = getRecentROMs().filter(r => r.rom !== entry.rom);
  list.unshift({ ...entry, ts: Date.now() });
  if (list.length > MAX_RECENT) list = list.slice(0, MAX_RECENT);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch {}
}

function clearRecentROMs() {
  try { localStorage.removeItem(RECENT_KEY); } catch {}
}

/* ── Toast notification ─────────────────────────────────────────────────── */

let toastTimer;
function showToast(msg, duration = 3000) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

/* ── Virtual gamepad – key simulation ──────────────────────────────────── */

/**
 * Default key bindings for EmulatorJS player-1 controls.
 * These match EmulatorJS default keyboard map.
 */
const KEY_MAP = {
  up:     { key: 'ArrowUp',    code: 'ArrowUp',    keyCode: 38 },
  down:   { key: 'ArrowDown',  code: 'ArrowDown',  keyCode: 40 },
  left:   { key: 'ArrowLeft',  code: 'ArrowLeft',  keyCode: 37 },
  right:  { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
  a:      { key: 'x',          code: 'KeyX',        keyCode: 88 },
  b:      { key: 'z',          code: 'KeyZ',        keyCode: 90 },
  x:      { key: 's',          code: 'KeyS',        keyCode: 83 },
  y:      { key: 'a',          code: 'KeyA',        keyCode: 65 },
  start:  { key: 'Enter',      code: 'Enter',       keyCode: 13 },
  select: { key: 'Shift',      code: 'ShiftLeft',   keyCode: 16 },
  l1:     { key: 'q',          code: 'KeyQ',        keyCode: 81 },
  l2:     { key: 'e',          code: 'KeyE',        keyCode: 69 },
  r1:     { key: 'w',          code: 'KeyW',        keyCode: 87 },
  r2:     { key: 'r',          code: 'KeyR',        keyCode: 82 },
};

/** Simulate a keyboard event for a virtual gamepad button. */
function simulateKey(buttonId, type /* 'keydown'|'keyup' */) {
  const mapping = KEY_MAP[buttonId];
  if (!mapping) return;

  // Try EmulatorJS native API first (most reliable)
  if (typeof window.EJS_emulator !== 'undefined' &&
      window.EJS_emulator.gameManager &&
      typeof window.EJS_emulator.gameManager.simulateInput === 'function') {
    // libretro JOYPAD button codes
    const JOYPAD = { b:0, y:1, select:2, start:3, up:4, down:5, left:6, right:7, a:8, x:9, l1:10, r1:11, l2:12, r2:13 };
    const value  = (type === 'keydown') ? 1 : 0;
    if (JOYPAD[buttonId] !== undefined) {
      window.EJS_emulator.gameManager.simulateInput(0, JOYPAD[buttonId], value);
      return;
    }
  }

  // Fall back to keyboard event dispatch
  const evt = new KeyboardEvent(type, {
    key:      mapping.key,
    code:     mapping.code,
    keyCode:  mapping.keyCode,
    which:    mapping.keyCode,
    bubbles:  true,
    cancelable: true,
  });
  window.dispatchEvent(evt);
}

/** Attach touchstart/touchend + mousedown/mouseup to all .gp-btn elements. */
function initVirtualGamepad() {
  document.querySelectorAll('.gp-btn').forEach(btn => {
    const id = btn.dataset.button;
    if (!id) return;

    const press   = (e) => { e.preventDefault(); simulateKey(id, 'keydown'); btn.classList.add('pressed'); };
    const release = (e) => { e.preventDefault(); simulateKey(id, 'keyup');   btn.classList.remove('pressed'); };

    btn.addEventListener('touchstart',  press,   { passive: false });
    btn.addEventListener('touchend',    release, { passive: false });
    btn.addEventListener('touchcancel', release, { passive: false });
    btn.addEventListener('mousedown',   press);
    btn.addEventListener('mouseup',     release);
    btn.addEventListener('mouseleave',  release);
  });
}

/* ── Emulator readiness polling ─────────────────────────────────────────── */

/**
 * Poll until window.EJS_emulator is available, then call cb().
 * Gives up after timeoutMs milliseconds and calls errCb().
 */
function waitForEmulator(cb, errCb, timeoutMs = 60000) {
  const start    = Date.now();
  const interval = setInterval(() => {
    if (window.EJS_emulator) {
      clearInterval(interval);
      cb(window.EJS_emulator);
    } else if (Date.now() - start > timeoutMs) {
      clearInterval(interval);
      if (errCb) errCb();
    }
  }, 300);
}

/* ════════════════════════════════════════════════════════════════════════════
   GP SUITE – Extended AI Engine
   ════════════════════════════════════════════════════════════════════════════ */

/**
 * GP Suite AI definitions.
 * Each agent has an id, name, symbol, role, status, and health value (0-100).
 */
const GP_AGENTS = [
  {
    id:     'gitflow',
    name:   'Gitflow',
    symbol: '≋',
    title:  'The Streamliner',
    role:   `Manages momentum of the inertia pool. Ensures smooth cloning/forking without rhythm shock.`,
    color:  '#00d4ff',
    status: 'nominal',
    health: 98,
  },
  {
    id:     'gitpulse',
    name:   'Gitpulse',
    symbol: '♥',
    title:  'The Diagnostic',
    role:   'Monitors the Erythmia. Flags off-beats in spatial code before they become full-blown glitches.',
    color:  '#ff4d6d',
    status: 'scanning',
    health: 87,
  },
  {
    id:     'gitarch',
    name:   'Gitarch',
    symbol: '🏛',
    title:  'The Architect',
    role:   'Heavy lifter for structural changes. Handles the foundation—the actual physics laws of the cloned world.',
    color:  '#ffd700',
    status: 'nominal',
    health: 100,
  },
  {
    id:     'gitsync',
    name:   'Gitsync',
    symbol: '⟲',
    title:  'The Harmonizer',
    role:   `Re-integrates patched rhythms back into the main existence. Ensures healing isn't rejected.`,
    color:  '#7b2fff',
    status: 'syncing',
    health: 74,
  },
  {
    id:     'gitscan',
    name:   'Gitscan',
    symbol: '◈',
    title:  'The Sentry',
    role:   'Constantly scans the cauldron of everything for external inertia forces that might interfere.',
    color:  '#00ff9d',
    status: 'alert',
    health: 62,
  },
];

/** Giro Brain – the central healer / Quantum Rhythm Engine state. */
const GIRO_BRAIN = {
  name:          'Giro Brain',
  symbol:        '⊕',
  title:         'Quantum Rhythm Engine',
  coreFrequency: 432,     // Hz – base resonance
  poolStability: 91,      // %
  erythmiaBPM:   72,
  status:        'healing',
  color:         '#ff8c00',
};

/** Local GP state storage key */
const GP_STATE_KEY = 'es_gp_state';

function loadGPState() {
  try { return JSON.parse(localStorage.getItem(GP_STATE_KEY)) || {}; }
  catch { return {}; }
}

function saveGPState(state) {
  try { localStorage.setItem(GP_STATE_KEY, JSON.stringify(state)); } catch {}
}

/**
 * Simulate one GP Suite heartbeat tick.
 * Returns a shallow-cloned updated agents array with slightly varied health values.
 */
function gpHeartbeat(agents) {
  return agents.map(a => {
    const delta  = (Math.random() - 0.5) * GP_HEALTH_DELTA;
    const health = Math.max(10, Math.min(100, a.health + delta));
    const statuses = ['nominal', 'scanning', 'syncing', 'alert', 'healing'];
    const status  = health < 40 ? 'alert'
                  : health < 70 ? 'scanning'
                  : a.status;
    return { ...a, health: Math.round(health * 10) / 10, status };
  });
}

/* ════════════════════════════════════════════════════════════════════════════
   GAME GENIE – Points / Coins / Levels Engine
   ════════════════════════════════════════════════════════════════════════════ */

const GENIE_KEY = 'es_genie_state';

/** XP required to advance one level — shared by awardPlayer and the Genie UI. */
const XP_PER_LEVEL = 100;

/** Maximum health delta per GP heartbeat tick. */
const GP_HEALTH_DELTA = 4;

const DEFAULT_GENIE_STATE = {
  points:    0,
  coins:     0,
  level:     1,
  xp:        0,
  cheats:    [],
  unlockedLevels: [1],
};

function loadGenieState() {
  try { return Object.assign({}, DEFAULT_GENIE_STATE, JSON.parse(localStorage.getItem(GENIE_KEY))); }
  catch { return { ...DEFAULT_GENIE_STATE }; }
}

function saveGenieState(state) {
  try { localStorage.setItem(GENIE_KEY, JSON.stringify(state)); } catch {}
}

/**
 * Award points and coins to the player.
 * Every 100 XP grants a level-up.
 * @param {number} pts   – points to add
 * @param {number} coins – coins to add
 */
function awardPlayer(pts, coins) {
  const state = loadGenieState();
  state.points += pts;
  state.coins  += coins;
  state.xp     += pts;

  const xpPerLevel = XP_PER_LEVEL;
  const newLevel   = Math.floor(state.xp / xpPerLevel) + 1;
  if (newLevel > state.level) {
    state.level = newLevel;
    if (!state.unlockedLevels.includes(newLevel)) {
      state.unlockedLevels.push(newLevel);
    }
    showToast(`🏆 Level ${newLevel} unlocked! +${coins} coins`);
  }

  saveGenieState(state);
  return state;
}

/**
 * Apply a cheat code string.
 * Returns { ok: boolean, msg: string }.
 */
function applyCheatCode(code) {
  const state  = loadGenieState();
  const upper  = code.trim().toUpperCase();

  // Built-in cheat library
  const CHEATS = {
    'IDDQD':    { pts: 500,  coins: 50,  msg: '☢️ God Mode activated! +500 pts' },
    'IDKFA':    { pts: 300,  coins: 30,  msg: '🔫 Full Arsenal! +300 pts' },
    'NOCLIP':   { pts: 200,  coins: 20,  msg: '👻 No-clip enabled! +200 pts' },
    'LEVELUP':  { pts: 100,  coins: 10,  msg: '⬆️ Instant level up! +100 pts' },
    'COINRAIN': { pts: 0,    coins: 99,  msg: '🪙 Coin Rain! +99 coins' },
    'GENIE':    { pts: 1000, coins: 100, msg: '🧞 Genie granted! +1000 pts +100 coins' },
  };

  if (CHEATS[upper]) {
    const c = CHEATS[upper];
    const newState = awardPlayer(c.pts, c.coins);
    if (!newState.cheats.includes(upper)) newState.cheats.push(upper);
    saveGenieState(newState);
    return { ok: true, msg: c.msg };
  }

  return { ok: false, msg: `Unknown cheat: ${code}` };
}

/**
 * Unlock a new custom level by name.
 * Returns the updated state.
 */
function unlockCustomLevel(levelName) {
  const state = loadGenieState();
  const id    = `custom_${levelName.trim().toLowerCase().replace(/\s+/g, '_')}`;
  if (!state.unlockedLevels.includes(id)) {
    state.unlockedLevels.push(id);
    state.coins += 25;
    saveGenieState(state);
    showToast(`✨ Custom level "${levelName}" created! +25 coins`);
  }
  return state;
}
