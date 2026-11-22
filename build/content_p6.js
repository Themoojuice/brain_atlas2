// ---------------------------------------------------------------- Part 6 · One trunk, three illnesses
// Mental model: psychosis is one shared trunk (too much dopamine in the associative striatum). Two engines can drive it:
// the chain (Parts 1–4: steady, with cognitive and negative baggage) gives schizophrenia; the mood loop (Part 5: episodic,
// psychosis at its peaks) gives bipolar disorder; both give schizoaffective disorder. A stress-hormone route can drive
// psychotic depression. The pole of the mood engine picks the plot.
// Model, illustrative units: trunk = max(chain, mood, cortisol) × 0.95; associative dopamine = 0.4 + 0.5 × trunk.

function engineInset(S) {
  const eng = (id, y, label, sub, col, glyph) => `<g id="en-${id}" class="grp"><rect x="4" y="${y}" width="118" height="26" rx="7" fill="#0d141d" stroke="${col}" stroke-width="1.6"/>
    <g transform="translate(9 ${y + 4}) scale(0.75)" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>
    <text class="lab" x="32" y="${y + 11}">${label}</text><text class="sub" x="32" y="${y + 21}">${sub}</text>
    <rect x="84" y="${y + 17}" width="32" height="4" rx="2" fill="rgba(141,155,173,0.25)"/><rect class="thr" x="84" y="${y + 17}" width="0" height="4" rx="2" fill="${col}"/>
    <path class="pipe" d="M122 ${y + 13} C 150 ${y + 13}, 160 52, 182 52" fill="none" stroke="${col}" stroke-width="2"/></g>`;
  const html = `<div class="t lt"><span>One trunk, two engines</span><b id="enTag"></b></div>
  <svg viewBox="0 0 312 100" class="cardsvg" id="ensvg">
    ${eng('chain', 4, 'Chain', 'Parts 1–4', '#ffb454', SERIES_GLYPH.p2)}
    ${eng('loop', 36, 'Mood loop', 'Part 5', '#ff9f43', SERIES_GLYPH.aff2)}
    ${eng('cort', 68, 'Stress hormone', 'cortisol', '#7fe0d0', '<path d="M12 3v11M7 9l5 5 5-5M5 20h14"/>')}
    <rect x="182" y="10" width="16" height="84" rx="6" fill="#0d141d" stroke="#ffd34d" stroke-width="1.6"/>
    <rect id="enFill" x="184.5" y="92" width="11" height="0" rx="4" fill="#ffd34d"/>
    <line x1="178" y1="52" x2="202" y2="52" stroke="#e7edf4" stroke-width="1" stroke-dasharray="3 2"/><text class="sub" x="206" y="55">psychosis</text>
    <text class="sub" x="190" y="8" text-anchor="middle">trunk</text>
    <text id="enDx" class="lab" x="208" y="24" style="font-size:11px"></text>
    <text id="enPlot" class="lab" x="208" y="76" fill="#ffd34d" font-style="italic"></text>
    <g id="enRoots" opacity="0"><path d="M126 17 C 140 17, 140 49, 126 49" fill="none" stroke="#c9d4e2" stroke-width="1.2" stroke-dasharray="2 2"/><text class="sub" x="142" y="30" fill="#c9d4e2">shared</text><text class="sub" x="142" y="40" fill="#c9d4e2">genes</text></g>
  </svg>`;
  return { html, tick(m) {
    const q = id => document.getElementById(id), fx = S.fx; if (!q('ensvg')) return;
    setText(q('enTag'), fx.tag || '');
    cardGroups('en-', ['chain', 'loop', 'cort'], fx.en || ['chain', 'loop'], fx.enhi);
    const lv = { chain: m.chain, loop: m.mood, cort: m.cort };
    for (const id of ['chain', 'loop', 'cort']) { const g = q('en-' + id); if (!g) continue; g.querySelector('.thr').setAttribute('width', (32 * cl01(lv[id])).toFixed(1)); g.querySelector('.pipe').setAttribute('stroke-width', (0.6 + 4 * cl01(lv[id])).toFixed(2)); g.querySelector('.pipe').setAttribute('opacity', (0.25 + 0.75 * cl01(lv[id])).toFixed(2)); }
    const h = 80 * cl01(m.trunk); setAttrs(q('enFill'), { y: (92 - h).toFixed(1), height: h.toFixed(1), fill: m.trunk > 0.5 ? '#ffd34d' : '#8d7a3a' });
    wrapTo(q('enDx'), fx.dx || '', 16, 208, 12); wrapTo(q('enPlot'), m.trunk > 0.5 ? (fx.plot || '') : '', 18, 208, 11);
    q('enRoots').setAttribute('opacity', fx.roots ? 1 : 0);
  } };
}

