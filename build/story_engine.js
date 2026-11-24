// ================= animated stories =================
// A story = nodes (atlas structures or approximate points) + signed edges + a small state model + scenes with timed beats.
// Every visual (edge thickness, particle rate, glow, dot grid, dial, token size) is computed from the model each frame,
// so scenes, state switches and free play all stay consistent with one another.
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const easeIO = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// Colour and end cap come from the sign; the line pattern comes from the evidence (ev): solid = shown in patients,
// dashed = animal models, dotted = proposed. 'fc' is undirected functional coupling (flows both ways, no cap).
const SIGN = {
  '+':    { col: '#ff9f43', cap: 'arrow', label: '<b>Excites</b>: switches the next area on (glutamate)' },
  '-':    { col: '#4aa8ff', cap: 'bar', label: '<b>Brakes</b>: quietens the next area (GABA); flat end, not an arrowhead' },
  da:     { col: '#ffd34d', cap: 'arrow', packets: true, label: '<b>Dopamine</b>: tags events as important; gold packets' },
  ctl:    { col: '#b48cff', cap: 'arrow', label: '<b>Top-down check</b>: a higher area reins in a lower one (net effect, may pass through relays)' },
  spiral: { col: '#c9b27a', cap: 'arrow', label: '<b>Passes it on</b>: striatum to the next dopamine group (the striatonigral spiral)' },
  clock:  { col: '#3fd0c9', cap: 'arrow', label: '<b>Daily rhythm</b>: input from the body clock (schematic)' },
  '5ht':  { col: '#ff8fb1', cap: 'arrow', packets: true, label: '<b>Serotonin</b>' },
  fc:     { col: '#7fe7ff', cap: 'none', bi: true, label: '<b>In sync</b>: activity rises and falls together (functional coupling, no direction)' },
};
const EV_PAT = { human: 0, rodent: 1, proposed: 2 };
const ICONS = {
  wave: '<svg viewBox="0 0 24 24"><circle cx="11" cy="5.5" r="2.6"/><path d="M11 8.5v7.5M11 16l-3 5M11 16l3 5M11 11l-4 2.5M11 11l5-4.5"/></svg>',
  car: '<svg viewBox="0 0 24 24"><path d="M3 15.5h18v-3.5l-2.2-4.2H6.2L4 12H3z"/><circle cx="7.5" cy="16.5" r="1.9"/><circle cx="16.5" cy="16.5" r="1.9"/></svg>',
  plate: '<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M5.5 10.5v3M8 10.5v3M11 10.5h2.5v3H11M16 10.5h2.5M16 12h2.5M16 13.5h2.5"/></svg>',
  radio: '<svg viewBox="0 0 24 24"><rect x="3" y="9" width="18" height="11" rx="2"/><circle cx="9" cy="14.5" r="2.8"/><path d="M14.5 12.5h3.5M14.5 15h3.5M14.5 17.5h3.5M7 9l9-5"/></svg>',
  coin: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 7.5l1.4 2.9 3.1.4-2.3 2.2.6 3.1-2.8-1.5-2.8 1.5.6-3.1-2.3-2.2 3.1-.4z"/></svg>',
  cloud: '<svg viewBox="0 0 24 24"><path d="M7 17.5h10a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.6A3.3 3.3 0 0 0 7 17.5z"/><path d="M9 20l-1 2M13 20l-1 2"/></svg>',
  bolt: '<svg viewBox="0 0 24 24"><path d="M13 2L5 13.5h6L10 22l8-11.5h-6z"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.1 6.4 6.4 2.1-6.4 2.1L12 19.5l-2.1-6.4L3.5 11l6.4-2.1z"/></svg>',
  dip: '<svg viewBox="0 0 24 24"><path d="M12 4v15M6 13l6 6 6-6"/></svg>',
  cup: '<svg viewBox="0 0 24 24"><path d="M4.5 9h12v5.5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M16.5 10.5h1.6a2.4 2.4 0 0 1 0 4.8h-1.9M8 3.5c-.8 1 .8 2 0 3M11.5 3.5c-.8 1 .8 2 0 3"/></svg>',
  trophy: '<svg viewBox="0 0 24 24"><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4.5a2.5 2.5 0 0 0 3 3.4M17 6h2.5a2.5 2.5 0 0 1-3 3.4M12 14v3.5M8.5 20.5h7M9.5 17.5h5v3h-5z"/></svg>',
  bird: '<svg viewBox="0 0 24 24"><path d="M2.5 13.5c3.5-.5 5.5-4 9.5-4 2.2 0 3.4 1.1 4.3 2.2l5.2-1-3.2 3c0 4.2-3.9 7-8.8 7-3.1 0-5.3-1.3-6.3-3.2l3.6-.9"/><circle cx="15.4" cy="11.6" r="0.5"/></svg>',
  bubble: '<svg viewBox="0 0 24 24"><path d="M4 4.5h16A1.5 1.5 0 0 1 21.5 6v8.5A1.5 1.5 0 0 1 20 16h-9l-5 4.5V16H4a1.5 1.5 0 0 1-1.5-1.5V6A1.5 1.5 0 0 1 4 4.5z"/><path d="M7 9h10M7 12h6"/></svg>',
  hand: '<svg viewBox="0 0 24 24"><path d="M7.5 12.5V6.8a1.5 1.5 0 0 1 3 0v4.7M10.5 11.5V4.8a1.5 1.5 0 0 1 3 0v6.7M13.5 11.5V5.8a1.5 1.5 0 0 1 3 0v6.4M16.5 12.2V9a1.5 1.5 0 0 1 3 0v5c0 4-3 7-7 7-2.8 0-4.4-1.4-5.8-3.8l-2.4-4a1.5 1.5 0 0 1 2.5-1.6l1.7 2.2"/></svg>',
  pill: '<svg viewBox="0 0 24 24"><g transform="rotate(-40 12 12)"><rect x="3" y="8.5" width="18" height="7" rx="3.5"/><path d="M12 8.5v7"/></g></svg>',
  person: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.8"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-6.2 10-6.2S22 12 22 12s-3.6 6.2-10 6.2S2 12 2 12z"/><circle cx="12" cy="12" r="2.9"/></svg>',
  word: '<svg viewBox="0 0 24 24"><path d="M3 7h18M3 12h12M3 17h15"/></svg>',
};
const story = { def: null, i: 0, t: 0, playing: true, vars: {}, tweens: [], m: {}, group: new THREE.Group(), edges: new Map(), nodes: new Map(),
  tokens: [], fx: {}, hud: {}, beatIdx: 0, scene: null, focus: null, show: [], labelSet: new Set(), last: 0, snapshot: null, flash: {}, flashNeg: {},
  rand: Math.random, sim: {}, stateId: null, tags: {}, camNow: null, framePending: false, instant: false, kicker: null, capText: '', gateT: 0 };
scene.add(story.group);
let storyMeshes = [];
const TINT_KEYS = new Set(['Caudate_nucleus', 'Putamen', 'Nucleus_accumbens']);
const HEAT = new THREE.Color('#ff8a3d'), DIMC = new THREE.Color('#1c2330'), GOLD = new THREE.Color('#ffc21a'), tmpC = new THREE.Color();
const TERR = [new THREE.Color('#3fd0a6'), new THREE.Color('#a98bff'), new THREE.Color('#5b7cff')];   // limbic, associative, sensorimotor
const pv3 = new THREE.Vector3();

