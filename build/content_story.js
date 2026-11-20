// ================= story content =================
// Positions are MNI (left hemisphere). Nodes with `mni` but a `key` glow on that atlas structure but sit at the point given.
// Every scene below mirrors a numbered scene in the storyboard doc ("Psychosis and mood circuits: checked pathways and animation storyboard").
const cl01 = x => Math.min(1, Math.max(0, x));
const mixHex = (a, b, t) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), ch = s => [(s >> 16) & 255, (s >> 8) & 255, s & 255]; const A = ch(pa), B = ch(pb); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * cl01(t)).toString(16).padStart(2, '0')).join(''); };
const MED = [-1, 0.34, 0.16], LAT = [0.9, 0.42, 0.45], MED_LOW = [-1, -0.42, 0.3], MED_UP = [-1, 0.62, 0.1];
const NET_COL = { smn: '#6fa8ff', sal: '#c43afa', dmn: '#cd3e4e' };
const unitLook = (a, col) => a > 0.05 ? { glow: 0.2 + 0.7 * a, ec: col, op: 0.16 + 0.34 * a } : a < -0.05 ? { dim: 0.75 * -a, glow: 0.12 * -a, ec: '#4a6fa5', op: 0.1 } : { op: 0.14 };
const KRAEPELIN = { '+++': 'Mania', '---': 'Depression', '+-+': 'Depressive or anxious mania', '+--': 'Excited depression', '++-': 'Mania with poverty of thought', '-+-': 'Manic stupor', '--+': 'Depression with flight of ideas', '-++': 'Inhibited mania' };
const sgn = x => x > 0.2 ? '+' : x < -0.2 ? '-' : '0';