const P6_CAM = {
  all: { dir: [-1, 0.1, 0.35], fit: ['ahp', 'nac', 'cd', 'vta', 'hyp'], r: 22, pad: 12 },
  st: { dir: [-0.75, 0.45, 0.55], fit: ['cd', 'nac', 'sn'], r: 20, pad: 14 },
  hp: { dir: MED, fit: ['ahp', 'nac', 'cd'], r: 22, pad: 14 },
};
const P6_EV = {
  series: 'Part 6 of the series: how the chain (Parts 1–4) and the mood loop (Part 5) combine.',
  trunk: 'Striatal dopamine synthesis capacity in bipolar psychosis matched schizophrenia and tracked positive symptoms in both, r 0.52 (Jauhar 2017, ' + doi('10.1001/jamapsychiatry.2017.2943') + '). Confidence moderate to high.',
  terr: 'Limbic striatal synthesis was not raised in mania or mixed states and was lower in psychotic depression (Jauhar 2025, ' + doi('10.1001/jamapsychiatry.2025.1811') + '). So territory does not split the diagnoses; the engines do. Confidence moderate to high.',
  chain: 'Teaching synthesis of Parts 1–4: persistent hippocampal drive with interneuron, cognitive and negative-symptom features. Confidence moderate.',
  loop: 'In bipolar disorder the excess appears with psychotic episodes; the mood engine is reward and regulation circuits with momentum (Phillips &amp; Swartz 2014; Nusslock 2017; Eldar 2016; all in the project library). Synthesis: confidence moderate.',
  both: 'Schizoaffective disorder: mood episodes plus psychosis that persists without mood symptoms (diagnostic criteria, recalled). No schizoaffective-specific imaging was found: confidence low.',
  roots: 'Schizophrenia and bipolar disorder share much of their common genetic risk (Grotzinger 2026, ' + doi('10.1038/s41586-025-09820-3') + '; O’Connell 2025, ' + doi('10.1038/s41586-024-08468-9') + '); biologically defined psychosis subgroups cut across diagnoses (Clementz 2022, ' + doi('10.1093/schbul/sbab090') + '). Confidence moderate.',
  pd: 'Psychotic depression: very high cortisol; blocking glucocorticoid receptors with mifepristone can rapidly ease psychotic symptoms, at least at higher doses (Schatzberg 2015, ' + doi('10.3109/15622975.2014.916414') + '). One main research programme: confidence moderate.',
  plot: 'Mood-congruent content (grandiose in mania; guilt, ruin, nihilism and Cotard delusions in depression) is a clinical observation; worry drives persecutory content (Freeman 2015, from the project library). Confidence moderate.',
};
const P6_SEE = ['ahp', 'nac', 'vta', 'sn', 'cd'];
const P6_SHOW = ['hp-nac', 'vta-nac', 'nac-sn', 'sn-cd'];