// ---------- building the 3D layer ----------
function nodePos(n) { return mni2three(n.mni || centroid(n.key, story.def.hemi || 'L')); }
function makeLabel(text, cls = '', job = '') {
  const el = document.createElement('div'); el.className = 'slab ' + cls;
  if (job) { el.classList.add('two'); el.innerHTML = `<span class="nm">${escHtml(text)}</span><span class="jb">${escHtml(job)}</span>`; } else el.textContent = text;
  $('#labels').append(el); return el;
}
// plain-language decoder (content_jobs.js): a job line under every region label, a verb on every arrow, jargon decoded under the caption
const HAS_JOBS = typeof JOBS !== 'undefined';
const jobOf = n => n.job === false ? null : (n.job ? { job: n.job, say: n.say || '' } : HAS_JOBS ? (JOBS[n.label] || JOBS_KEY[n.key] || null) : null);
const arrowOf = e => (HAS_JOBS && ARROWS[e.id]) || null;
const arrowTag = e => e.tagText ?? arrowOf(e)?.tag ?? (HAS_JOBS ? ARROW_SIGN[e.sign] : '') ?? '';
function edgeMat(sign, len, ev) {
  const S = SIGN[sign];
  return new THREE.ShaderMaterial({
    uniforms: { ph: { value: 0 }, col: { value: new THREE.Color(S.col) }, len: { value: len }, act: { value: 0.5 }, w: { value: 1 }, vis: { value: 0 },
      pat: { value: EV_PAT[ev] ?? 0 }, bi: { value: S.bi ? 1 : 0 }, pk: { value: S.packets ? 1 : 0 }, fl: { value: 0 }, neg: { value: 0 }, fault: { value: 0 }, tm: { value: 0 } },
    vertexShader: 'uniform float w; varying vec2 vUv; void main(){ vUv = uv; vec3 p = position + normal * (w - 1.0) * 0.7; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
    fragmentShader: `uniform float ph; uniform vec3 col; uniform float len; uniform float act; uniform float vis; uniform float pat; uniform float bi; uniform float pk; uniform float fl; uniform float neg; uniform float fault; uniform float tm; varying vec2 vUv;
      float shape(float x, float k) { return k > 0.5 ? smoothstep(0.0, 0.05, x) * (1.0 - smoothstep(0.05, 0.2, x)) : smoothstep(0.0, 0.12, x) * (1.0 - smoothstep(0.12, 0.6, x)); }
      void main(){
        float s = vUv.x * len, per = pk > 0.5 ? 15.0 : 9.0;
        float p = shape(fract(s / per - ph), pk);
        if (bi > 0.5) p = 0.8 * max(p, shape(fract(s / per + ph), pk));
        float a = 0.2 + 0.3 * act + (0.3 + 0.9 * act) * p + 0.9 * fl;
        if (pat > 0.5 && pat < 1.5 && fract(s / 5.0) > 0.58) a *= 0.08;       // dashed: animal models
        if (pat > 1.5 && fract(s / 2.4) > 0.34) a *= 0.08;                    // dotted: proposed
        vec3 c = mix(col, vec3(0.32, 0.42, 0.58), neg);
        c = mix(c, vec3(1.0, 0.28, 0.22), 0.75 * fault);                     // dysconnected: red, flickering
        a *= 1.0 - 0.5 * fault * step(0.5, fract(tm * 6.0 + s * 0.11));
        gl_FragColor = vec4(c * (0.45 + 1.25 * p * (0.35 + act) + 1.2 * fl), a * vis);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
}
function buildStory(def) {
  clearStory3D();
  for (const [id, n] of Object.entries(def.nodes)) {
    const p = nodePos(n);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(n.r || 1.5, 16, 12), new THREE.MeshBasicMaterial({ color: n.dot || '#e7edf4', transparent: true, opacity: 0, depthWrite: false }));
    dot.position.copy(p); dot.renderOrder = 6; dot.visible = false; story.group.add(dot);
    story.nodes.set(id, { id, def: n, pos: p, dot, label: n.label ? makeLabel(n.label, n.hot ? 'hot' : '', jobOf(n)?.job || '') : null, vis: 0, sv: 0 });
  }
  story.keyNodes = new Map();
  for (const [id, n] of Object.entries(def.nodes)) if (n.key) story.keyNodes.set(n.key, [...(story.keyNodes.get(n.key) || []), id]);
  for (const e of def.edges) {
    const a = story.nodes.get(e.from), b = story.nodes.get(e.to), S = SIGN[e.sign];
    const curve = new THREE.CatmullRomCurve3([a.pos, ...(e.via || []).map(v => mni2three(v)), b.pos], false, 'centripetal');
    const len = curve.getLength(), mat = edgeMat(e.sign, len, e.ev);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(40, Math.round(len * 1.4)), 0.7, 8, false), mat);
    tube.renderOrder = 5; tube.visible = false; story.group.add(tube);
    const cap = S.cap === 'none' ? null : new THREE.Mesh(S.cap === 'bar' ? new THREE.CylinderGeometry(2.3, 2.3, 0.9, 20) : new THREE.ConeGeometry(1.7, 3.8, 14),
      new THREE.MeshBasicMaterial({ color: S.col, transparent: true, opacity: 0, depthWrite: false }));
    const tEnd = clamp(1 - ((b.def.r || 1.5) * 2.4) / len, 0.6, 0.97);
    if (cap) {
      cap.position.copy(curve.getPointAt(tEnd));
      cap.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curve.getTangentAt(tEnd).normalize());
      cap.renderOrder = 6; cap.visible = false; story.group.add(cap);
    }
    story.edges.set(e.id, { id: e.id, def: e, curve, len, tube, mat, cap, vis: 0, ph: Math.random(), act: 0, tag: makeLabel('', 'tag') });
  }
  // parvalbumin interneuron ring
  story.ring = [];
  if (def.ring) {
    const c = story.nodes.get(def.ring).pos;
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2, s = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 8), new THREE.MeshBasicMaterial({ color: '#6cc4ff', transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }));
      s.position.set(c.x + Math.cos(a) * 7, c.y + Math.sin(a) * 6, c.z + Math.sin(a * 2) * 2); s.renderOrder = 7; s.visible = false; story.group.add(s); story.ring.push(s);
    }
  }
  // drug caps on the striatal surface: one set per drug variable (blue hexagons = D2 blockade, green rounds = muscarinic)
  story.shields = [];
  const capsets = def.capsets || (def.shieldOn ? [{ var: 'd2', shape: 'hex', stroke: '#9fd3ff', fill: 'rgba(74,168,255,0.55)', on: def.shieldOn }] : []);
  capsets.forEach((cs, ci) => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d');
    g.strokeStyle = cs.stroke; g.fillStyle = cs.fill; g.lineWidth = 5; g.beginPath();
    if (cs.shape === 'hex') { for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; g[k ? 'lineTo' : 'moveTo'](32 + 26 * Math.cos(a), 32 + 26 * Math.sin(a)); } g.closePath(); }
    else g.arc(32, 32, 24, 0, Math.PI * 2);
    g.fill(); g.stroke();
    if (cs.text) { g.fillStyle = '#0a0f16'; g.font = 'bold 22px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(cs.text, 32, 33); }
    const tex = new THREE.CanvasTexture(cv);
    let n = 0;
    for (const [key, count, test] of cs.on) {
      const mesh = (byKey.get(key) || []).find(mm => mm.userData.hemi === (def.hemi || 'L')); if (!mesh) continue;
      const pos = mesh.geometry.attributes.position, nor = mesh.geometry.attributes.normal, cand = [];
      for (let i = ci; i < pos.count; i += 3) { const v = new THREE.Vector3().fromBufferAttribute(pos, i); if (!test || test(three2mni(v))) cand.push(i); }
      const R = rng(77 + 31 * ci + n++);
      for (let k = 0; k < count && cand.length; k++) {
        const i = cand.splice(Math.floor(R() * cand.length), 1)[0];
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false }));
        sp.position.fromBufferAttribute(pos, i).addScaledVector(new THREE.Vector3().fromBufferAttribute(nor, i), 1.6);
        sp.scale.setScalar(0.01); sp.renderOrder = 8; sp.userData.delay = k * 0.06; sp.userData.v = cs.var; story.group.add(sp); story.shields.push(sp);
      }
    }
  });
}
function clearStory3D() {
  for (const o of [...story.group.children]) { o.geometry?.dispose(); if (o.material) { o.material.map?.dispose?.(); o.material.dispose(); } story.group.remove(o); }
  story.edges.clear(); story.nodes.clear(); $('#labels').innerHTML = '';
}

// ---------- tokens ----------
function spawnToken(t) {
  const a = story.nodes.get(t.from), b = story.nodes.get(t.to); if (!a || !b) return null;
  const curve = new THREE.CatmullRomCurve3([a.pos, ...(t.via || []).map(v => mni2three(v)), b.pos], false, 'centripetal');
  const el = document.createElement('div'); el.className = 'tok'; el.innerHTML = (ICONS[t.icon] || '') + '<span class="bang">!</span>';
  const ring = document.createElement('div'); ring.className = 'ghostring';
  $('#tokens').append(el, ring);   // the ghost ring (face-value size) sits on top, so it shows inside a swollen token
  const tok = { dur: 2.2, life: 3, ...t, curve, el, ring, t0: story.t, size: t.size0 ?? 1, target: 1, arrived: false, off: t.off ? new THREE.Vector3(...t.off) : null, pos: new THREE.Vector3() };
  if (t.cls) el.classList.add(t.cls);
  // grow: the token swells (or shrinks) along its path to a size fixed at spawn, e.g. value judged in the current mood
  if (t.grow && t.sal) tok.pre = t.sal(story, tok);
  story.tokens.push(tok); return tok;
}
function clearTokens() { for (const tk of story.tokens) { tk.el.remove(); tk.ring.remove(); } story.tokens = []; }
story.spawn = spawnToken;
story.flashEdge = (id, mag, neg = false) => { story.flash[id] = Math.max(story.flash[id] || 0, mag); story.flashNeg[id] = neg ? 1 : 0; };
story.setState = id => { story.stateId = id; syncBar(); };
story.setCaption = text => setCaption(text);

// ---------- vars, tweens, scenes ----------
function tweenVar(k, to, dur = 1.2, delay = 0, from) {
  story.tweens = story.tweens.filter(tw => tw.k !== k);
  if (from !== undefined) story.vars[k] = from;
  if (dur <= 0 || reduceMotion || story.instant || (story.def.discrete || []).includes(k)) { story.vars[k] = to; return; }
  story.tweens.push({ k, from: story.vars[k] ?? 0, to, t0: performance.now() + delay * 1000, dur: dur * 1000 });
}
story.tween = tweenVar;
function stepTweens(now) {
  story.tweens = story.tweens.filter(tw => { if (now < tw.t0) return true; const e = clamp((now - tw.t0) / tw.dur); story.vars[tw.k] = lerp(tw.from, tw.to, easeIO(e)); return e < 1; });
}
function applyState(id, dur = 0.9) {
  const st = story.def.states.find(s => s.id === id); if (!st) return;
  for (const [k, v] of Object.entries(st.vars)) tweenVar(k, v, dur);
  story.stateId = id;
}
function frameCam(cam, animate = true) {
  if (!cam || !story.def) return;
  const ids = cam.fit || (cam.target ? [cam.target] : [...story.nodes.keys()].filter(k => !story.def.nodes[k].nofit));
  const pts = ids.map(id => story.nodes.get(id)?.pos).filter(Boolean);
  const sp = sphereOf(pts, cam.r || 24, cam.pad ?? 9);
  frameSphere(sp.center, sp.radius, cam.dir || story.def.view, animate && !story.instant, cam.dur || 1000);
}
function gotoScene(i, opts = {}) {
  const def = story.def; if (!def) return;
  i = clamp(i, 0, def.scenes.length - 1);
  const sc = def.scenes[i];
  story.i = i; story.t = 0; story.beatIdx = 0; story.scene = sc; story.rand = rng(1000 + i * 7919); story.sim = {};
  story.instant = !!opts.instant;
  const target = { ...def.vars, ...((def.states.find(s => s.id === sc.state) || {}).vars || {}), ...(sc.set || {}) };
  for (const [k, v] of Object.entries(target)) tweenVar(k, v, sc.ease ?? 0.9);
  story.stateId = sc.state;
  story.show = sc.show === 'all' ? [...story.edges.keys()] : (sc.show || []);
  story.focus = sc.focus || null; story.labelSet = new Set(sc.labels || []); story.tags = { ...(sc.tags || {}) };
  story.fx = { ...(sc.fx || {}) }; story.hud = { ...(def.hud || {}), ...(sc.hud || {}) };
  if (def.steps) {
    // Step mode: everything introduced so far stays on screen, dimmed, as context; only this step's focus is bright,
    // labelled and moving. Instruments ('@mood', '@grid', '@clock', '@bias', '@loop') follow the same rule.
    const intro = new Set(); for (let j = 0; j <= i; j++) for (const id of def.scenes[j].add || []) intro.add(id);
    story.intro = intro;
    story.show = [...story.edges.keys()].filter(id => intro.has(id));
    story.focus = sc.recap ? null : (sc.focus || sc.add || []);
    const lab = sc.recap ? [...intro] : story.focus;
    story.labelSet = new Set([...lab.filter(id => story.nodes.has(id)), ...(sc.labels || [])]);
    const newNode = !sc.recap && (sc.add || []).find(id => story.nodes.has(id));
    if (newNode) story.fx.look = newNode;
    $('#sbnext').classList.remove('ready'); story.waiting = false;
  }
  story.flash = {}; story.flashNeg = {};
  if (story.sceneLevelKeys && story.sceneLevelKeys.size) {
    for (const k of story.sceneLevelKeys) state.level.set(k, story.baseLevels.get(k));
    for (const [k, lv] of Object.entries(sc.levels || {})) state.level.set(k, lv);
    applyMaterials();
  }
  paintYeo(story.hud.yeo || 0);
  story.see = sc.see ? new Set(sc.see) : null; applySee();
  story.kicker = sc.kicker || null;
  clearTokens(); $('#sbgloss').innerHTML = ''; $('#sbgloss').hidden = true; story.glossQueue = []; story.readUntil = 0; setCaption(sc.caption); renderExtra(sc); renderInset(sc.inset || null); syncBar();
  if (!$('#keycard').hidden) $('#keycard').innerHTML = keyHtml(def);
  story.camNow = sc.cam || (def.steps && def.cam) || { dir: def.view }; story.framePending = true;
  const anim = !opts.instant;
  requestAnimationFrame(() => { story.framePending = false; resize(); frameCam(story.camNow, anim); });
  story.instant = false;
  if (opts.play !== undefined) story.playing = opts.play;
}
function applyBeat(b) {
  if (b.kicker !== undefined) story.kicker = b.kicker;
  if (b.caption) setCaption(b.caption);
  if (b.relabel) story.labelSet = new Set(b.relabel);
  if (b.see) { story.see = new Set([...(story.see || []), ...b.see]); applySee(); }
  if (b.focus !== undefined) story.focus = b.focus;
  if (b.show) story.show = b.show === 'all' ? [...story.edges.keys()] : b.show;
  if (b.labels) for (const l of b.labels) story.labelSet.add(l);
  if (b.tags) Object.assign(story.tags, b.tags);
  if (b.cam) { story.camNow = b.cam; if (!story.framePending) frameCam(b.cam, !story.instant); }
  if (b.tween) for (const [k, v] of Object.entries(b.tween)) Array.isArray(v) ? tweenVar(k, v[0], v[1]) : tweenVar(k, v);
  if (b.set) Object.assign(story.vars, b.set);
  if (b.fx) Object.assign(story.fx, b.fx);
  if (b.hud) Object.assign(story.hud, b.hud);
  if (b.state !== undefined) { story.stateId = b.state; syncBar(); }
  if (b.token) spawnToken(b.token);
  if (b.inset !== undefined) renderInset(b.inset);
  if (b.do) b.do(story);
  if ((b.labels || b.relabel || b.show || b.see) && !$('#keycard').hidden) $('#keycard').innerHTML = keyHtml(story.def);
}
// reveal mode: a story with reveal:true shows a deep structure only once a scene (or beat) puts its node in `see`;
// cortical ghosts stay as the context shell
function applySee() {
  const def = story.def; if (!def || !def.reveal || !story.see) return;
  for (const [id, n] of Object.entries(def.nodes)) {
    if (!n.key || cortex.includes(n.key)) continue;
    state.level.set(n.key, story.see.has(id) ? (n.ghost ? 1 : 2) : 0);
  }
  applyMaterials();
}
function fastForward(t) {
  story.instant = true; story.ffwd = true;
  for (let x = 0; x < t; x += 0.1) {
    story.t += 0.1;
    const beats = story.scene.beats || [];
    while (story.beatIdx < beats.length && beats[story.beatIdx].at <= story.t) applyBeat(beats[story.beatIdx++]);
    for (const tw of story.tweens) story.vars[tw.k] = tw.to; story.tweens = [];
    story.m = story.def.model(story.vars, story);
    if (story.def.tick) story.def.tick(0.1, story.vars, story.m, story);
    for (const tk of story.tokens) if (story.t - tk.t0 >= tk.dur && !tk.arrived) arrive(tk);
  }
  story.instant = false; story.ffwd = false; story.readUntil = 0;
}
function arrive(tk) {
  tk.arrived = true;
  tk.target = tk.pre ?? (tk.sal ? tk.sal(story, tk) : story.def.salience ? story.def.salience(tk.kind, story.m, story) : 1);
  if (tk.flash) story.flashEdge(tk.flash, clamp(tk.target - 0.55), false);
  if (tk.onArrive) tk.onArrive(story, tk);
}

// ---------- per-frame ----------
const shownE = id => story.show.includes(id);
const focusedId = id => !story.focus || story.focus.includes(id);
function storyFrame(now) {
  const dt = Math.min(0.1, (now - (story.last || now)) / 1000); story.last = now;
  const def = story.def, sc = story.scene;
  if (story.playing) {
    // narration gate: while the voice is still reading, hold before the next captioned beat (or the scene end), at most 12 s
    let nt = story.t + dt;
    const nb = (sc.beats || [])[story.beatIdx], lim = nb ? (nb.caption ? nb.at : Infinity) : (sc.free || def.steps ? Infinity : sc.dur + (sc.hold ?? 1.5));
    if (story.narrate && window.speechSynthesis && speechSynthesis.speaking && nt >= lim && story.gateT < 12) { story.gateT += dt; nt = Math.max(story.t, lim - 0.001); } else if (nt < lim) story.gateT = 0;
    // reading gate: the same hold until the caption and any new definitions have had reading time (about 150 words a minute)
    if (nt >= lim && now < story.readUntil) nt = Math.max(story.t, lim - 0.001);
    story.t = nt;
    const beats = sc.beats || [];
    while (story.beatIdx < beats.length && beats[story.beatIdx].at <= story.t) applyBeat(beats[story.beatIdx++]);
  }
  stepTweens(now);
  story.m = def.model(story.vars, story);
  if (story.playing && def.tick) def.tick(dt, story.vars, story.m, story);
  if (def.steps) {
    if (story.fx.look && story.t > 2.6) story.fx.look = null;
    const ready = story.t >= sc.dur + 0.3, last = story.i === def.scenes.length - 1;
    if (ready !== story.waiting) { story.waiting = ready; $('#sbnext').classList.toggle('ready', ready && !last); }
    if (story.auto && story.playing && story.t >= Math.max(sc.dur + 1.2, sc.read || 0) && !(story.narrate && window.speechSynthesis && speechSynthesis.speaking)) {
      if (!last) gotoScene(story.i + 1); else { story.auto = false; syncBar(); }
    }
  } else if (story.playing && !sc.free && story.t >= sc.dur + (sc.hold ?? 1.5)) {
    if (story.i < def.scenes.length - 1) gotoScene(story.i + 1); else { story.playing = false; syncBar(); }
  }
  applyLook(dt, now);
  updateHud(dt, now);
}
// a story can grey the cortex into a neutral shell (def.shell) so only the structures in play carry colour
const baseCol = mesh => (story.def && story.def.shell && CORTEX_GROUPS.has(mesh.userData.st.group)) ? story.def.shell : mesh.userData.st.color;
function applyLook(dt, now) {
  const m = story.m, def = story.def, k = 1 - Math.exp(-dt * 5);
  for (const E of story.edges.values()) {
    const e = E.def, on = shownE(e.id) && (!e.gate || e.gate(m, story)), ctx = def.steps && !focusedId(e.id), tgt = on ? (focusedId(e.id) ? 1 : (def.steps ? 0.16 : 0.2)) : 0;
    E.vis += (tgt - E.vis) * k;
    E.act += ((ctx ? 0.1 : clamp(e.act ? e.act(m) : 0.5)) - E.act) * k;
    const w = e.w ? e.w(m) : 0.55 + 1.15 * E.act;
    let fl = story.flash[e.id] || 0; if (fl) story.flash[e.id] = Math.max(0, fl - dt * 1.3);
    if (!reduceMotion && !ctx) E.ph += dt * (0.15 + 1.5 * E.act);
    const u = E.mat.uniforms; u.ph.value = E.ph; u.act.value = E.act; u.w.value = w; u.vis.value = E.vis; u.fl.value = Math.min(1, fl); u.neg.value = story.flashNeg[e.id] || 0;
    u.fault.value = e.fault ? clamp(e.fault(m)) : 0; u.tm.value = reduceMotion ? 0 : now / 1000;
    const vis = E.vis > 0.01; E.tube.visible = vis;
    if (E.cap) { E.cap.visible = vis; E.cap.material.opacity = 0.85 * E.vis; E.cap.scale.setScalar(0.75 + 0.45 * w); }
  }
  for (const N of story.nodes.values()) {
    const gated = N.def.gate && !N.def.gate(m, story);
    let tgt;
    if (def.steps) {
      const intro = story.intro.has(N.id) && !gated, svT = intro ? (focusedId(N.id) ? 1 : 0.3) : 0;
      N.sv += (svT - N.sv) * k * 0.8;
      tgt = intro && !N.def.noDot ? (focusedId(N.id) ? 0.9 : 0.3) : 0;
    } else {
      let touched = false; for (const E of story.edges.values()) if ((E.def.from === N.id || E.def.to === N.id) && shownE(E.def.id)) { touched = true; break; }
      tgt = (touched || story.labelSet.has(N.id)) && !N.def.noDot && !gated ? (focusedId(N.id) ? 0.9 : 0.35) : 0;
    }
    N.vis += (tgt - N.vis) * k; N.dot.material.opacity = N.vis; N.dot.visible = N.vis > 0.01;
  }
  const look = def.look ? def.look(m, story) : {};
  for (const mesh of storyMeshes) {
    const key = mesh.userData.key, L = look[key], mat = mesh.material, st = mesh.userData.st, tinted = story.hud.tint && TINT_KEYS.has(key);
    let sv = 1;
    if (def.steps && story.keyNodes.has(key)) {
      // step mode: a structure is hidden until introduced, ghosted as context, near-solid in focus
      const ids = story.keyNodes.get(key); sv = Math.max(...ids.map(id => story.nodes.get(id).sv));
      const cortical = ids.some(id => def.nodes[id].ghost);
      mat.opacity = cortical ? state.ghost + (0.32 - state.ghost) * sv : 0.88 * sv;
      mesh.visible = (cortical || sv > 0.02) && (state.hemi === 'B' || mesh.userData.hemi === 'M' || mesh.userData.hemi === state.hemi);
    }
    if (!L) { if (mat.userData.sl) { if (!tinted) mat.color.set(baseCol(mesh)); mat.userData.sl = false; } continue; }
    mat.userData.sl = true;
    if (!tinted) { tmpC.set(L.col || baseCol(mesh)); if (L.heat) tmpC.lerp(HEAT, clamp(L.heat)); if (L.dim) tmpC.lerp(DIMC, clamp(L.dim)); mat.color.copy(tmpC); }
    mat.emissive.set(L.ec || '#ffb454'); mat.emissiveIntensity = Math.max(mat.emissiveIntensity, clamp(L.glow || 0) * 0.9 * (def.steps ? sv * sv : 1));
    if (L.op !== undefined && mat.transparent && !def.steps) mat.opacity = L.op;
  }
  if (story.hud.tint) tintStriatum(m, now); else if (tintOn) untint();
  if (story.painted) for (const mesh of story.painted.meshes) if (mesh.material.transparent) mesh.material.opacity = 0.34;
  if (story.ring.length) {
    const pvN = (story.m.pvEff ?? story.vars.pv ?? 1) * 8, on = !!story.hud.ring;
    story.ring.forEach((s, i) => {
      const alive = i < pvN - 0.5 || (i < pvN + 0.5 && Math.sin(now / 90 + i * 3) > 0);
      const tgt = on && alive ? 0.95 : 0; s.material.opacity += (tgt - s.material.opacity) * k * 1.6; s.visible = s.material.opacity > 0.02;
      s.scale.setScalar(0.85 + 0.25 * Math.sin(now / 240 + i));
    });
  }
  if (story.shields.length) {
    story.shields.forEach(sp => { const lv = story.hud.shields ? (story.vars[sp.userData.v] ?? 0) : 0, tgt = clamp(lv * 1.25 - sp.userData.delay) * 3.4; sp.scale.setScalar(Math.max(0.01, sp.scale.x + (tgt - sp.scale.x) * k * 1.5)); sp.visible = sp.scale.x > 0.05; });
  }
}
let tintOn = false;
// paint one Yeo network on the (ghosted) cortex for a scene; everything else grey
function paintYeo(id) {
  if ((story.painted?.id || 0) === id) return;
  for (const mesh of story.painted?.meshes || []) { const mat = mesh.material; mat.vertexColors = false; mat.needsUpdate = true; mat.color.set(mesh.userData.st.color); }
  story.painted = null;
  if (!id) { applyMaterials(); return; }
  const list = [], c = new THREE.Color();
  for (const mesh of meshes) {
    const { st, net } = mesh.userData; if (!(CORTEX_GROUPS.has(st.group) || st.key === 'Parahippocampal_and_ambient_gyri')) continue;
    const mat = mesh.material, arr = mesh.geometry.attributes.color.array;
    if (!mat.vertexColors) { mat.vertexColors = true; mat.needsUpdate = true; }
    mat.color.set(0xffffff);
    for (let i = 0; i < net.length; i++) { c.set(net[i] === id ? NETS[id].color : '#3a414d'); arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
    mesh.geometry.attributes.color.needsUpdate = true; list.push(mesh);
  }
  story.painted = { id, meshes: list };
}
// Oklab mixing: lavender → gold passes through a neutral grey instead of pink
function toLab(c) { const l = Math.cbrt(0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b), m = Math.cbrt(0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b), s = Math.cbrt(0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]; }
function fromLab([L, A, B], out) { const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3, m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3, s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return out.setRGB(clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s), clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s), clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s), THREE.LinearSRGBColorSpace); }
const TERR_LAB = TERR.map(toLab), GOLD_LAB = toLab(GOLD);
const terrCache = new Map();
// Striatal parcels per vertex from the Melbourne Subcortex Atlas (Tian 2020, scale III, sampled at build time).
// Assigning parcels to limbic / associative / sensorimotor territories is a judgment, stated in the Key.
const TIAN = man.tian ? new Map(Object.entries(man.tian.meshes).map(([i, b64]) => [meshes[+i], Uint8Array.from(atob(b64), c => c.charCodeAt(0))])) : new Map();
const TIAN_TERR = { 'NAc-shell': 0, 'NAc-core': 0, 'CAU-VA': 0, 'PUT-VA': 0, 'CAU-DA': 1, 'CAU-body': 1, 'CAU-tail': 1, 'PUT-DA': 1, 'PUT-VP': 2, 'PUT-DP': 2 };
const PARCEL_SHADE = [1, 0.86, 1.12];
function territories(mesh) {
  if (terrCache.has(mesh)) return terrCache.get(mesh);
  const p = mesh.geometry.attributes.position, key = mesh.userData.key, ter = new Uint8Array(p.count), shade = new Float32Array(p.count).fill(1), v = new THREE.Vector3();
  const lab = TIAN.get(mesh);
  for (let i = 0; i < p.count; i++) {
    const L = lab ? lab[i] : 0;
    if (L) { const nm = man.tian.names[L - 1].replace(/-(lh|rh)$/, ''); ter[i] = TIAN_TERR[nm] ?? 1; shade[i] = PARCEL_SHADE[L % 3]; continue; }
    const [, y, z] = three2mni(v.fromBufferAttribute(p, i));      // fallback: coordinate rule
    ter[i] = key === 'Nucleus_accumbens' ? 0 : key === 'Caudate_nucleus' ? (z < 2 && y > 8 ? 0 : 1) : (y < -2 ? 2 : z < -3 ? 0 : 1);
  }
  const out = { ter, shade }; terrCache.set(mesh, out); return out;
}
function tintStriatum(m, now) {
  tintOn = true;
  const lv = [m.limbicDA ?? 0.4, m.assocDA ?? 0.4, 0.3], pulse = 0.88 + 0.12 * Math.sin(now / 300);
  for (const mesh of storyMeshes) {
    if (!TINT_KEYS.has(mesh.userData.key)) continue;
    const mat = mesh.material, { ter, shade } = territories(mesh), arr = mesh.geometry.attributes.color.array;
    if (!mat.vertexColors) { mat.vertexColors = true; mat.needsUpdate = true; }
    mat.color.set(0xffffff);
    for (let i = 0; i < ter.length; i++) {
      // reach pure gold at high dopamine (mixing gold with the blue-ish base in linear space reads as peach)
      const g = clamp((lv[ter[i]] - 0.38) / 0.3), A = TERR_LAB[ter[i]];
      fromLab([A[0] + (GOLD_LAB[0] - A[0]) * g, A[1] + (GOLD_LAB[1] - A[1]) * g, A[2] + (GOLD_LAB[2] - A[2]) * g], tmpC).multiplyScalar((g > 0.05 ? pulse : 1) * (g > 0.6 ? 1 : shade[i]));
      arr[i * 3] = tmpC.r; arr[i * 3 + 1] = tmpC.g; arr[i * 3 + 2] = tmpC.b;
    }
    mesh.geometry.attributes.color.needsUpdate = true;
  }
}
function untint() {
  tintOn = false;
  for (const mesh of storyMeshes) if (TINT_KEYS.has(mesh.userData.key)) { mesh.material.vertexColors = false; mesh.material.needsUpdate = true; mesh.material.color.set(mesh.userData.st.color); }
}

// ---------- heads-up layer ----------
// Phones: one strip across the top (counted as an obstruction, so the camera frames below it).
// Desktop: a column down the left edge. Labels are decluttered every frame and keep a leader line to their node.
const hud = {};
const isSmall = () => innerWidth <= 760;
const NEXT_SVG = '<svg viewBox="0 0 20 20"><path d="M15 4v12M4 4l8 6-8 6z"/></svg>';
const PLAY_SVG = '<svg viewBox="0 0 20 20"><path d="M6 4l10 6-10 6z"/></svg>', PAUSE_SVG = '<svg viewBox="0 0 20 20"><path d="M6 4v12M14 4v12" stroke-width="3"/></svg>';
function initHud() {
  const P = (a, R, cx = 54, cy = 52) => [cx + R * Math.cos(a), cy - R * Math.sin(a)];
  const arc = (a0, a1, col) => { const [x0, y0] = P(a0, 42), [x1, y1] = P(a1, 42); return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A42 42 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="${col}" stroke-width="7" fill="none"/>`; };
  $('#dial').innerHTML = `<div class="t">Dopamine gain<span class="ill">illustrative units</span></div><svg viewBox="0 0 108 60">${arc(Math.PI, 0.62 * Math.PI, '#4aa8ff')}${arc(0.62 * Math.PI, 0.38 * Math.PI, '#5d6878')}${arc(0.38 * Math.PI, 0, '#ffd34d')}
    <line id="draw" x1="54" y1="52" x2="54" y2="12" stroke="#e7edf4" stroke-width="2" stroke-dasharray="3 3" opacity="0"/>
    <line id="dneedle" x1="54" y1="52" x2="54" y2="16" stroke="#e7edf4" stroke-width="3" stroke-linecap="round"/><circle cx="54" cy="52" r="4.5" fill="#e7edf4"/></svg><div id="dword" class="mono" style="font-size:10.5px;margin-top:-1px;line-height:1.25"></div>`;
  hud.needle = $('#dneedle'); hud.raw = $('#draw'); hud.word = $('#dword'); hud.P = P;
  $('#grid').innerHTML = Array.from({ length: 25 }, () => '<i></i>').join('') + '<div class="cap">dopamine neurons awake</div>';
  hud.dots = $$('#grid i');
  $('#ledger').innerHTML = '<span class="p">+</span>&thinsp;<span>×</span>&thinsp;<span class="m">−</span>&thinsp;<span>×</span>&thinsp;<span class="m">−</span>&thinsp;<span class="r">= +</span>';
  hud.ledger = $$('#ledger span');
  $('#moodbar').innerHTML = '<div class="lab">Mood</div><div class="track"><div class="zero"></div><div class="knob"></div></div><div class="lab">running total of surprises</div>';
  hud.knob = $('#moodbar .knob'); hud.track = $('#moodbar .track');
  $('#seesaw').innerHTML = `<div class="t" style="text-align:center">Network balance</div><svg viewBox="0 0 180 56">
    <text x="4" y="11" fill="#e7edf4" font-size="10.5">Default mode</text><text x="176" y="11" fill="#e7edf4" font-size="10.5" text-anchor="end">Sensorimotor</text>
    <polygon points="90,46 81,55 99,55" fill="#5d6878"/>
    <g id="beam"><line x1="18" y1="44" x2="162" y2="44" stroke="#c9d4e2" stroke-width="3" stroke-linecap="round"/><circle cx="26" cy="35" r="7.5" fill="#cd3e4e"/><circle cx="154" cy="35" r="7.5" fill="#6fa8ff"/></g></svg>
    <div class="src">resting-state variability, Martino 2016</div>`;
  hud.beam = $('#beam');
  $('#clockico').innerHTML = '<svg viewBox="0 0 30 30"><circle cx="15" cy="15" r="12" fill="rgba(10,15,22,0.85)" stroke="#3fd0c9" stroke-width="2"/><line id="chand" x1="15" y1="15" x2="15" y2="6" stroke="#3fd0c9" stroke-width="2.4" stroke-linecap="round"/><circle cx="15" cy="15" r="2" fill="#3fd0c9"/></svg>';
  hud.hand = $('#chand');
  $('#daystrip').innerHTML = '<canvas width="600" height="32"></canvas><span class="lab">day / night</span>';
  hud.strip = $('#daystrip canvas');
  hud.datLabel = makeLabel('Dopamine transporter ↑ (faster clearance)', 'tag');
  $('#hudsvg').innerHTML = `<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="context-stroke"/></marker></defs>
    <g id="leaders"></g><path id="gridlead" fill="none" stroke="#ffd34d" stroke-width="1.2" stroke-dasharray="3 4" opacity="0"/><path id="bias" fill="none" stroke-linecap="round" marker-end="url(#ah)" opacity="0"/>
    <path id="loop" fill="none" stroke="#3fd0c9" stroke-width="2.6" stroke-dasharray="6 5" stroke-linecap="round" marker-end="url(#ah)" opacity="0"/><g id="threads"></g>`;
  hud.bias = $('#bias'); hud.threads = $('#threads'); hud.leaders = $('#leaders'); hud.gridlead = $('#gridlead'); hud.loop = $('#loop');
  if (!hud.ro && typeof ResizeObserver !== 'undefined') {
    hud.ro = new ResizeObserver(() => { document.body.style.setProperty('--sb-h', `${Math.round($('#storybar').getBoundingClientRect().height)}px`); _fbc = null; resize(); });
    for (const sel of ['#storybar', '#inset', '#hudrow', '#keycard']) hud.ro.observe($(sel));
  }
}
function clearHud() {
  for (const id of ['#dial', '#ledger', '#moodbar', '#seesaw', '#grid', '#clockico', '#daystrip', '#badge', '#hitring', '#spotring']) $(id)?.classList.remove('on', 'dim', 'look');
  $('#hudsvg').innerHTML = ''; $('#tokens').innerHTML = ''; $('#labels').innerHTML = '';
}
// push overlapping labels apart vertically, keep them inside the uncovered strip
function declutter(items, fb, W) {
  for (const it of items) { it.x = clamp(it.ax - it.w / 2, 2, W - it.w - 2); it.y = it.below ? it.ay + 9 : it.ay - it.h - 9; }
  for (let pass = 0; pass < 8; pass++) {
    let moved = false; items.sort((a, b) => a.y - b.y);
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      if (a.x < b.x + b.w + 4 && b.x < a.x + a.w + 4 && a.y < b.y + b.h + 3 && b.y < a.y + a.h + 3) { const dy = (a.y + a.h + 3 - b.y) / 2 + 0.5; a.y -= dy; b.y += dy; moved = true; }
    }
    for (const it of items) it.y = clamp(it.y, fb.top + 2, fb.bot - it.h - 2);
    if (!moved) break;
  }
}
function measure(el) { const key = el.className.includes('nojob') + el.textContent; if (el._t !== key) { el._t = key; el._w = el.offsetWidth; el._h = el.offsetHeight; } return [el._w || 60, el._h || 20]; }
function updateHud(dt, now) {
  const r = canvas.getBoundingClientRect(), W = r.width, H = r.height, m = story.m, def = story.def, small = isSmall();
  let H2 = story.hud;
  if (def.steps) {
    const I = story.intro, F = story.focus, on = k => I.has('@' + k), dim = k => on(k) && F && !F.includes('@' + k);
    H2 = { ...H2, mood: on('mood'), grid: on('grid'), clock: on('clock') };
    for (const [id, k] of [['#moodbar', 'mood'], ['#grid', 'grid'], ['#clockico', 'clock']]) $(id).classList.toggle('dim', dim(k));
    story.instr = { bias: on('bias') ? (dim('bias') ? 0.25 : 1) : 0, loop: on('loop') ? (dim('loop') ? 0.25 : 1) : 0 };
  }
  const fb = freeBandCached();
  const proj = p => { pv3.copy(p).project(camera); return { x: (pv3.x + 1) / 2 * W, y: (1 - pv3.y) / 2 * H, ok: pv3.z < 1 && pv3.z > -1 }; };
  const k = 1 - Math.exp(-dt * 6);
  const insetEl = $('#inset'), insetOn = !insetEl.hidden, ir = insetOn ? insetEl.getBoundingClientRect() : null;
  // the heads-up row/column sits below the inset card on phones
  const row = $('#hudrow'); row.style.top = `${small && insetOn ? Math.round(ir.bottom - r.top + 6) : (small ? 8 : 12)}px`;
  const dial = $('#dial'); dial.classList.toggle('on', !!H2.dial);
  if (H2.dial) {
    const g = clamp(def.gauge.gain(m)), [x, y] = hud.P(Math.PI * (1 - g), 36);
    hud.needle.setAttribute('x2', x.toFixed(1)); hud.needle.setAttribute('y2', y.toFixed(1));
    const raw = def.gauge.raw ? clamp(def.gauge.raw(m)) : g, show = Math.abs(raw - g) > 0.06, [rx, ry] = hud.P(Math.PI * (1 - raw), 40);
    hud.raw.setAttribute('x2', rx.toFixed(1)); hud.raw.setAttribute('y2', ry.toFixed(1)); hud.raw.setAttribute('opacity', show ? 0.8 : 0);
    const word = (g < 0.38 ? 'low' : g > 0.62 ? 'high' : 'normal') + (show ? ` · source ${raw > 0.62 ? 'high' : 'normal'}` : '');
    if (hud.word.textContent !== word) hud.word.textContent = word;
  }
  const led = $('#ledger'); led.classList.toggle('on', !!H2.ledger);
  if (H2.ledger) { const upto = [0, 1, 3, 5, 6][story.fx.ledger || 0] || 0; hud.ledger.forEach((s, i) => s.classList.toggle('on', i < upto)); }
  const mb = $('#moodbar'); mb.classList.toggle('on', !!H2.mood);
  if (H2.mood) {
    const f = (clamp(story.vars.m ?? 0, -1, 1) + 1) / 2;
    if (small) { hud.knob.style.left = `${f * 100}%`; hud.knob.style.top = '50%'; } else { hud.knob.style.left = '50%'; hud.knob.style.top = `${(1 - f) * 100}%`; }
    hud.knob.classList.toggle('kick', now - (story.kick || -9999) < 650);
  }
  const ss = $('#seesaw'); ss.classList.toggle('on', !!H2.seesaw);
  if (H2.seesaw) hud.beam.setAttribute('transform', `rotate(${(clamp(m.tilt ?? 0, -1, 1) * 14).toFixed(1)} 90 44)`);
  // dopamine neuron grid lives in the heads-up row, with a leader line down to the ventral tegmental area
  const grid = $('#grid'), vta = story.nodes.get(def.gridAt || 'vta');
  grid.classList.toggle('on', !!H2.grid && !!vta);
  if (H2.grid && vta) {
    const lit = Math.round(clamp(def.gauge.pop(m)) * 25);
    hud.dots.forEach((d, i) => d.classList.toggle('lit', i < lit));
    const gr = grid.getBoundingClientRect(), s = proj(vta.pos);
    const gx = gr.left - r.left + gr.width / 2, gy = gr.bottom - r.top;
    hud.gridlead.setAttribute('d', `M${gx.toFixed(1)} ${gy.toFixed(1)} Q ${gx.toFixed(1)} ${((gy + s.y) / 2).toFixed(1)} ${s.x.toFixed(1)} ${(s.y - 4).toFixed(1)}`);
    hud.gridlead.setAttribute('opacity', s.ok ? 0.55 : 0);
  } else hud.gridlead.setAttribute('opacity', 0);
  // labels: nodes, edge tags and the transporter note, decluttered together
  const eff = new Set(story.labelSet);
  for (const E of story.edges.values()) {
    const e = E.def;
    if (E.vis > 0.5 && (story.tags[e.id] || story.focus?.includes(e.id)) && !def.noArrowTags) [e.from, e.to].forEach(id => story.nodes.get(id)?.label && eff.add(id));
  }
  story.effLabels = eff;
  const items = [], labOrder = [...eff].filter(id => story.nodes.get(id)?.label), jobCut = small && labOrder.length >= 4 ? labOrder.length - 2 : 0;
  for (const N of story.nodes.values()) {
    if (!N.label) continue;
    const s = proj(N.pos), on = eff.has(N.id) && s.ok && !(N.def.gate && !N.def.gate(m, story)); N.label.classList.toggle('on', on);
    N.label.classList.toggle('nojob', labOrder.indexOf(N.id) < jobCut);
    if (on) { const [w, h] = measure(N.label); items.push({ el: N.label, ax: s.x, ay: s.y, w, h, below: (N.def.lo || [0, 0])[1] > 0 }); }
  }
  const tagged = [];
  for (const E of story.edges.values()) {
    const st = story.tags[E.id], plain = def.noArrowTags ? '' : arrowTag(E.def), e = E.def;
    const named = eff.has(e.from) && eff.has(e.to);
    if (E.vis > 0.5 && named && (st || plain)) tagged.push({ E, txt: st ? (plain ? `${plain} · ${st}` : st) : plain, pri: st ? 3 : story.focus?.includes(e.id) ? 2 : 1 });
    else E.tag.classList.remove('on');
  }
  tagged.sort((a, b) => b.pri - a.pri).forEach(({ E, txt }, i) => {
    const on = i < (small ? 3 : 6); E.tag.classList.toggle('on', on); if (!on) return;
    if (E.tag.textContent !== txt) { E.tag.textContent = txt; E.tag.style.borderColor = SIGN[E.def.sign].col; }
    const s = proj(E.curve.getPointAt(0.5)), [w, h] = measure(E.tag); items.push({ el: E.tag, ax: s.x, ay: s.y + h / 2 + 9, w, h, tag: true });
  });
  if (story.glossPending) renderGloss();
  else if (story.glossQueue?.length && performance.now() >= story.glossPageAt) { const max = small ? 2 : 3, next = story.glossQueue.slice(0, max); story.glossQueue = story.glossQueue.slice(max); showGloss(next, false, true); story.glossPageAt = performance.now() + 1000 * (0.6 + glossText(next).split(/\s+/).length / READ_WPS); }
  const nac = story.nodes.get('nac'), datOn = !!H2.dat && nac && def.gauge.pop(m) < 0.3;
  hud.datLabel.classList.toggle('on', !!datOn);
  if (datOn) { const s = proj(nac.pos), [w, h] = measure(hud.datLabel); items.push({ el: hud.datLabel, ax: s.x, ay: s.y, w, h, below: true }); }
  declutter(items, fb, W);
  let lead = '';
  for (const it of items) {
    it.el.style.transform = `translate(${it.x.toFixed(1)}px, ${it.y.toFixed(1)}px)`;
    if (it.tag) continue;
    const ex = clamp(it.ax, it.x, it.x + it.w), ey = it.ay < it.y ? it.y : it.ay > it.y + it.h ? it.y + it.h : it.ay;
    if (Math.hypot(ex - it.ax, ey - it.ay) > 14) lead += `<line x1="${ex.toFixed(1)}" y1="${ey.toFixed(1)}" x2="${it.ax.toFixed(1)}" y2="${it.ay.toFixed(1)}" stroke="rgba(231,237,244,0.45)" stroke-width="1"/>`;
  }
  if (hud.leaders._h !== lead) { hud.leaders.innerHTML = lead; hud.leaders._h = lead; }
  // tokens
  for (const tk of story.tokens) {
    const age = story.t - tk.t0, prog = easeIO(clamp(age / tk.dur));
    tk.curve.getPointAt(prog, tk.pos); if (tk.off) tk.pos.addScaledVector(tk.off, prog);
    if (age >= tk.dur && !tk.arrived) arrive(tk);
    if (tk.grow && !tk.arrived && tk.pre !== undefined) tk.size = lerp(tk.size0 ?? 1, tk.pre, prog); else tk.size += (tk.target - tk.size) * k;
    const life = tk.target < 0.8 ? Math.min(tk.life, 0.9) : tk.life;
    const fade = tk.persist ? 1 : clamp(1 - (age - tk.dur - life) / 0.6);
    const s = proj(tk.pos), so = tk.soff || [0, 0]; tk.sx = s.x + so[0] * prog; tk.sy = s.y + so[1] * prog;
    tk.el.style.transform = `translate(${(tk.sx - 17).toFixed(1)}px, ${(tk.sy - 17).toFixed(1)}px) scale(${Math.max(0.05, tk.size).toFixed(3)})`;
    tk.el.style.opacity = s.ok ? fade : 0;
    tk.el.classList.toggle('bangon', tk.kind === 'neutral' && tk.size > 1.3);
    tk.el.classList.toggle('gold', tk.kind === 'rewardPos'); tk.el.classList.toggle('cool', tk.kind === 'rewardNeg');
    if (tk.ghost && tk.arrived) { tk.ring.classList.add('on'); tk.ring.style.transform = `translate(${(tk.sx - 17).toFixed(1)}px, ${(tk.sy - 17).toFixed(1)}px) scale(${tk.ghost})`; }
    tk.dead = !tk.persist && age > tk.dur + life + 1;
  }
  for (const tk of story.tokens) if (tk.dead) { tk.el.remove(); tk.ring.remove(); }
  story.tokens = story.tokens.filter(tk => !tk.dead);
  if (story.fx.threads) {
    const big = story.tokens.filter(tk => tk.persist && tk.arrived && tk.size > 1.2);
    let h = ''; for (let i = 0; i < big.length; i++) for (let j = i + 1; j < big.length; j++) h += `<line x1="${big[i].sx.toFixed(1)}" y1="${big[i].sy.toFixed(1)}" x2="${big[j].sx.toFixed(1)}" y2="${big[j].sy.toFixed(1)}" stroke="#ffd34d" stroke-width="2.2" stroke-dasharray="5 4" opacity="0.95"/>`;
    hud.threads.innerHTML = h;
  } else if (hud.threads.innerHTML) hud.threads.innerHTML = '';
  // mood bias arrow: from the mood knob back into valuation
  const tgtN = story.nodes.get(def.biasTo || 'nac');
  const biasOn = def.steps ? story.instr.bias > 0 : story.fx.bias;
  if (biasOn && H2.mood && tgtN) {
    const kr = hud.knob.getBoundingClientRect(), s = proj(tgtN.pos), mv = story.vars.m ?? 0, wgt = def.biasW ? clamp(def.biasW(m, story.vars)) * (def.steps ? story.instr.bias : 1) : clamp((m.b ?? 0.5) * Math.abs(mv));
    const x0 = small ? kr.left - r.left + kr.width / 2 : kr.right - r.left + 4, y0 = small ? kr.bottom - r.top + 4 : kr.top - r.top + kr.height / 2;
    const c1 = small ? [x0, y0 + 90] : [x0 + 90, y0 - 50];
    hud.bias.setAttribute('d', `M${x0.toFixed(1)} ${y0.toFixed(1)} C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${(s.x - 50).toFixed(1)} ${(s.y - 90).toFixed(1)}, ${(s.x - 6).toFixed(1)} ${(s.y - 14).toFixed(1)}`);
    hud.bias.setAttribute('stroke', mv >= 0 ? '#ffb454' : '#4aa8ff'); hud.bias.setAttribute('stroke-width', (1 + 6 * wgt).toFixed(1)); hud.bias.setAttribute('opacity', (0.25 + 0.7 * wgt).toFixed(2));
  } else hud.bias.setAttribute('opacity', 0);
  // sleep-loss loop (step mode): from the mood knob round to the clock
  const scnL = story.nodes.get('scn'), loopA = def.steps ? story.instr.loop : 0;
  if (loopA && H2.mood && scnL) {
    const kr = hud.knob.getBoundingClientRect(), s = proj(scnL.pos);
    const x0 = kr.left - r.left + kr.width / 2, y0 = kr.bottom - r.top + 4, x1 = s.x - 22, y1 = s.y - 8;
    hud.loop.setAttribute('d', `M${x0.toFixed(1)} ${y0.toFixed(1)} C ${(x0 - 60).toFixed(1)} ${(y0 + 120).toFixed(1)}, ${(x1 - 90).toFixed(1)} ${(y1 - 20).toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`);
    hud.loop.setAttribute('opacity', (0.95 * loopA).toFixed(2));
  } else hud.loop?.setAttribute('opacity', 0);
  // clock + day/night strip
  const ck = $('#clockico'), scn = story.nodes.get('scn');
  ck.classList.toggle('on', !!H2.clock && !!scn);
  if (H2.clock && scn) {
    const s = proj(scn.pos); ck.style.transform = def.steps ? `translate(${(s.x - 15).toFixed(1)}px, ${(s.y - 44).toFixed(1)}px)` : `translate(${(s.x - 34).toFixed(1)}px, ${(s.y - 6).toFixed(1)}px)`;
    const day = story.sim.day || 0, jit = (1 - (m.clockEff ?? 1)) * Math.sin(now / 37) * 40;
    hud.hand.setAttribute('transform', `rotate(${((day % 1) * 360 + jit).toFixed(1)} 15 15)`);
  }
  const ds = $('#daystrip'); ds.classList.toggle('on', !!H2.strip);
  if (H2.strip) {
    ds.style.left = small ? '10px' : '200px'; ds.style.right = '12px'; ds.style.top = `${fb.bot - 22}px`;
    const g = hud.strip.getContext('2d'), cw = hud.strip.width, chh = hud.strip.height, day = story.sim.day || 0, ce = m.clockEff ?? 1, nf = 0.12 + 0.3 * ce, span = 4;
    g.clearRect(0, 0, cw, chh);
    for (let d = Math.floor(day) - 1; d < day + span + 1; d++) {
      const x0 = (d - day) / span * cw, nx = (d + 1 - nf - day) / span * cw, x1 = (d + 1 - day) / span * cw;
      g.fillStyle = '#35587d'; g.fillRect(x0, 0, nx - x0, chh); g.fillStyle = '#0b1119'; g.fillRect(nx, 0, x1 - nx, chh);
    }
  }
  const btxt = def.badge ? def.badge(m, story) : story.fx.badge, bd = $('#badge');
  bd.classList.toggle('on', !!btxt); if (btxt && bd.textContent !== btxt) bd.textContent = btxt;
  const hr = $('#hitring'), hn = story.nodes.get(story.fx.hit || story.fx.look || '');
  hr.classList.toggle('on', !!hn); hr.classList.toggle('look', !story.fx.hit && !!story.fx.look);
  if (hn) { const s = proj(hn.pos); hr.style.transform = `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px)`; const sp = hr.querySelector('span'); if (sp.textContent !== (story.fx.hitLabel || '')) sp.textContent = story.fx.hitLabel || ''; }
  // spotlight: a calm pulsing ring on the one structure the caption is about
  const spr = $('#spotring'), spn = story.fx.spot && story.nodes.get(story.fx.spot);
  if (spr) { const s = spn ? proj(spn.pos) : null; spr.classList.toggle('on', !!(s && s.ok)); if (s && s.ok) spr.style.transform = `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px)`; }
  if (insetOn && story.insetTick) story.insetTick(m, now);
  if (def.liveCaption && story.scene.live) { const c = def.liveCaption(story.vars, story.scene.live); if (c !== hud.lastLive) { hud.lastLive = c; setCaption(c); } }
  $('#sbprog i').style.width = sc_progress();
  if (now - (hud.syncT || 0) > 200) { hud.syncT = now; syncControls(); }
}
function sc_progress() { const sc = story.scene; return sc.free ? '100%' : `${clamp(story.t / sc.dur) * 100}%`; }