function nmdaInset(S) {
  const rec = [[192, 56], [189, 70], [192, 84]].map(([x, y], i) => `<rect x="${x - 4}" y="${y - 4}" width="2.4" height="8" fill="#ff9f43"/><rect x="${x + 2}" y="${y - 4}" width="2.4" height="8" fill="#ff9f43"/><circle class="plug" cx="${x + 0.2}" cy="${y}" r="2.6" fill="#c9d4e2" opacity="0"/>`).join('');
  const bar = (y, lab, id, healthy) => `<text x="10" y="${y + 7}" fill="#c9d4e2" font-size="10">${lab}</text><rect x="150" y="${y}" width="130" height="8" rx="4" fill="rgba(141,155,173,0.2)"/><rect id="${id}" x="150" y="${y}" width="0" height="8" rx="4" fill="${id === 'nbP' ? '#ff9f43' : '#6cc4ff'}"/><line x1="${150 + 130 * healthy}" y1="${y - 2}" x2="${150 + 130 * healthy}" y2="${y + 10}" stroke="#e7edf4" stroke-width="1.2" stroke-dasharray="2 2"/>`;
  const html = `<div class="t">Inside the anterior hippocampus</div>
    <svg viewBox="0 0 290 172" id="nmdasvg">
      <defs><marker id="nah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#ff9f43"/></marker></defs>
      <line x1="70" y1="40" x2="70" y2="14" stroke="#ff9f43" stroke-width="2"/>
      <polygon points="34,100 70,40 106,100" fill="rgba(255,159,67,0.16)" stroke="#ff9f43" stroke-width="1.6"/>
      <circle id="spP" cx="92" cy="30" r="4" fill="#ff9f43" opacity="0.2"/>
      <text x="70" y="116" fill="#e7edf4" font-size="10" text-anchor="middle">Pyramidal cell</text>
      <path d="M106 78 L 180 64" stroke="#ff9f43" stroke-width="2" fill="none" marker-end="url(#nah)"/>
      <text x="140" y="62" fill="#ffcf9e" font-size="9" text-anchor="middle">glutamate</text>
      <circle cx="214" cy="70" r="22" fill="rgba(108,196,255,0.16)" stroke="#6cc4ff" stroke-width="1.6"/>
      ${rec}
      <text x="190" y="42" fill="#ffcf9e" font-size="8.5" text-anchor="end">NMDA receptors</text>
      <circle id="spI" cx="242" cy="44" r="4" fill="#6cc4ff" opacity="0.2"/>
      <text x="214" y="108" fill="#e7edf4" font-size="10" text-anchor="middle">Parvalbumin interneuron</text>
      <path id="inh" d="M200 88 C 178 112, 136 114, 108 98" stroke="#4aa8ff" stroke-width="4" fill="none"/>
      <line id="inhbar" x1="103" y1="91" x2="111" y2="104" stroke="#4aa8ff" stroke-width="3"/>
      ${bar(126, 'NMDA receptor function', 'nbN', 1)}${bar(142, 'Interneuron firing', 'nbI', 1)}${bar(158, 'Pyramidal firing · glutamate', 'nbP', 0.25)}
    </svg>
    <div class="foot">These interneurons depend on NMDA receptor drive, so blocking it quietens them before the pyramidal cells. Ketamine reproduces the patients' hippocampal pattern in mice (Schobel 2013).</div>`;
  return { html, tick(m, now) {
    const q = id => document.getElementById(id);
    document.querySelectorAll('#nmdasvg .plug').forEach(p => p.setAttribute('opacity', (1 - m.nmda).toFixed(2)));
    q('nbN')?.setAttribute('width', (130 * m.nmda).toFixed(1)); q('nbI')?.setAttribute('width', (130 * m.pvEff).toFixed(1)); q('nbP')?.setAttribute('width', (130 * m.hp).toFixed(1));
    const w = (1 + 4 * m.pvEff).toFixed(1); q('inh')?.setAttribute('stroke-width', w); q('inh')?.setAttribute('opacity', (0.35 + 0.65 * m.pvEff).toFixed(2)); q('inhbar')?.setAttribute('opacity', (0.35 + 0.65 * m.pvEff).toFixed(2));
    const blink = (rate, ph) => (Math.sin(now / 1000 * rate * 6.28 + ph) > 0.7 ? 1 : 0.15).toFixed(2);
    q('spP')?.setAttribute('opacity', blink(0.8 + 5 * m.hp, 0)); q('spI')?.setAttribute('opacity', blink(0.5 + 6 * m.pvEff, 1.3));
  } };
}
function terminalInset(S) {
  const ves = [...Array(6)].map((_, i) => `<circle cx="${72 + i * 31}" cy="${60 + (i % 2) * 9}" r="9" fill="rgba(255,211,77,0.22)" stroke="#ffd34d" stroke-width="1.4"/><rect x="${68 + i * 31}" y="${48 + (i % 2) * 9}" width="8" height="3" rx="1" fill="#8d9bad"/>`).join('');
  const rel = [...Array(16)].map((_, i) => `<circle r="2.2" fill="#ffd34d" cx="${52 + i * 12.5}" cy="100" opacity="0"/>`).join('');
  const recs = [...Array(9)].map((_, i) => `<path d="M${46 + i * 26} 126 v-5 m0 0 l-4 -5 m4 5 l4 -5" stroke="#4aa8ff" stroke-width="1.7" fill="none"/>`).join('');
  const bar = (y, lab) => `<text x="12" y="${y + 7}" fill="#c9d4e2" font-size="10">${lab}</text><rect x="118" y="${y}" width="160" height="8" rx="4" fill="rgba(141,155,173,0.2)"/><rect class="bf" x="118" y="${y}" width="0" height="8" rx="4" fill="#ffd34d"/><line x1="198" y1="${y - 2}" x2="198" y2="${y + 10}" stroke="#e7edf4" stroke-width="1.2" stroke-dasharray="2 2"/>`;
  const html = `<div class="t">A nigral dopamine terminal in the caudate head</div>
    <svg viewBox="0 0 290 190" id="term">
      <path d="M24 94 C24 32 56 10 145 10 C234 10 266 32 266 94" fill="rgba(141,155,173,0.10)" stroke="#8d9bad" stroke-width="1.4"/>
      <line x1="145" y1="10" x2="145" y2="0" stroke="#8d9bad" stroke-width="1.4"/><text x="151" y="7" fill="#8d9bad" font-size="8.5">axon from the substantia nigra</text>
      <text x="44" y="32" fill="#c9d4e2" font-size="10">tyrosine → L-DOPA → dopamine</text>
      <text x="145" y="86" fill="#8d9bad" font-size="9" text-anchor="middle">grey tags = vesicle transporter: normal</text>
      ${ves}<g id="relg">${rel}</g>
      <line x1="16" y1="127" x2="274" y2="127" stroke="#8d9bad" stroke-width="1.4"/>${recs}
      ${bar(142, 'Synthesis')}${bar(158, 'Release')}${bar(174, 'Synaptic dopamine')}
      <text x="198" y="138" fill="#8d9bad" font-size="8.5" text-anchor="middle">healthy</text>
    </svg>
    <div class="foot">Psychosis versus controls, meta-analytic effect sizes: synthesis g 0.65 · release 0.66 · synaptic dopamine 0.78 (Brugger 2020). Vesicle transporter binding normal (Taylor 2000).</div>`;
  return { html, tick(m, now) {
    const lv = cl01(0.3 + 0.75 * (m.pop - 0.25) / 0.55), dots = document.querySelectorAll('#relg circle'), n = Math.round(lv * dots.length);
    dots.forEach((d, i) => { const ph = ((now / 1000) * (0.5 + lv) + i * 0.37) % 1; d.setAttribute('cy', (96 + ph * 26).toFixed(1)); d.setAttribute('opacity', i < n ? (1 - ph * 0.6).toFixed(2) : 0); });
    document.querySelectorAll('#term .bf').forEach((b, i) => b.setAttribute('width', (160 * cl01(lv + [0, 0.01, 0.04][i])).toFixed(1)));
  } };
}
function compareInset(S) {
  const panel = (x, title, sub, id) => `<g transform="translate(${x} 0)">
    <text x="72" y="14" fill="#e7edf4" font-size="11.5" font-weight="600" text-anchor="middle">${title}</text>
    <text x="72" y="27" fill="#8d9bad" font-size="9.5" text-anchor="middle">${sub}</text>
    <path d="M48 72 A24 24 0 0 1 96 72" stroke="#5d6878" stroke-width="5" fill="none"/>
    <line id="${id}n" x1="72" y1="72" x2="72" y2="52" stroke="#e7edf4" stroke-width="2.5" stroke-linecap="round"/><circle cx="72" cy="72" r="3" fill="#e7edf4"/>
    <ellipse id="${id}a" cx="52" cy="98" rx="19" ry="10"/><ellipse id="${id}l" cx="96" cy="104" rx="14" ry="8.5"/>
    <text x="52" y="122" fill="#c9d4e2" font-size="9" text-anchor="middle">associative</text><text x="98" y="122" fill="#c9d4e2" font-size="9" text-anchor="middle">limbic</text></g>`;
  const html = `<div class="t">Same amplifier, two failure modes</div><svg viewBox="0 0 290 128">${panel(0, 'Schizophrenia', 'gain stuck high', 'cA')}${panel(146, 'Bipolar disorder', 'gain swings', 'cB')}<line x1="145" y1="6" x2="145" y2="122" stroke="rgba(141,155,173,0.25)"/></svg>
    <div class="foot">Left is fixed at the psychosis setting; right is live from the brain above.</div>`;
  const needle = (id, g) => { const a = Math.PI * (1 - cl01(g)), el = document.getElementById(id + 'n'); if (el) { el.setAttribute('x2', (72 + 20 * Math.cos(a)).toFixed(1)); el.setAttribute('y2', (72 - 20 * Math.sin(a)).toFixed(1)); } };
  const fill = (id, base, lv) => { const el = document.getElementById(id); if (el) el.setAttribute('fill', mixHex(base, '#ffd34d', cl01((lv - 0.4) / 0.45))); };
  return { html, tick(m) {
    needle('cA', 0.8); fill('cAa', '#a98bff', 0.82); fill('cAl', '#3fd0a6', 0.5);
    needle('cB', m.eff); fill('cBa', '#a98bff', m.assocDA); fill('cBl', '#3fd0a6', m.limbicDA);
  } };
}

