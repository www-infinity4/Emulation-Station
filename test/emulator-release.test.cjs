'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const launcher = fs.readFileSync('app.js','utf8');
const player = fs.readFileSync('emulator.html','utf8');
const index = fs.readFileSync('index.html','utf8');

function harness() {
  const handlers = new Map(), calls = [];
  const button = {
    dataset: {button:'up'}, style:{}, classList:{add(){},remove(){}},
    addEventListener(type,fn){handlers.set(type,(handlers.get(type)||[]).concat(fn));},
    setPointerCapture(){}, releasePointerCapture(){},
  };
  const windowListeners = new Map();
  const win = {
    location:{search:'',href:''},
    EJS_emulator:{gameManager:{simulateInput(...args){calls.push(args);}}},
    addEventListener(type,fn){windowListeners.set(type,(windowListeners.get(type)||[]).concat(fn));}
  };
  const document = {
    hidden:false,
    querySelectorAll:()=>[button],
    addEventListener(type,fn){windowListeners.set(type,(windowListeners.get(type)||[]).concat(fn));},
    getElementById:()=>({textContent:'',classList:{add(){},remove(){}}}),
    body:{appendChild(){}}
  };
  const context = vm.createContext({
    window:win,document,localStorage:{getItem(){return null},setItem(){},removeItem(){}},
    URLSearchParams,URL,KeyboardEvent:class{},console,setTimeout(){},clearTimeout(){},
    setInterval(){},clearInterval(){}
  });
  vm.runInContext(launcher,context);
  const emit=(type,props={})=>{for(const fn of handlers.get(type)||[])fn({preventDefault(){},pointerId:1,...props});};
  return {context,window:win,document,button,calls,handlers,windowListeners,emit};
}

test('official stable EmulatorJS loader, not undocumented minified entrypoint',()=>{
  assert.match(player,/https:\/\/cdn\.emulatorjs\.org\/stable\/data\/loader\.js/);
  assert.match(player,/EJS_pathtodata\s*=\s*'https:\/\/cdn\.emulatorjs\.org\/stable\/data\/'/);
  assert.doesNotMatch(player,/cdn\.emulatorjs\.org\/latest\/data\/emulator\.min\.js/);
});

test('local ROM history stores only a re-openable session sentinel, never a temporary blob URL',()=>{
  assert.match(player,/saveRecentROM\(\{\s*name,\s*core,\s*rom:\s*params\.rom/);
  assert.doesNotMatch(player,/saveRecentROM\(\{\s*name,\s*core,\s*rom:\s*romUrl/);
});

test('Android pointer controls release on cancel and do not double-register after showing pad',()=>{
  const h=harness();
  vm.runInContext('initVirtualGamepad(); initVirtualGamepad();',h.context);
  assert.equal(h.handlers.get('pointerdown')?.length,1);
  assert.equal(h.handlers.get('pointerup')?.length,1);
  assert.equal(h.handlers.get('pointercancel')?.length,1);
  h.emit('pointerdown');
  h.emit('pointercancel');
  assert.deepEqual(h.calls,[[0,4,1],[0,4,0]]);
});

test('leaving the page or losing focus releases any held gamepad input',()=>{
  const h=harness();
  vm.runInContext('initVirtualGamepad()',h.context);
  h.emit('pointerdown');
  for (const fn of h.windowListeners.get('blur')||[])fn();
  assert.deepEqual(h.calls,[[0,4,1],[0,4,0]]);
});

test('launcher refuses dangerous ROM schemes and unknown cores',()=>{
  const h=harness();
  vm.runInContext("launchEmulator('nes','javascript:alert(1)','bad','nes')",h.context);
  assert.equal(h.window.location.href,'');
  vm.runInContext("launchEmulator('arbitrary-core','https://example.com/game.nes','bad','')",h.context);
  assert.equal(h.window.location.href,'');
  vm.runInContext("launchEmulator('nes','__LOCAL__','owned','nes')",h.context);
  assert.match(h.window.location.href,/emulator\.html\?/);
});

test('ROMs are owner supplied and not advertised as freely downloadable copyrighted games',()=>{
  assert.doesNotMatch(index,/tonsganes\.com/i);
  assert.match(index,/authorized|homebrew|licensed|permission/i);
});

test('save/load guard rejects missing APIs and failed state actions without claiming success',async()=>{
  const h=harness();
  const missing=await vm.runInContext("performEmulatorStateAction(window.EJS_emulator,'saveState')",h.context);
  assert.equal(missing,false);
  h.window.EJS_emulator.saveState=()=>{};
  const saved=await vm.runInContext("performEmulatorStateAction(window.EJS_emulator,'saveState')",h.context);
  assert.equal(saved,true);
  h.window.EJS_emulator.loadState=()=>{throw Error('state unavailable')};
  const loaded=await vm.runInContext("performEmulatorStateAction(window.EJS_emulator,'loadState')",h.context);
  assert.equal(loaded,false);
  assert.match(player,/performEmulatorStateAction\(window\.EJS_emulator/);
});