STORIES.push({ id: 'p6', name: 'Part 6 · One trunk, three illnesses', color: '#c49bff', hemi: 'L', view: MED, reveal: true, noStates: true, shell: '#7a8494',
  desc: 'How the chain and the mood loop make three illnesses: one shared psychosis trunk, two engines, a stress-hormone route in psychotic depression, and the mood pole picking the plot. Ten short scenes.',
  keyIntro: '<div class="t">The engine card</div><div class="note">Engines on the left feed the trunk on the right; pipe thickness is how hard each drives it. Above the dashed line, the trunk means psychosis. The label on the right is the diagnosis this combination gives; the gold line is the content the mood pole supplies. Illustrative.</div>',
  nodes: {
    ahp: { key: 'Hippocampus', mni: [-25, -13, -20], label: 'Anterior hippocampus', hot: true, lo: [0, 12] },
    fxb: { mni: [-4, -26, 15], label: 'Fornix', noDot: true, nofit: true },
    nac: { key: 'Nucleus_accumbens', label: 'Accumbens', lo: [-6, 0] },
    vta: { key: 'VTA', label: 'Ventral tegmental area' },
    sn: { key: 'Substantia_nigra', label: 'Substantia nigra', lo: [0, 12] },
    cd: { key: 'Caudate_nucleus', mni: [-12, 12, 6], label: 'Caudate head (associative)' },
    hyp: { key: 'Hypothalamus', mni: [-3, -2, -12], label: 'Hypothalamus (stress hormones)', lo: [0, 12] },
    amy: { key: 'Amygdala', label: 'Amygdala', lo: [0, 12] },
  },
  edges: [
    { id: 'hp-nac', from: 'ahp', to: 'nac', via: FORNIX, sign: '+', ev: 'rodent', act: m => 0.2 + 0.8 * m.chain },
    { id: 'vta-nac', from: 'vta', to: 'nac', via: [[-6, -4, -12]], sign: 'da', ev: 'human', act: m => 0.3 + 0.7 * Math.max(m.chain, m.mood) },
    { id: 'nac-sn', from: 'nac', to: 'sn', via: [[-11, -6, -15]], sign: 'spiral', ev: 'proposed', act: m => m.trunk },
    { id: 'sn-cd', from: 'sn', to: 'cd', via: [[-12, -6, -2], [-13, 4, 4]], sign: 'da', ev: 'human', act: m => m.assocDA },
  ],
  vars: { chain: 0, loop: 0, osc: 0, amp: 0, cort: 0, fear: 0, ph: 0 },
  discrete: ['osc'],
  states: [{ id: 'x', label: 'Model', vars: {} }],
  model(v) {
    const mood = v.osc > 0.5 ? (S => S)(v.amp * Math.max(0, Math.sin(v.ph))) : v.loop;
    const trunk = 0.95 * Math.max(v.chain, mood, v.cort);
    return { chain: v.chain, mood, cort: v.cort, fear: v.fear, trunk, assocDA: 0.4 + 0.5 * trunk, limbicDA: v.cort > 0.5 ? 0.3 : 0.4, eff: 0.4 + 0.5 * trunk, pop: 0.4 + 0.4 * Math.max(v.chain, mood) };
  },
  gauge: { gain: m => m.eff, raw: m => m.eff, pop: m => m.pop },
  salience: () => 1,
  tick(dt, v) { if (v.osc > 0.5) v.ph += dt * 0.42; },
  look: seeLook((m, S) => ({
    Hippocampus: { heat: cl01((m.chain - 0.2) / 0.6), glow: 0.1 + 0.5 * m.chain, ec: '#ff8a3d' },
    Nucleus_accumbens: { glow: 0.1 + 0.7 * m.mood, ec: '#ff9f43' },
    Caudate_nucleus: { glow: 0.6 * cl01((m.assocDA - 0.45) / 0.4), ec: '#ffc21a' },
    VTA: { glow: 0.15 + 0.6 * cl01((m.pop - 0.4) / 0.4), ec: '#ffd34d' },
    Substantia_nigra: { glow: 0.5 * cl01((m.assocDA - 0.45) / 0.4), ec: '#ffd34d' },
    Hypothalamus: { col: '#2d8c88', glow: 0.1 + 0.8 * m.cort, ec: '#7fe0d0' },
    Amygdala: { heat: m.fear, glow: 0.1 + 0.7 * m.fear, ec: '#ff6b5b' },
  })),
  insets: { series: seriesInset, engine: engineInset },
  scenes: [
    { title: 'Previously / today', chapter: 'Trunk', dur: 13, state: 'x', set: { chain: 0.9, loop: 0, osc: 0, cort: 0 }, cam: P6_CAM.all, see: [], show: [], labels: [], inset: 'series', fx: {},
      kicker: 'Part 6', caption: 'Parts 1 to 4 built the chain. Part 5 built the mood loop.', ev: P6_EV.series,
      beats: [{ at: 6.5, see: P6_SEE, show: P6_SHOW, kicker: 'Today', caption: 'Today: how they make three different illnesses.' }] },
    { title: 'One trunk', chapter: 'Trunk', dur: 20, state: 'x', set: { chain: 0.9, loop: 0, osc: 0, cort: 0 }, cam: P6_CAM.st, see: P6_SEE, show: P6_SHOW, labels: ['cd'], hud: { tint: true }, inset: 'engine', fx: { en: ['chain', 'loop'], spot: 'cd' },
      kicker: 'One trunk', caption: 'In schizophrenia and in bipolar psychosis alike, dopamine synthesis in the associative striatum tracks the positive symptoms.', ev: P6_EV.trunk,
      beats: [{ at: 10, tween: { chain: [0, 2], loop: [0.9, 2] }, kicker: null, caption: 'Whichever engine drives it, psychosis rides on the same trunk.' }] },
    { title: 'Territory doesn’t split them', chapter: 'Trunk', dur: 18, state: 'x', set: { chain: 0, loop: 0.9, osc: 0, cort: 0 }, cam: P6_CAM.st, see: P6_SEE, show: P6_SHOW, labels: ['nac', 'cd'], hud: { tint: true }, inset: 'engine', fx: { en: ['chain', 'loop'] },
      kicker: 'Territory', caption: 'The limbic striatum isn’t raised in mania. Both illnesses load the associative part.', ev: P6_EV.terr,
      beats: [{ at: 8.5, kicker: null, caption: 'So the difference isn’t where dopamine lands. It is what drives it.' }] },
    { title: 'Engine 1: the chain', chapter: 'Engines', dur: 20, state: 'x', set: { chain: 0, loop: 0, osc: 0, cort: 0 }, cam: P6_CAM.hp, see: P6_SEE, show: P6_SHOW, labels: ['ahp'], inset: 'engine', fx: { en: ['chain', 'loop'], enhi: 'chain', dx: '', spot: 'ahp' },
      kicker: 'Engine 1', caption: 'The chain: a steadily loud hippocampus keeps the trunk running.', ev: P6_EV.chain,
      beats: [
        { at: 2, tween: { chain: [0.9, 3] } },
        { at: 8, fx: { dx: 'Schizophrenia' }, kicker: null, caption: 'With Part 1’s frayed rhythm and Part 4’s missing signals alongside, that is schizophrenia.' }] },
    { title: 'Engine 2: the mood loop', chapter: 'Engines', dur: 26, state: 'x', set: { chain: 0.15, loop: 0, osc: 1, amp: 1, ph: -2.63, cort: 0 }, cam: P6_CAM.st, see: P6_SEE, show: P6_SHOW, labels: ['nac'], inset: 'engine', fx: { en: ['chain', 'loop'], enhi: 'loop', dx: 'Bipolar disorder', plot: '“I have been chosen”', spot: 'nac' },
      kicker: 'Engine 2', caption: 'The mood loop runs in episodes.', ev: P6_EV.loop,
      controls: [{ type: 'button', label: 'Revisit Part 5 · How mania builds', do: () => startStory('aff2', 15) }],
      beats: [
        { at: 7, kicker: null, caption: 'At the peak of mania it overflows into the trunk: psychosis, with grandiose content.' },
        { at: 16, caption: 'Between episodes the trunk quiets. That is bipolar disorder.' }] },
    { title: 'Both engines', chapter: 'Engines', dur: 22, state: 'x', set: { chain: 0.7, loop: 0, osc: 1, amp: 1, ph: 0, cort: 0 }, cam: P6_CAM.all, see: P6_SEE, show: P6_SHOW, labels: [], inset: 'engine', fx: { en: ['chain', 'loop'], enhi: ['chain', 'loop'], dx: 'Schizoaffective disorder', plot: '' },
      kicker: 'Both', caption: 'Both engines at once: mood episodes on top of psychosis that persists when mood is level.', ev: P6_EV.both,
      beats: [{ at: 10, kicker: null, caption: 'That is schizoaffective disorder. It has no imaging of its own yet; this is inference.' }] },
    { title: 'Shared roots', chapter: 'Engines', dur: 18, state: 'x', set: { chain: 0.7, loop: 0.6, osc: 0, cort: 0 }, cam: P6_CAM.all, see: P6_SEE, show: P6_SHOW, labels: [], inset: 'engine', fx: { en: ['chain', 'loop'], roots: true, dx: '' },
      kicker: 'Genes', caption: 'Schizophrenia and bipolar disorder share much of their genetic risk.', ev: P6_EV.roots,
      beats: [{ at: 8.5, kicker: null, caption: 'And biologically defined subgroups of psychosis cut across the two diagnoses.' }] },
    { title: 'Psychotic depression', chapter: 'A third route', dur: 24, state: 'x', set: { chain: 0, loop: 0, osc: 0, cort: 0 }, cam: P6_CAM.all, see: [...P6_SEE, 'hyp'], show: P6_SHOW, labels: ['hyp'], hud: { tint: true }, inset: 'engine', fx: { en: ['chain', 'loop', 'cort'], enhi: 'cort', dx: '', plot: '“I deserve what is coming”', spot: 'hyp' },
      kicker: 'Third route', caption: 'In psychotic depression, stress hormones run very high.', ev: P6_EV.pd,
      beats: [
        { at: 2, tween: { cort: [0.85, 3] }, fx: { dx: 'Psychotic depression' } },
        { at: 9, kicker: null, caption: 'Blocking the cortisol receptor with mifepristone can ease the psychosis quickly, at least at high doses.' },
        { at: 17, caption: 'The limbic striatum runs low here, and the content is guilty.' }] },
    { title: 'The pole picks the plot', chapter: 'A third route', dur: 24, state: 'x', set: { chain: 0, loop: 0.9, osc: 0, cort: 0, fear: 0 }, cam: P6_CAM.all, see: [...P6_SEE, 'amy'], show: P6_SHOW, labels: [], inset: 'engine', fx: { en: ['chain', 'loop', 'cort'], dx: 'Mania', plot: '“I have been chosen”' },
      kicker: 'The plot', caption: 'Mania supplies grandiose content.', ev: P6_EV.plot,
      beats: [
        { at: 7, tween: { loop: [0, 1.5], cort: [0.85, 1.5] }, fx: { dx: 'Depression', plot: '“My insides have rotted”' }, caption: 'Depression supplies guilt, ruin, even nihilism: Cotard delusions.' },
        { at: 14, tween: { cort: [0, 1.5], chain: [0.85, 1.5], fear: [0.9, 1.5] }, relabel: ['amy'], fx: { dx: 'Fear', plot: '“They are onto me”', spot: 'amy' }, caption: 'Fear supplies persecution.' }] },
    { title: 'Recap', chapter: 'A third route', dur: 18, state: 'x', set: { chain: 0.7, loop: 0, osc: 1, amp: 1, ph: 0, cort: 0, fear: 0 }, cam: P6_CAM.all, see: P6_SEE, show: P6_SHOW, labels: [], inset: 'engine', fx: { en: ['chain', 'loop', 'cort'], dx: '', tag: 'Recap' },
      kicker: 'Recap', caption: 'One trunk, two engines, three illnesses, and the mood pole picks the plot.', ev: P6_EV.trunk,
      beats: [{ at: 9, kicker: 'Next', caption: 'Part 7: when movement locks, in any of the three.' }] },
  ],
});