const STORIES = [
// ---------------------------------------------------------------- psychosis
{ id: 'psy', name: 'Psychosis: the gain story', color: '#ffb454', hemi: 'L', view: MED,
  desc: 'Hippocampus → accumbens → pallidum → midbrain → associative striatum: how a quiet cue gets amplified. Eleven scenes.',
  nodes: {
    ilc: { key: 'Subgenual_frontal_cortex', label: 'Medial prefrontal' },
    dl:  { key: 'Middle_frontal_gyrus', ghost: true, label: 'Dorsolateral prefrontal' },
    re:  { mni: [-1, -10, 4], label: 'Nucleus reuniens (approx.)', r: 1.3, dot: '#b48cff' },
    ahp: { key: 'Hippocampus', mni: [-25, -13, -20], label: 'Anterior hippocampus', hot: true },
    nac: { key: 'Nucleus_accumbens', label: 'Accumbens', lo: [-6, 0] },
    vp:  { key: 'Ventral_pallidum', label: 'Ventral pallidum', lo: [0, 12] },
    vta: { key: 'VTA', label: 'Ventral tegmental area' },
    sn:  { key: 'Substantia_nigra', label: 'Substantia nigra', lo: [0, 12] },
    cd:  { key: 'Caudate_nucleus', mni: [-12, 12, 6], label: 'Caudate head (associative)' },
    md:  { key: 'Thal_MD', label: 'Mediodorsal thalamus', lo: [0, 12] },
    ctx: { key: 'Middle_and_inferior_temporal_gyrus', ghost: true, label: 'Temporal cortex' },
  },
  edges: [
    { id: 'ilc-re', from: 'ilc', to: 're', via: [[-3, 8, -2]], sign: 'ctl', act: m => m.ctl },
    { id: 're-hp', from: 're', to: 'ahp', via: [[-10, -14, -4], [-20, -16, -12]], sign: 'ctl', act: m => m.ctl },
    { id: 'hp-nac', from: 'ahp', to: 'nac', via: [[-18, -2, -15]], sign: '+', act: m => m.hpOut },
    { id: 'nac-vp', from: 'nac', to: 'vp', sign: '-', act: m => m.nacOut },
    { id: 'vp-vta', from: 'vp', to: 'vta', via: [[-9, -7, -10]], sign: '-', act: m => m.stream },
    { id: 'vta-nac', from: 'vta', to: 'nac', via: [[-6, -4, -12]], sign: 'da', act: m => m.pop },
    { id: 'nac-sn', from: 'nac', to: 'sn', via: [[-11, -6, -15]], sign: 'spiral', act: m => m.pop * 0.9 },
    { id: 'sn-cd', from: 'sn', to: 'cd', via: [[-12, -6, -2], [-13, 4, 4]], sign: 'da', act: m => m.assocDA },
    { id: 'ctx-cd', from: 'ctx', to: 'cd', via: [[-40, -12, -8], [-24, 2, 4]], sign: '+', act: () => 0.45 },
    { id: 'cd-md', from: 'cd', to: 'md', via: [[-10, -4, 6]], sign: '+', act: m => m.eff },
    { id: 'md-dl', from: 'md', to: 'dl', via: [[-12, -2, 22], [-24, 18, 28]], sign: '+', act: m => m.eff },
    { id: 'dl-cd', from: 'dl', to: 'cd', via: [[-22, 22, 16]], sign: '+', act: m => 0.45 + 0.3 * m.eff },
  ],
  ring: 'ahp',
  shieldOn: [['Caudate_nucleus', 8, p => p[1] > 2], ['Nucleus_accumbens', 4, null], ['Putamen', 4, p => p[1] > 0]],
  vars: { pv: 1, ctl: 1, d2: 0, tr: 0, cs: 4, hpx: -1, nmda: 1 },
  discrete: ['hpx'],
  states: [
    { id: 'healthy', label: 'Healthy', vars: { pv: 1, ctl: 1, d2: 0, tr: 0, cs: 4, nmda: 1 } },
    { id: 'psychosis', label: 'Psychosis', vars: { pv: 0.15, ctl: 0.45, d2: 0, cs: 4, nmda: 1 } },
    { id: 'treated', label: 'On antipsychotic', vars: { pv: 0.15, ctl: 0.45, d2: 1, cs: 4, nmda: 1 } },
  ],
  // cs = how many hops of the cascade have propagated (0–4); scene 6 walks it up one hop at a time
  // nmda = NMDA receptor function on the interneurons (1 normal); scene 4 turns it down
  model(v) {
    const H0 = 0.25, nac0 = 0.3 + 0.6 * H0, vp0 = cl01(1.05 - 0.8 * nac0);
    const pvEff = v.pv * (0.3 + 0.7 * v.nmda);
    let hp = cl01(0.25 + 0.6 * (1 - pvEff) + 0.15 * (1 - v.ctl)); if (v.hpx >= 0) hp = v.hpx;
    const nacF = 0.3 + 0.6 * hp, vpF = cl01(1.05 - 0.8 * nacF), popF = Math.min(0.97, Math.max(0.05, 0.4 + 1.3 * (0.69 - vpF)));
    const c = k => cl01(v.cs - k), L = (a, b, t) => a + (b - a) * t;
    let pop = L(0.4, popF, c(3)); if (v.tr > 0) pop = L(pop, 0.42, v.tr);
    const eff = L(pop, 0.45 + (pop - 0.4) * 0.25, v.d2);
    return { hp, hpOut: L(H0, hp, c(0)), nac: L(nac0, nacF, c(0)), nacOut: L(nac0, nacF, c(1)), vp: L(vp0, vpF, c(1)), stream: L(vp0, vpF, c(2)),
      pop, eff, ctl: v.ctl, pv: v.pv, pvEff, nmda: v.nmda, d2: v.d2, tr: v.tr, assocDA: eff, limbicDA: 0.4 + 0.35 * (eff - 0.4) };
  },
  gauge: { gain: m => m.eff, raw: m => m.pop, pop: m => m.pop },
  salience(kind, m) {
    if (kind === 'relevant') return 1.05 + 0.4 * m.eff;
    if (kind === 'neutral') return m.tr > 0.5 ? 1.9 : 0.55 + cl01((m.eff - 0.5) * 5) * 1.5;
    return 1;
  },
  look(m) {
    const heat = cl01((m.hp - 0.28) / 0.55);
    return {
      Hippocampus: { heat, glow: 0.12 + 0.6 * heat, ec: '#ff8a3d' },
      Nucleus_accumbens: { glow: 0.6 * cl01((m.nac - 0.42) / 0.4), ec: '#ff9f43' },
      Ventral_pallidum: { glow: 0.75 * m.vp, ec: '#7cc4ff' },
      VTA: { glow: 0.15 + 0.8 * cl01((m.pop - 0.3) / 0.6), ec: '#ffd34d' },
      Substantia_nigra: { glow: 0.6 * cl01((m.assocDA - 0.4) / 0.4), ec: '#ffd34d' },
      Caudate_nucleus: { glow: 0.5 * cl01((m.assocDA - 0.45) / 0.35), ec: '#ffc21a' },
      Subgenual_frontal_cortex: { glow: 0.45 * m.ctl, ec: '#b48cff' },
      Middle_frontal_gyrus: { glow: 0.3 * m.eff, ec: '#ff9f43', op: 0.12 + 0.1 * m.eff },
      Middle_and_inferior_temporal_gyrus: { glow: 0.15, ec: '#ff9f43', op: 0.13 },
      Thal_MD: { glow: 0.4 * cl01((m.eff - 0.4) / 0.4), ec: '#ff9f43' },
    };
  },
  insets: {
    chips: () => ({ html: '<div class="t">What strains the interneurons</div><div class="chips"><span class="chip">Redox load</span><span class="chip">NMDA receptor hypofunction</span><span class="chip">Stress</span></div>' }),
    terminal: terminalInset,
    nmda: nmdaInset,
  },
  scenes: [
    { title: 'Orient', dur: 7, state: 'healthy', cam: { dir: MED }, show: [], hud: { dial: false, grid: false },
      caption: 'Six stops: prefrontal cortex, hippocampus, accumbens, pallidum, midbrain, striatum.',
      beats: [{ at: 0.3, labels: ['ilc', 'dl'] }, { at: 1.3, labels: ['ahp'] }, { at: 2.2, labels: ['nac'] }, { at: 3.0, labels: ['vp'] }, { at: 3.8, labels: ['vta', 'sn'] }, { at: 4.7, labels: ['cd', 'md'] }] },
    { title: 'Healthy baseline', dur: 10, state: 'healthy', cam: { dir: MED },
      show: ['ilc-re', 're-hp', 'hp-nac', 'nac-vp', 'vp-vta', 'vta-nac'], focus: ['ilc-re', 're-hp', 'ilc', 're', 'ahp'], labels: ['ilc', 're', 'ahp'],
      hud: { dial: true, grid: true, ring: true },
      caption: 'Medial prefrontal cortex reaches the hippocampus through nucleus reuniens; interneurons hold it quiet.',
      beats: [{ at: 5, focus: ['vp-vta', 'vp', 'vta'], labels: ['vp', 'vta'], caption: 'The pallidum keeps most dopamine neurons silent — a reserve, not a deficit.' }] },
    { title: 'A cue that matters, and one that doesn’t', dur: 10, state: 'healthy', cam: { dir: LAT, fit: ['ctx', 'cd', 'vta', 'sn'] },
      show: ['ctx-cd', 'sn-cd', 'vta-nac'], focus: ['ctx-cd', 'sn-cd', 'ctx', 'cd', 'sn'], labels: ['ctx', 'cd'], hud: { dial: true, grid: true },
      caption: 'Healthy gain: only what matters gets amplified.',
      beats: [{ at: 0.8, token: { icon: 'wave', from: 'ctx', to: 'cd', kind: 'relevant', flash: 'sn-cd' } }, { at: 4.8, token: { icon: 'car', from: 'ctx', to: 'cd', kind: 'neutral', flash: 'sn-cd' } }] },
    { title: 'NMDA receptor hypofunction', dur: 12, state: 'healthy', set: { cs: 0, nmda: 1 }, cam: { fit: ['ahp', 're'], r: 22, dir: [-1, 0.22, 0.32] },
      show: ['ilc-re', 're-hp'], focus: ['ahp'], labels: ['ahp'], hud: { dial: false, grid: true, ring: true }, inset: 'nmda',
      caption: 'Parvalbumin interneurons need NMDA receptor drive to keep firing.',
      beats: [
        { at: 2.5, tween: { nmda: [0.2, 4] }, caption: 'Block the NMDA receptors (ketamine, or the illness) and the interneurons go quiet first.' },
        { at: 7, caption: 'Pyramidal cells are released: glutamate rises and the hippocampus heats.' },
        { at: 10, caption: 'Blocking a glutamate receptor ends up raising glutamate. The midbrain hasn’t noticed yet.' }] },
    { title: 'The interneurons falter', dur: 10, state: 'healthy', set: { cs: 0 }, cam: { fit: ['ahp', 're'], r: 22, dir: [-1, 0.22, 0.32] },
      show: ['ilc-re', 're-hp', 'hp-nac'], focus: ['ilc-re', 're-hp', 'ahp', 're', 'ilc'], labels: ['ahp', 're'], hud: { dial: true, grid: true, ring: true }, inset: 'chips',
      caption: 'Anterior hippocampus runs hot.',
      beats: [{ at: 0.6, tween: { pv: [0.15, 6], ctl: [0.45, 6] }, state: 'psychosis' }] },
    { title: 'The cascade', dur: 13, state: 'psychosis', set: { cs: 0 }, cam: { fit: ['ahp', 'nac'], dir: MED, r: 22 },
      show: ['hp-nac', 'nac-vp', 'vp-vta', 'vta-nac'], focus: ['hp-nac', 'ahp', 'nac'], labels: ['ahp', 'nac'], hud: { dial: true, grid: true, ledger: true }, fx: { ledger: 0 },
      caption: 'Subiculum excites accumbens.',
      beats: [
        { at: 0.4, tween: { cs: [1, 2] }, fx: { ledger: 1 } },
        { at: 3.2, tween: { cs: [2, 2] }, fx: { ledger: 2 }, focus: ['nac-vp', 'nac', 'vp'], labels: ['vp'], cam: { fit: ['nac', 'vp'], dir: MED, r: 20 }, caption: 'Accumbens inhibits pallidum.' },
        { at: 6.2, tween: { cs: [3, 2] }, fx: { ledger: 3 }, focus: ['vp-vta', 'vp', 'vta'], labels: ['vta'], cam: { fit: ['vp', 'vta'], dir: MED, r: 20 }, caption: 'The brake lifts.' },
        { at: 9.2, tween: { cs: [4, 2] }, fx: { ledger: 4 }, focus: ['vta-nac', 'vta', 'nac'], cam: { fit: ['vta', 'nac', 'vp'], dir: MED, r: 24 }, caption: 'More dopamine neurons awake.' }] },
    { title: 'Spiral up to the associative striatum', dur: 10, state: 'psychosis', cam: { fit: ['vta', 'nac', 'sn', 'cd'], dir: MED },
      show: ['vta-nac', 'nac-sn', 'sn-cd'], focus: ['vta-nac', 'vta', 'nac'], labels: ['vta', 'nac'], hud: { dial: true, grid: true, tint: true },
      caption: 'Ventral tegmental dopamine floods the accumbens.',
      beats: [{ at: 3, focus: ['nac-sn', 'nac', 'sn'], labels: ['sn'], tags: { 'nac-sn': 'untested link' }, caption: 'The accumbens is a relay, not a source: it projects back onto nigral dopamine cells.' },
        { at: 6.2, focus: ['sn-cd', 'sn', 'cd'], labels: ['cd'], caption: 'Nigral neurons carry the excess into the caudate head. It lands in the associative striatum.' }] },
    { title: 'Inside a nigral dopamine terminal', dur: 10, state: 'psychosis', cam: { target: 'cd', r: 18, dir: [-0.7, 0.55, 0.55] },
      show: ['sn-cd'], labels: ['cd'], hud: { tint: true }, inset: 'terminal',
      caption: 'More dopamine made and released — the vesicles themselves are normal.' },
    { title: 'Aberrant salience', dur: 13, state: 'psychosis', cam: { dir: LAT, fit: ['ctx', 'cd', 'md', 'dl'] },
      show: ['ctx-cd', 'sn-cd', 'cd-md', 'md-dl', 'dl-cd'], focus: ['ctx-cd', 'sn-cd', 'ctx', 'cd'], labels: ['ctx', 'cd'], hud: { dial: true, grid: true, tint: true },
      caption: 'The same passing car comes back.',
      beats: [
        { at: 0.6, token: { icon: 'car', from: 'ctx', to: 'cd', kind: 'neutral', persist: true, ghost: 0.55, flash: 'sn-cd' } },
        { at: 3.4, caption: 'Nothing changed outside. The gain did.', focus: null, labels: ['md', 'dl'], token: { icon: 'plate', from: 'ctx', to: 'cd', kind: 'neutral', persist: true, soff: [98, -66], flash: 'sn-cd' } },
        { at: 5.4, token: { icon: 'radio', from: 'ctx', to: 'cd', kind: 'neutral', persist: true, soff: [-94, -76], flash: 'sn-cd' } },
        { at: 7.8, fx: { threads: true }, caption: 'Linked up, they become an explanation: the delusion.' }] },
    { title: 'On an antipsychotic', dur: 11, state: 'treated', set: { d2: 0 }, cam: { dir: MED },
      show: ['hp-nac', 'nac-vp', 'vp-vta', 'vta-nac', 'sn-cd', 'ctx-cd'], labels: ['ahp', 'cd'], hud: { dial: true, grid: true, tint: true, shields: true },
      caption: 'D2 receptors in the striatum are blocked.',
      controls: [{ type: 'toggle', var: 'tr', label: 'Treatment-resistant variant', after: S => S.flashEdge('sn-cd', 0) }, { type: 'button', label: 'Send a neutral cue', do: S => S.spawn({ icon: 'car', from: 'ctx', to: 'cd', kind: 'neutral', flash: 'sn-cd' }) }],
      beats: [{ at: 0.8, tween: { d2: [1, 1.6] } }, { at: 3.4, token: { icon: 'car', from: 'ctx', to: 'cd', kind: 'neutral', flash: 'sn-cd' } }, { at: 6.4, caption: 'Antipsychotics turn down the speaker, not the source.' }] },
    { title: 'Free play', free: true, dur: 0, state: 'psychosis', set: { hpx: 0.84 }, cam: { dir: MED }, show: 'all', labels: ['ahp', 'vta', 'cd'],
      hud: { dial: true, grid: true, tint: true, ring: true, shields: true },
      caption: 'Drag the hippocampus. Watch the midbrain.',
      controls: [{ type: 'range', var: 'hpx', label: 'Hippocampal drive', min: 0.2, max: 1 }, { type: 'toggle', var: 'd2', label: 'Antipsychotic' },
        { type: 'button', label: 'Send a neutral cue', do: S => S.spawn({ icon: 'car', from: 'ctx', to: 'cd', kind: 'neutral', flash: 'sn-cd' }) }] },
  ] },

// ---------------------------------------------------------------- affective
{ id: 'aff', name: 'Mood: the affective disruption story', color: '#3fd0c9', hemi: 'L', view: MED_LOW,
  desc: 'Prefrontal brakes, amygdala, pallidal gate and a circadian clock: how a mood loop runs away in either direction. Nine scenes.',
  nodes: {
    ifg:  { key: 'Inferior_frontal_gyrus', ghost: true, label: 'Ventrolateral prefrontal' },
    lofc: { key: 'Lateral_orbital_gyrus', ghost: true, label: 'Orbitofrontal' },
    amy:  { key: 'Amygdala', label: 'Amygdala (basolateral)', lo: [0, 12] },
    nac:  { key: 'Nucleus_accumbens', label: 'Accumbens' },
    vp:   { key: 'Ventral_pallidum', label: 'Ventral pallidum', lo: [0, 12] },
    vta:  { key: 'VTA', label: 'Ventral tegmental area' },
    hp:   { key: 'Hippocampus', ghost: true, label: 'Hippocampus', nofit: true },
    scn:  { key: 'Hypothalamus', mni: [-2, 2, -12], label: 'Suprachiasmatic (approx.)', r: 1.2, dot: '#3fd0c9', lo: [0, 12] },
    rph:  { key: 'Dorsal_raphe', label: 'Dorsal raphe', lo: [0, 12] },
    mpfc: { key: 'Pre-subgenual_frontal_cortex', ghost: true, label: 'Medial prefrontal', noDot: true },
    sn:   { key: 'Substantia_nigra', label: 'Substantia nigra', lo: [0, 12], nofit: true },
    cd:   { key: 'Caudate_nucleus', ghost: true, mni: [-12, 12, 6], label: 'Caudate head (associative)', nofit: true },
    ctx:  { key: 'Middle_and_inferior_temporal_gyrus', ghost: true, label: 'Temporal cortex', nofit: true },
    smn:  { key: 'Precentral_gyrus', ghost: true, label: 'Sensorimotor network', noDot: true, nofit: true },
    sal:  { key: 'Insula', ghost: true, label: 'Salience network', noDot: true, nofit: true },
    dmn:  { key: 'Cingulate_gyrus_posterior_part', ghost: true, label: 'Default mode network', noDot: true, nofit: true },
  },
  ghostCast: ['Postcentral_gyrus', 'Cingulate_gyrus_anterior_part', 'Medial_orbital_gyrus'],
  edges: [
    { id: 'ifg-amy', from: 'ifg', to: 'amy', via: [[-36, 8, -12]], sign: 'ctl', act: m => m.brake },
    { id: 'ofc-nac', from: 'lofc', to: 'nac', via: [[-26, 24, -12]], sign: 'ctl', act: m => m.brake },
    { id: 'amy-vp', from: 'amy', to: 'vp', via: [[-17, 0, -14]], sign: '+', act: m => m.amy },
    { id: 'hp-nac', from: 'hp', to: 'nac', via: [[-20, -2, -14]], sign: '+', act: () => 0.3 },
    { id: 'nac-vp', from: 'nac', to: 'vp', sign: '-', act: m => m.nac },
    { id: 'vp-vta', from: 'vp', to: 'vta', via: [[-9, -7, -10]], sign: '-', act: m => m.vp },
    { id: 'vta-nac', from: 'vta', to: 'nac', via: [[-6, -4, -12]], sign: 'da', act: m => m.pop },
    { id: 'scn-vta', from: 'scn', to: 'vta', via: [[-3, -8, -12]], sign: 'clock', act: m => m.clockEff },
    { id: 'rph-mpfc', from: 'rph', to: 'mpfc', via: [[0, -14, -6], [-2, 14, -10]], sign: '5ht', act: m => 0.35 + 0.4 * cl01(-m.tilt) },
    { id: 'nac-sn', from: 'nac', to: 'sn', via: [[-11, -6, -15]], sign: 'spiral', act: m => m.assocDA },
    { id: 'sn-cd', from: 'sn', to: 'cd', via: [[-12, -6, -2], [-13, 4, 4]], sign: 'da', act: m => m.assocDA },
    { id: 'ctx-cd', from: 'ctx', to: 'cd', via: [[-40, -12, -8], [-24, 2, 4]], sign: '+', act: () => 0.45 },
  ],
  shieldOn: [['Nucleus_accumbens', 5, null], ['Caudate_nucleus', 6, p => p[1] > 2], ['Putamen', 3, p => p[1] > 0]],
  vars: { clock: 1, brake: 1, amy: 0.3, b: 0.2, m: 0, ev: 1, d2: 0, lith: 0, rth: 0, ps: 0, af: 0, th: 0 },
  discrete: ['ev'],
  states: [
    { id: 'eu', label: 'Euthymia', vars: { clock: 1, brake: 1, amy: 0.3, b: 0.2, ev: 1, m: 0, d2: 0, lith: 0, rth: 0 } },
    { id: 'mania', label: 'Mania', vars: { clock: 0.3, brake: 0.55, amy: 0.3, b: 0.9, ev: 2, m: 0.6 } },
    { id: 'dep', label: 'Depression', vars: { clock: 0.75, brake: 0.55, amy: 0.9, b: 0.9, ev: 3, m: -0.6 } },
  ],
  model(v, S) {
    const clockEff = Math.min(1, v.clock + (1 - v.clock) * (0.55 * v.rth + 0.45 * v.lith));
    const pop = Math.min(0.95, Math.max(0.08, 0.4 + 0.45 * (1 - clockEff) * (1 - 0.4 * v.lith) + 0.2 * v.m - 0.5 * Math.max(0, v.amy - 0.3)));
    const eff = pop + v.d2 * (0.45 + (pop - 0.4) * 0.25 - pop);
    const day = (S && S.sim && S.sim.day) || 0;
    return { clockEff, pop, popShow: Math.min(1, Math.max(0, pop + 0.07 * Math.sin(day * Math.PI * 2) * clockEff)), eff,
      vp: cl01(0.69 - (pop - 0.4) / 1.3), nac: 0.3 + 0.5 * pop, limbicDA: eff, assocDA: cl01(0.3 + Math.max(0, eff - 0.72) * 3),
      tilt: Math.max(-1, Math.min(1, (pop - 0.4) * 1.6 + 0.45 * v.m)), amy: v.amy, brake: v.brake, b: v.b * (1 - 0.6 * v.lith), m: v.m };
  },
  gauge: { gain: m => m.eff, raw: m => m.pop, pop: m => m.popShow },
  gridAt: 'vta', biasTo: 'nac',
  salience(kind, m) {
    if (kind === 'rewardPos') return 0.85 + 0.7 * m.eff;
    if (kind === 'rewardNeg') return 0.85;
    if (kind === 'neutral') return 0.55 + cl01((m.assocDA - 0.5) * 5) * 1.5;
    if (kind === 'stress') return 1.35;
    return 1;
  },
  // reward events: an outcome travels orbitofrontal → accumbens; on arrival mood integrates the prediction error
  tick(dt, v, m, S) {
    const sim = S.sim;
    sim.day = (sim.day || 0) + dt * (0.2 + 0.55 * (1 - m.clockEff));
    if (S.fx.swing) { const ph = S.t * 0.5; v.m = 0.85 * Math.sin(ph); v.amy = 0.3 + 0.5 * Math.max(0, -Math.sin(ph)); v.clock = 0.6; }
    const ev = Math.round(v.ev); if (!ev) return;
    sim.next = (sim.next ?? 0.7) - dt; if (sim.next > 0) return;
    sim.next = Math.max(0.55, 1.5 - 0.7 * Math.abs(v.m));
    const R = S.rand, r = ev === 1 ? (R() - 0.5) * 0.6 : ev === 2 ? 0.12 + R() * 0.16 : -0.18 - R() * 0.16 + (R() < 0.2 ? 0.3 : 0);
    S.spawn({ icon: r >= 0 ? 'coin' : 'cloud', from: 'lofc', to: 'nac', dur: 0.9, life: 0.5, kind: r >= 0 ? 'rewardPos' : 'rewardNeg', onArrive: S2 => {
      const mm = S2.def.model(S2.vars, S2), V = S2.vars;
      const delta = (r + mm.b * V.m) * (0.5 + mm.eff), decay = 0.86 - 0.14 * V.lith;
      V.m = Math.max(-1, Math.min(1, V.m * decay + 0.35 * delta));
      S2.flashEdge('vta-nac', cl01(Math.abs(delta) * 1.8), delta < 0);
    } });
  },
  look(m, S) {
    const day = (S.sim.day || 0), a = cl01((m.amy - 0.3) / 0.6), mixed = !!S.hud.mixed, net = mixed || !!S.hud.seesaw;
    const L = {
      Amygdala: { heat: a, glow: 0.12 + 0.7 * a, ec: '#ff6b5b' },
      Nucleus_accumbens: { glow: 0.15 + 0.65 * cl01((m.limbicDA - 0.3) / 0.6), ec: '#ffd34d' },
      Ventral_pallidum: { glow: 0.75 * m.vp, ec: '#7cc4ff' },
      VTA: { glow: 0.12 + 0.8 * cl01((m.pop - 0.1) / 0.8), ec: '#ffd34d' },
      Inferior_frontal_gyrus: { glow: 0.35 * m.brake, ec: '#b48cff', op: 0.1 + 0.12 * m.brake },
      Lateral_orbital_gyrus: { glow: 0.3 * m.brake, ec: '#b48cff', op: 0.1 + 0.12 * m.brake },
      Hypothalamus: { glow: 0.25 + 0.3 * Math.sin(day * Math.PI * 2) * m.clockEff, ec: '#3fd0c9' },
      Caudate_nucleus: { glow: 0.6 * cl01((m.assocDA - 0.45) / 0.4), ec: '#ffd34d', op: S.hud.tint ? 0.8 : 0.08 },
      Substantia_nigra: { glow: 0.5 * cl01((m.assocDA - 0.45) / 0.4), ec: '#ffd34d' },
    };
    if (net) {
      const smn = mixed ? S.vars.ps : m.tilt, sal = mixed ? S.vars.af : Math.max(0, m.tilt) * 0.9, dmn = mixed ? S.vars.th : -m.tilt;
      L.Precentral_gyrus = L.Postcentral_gyrus = unitLook(smn, NET_COL.smn);
      L.Insula = L.Cingulate_gyrus_anterior_part = unitLook(sal, NET_COL.sal);
      L.Cingulate_gyrus_posterior_part = L['Pre-subgenual_frontal_cortex'] = unitLook(dmn, NET_COL.dmn);
    }
    return L;
  },
  liveCaption(v) {
    const w = x => x > 0.2 ? 'excited' : x < -0.2 ? 'inhibited' : 'neutral', name = KRAEPELIN[sgn(v.ps) + sgn(v.af) + sgn(v.th)] || 'Between states';
    return `${name}: psychomotor ${w(v.ps)}, affect ${w(v.af)}, thought ${w(v.th)}.`;
  },
  mixedHtml(v) {
    const row = (lab, sub, x) => { const w = Math.abs(x) * 50, left = x < 0 ? 50 - w : 50; return `<span>${lab} <span style="color:var(--muted)">${sub}</span></span><span class="g"><i style="left:${left}%;width:${w}%;background:${x < 0 ? '#4aa8ff' : '#ffb454'}"></i></span>`; };
    const key = sgn(v.ps) + sgn(v.af) + sgn(v.th), name = KRAEPELIN[key] || 'Between states';
    return `<div class="t">Three dimensions</div><div class="row3">${row('Psychomotor', 'sensorimotor', v.ps)}${row('Affect', 'salience', v.af)}${row('Thought', 'default mode', v.th)}</div><div class="nm">${name}</div><div class="src">Warm = excited, cool = inhibited, shown on the network that carries each dimension (Martino &amp; Magioncalda 2022). Names from Kraepelin's scheme (recalled).</div>`;
  },
  insets: {
    compare: compareInset,
    evidence: () => ({ html: '<div class="t">Evidence</div>Bipolar psychosis matches schizophrenia on striatal dopamine synthesis capacity, and it tracks positive symptoms after adjusting for mania (Jauhar 2017).' }),
  },
  scenes: [
    { title: 'Orient', dur: 7, state: 'eu', set: { ev: 0 }, cam: { dir: MED_LOW }, show: [], hud: {},
      caption: 'The mood engine: prefrontal brakes, amygdala, accumbens, pallidum, midbrain, clock.',
      beats: [{ at: 0.3, labels: ['ifg', 'lofc'] }, { at: 1.4, labels: ['amy'] }, { at: 2.4, labels: ['nac', 'vp'] }, { at: 3.4, labels: ['vta'] }, { at: 4.4, labels: ['scn', 'rph'] }] },
    { title: 'Euthymia', dur: 12, state: 'eu', cam: { dir: MED_LOW, fit: ['amy', 'nac', 'vp', 'vta', 'scn'], r: 20 },
      show: ['ifg-amy', 'ofc-nac', 'amy-vp', 'nac-vp', 'vp-vta', 'vta-nac', 'scn-vta'], labels: ['amy', 'nac', 'vta', 'scn'],
      hud: { dial: true, grid: true, mood: true, clock: true, strip: true },
      caption: 'Mood is the running total of surprises — and it decays back.' },
    { title: 'The trigger', dur: 9, state: 'eu', cam: { dir: MED_LOW, fit: ['amy', 'nac', 'vp', 'vta', 'scn'], r: 20 },
      show: ['ifg-amy', 'ofc-nac', 'amy-vp', 'nac-vp', 'vp-vta', 'vta-nac', 'scn-vta'], focus: ['scn-vta', 'ifg-amy', 'ofc-nac', 'scn', 'vta', 'ifg', 'lofc', 'amy', 'nac'], labels: ['scn', 'vta'],
      hud: { dial: true, grid: true, mood: true, clock: true, strip: true },
      caption: 'Sleep loss knocks the midbrain off its clock.',
      beats: [{ at: 0.4, tween: { clock: [0.3, 4.5], brake: [0.55, 4.5] } }] },
    { title: 'Mania: the momentum ratchet', dur: 15, state: 'mania', set: { m: 0.12 }, cam: { dir: MED_UP, fit: ['ifg', 'lofc', 'amy', 'nac', 'vta', 'smn', 'dmn'] },
      show: ['ofc-nac', 'nac-vp', 'vp-vta', 'vta-nac', 'scn-vta', 'ifg-amy'], focus: ['ofc-nac', 'vta-nac', 'scn-vta', 'lofc', 'nac', 'vta'], labels: ['lofc', 'nac'],
      tags: { 'scn-vta': 'extrapolation' },
      hud: { dial: true, grid: true, mood: true, seesaw: true }, fx: { bias: true },
      caption: 'Good news makes the next news look better. The loop runs away.',
      beats: [{ at: 6, labels: ['smn', 'sal', 'dmn'], caption: 'Sensorimotor and salience networks brighten; the default mode network dims.' }, { at: 11, caption: 'Good news makes the next news look better. The loop runs away.' }] },
    { title: 'Psychosis spillover', dur: 10, state: 'mania', set: { m: 0.95 }, cam: { dir: MED, fit: ['vta', 'nac', 'sn', 'cd', 'ctx'] },
      show: ['vta-nac', 'nac-sn', 'sn-cd', 'ctx-cd'], labels: ['nac', 'cd'], tags: { 'nac-sn': 'untested link' }, hud: { dial: true, grid: true, mood: true, tint: true }, inset: 'evidence',
      caption: 'Same amplifier, overflowing into the associative striatum.',
      controls: [{ type: 'button', label: 'See it in the psychosis story', do: () => startStory('psy', 8) }],
      beats: [{ at: 3, token: { icon: 'car', from: 'ctx', to: 'cd', kind: 'neutral', persist: true, flash: 'sn-cd' } }] },
    { title: 'The switch to depression', dur: 16, state: 'dep', set: { amy: 0.3, m: 0, ev: 0 }, cam: { dir: MED_UP, fit: ['ifg', 'lofc', 'amy', 'nac', 'vta', 'smn', 'dmn'] },
      show: ['ifg-amy', 'ofc-nac', 'amy-vp', 'nac-vp', 'vp-vta', 'vta-nac'], focus: ['amy-vp', 'vp-vta', 'amy', 'vp', 'vta'], labels: ['amy', 'vp', 'vta'],
      tags: { 'amy-vp': 'rodent circuit' },
      hud: { dial: true, grid: true, mood: true, seesaw: true, dat: true }, fx: { bias: true },
      caption: 'A stressor hits the amygdala.',
      beats: [
        { at: 0.5, token: { icon: 'bolt', from: 'ctx', to: 'amy', kind: 'stress', dur: 1.4 } },
        { at: 1.8, tween: { amy: [0.9, 2.5] }, caption: 'The amygdala clamps the brake. Rewards stop landing.' },
        { at: 4, set: { ev: 3 }, focus: null },
        { at: 8.5, labels: ['dmn', 'smn'], caption: 'Default mode network up (rumination), sensorimotor down (slowing).' },
        { at: 13, caption: 'The amygdala clamps the brake. Rewards stop landing.' }] },
    { title: 'Mixed states', free: true, dur: 0, state: 'eu', set: { ev: 0, ps: 1, af: -1, th: -1 }, cam: { dir: MED_UP, fit: ['ifg', 'nac', 'vta', 'smn', 'sal', 'dmn'] },
      show: [], labels: ['smn', 'sal', 'dmn'], hud: { mixed: true, dial: false, grid: false }, live: 'mixed',
      caption: 'Three dimensions, each excited or inhibited: eight combinations — two pure states, six mixed.',
      controls: [
        { type: 'range', var: 'ps', label: 'Psychomotor', min: -1, max: 1 }, { type: 'range', var: 'af', label: 'Affect', min: -1, max: 1 }, { type: 'range', var: 'th', label: 'Thought', min: -1, max: 1 },
        { type: 'presets', items: [{ label: 'Mania', set: { ps: 1, af: 1, th: 1 } }, { label: 'Depression', set: { ps: -1, af: -1, th: -1 } }, { label: 'Excited depression', set: { ps: 1, af: -1, th: -1 } }, { label: 'Inhibited mania', set: { ps: -1, af: 1, th: 1 } }] },
        { type: 'note', html: 'Warm = excited, cool = inhibited, shown on the network that carries each dimension (Martino &amp; Magioncalda 2022). State names follow Kraepelin’s scheme (recalled).' }] },
    { title: 'Treatment', dur: 14, state: 'mania', set: { m: 0.8, lith: 0, d2: 0, rth: 0 }, cam: { dir: MED_LOW, fit: ['amy', 'nac', 'vp', 'vta', 'scn'], r: 20 },
      show: ['ifg-amy', 'ofc-nac', 'amy-vp', 'nac-vp', 'vp-vta', 'vta-nac', 'scn-vta'], labels: ['scn', 'nac', 'vta'],
      hud: { dial: true, grid: true, mood: true, clock: true, strip: true, shields: true }, fx: { bias: true },
      caption: 'Mania, running.',
      controls: [{ type: 'toggle', var: 'lith', label: 'Lithium' }, { type: 'toggle', var: 'd2', label: 'Antipsychotic' }, { type: 'toggle', var: 'rth', label: 'Rhythm' }],
      beats: [
        { at: 1.5, tween: { lith: [1, 1.5] }, set: { ev: 1 }, caption: 'Lithium: the clock steadies and the loop gains a damper.' },
        { at: 6, tween: { d2: [1, 1.2] }, caption: 'Antipsychotic: the gain is capped and the ratchet stalls.' },
        { at: 9.5, tween: { rth: [1, 1.5] }, caption: 'Rhythm: regular sleep and routine stop the creep.' },
        { at: 12.5, caption: 'Steady the clock, damp the loop, cap the gain.' }] },
    { title: 'Side by side', dur: 16, state: 'eu', set: { ev: 0 }, fx: { swing: true }, cam: { dir: MED, fit: ['vta', 'nac', 'sn', 'cd'] },
      show: ['vta-nac', 'nac-sn', 'sn-cd'], labels: ['nac', 'cd'], hud: { dial: true, grid: true, tint: true }, inset: 'compare',
      caption: 'Stuck gain, wrong territory. Swinging gain, right territory.' },
  ] },
];