// ---------- story bar ----------
const HL_RE = /\{([^}|]+)\|(\w+)\}/g;
const escHtml = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const plainCap = s => (s || '').replace(HL_RE, '$1');
// wrap glossary words in the caption (text between tags only), and remember which entries this caption used
function glossMark(html) {
  const found = [];
  if (!HAS_JOBS) return [html, found];
  const out = html.split(/(<[^>]+>)/).map(part => part.startsWith('<') ? part : part.replace(GLOSS_RE, (m, pre, w) => {
    const gi = GLOSS_IDX.get(w.toLowerCase()); if (gi === undefined) return m;
    if (!found.includes(gi)) found.push(gi);
    return `${pre}<span class="gl" data-g="${gi}" role="button" tabindex="0">${w}</span>`;
  })).join('');
  return [out, found];
}
const READ_WPS = 2.5;
function readFor(text) {   // extend the reading budget by this text's reading time
  const w = (text || '').split(/\s+/).filter(Boolean).length; if (!w) return;
  const now = performance.now();
  story.readUntil = Math.min(Math.max(story.readUntil || 0, now) + (0.6 + w / READ_WPS) * 1000, now + 16000);
}
// the strip: definitions for words this story hasn't decoded yet (a region whose label is on screen is already explained by its job line)
function renderGloss(force) {
  story.glossPending = false;
  const box = $('#sbgloss'); if (!box || !HAS_JOBS) return;
  const onLabels = new Set([...(story.effLabels || story.labelSet)].map(id => story.nodes.get(id)?.def.label).filter(Boolean));
  const fresh = [];
  for (const gi of force !== undefined ? [force] : (story.glossNow || [])) {
    const g = GLOSS[gi];
    if (force === undefined && story.glossSeen.has(gi)) continue;
    story.glossSeen.add(gi);
    if (force === undefined && g.node && g.node.some(l => onLabels.has(l))) continue;
    fresh.push(gi);
  }
  if (!fresh.length) {   // nothing new: definitions this caption doesn't use fade back, so the strip never reads as current when it isn't
    box.querySelectorAll('.gi').forEach(el => el.classList.toggle('old', !(story.glossNow || []).includes(+el.dataset.g)));
    return;
  }
  const max = isSmall() ? 2 : 3;
  showGloss(fresh.slice(0, max), force !== undefined);
  story.glossQueue = fresh.slice(max);   // more than fit: page through them rather than drop them, and budget their reading time now
  if (story.glossQueue.length) { story.glossPageAt = story.readUntil; if (!story.ffwd) readFor(glossText(story.glossQueue)); }
}
const glossText = list => list.map(gi => GLOSS[gi].t[0] + ' ' + GLOSS[gi].d).join(' ');
function showGloss(list, tapped, paged) {
  const box = $('#sbgloss');
  box.innerHTML = list.map(gi => `<span class="gi${tapped ? ' tap' : ''}" data-g="${gi}"><b>${escHtml(GLOSS[gi].t[0].replace(/^./, c => c.toUpperCase()))}</b> ${escHtml(GLOSS[gi].d)}</span>`).join('');
  box.hidden = false;
  if (!story.ffwd && !tapped && !paged) readFor(glossText(list));
}
function setCaption(text) {
  story.capNow = text;
  const hl = story.def?.hl || {}, ev = story.def?.steps && story.scene?.ev, kick = text ? story.kicker : null;
  const [body, found] = glossMark(escHtml(text || '').replace(HL_RE, (_, w, k) => `<b class="hl" style="color:${hl[k] || 'inherit'}">${w}</b>`));
  const kickFound = kick ? glossMark(escHtml(kick))[1] : [];
  story.glossNow = [...kickFound.filter(gi => !found.includes(gi)), ...found]; story.glossPending = true;
  $('#sbcap').innerHTML = (kick ? `<span class="st">${escHtml(kick)}</span>` : '') + body + (ev ? ` <span class="ev">${escHtml(ev)}</span>` : '');
  story.capText = (kick ? kick + '. ' : '') + plainCap(text); story.gateT = 0;
  if (!story.ffwd) readFor(story.capText);   // a scene entered instantly still needs reading time; skipped beats don't
  if (story.narrate && text && !story.instant) speak(story.capText);
}
function speak(text) {
  if (!window.speechSynthesis || !text) return;
  {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text), vs = speechSynthesis.getVoices();
    u.voice = vs.find(v => v.lang === 'en-AU') || vs.find(v => v.lang === 'en-GB') || vs.find(v => v.lang.startsWith('en')) || null;
    u.rate = 1.02; speechSynthesis.speak(u);
  }
}
if (!window.speechSynthesis) $('#sbvoice').hidden = true;
const glossTap = ev => { const g = ev.target.closest?.('.gl'); if (!g || (ev.type === 'keydown' && ev.key !== 'Enter' && ev.key !== ' ')) return; ev.preventDefault(); renderGloss(+g.dataset.g); };
$('#sbcap').addEventListener('click', glossTap); $('#sbcap').addEventListener('keydown', glossTap);
$('#sbvoice').addEventListener('click', () => {
  story.narrate = !story.narrate; $('#sbvoice').setAttribute('aria-pressed', story.narrate);
  if (story.narrate) speak(story.capText || plainCap(story.capNow ?? $('#sbcap').textContent)); else speechSynthesis.cancel();
});
function keyHtml(def) {
  const used = [...new Set(def.edges.map(e => e.sign))], sc = story.scene || {};
  const usesDial = def.steps || def.scenes.some(x => x.hud && (x.hud.dial || x.hud.grid));
  const head = (sc.ev && !def.steps ? `<div class="t">This scene: evidence</div><div class="note ev">${sc.ev}</div>` : '') + (def.keyIntro || '');
  const line = (pat, col = '#c9d4e2') => `<svg viewBox="0 0 34 10"><line x1="1" y1="5" x2="33" y2="5" stroke="${col}" stroke-width="3" ${pat === 1 ? 'stroke-dasharray="6 4"' : pat === 2 ? 'stroke-dasharray="2 4" stroke-linecap="round"' : ''}/></svg>`;
  return `${head}${whoHtml(def)}<div class="t">Arrow colour = what the connection does</div>${used.map(k => `<div class="kr">${line(0, SIGN[k].col)}<span>${SIGN[k].label}</span></div>`).join('')}
    <div class="t">Line style = evidence for this link's role in illness</div>
    <div class="kr">${line(0)}Shown in patients (imaging, PET)</div><div class="kr">${line(1)}Animal models</div><div class="kr">${line(2)}Proposed, untested</div>
    ${def.scenes.some(s => s.hud && s.hud.tint) ? `<div class="t">Striatal territories</div>
    <div class="kr"><span class="sw" style="background:#3fd0a6"></span>Limbic</div><div class="kr"><span class="sw" style="background:#a98bff"></span>Associative</div><div class="kr"><span class="sw" style="background:#5b7cff"></span>Sensorimotor</div><div class="kr"><span class="sw" style="background:#ffc21a"></span>Gold = dopamine excess</div>
    <div class="note">Parcels: Melbourne Subcortex Atlas (Tian 2020, scale III). Which parcel counts as which territory is my judgment.</div>` : ''}${def.keyExtra || ''}
    ${usesDial ? `<div class="t">Dials and grids</div><div class="note">Illustrative units, not measurements. Dopamine neuron population activity (the dot grid) has only been measured in rodents.</div>` : ''}${wordsHtml(def)}`;
}
function whoHtml(def) {
  if (!HAS_JOBS) return '';
  const vis = new Set([...(story.effLabels || story.labelSet), ...(story.see || []), ...story.show.flatMap(id => { const e = story.edges.get(id)?.def; return e ? [e.from, e.to] : []; })]);
  const seen = new Set(), rows = [];
  for (const id of [...(story.effLabels || story.labelSet), ...vis]) {
    const n = story.nodes.get(id)?.def, j = n && jobOf(n); if (!j || seen.has(n.label)) continue; seen.add(n.label);
    rows.push(`<div class="who"><b>${escHtml(n.label)}</b> <i>${escHtml(j.job)}</i><div>${escHtml(j.say)}</div></div>`);
  }
  const arrows = story.show.map(id => story.edges.get(id)?.def).filter(e => e && arrowOf(e)).map(e =>
    `<div class="kr arw"><svg viewBox="0 0 34 10"><line x1="1" y1="5" x2="33" y2="5" stroke="${SIGN[e.sign].col}" stroke-width="3"/></svg><span><b>${escHtml(arrowOf(e).tag)}</b>: ${escHtml(arrowOf(e).say)}</span></div>`);
  return (rows.length ? `<div class="t">Who’s who on screen</div>${rows.join('')}` : '') + (arrows.length ? `<div class="t">What each arrow on screen does</div>${arrows.join('')}` : '');
}
function wordsHtml(def) {
  if (!HAS_JOBS) return '';
  const caps = def.scenes.flatMap(sc => [sc.caption, ...(sc.beats || []).map(b => b.caption)]).filter(Boolean).map(plainCap).join(' ');
  const order = []; for (const m of caps.matchAll(GLOSS_RE)) { const gi = GLOSS_IDX.get(m[2].toLowerCase()); if (!order.includes(gi)) order.push(gi); }
  if (!order.length) return '';
  return `<div class="t">Words in this part</div><div class="note">Underlined words in the captions: tap one to see its meaning again.</div>${order.map(gi => `<div class="wd"><b>${escHtml(GLOSS[gi].t[0])}</b> ${escHtml(GLOSS[gi].d)}</div>`).join('')}`;
}
$('#sbkey').addEventListener('click', () => {
  const kc = $('#keycard'), open = kc.hidden;
  if (open) kc.innerHTML = keyHtml(story.def);
  kc.hidden = !open; $('#sbkey').setAttribute('aria-pressed', open); requestAnimationFrame(resize);
});
function syncBar() {
  const def = story.def; if (!def) return;
  const sc = story.scene;
  $('#sbtitle').textContent = sc.title;
  $('#sbcount').textContent = `${sc.chapter ? sc.chapter + ' · ' : ''}${story.i + 1} / ${def.scenes.length}`;
  document.body.classList.toggle('steps', !!def.steps);
  const nb = $('#sbnext');
  if (def.steps && !nb.dataset.wide) { nb.dataset.wide = '1'; nb.innerHTML = '<span>Next</span>' + NEXT_SVG; nb.setAttribute('aria-label', 'Next step'); }
  if (!def.steps && nb.dataset.wide) { delete nb.dataset.wide; nb.innerHTML = NEXT_SVG; nb.setAttribute('aria-label', 'Next scene'); }
  const seg = $('#sbstate'); seg.hidden = !!(def.steps || def.noStates);
  if (seg.dataset.story !== def.id) { seg.innerHTML = def.states.map(s => `<button data-s="${s.id}">${s.label}</button>`).join(''); seg.dataset.story = def.id; }
  $$('#sbstate button').forEach(b => b.setAttribute('aria-pressed', b.dataset.s === story.stateId));
  const pb = $('#sbplay');
  if (def.steps) { pb.innerHTML = story.auto ? PAUSE_SVG : PLAY_SVG; pb.setAttribute('aria-label', story.auto ? 'Stop auto-advance' : 'Auto-advance through the steps'); pb.title = pb.getAttribute('aria-label'); }
  else { pb.innerHTML = story.playing ? PAUSE_SVG : PLAY_SVG; pb.setAttribute('aria-label', story.playing ? 'Pause autoplay' : 'Play'); pb.title = ''; }
  $('#sbprev').disabled = story.i === 0; $('#sbnext').disabled = story.i === def.scenes.length - 1;
}
function renderExtra(sc) {
  const box = $('#sbextra'), ctl = sc.controls || [];
  let html = '', row = [];
  const flush = () => { if (row.length) { html += `<div class="sbrow">${row.join('')}</div>`; row = []; } };
  ctl.forEach((c, i) => {
    if (c.type === 'range') { flush(); html += `<div class="sbrow"><label><span>${c.label}</span><input type="range" data-i="${i}" min="${c.min ?? 0}" max="${c.max ?? 1}" step="${c.step ?? 0.01}" aria-label="${c.label}"></label></div>`; }
    else if (c.type === 'toggle') row.push(`<button class="btn" data-i="${i}" aria-pressed="false">${c.label}</button>`);
    else if (c.type === 'button') row.push(`<button class="btn" data-i="${i}">${c.label}</button>`);
    else if (c.type === 'presets') { flush(); html += `<div class="sbrow">${c.items.map((it, j) => `<button class="btn" data-i="${i}" data-j="${j}">${it.label}</button>`).join('')}</div>`; }
    else if (c.type === 'note') { flush(); html += `<div class="sbnote">${c.html}</div>`; }
  });
  flush(); box.innerHTML = html;
  $$('input[type=range]', box).forEach(inp => { const c = ctl[+inp.dataset.i]; inp.value = story.vars[c.var] ?? c.min ?? 0; });
}
function syncControls() {
  const sc = story.scene; if (!sc || !sc.controls) return;
  $$('#sbextra [data-i]').forEach(el => {
    const c = sc.controls[+el.dataset.i];
    if (c.type === 'toggle') el.setAttribute('aria-pressed', (story.vars[c.var] ?? 0) > 0.5);
    if (c.type === 'range' && document.activeElement !== el && !story.tweens.some(tw => tw.k === c.var) && Math.abs(+el.value - (story.vars[c.var] ?? 0)) > 0.02) el.value = story.vars[c.var] ?? 0;
  });
}
$('#sbextra').addEventListener('input', e => {
  const el = e.target.closest('input[type=range]'); if (!el) return;
  const c = story.scene.controls[+el.dataset.i];
  story.tweens = story.tweens.filter(tw => tw.k !== c.var); story.vars[c.var] = +el.value;
});
$('#sbextra').addEventListener('click', e => {
  const el = e.target.closest('button[data-i]'); if (!el) return;
  const c = story.scene.controls[+el.dataset.i];
  if (c.type === 'toggle') { tweenVar(c.var, (story.vars[c.var] ?? 0) > 0.5 ? 0 : 1, 0.8); if (c.after) c.after(story); }
  else if (c.type === 'button') c.do(story);
  else if (c.type === 'presets') { const it = c.items[+el.dataset.j]; for (const [k, v] of Object.entries(it.set)) tweenVar(k, v, 0.6); }
  syncControls();
});
$('#sbstate').addEventListener('click', e => {
  const b = e.target.closest('[data-s]'); if (!b) return;
  applyState(b.dataset.s); story.playing = false; syncBar();
});
$('#sbprev').addEventListener('click', () => gotoScene(story.i - 1));
$('#sbnext').addEventListener('click', () => gotoScene(story.i + 1));
$('#sbreplay').addEventListener('click', () => gotoScene(story.i, { play: true }));
$('#sbplay').addEventListener('click', () => {
  if (story.def?.steps) { story.auto = !story.auto; story.playing = true; if (story.auto && story.waiting && story.i < story.def.scenes.length - 1) gotoScene(story.i + 1); syncBar(); return; }
  story.playing = !story.playing; if (story.playing && !story.scene.free && story.t >= story.scene.dur) gotoScene(story.i + 1); syncBar();
});
// arrow keys step through scenes (not while a slider or text box has focus)
addEventListener('keydown', e => {
  if (!story.def || e.altKey || e.ctrlKey || e.metaKey || e.target.closest?.('input, textarea, select')) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); gotoScene(story.i + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); gotoScene(story.i - 1); }
});
$('#sbclose').addEventListener('click', () => endStory());

// ---------- inset cards ----------
function renderInset(kind) {
  const el = $('#inset'); story.insetTick = null;
  if (!kind) { el.hidden = true; el.innerHTML = ''; requestAnimationFrame(resize); return; }
  const k = typeof kind === 'string' ? kind : kind.kind;
  el.dataset.kind = k;
  if (k === 'html') el.innerHTML = kind.html;
  else if (story.def.insets && story.def.insets[k]) { const r = story.def.insets[k](story); el.innerHTML = r.html; story.insetTick = r.tick || null; }
  el.hidden = false; requestAnimationFrame(resize);
}

// ---------- start / end ----------
function startStory(id, i = 0, opts = {}) {
  const def = STORIES.find(s => s.id === id); if (!def) return;
  if (state.quiz) stopQuiz();
  if (story.def) endStory(false);
  endCircuit(false);
  story.snapshot = { level: new Map(state.level), hemi: state.hemi, preset: state.preset };
  state.netMode = 'off'; state.rec = null; state.drug = null; syncDrugs(); if (slice) slice.material.uniforms.petOn.value = 0;
  state.sel = null; state.cut = 'off'; applyCut();
  story.def = def; story.vars = { ...def.vars }; story.tweens = []; story.flash = {}; story.flashNeg = {}; story.glossSeen = new Set(HAS_JOBS ? (def.glossInline || []).map(w => GLOSS_IDX.get(w.toLowerCase())).filter(gi => gi !== undefined) : []); story.glossNow = []; story.glossQueue = []; story.readUntil = 0;
  const solid = new Set([...Object.values(def.nodes).filter(n => n.key && !n.ghost).map(n => n.key), ...(def.cast || [])]);
  const ghostK = new Set([...Object.values(def.nodes).filter(n => n.key && n.ghost).map(n => n.key), ...(def.ghostCast || [])]);
  setLevels(all, 0); setLevels(cortex, 1); setLevels([...ghostK], 1); setLevels([...solid], def.steps ? 1 : 2);
  if (def.steps) { story.auto = false; for (const sc of def.scenes) sc.read = Math.min(8, Math.max(3.2, plainCap(sc.caption).split(/\s+/).length * 0.34)); }
  state.hemi = def.hemi || 'L'; state.preset = null;
  story.baseLevels = new Map(state.level);
  story.sceneLevelKeys = new Set(def.scenes.flatMap(sc => Object.keys(sc.levels || {})));
  storyMeshes = meshes.filter(mm => solid.has(mm.userData.key) || ghostK.has(mm.userData.key) || story.sceneLevelKeys.has(mm.userData.key));
  document.body.classList.add('story'); $('#storybar').hidden = false;
  if (innerWidth <= 760) $('#panel').classList.add('min');
  buildStory(def); initHud();
  syncAll(); syncStories();
  if (def.shell) for (const mm of meshes) if (CORTEX_GROUPS.has(mm.userData.st.group)) mm.material.color.set(def.shell);
  if (def.steps) {
    story.savedGhost = state.ghost; state.ghost = 0.07; story.neutral = [];
    for (const mesh of meshes) { const k = mesh.userData.key; if (state.level.get(k) === 1 && !story.keyNodes.has(k)) { mesh.material.color.set('#6b7686'); story.neutral.push(mesh); } }
    applyMaterials();
  }
  gotoScene(i, { instant: true, play: !opts.paused });
  if (opts.t) fastForward(opts.t);
  syncBar();
}
function endStory(restore = true) {
  if (!story.def) return;
  for (const mesh of storyMeshes) { const mat = mesh.material; mat.color.set(mesh.userData.st.color); mat.emissive.set(0xffe6bf); mat.emissiveIntensity = 0; mat.userData.sl = false; }
  if (tintOn) untint();
  if (story.neutral) { for (const mesh of story.neutral) mesh.material.color.set(mesh.userData.st.color); story.neutral = null; state.ghost = story.savedGhost; }
  paintYeo(0); story.sceneLevelKeys = null;
  if (window.speechSynthesis) speechSynthesis.cancel();
  $('#keycard').hidden = true; $('#sbkey').setAttribute('aria-pressed', 'false'); $('#sbgloss').hidden = true;
  clearTokens(); clearStory3D(); clearHud(); renderInset(null);
  story.def = null; story.scene = null; storyMeshes = []; story.auto = false; story.intro = null;
  $('#sbnext').classList.remove('ready'); document.body.classList.remove('steps');
  document.body.classList.remove('story'); $('#storybar').hidden = true;
  if (restore && story.snapshot) { state.level = story.snapshot.level; state.hemi = story.snapshot.hemi; state.preset = story.snapshot.preset; }
  story.snapshot = null; lastNetMode = null;
  syncAll(); syncStories(); requestAnimationFrame(() => { resize(); setView('iso'); });
}
$('#stories').innerHTML = STORIES.map(s => `<button class="net" data-st="${s.id}" aria-pressed="false"><span class="dot" style="background:${s.color}"></span><b>${s.name}</b><span class="d">${s.desc}</span></button>`).join('');
$('#stories').addEventListener('click', e => { const b = e.target.closest('[data-st]'); if (!b) return; story.def?.id === b.dataset.st ? endStory() : startStory(b.dataset.st); });
function syncStories() { $$('#stories .net').forEach(b => b.setAttribute('aria-pressed', b.dataset.st === story.def?.id)); }
function storyFromHash() {
  const h = new URLSearchParams(location.hash.slice(1)), id = h.get('story');
  if (!id || !STORIES.find(s => s.id === id)) return;
  startStory(id, Math.max(0, (+h.get('scene') || 1) - 1), { paused: h.get('pause') === '1', t: +h.get('t') || 0 });
}
