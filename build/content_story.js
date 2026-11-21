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

// ---------------------------------------------------------------- psychosis
// Subiculum → accumbens fibres run in the fornix: waypoints are the left fornix centreline from the HCP842 tractography mesh
// (fimbria → crus → body over the thalamus → column), then the precommissural branch to the accumbens.
const FORNIX = [[-27.5, -24.3, -10.6], [-26.6, -31.7, -5.4], [-23.0, -37.1, 3.2], [-15.9, -36.4, 9.1], [-6.3, -30.3, 13.6], [-2.2, -21.6, 16.4], [-0.5, -10.1, 16.0], [-1.0, -2.9, 11.5], [-0.9, 2.9, 1.1], [-4, 7, -5]];
// Four illustrative patients: each loses a different node, all end with a high gain (Segal 2023 is the principle, not these four)
const PATIENTS = [
  { label: 'interneurons fail', node: 'ahp', k: 'pv', v: 0 },
  { label: 'prefrontal control fails', node: 'ilc', k: 'ctl', v: 0 },
  { label: 'pallidal output falls', node: 'vp', k: 'vpx', v: 0.55 },
  { label: 'dopamine neurons over-excitable', node: 'vta', k: 'vtax', v: 0.38 },
];
const NORMAL = { pv: 1, ctl: 1, nmda: 1, vpx: 1, vtax: 0 };
function patient(S, i) {
  const p = PATIENTS[i % PATIENTS.length];
  for (const [k, v] of Object.entries(NORMAL)) if (k !== p.k) S.tween(k, v, 0.6);
  S.tween(p.k, p.v, 1.6, 0.9, NORMAL[p.k]);
  S.fx.pn = (i % PATIENTS.length) + 1; S.fx.hit = p.node; S.fx.hitLabel = `Patient ${S.fx.pn}: ${p.label}`;
  S.setCaption ? S.setCaption(`Patient ${S.fx.pn}: ${p.label}.`) : null;
}
// Network spread, illustrative: hop count from the hippocampus along major connections (not a fitted model)
const SPREAD = [['Hippocampus', 0], ['Amygdala', 1], ['Parahippocampal_and_ambient_gyri', 1], ['Nucleus_accumbens', 1.1], ['Anterior_temporal_lobe_medial_part', 1.2],
  ['Subgenual_frontal_cortex', 2], ['Pre-subgenual_frontal_cortex', 2.1], ['Medial_orbital_gyrus', 2.1], ['Insula', 2.2], ['Superior_temporal_gyrus_anterior_part', 2.2], ['Cingulate_gyrus_anterior_part', 2.4], ['Thal_MD', 2.3],
  ['Superior_temporal_gyrus_posterior_part', 3], ['Middle_frontal_gyrus', 3.1], ['Inferior_frontal_gyrus', 3], ['Cingulate_gyrus_posterior_part', 3.2], ['Middle_and_inferior_temporal_gyrus', 3], ['Lateral_orbital_gyrus', 3]];
const SPREAD_TRACTS = [['Fornix', 0.6], ['Uncinate', 1.6], ['Cingulum', 2.2]];
const SPREAD_DEEP = new Set(['Hippocampus', 'Nucleus_accumbens', 'Thal_MD']);
const SPREAD_LEVELS = Object.fromEntries([...SPREAD.map(([k]) => [k, SPREAD_DEEP.has(k) ? 2 : 1]), ...SPREAD_TRACTS.map(([k]) => [k, 1])]);
const EVIDENCE_HTML = (t, body) => ({ kind: 'html', html: `<div class="t">${t}</div>${body}` });

const STORIES = [
{ id: 'psy', name: 'Psychosis: the gain story', color: '#ffb454', hemi: 'L', view: MED,
  desc: 'Fifteen scenes in two chapters: the dopamine cascade (hippocampus → pallidum → midbrain → associative striatum), then the network view (coupling, staging, heterogeneity, spread).',
  nodes: {
    ilc: { key: 'Subgenual_frontal_cortex', label: 'Medial prefrontal' },
    dl:  { key: 'Middle_frontal_gyrus', ghost: true, label: 'Dorsolateral prefrontal' },
    vmp: { key: 'Medial_orbital_gyrus', ghost: true, label: 'Ventromedial prefrontal', lo: [0, 12], nofit: true },
    re:  { mni: [-1, -10, 4], label: 'Nucleus reuniens (approx.)', r: 1.3, dot: '#b48cff' },
    ahp: { key: 'Hippocampus', mni: [-25, -13, -20], label: 'Anterior hippocampus', hot: true },
    fxb: { mni: [-4, -26, 15], label: 'Fornix', noDot: true, nofit: true },
    nac: { key: 'Nucleus_accumbens', label: 'Accumbens', lo: [-6, 0] },
    vp:  { key: 'Ventral_pallidum', label: 'Ventral pallidum', lo: [0, 12] },
    vta: { key: 'VTA', label: 'Ventral tegmental area' },
    sn:  { key: 'Substantia_nigra', label: 'Substantia nigra', lo: [0, 12] },
    cd:  { key: 'Caudate_nucleus', mni: [-12, 12, 6], label: 'Caudate head (associative)' },
    md:  { key: 'Thal_MD', label: 'Mediodorsal thalamus', lo: [0, 12] },
    ctx: { key: 'Middle_and_inferior_temporal_gyrus', ghost: true, label: 'Temporal cortex' },
  },
  // ev = evidence for this link's role in psychosis: human (patients), rodent (animal models), proposed (untested)
  edges: [
    { id: 'ilc-re', from: 'ilc', to: 're', via: [[-3, 8, -2]], sign: 'ctl', ev: 'rodent', act: m => m.ctl },
    { id: 're-hp', from: 're', to: 'ahp', via: [[-10, -14, -4], [-20, -16, -12]], sign: 'ctl', ev: 'rodent', act: m => m.ctl },
    { id: 'hp-nac', from: 'ahp', to: 'nac', via: FORNIX, sign: '+', ev: 'rodent', act: m => m.hpOut },
    { id: 'nac-vp', from: 'nac', to: 'vp', sign: '-', ev: 'rodent', act: m => m.nacOut },
    { id: 'vp-vta', from: 'vp', to: 'vta', via: [[-9, -7, -10]], sign: '-', ev: 'rodent', act: m => m.stream },
    { id: 'vta-nac', from: 'vta', to: 'nac', via: [[-6, -4, -12]], sign: 'da', ev: 'rodent', act: m => m.pop },
    { id: 'nac-sn', from: 'nac', to: 'sn', via: [[-11, -6, -15]], sign: 'spiral', ev: 'proposed', act: m => m.pop * 0.9 },
    { id: 'sn-cd', from: 'sn', to: 'cd', via: [[-12, -6, -2], [-13, 4, 4]], sign: 'da', ev: 'human', act: m => m.assocDA, fault: m => m.fs },
    { id: 'ctx-cd', from: 'ctx', to: 'cd', via: [[-40, -12, -8], [-24, 2, 4]], sign: '+', ev: 'human', act: () => 0.45 },
    { id: 'cd-md', from: 'cd', to: 'md', via: [[-10, -4, 6]], sign: '+', ev: 'human', act: m => m.eff, fault: m => m.fs },
    { id: 'md-dl', from: 'md', to: 'dl', via: [[-12, -2, 22], [-24, 18, 28]], sign: '+', ev: 'human', act: m => m.eff, fault: m => m.fcx },
    { id: 'dl-cd', from: 'dl', to: 'cd', via: [[-22, 22, 16]], sign: '+', ev: 'human', act: m => 0.45 + 0.3 * m.eff, fault: m => m.fcx },
    { id: 'fcD', from: 'dl', to: 'cd', via: [[-26, 24, 20]], sign: 'fc', ev: 'human', act: m => m.fcD / 1.6, w: m => 0.5 + 0.9 * m.fcD },
    { id: 'fcV', from: 'vmp', to: 'nac', via: [[-10, 26, -14]], sign: 'fc', ev: 'human', act: m => m.fcV / 1.6, w: m => 0.5 + 0.9 * m.fcV },
  ],
  ring: 'ahp',
  capsets: [
    { var: 'd2', shape: 'hex', stroke: '#9fd3ff', fill: 'rgba(74,168,255,0.55)', on: [['Caudate_nucleus', 8, p => p[1] > 2], ['Nucleus_accumbens', 4, null], ['Putamen', 4, p => p[1] > 0]] },
    { var: 'musc', shape: 'round', stroke: '#a9f0c4', fill: 'rgba(95,211,138,0.6)', text: 'M', on: [['Caudate_nucleus', 6, p => p[1] > 2], ['Putamen', 4, p => p[1] > 0]] },
  ],
  vars: { pv: 1, ctl: 1, d2: 0, tr: 0, cs: 4, hpx: -1, nmda: 1, vpx: 1, vtax: 0, musc: 0, fcD: 1, fcV: 1, rel: 0, fs: 0, fcx: 0, yrs: 0 },
  discrete: ['hpx', 'rel'],
  states: [
    { id: 'healthy', label: 'Healthy', vars: { pv: 1, ctl: 1, d2: 0, tr: 0, cs: 4, nmda: 1, vpx: 1, vtax: 0, musc: 0, fcD: 1, fcV: 1, rel: 0 } },
    { id: 'psychosis', label: 'Psychosis', vars: { pv: 0.15, ctl: 0.45, d2: 0, cs: 4, nmda: 1, vpx: 1, vtax: 0, musc: 0, fcD: 0.35, fcV: 1.6, rel: 0 } },
    { id: 'treated', label: 'On antipsychotic', vars: { pv: 0.15, ctl: 0.45, d2: 1, cs: 4, nmda: 1, vpx: 1, vtax: 0, fcD: 0.35, fcV: 1.6, rel: 0 } },
  ],
  // cs = hops of the cascade propagated (0–4); scene 6 walks it up one hop at a time
  // nmda = NMDA receptor function on the interneurons; vpx / vtax = direct pallidal and midbrain hits (patients scene)
  // musc = muscarinic agonist (less dopamine released); d2 = D2 blockade; fcD / fcV = dorsal / ventral frontostriatal coupling
  // fs / fcx = subcortical / cortical dysconnectivity (staging); yrs = 0–1 along the illustrative spread timeline
  model(v) {
    const H0 = 0.25, nac0 = 0.3 + 0.6 * H0, vp0 = cl01(1.05 - 0.8 * nac0);
    const pvEff = v.pv * (0.3 + 0.7 * v.nmda);
    let hp = cl01(0.25 + 0.5 * (1 - pvEff) + 0.5 * (1 - v.ctl)); if (v.hpx >= 0) hp = v.hpx;
    const nacF = 0.3 + 0.6 * hp, vpF = cl01(1.05 - 0.8 * nacF) * v.vpx;
    const popF = Math.min(0.97, Math.max(0.05, 0.4 + 1.3 * (0.69 - vpF) + v.vtax));
    const c = k => cl01(v.cs - k), L = (a, b, t) => a + (b - a) * t;
    let pop = L(0.4, popF, c(3)); if (v.tr > 0) pop = L(pop, 0.42, v.tr);
    let eff = L(pop, 0.45 + (pop - 0.4) * 0.25, v.d2);
    eff = L(eff, 0.45 + (eff - 0.4) * 0.3, v.musc);
    return { hp, hpOut: L(H0, hp, c(0)), nac: L(nac0, nacF, c(0)), nacOut: L(nac0, nacF, c(1)), vp: L(vp0, vpF, c(1)), stream: L(vp0, vpF, c(2)),
      pop, eff, ctl: v.ctl, pv: v.pv, pvEff, nmda: v.nmda, d2: v.d2, musc: v.musc, tr: v.tr, assocDA: eff, limbicDA: 0.4 + 0.35 * (eff - 0.4),
      fcD: v.fcD, fcV: v.fcV, rel: v.rel, fs: v.fs, fcx: v.fcx, yrs: v.yrs };
  },
  gauge: { gain: m => m.eff, raw: m => m.pop, pop: m => m.pop },
  salience(kind, m) {
    if (kind === 'relevant') return 1.05 + 0.4 * m.eff;
    if (kind === 'neutral') return m.tr > 0.5 ? 1.9 : 0.55 + cl01((m.eff - 0.5) * 5) * 1.5;
    return 1;
  },
  badge(m, S) {
    const b = S.scene.badge;
    if (b === 'patients') return S.fx.pn ? `Patient ${S.fx.pn} of 4 · one circuit` : null;
    if (b === 'years') return (m.yrs < 0.15 ? 'Prodrome' : m.yrs < 0.42 ? 'First episode' : m.yrs < 0.72 ? 'About 5 years in' : 'About 10 years in') + ' · illustrative order';
    if (b === 'stage') return m.fcx > 0.5 ? 'Established schizophrenia' : m.fs > 0.5 ? 'First episode, antipsychotic-naive' : 'Healthy';
    if (b === 'gradient') return m.rel > 0.5 ? 'Unaffected first-degree relative' : m.fcD < 0.7 ? 'First-episode psychosis' : 'Healthy';
    return null;
  },
  look(m, S) {
    const heat = cl01((m.hp - 0.28) / 0.55);
    const L = {
      Hippocampus: { heat, glow: 0.12 + 0.6 * heat, ec: '#ff8a3d' },
      Nucleus_accumbens: { glow: 0.6 * cl01((m.nac - 0.42) / 0.4), ec: '#ff9f43' },
      Ventral_pallidum: { glow: 0.75 * m.vp, ec: '#7cc4ff' },
      VTA: { glow: 0.15 + 0.8 * cl01((m.pop - 0.3) / 0.6), ec: '#ffd34d' },
      Substantia_nigra: { glow: 0.6 * cl01((m.assocDA - 0.4) / 0.4), ec: '#ffd34d' },
      Caudate_nucleus: { glow: 0.5 * cl01((m.assocDA - 0.45) / 0.35), ec: '#ffc21a' },
      Subgenual_frontal_cortex: { glow: 0.45 * m.ctl, ec: '#b48cff' },
      Middle_frontal_gyrus: { glow: 0.3 * m.eff, ec: '#ff9f43', op: 0.12 + 0.1 * m.eff },
      Medial_orbital_gyrus: { glow: 0.45 * cl01(m.fcV - 0.8), ec: '#7fe7ff', op: 0.12 + 0.12 * cl01(m.fcV - 0.8) },
      Middle_and_inferior_temporal_gyrus: { glow: 0.15, ec: '#ff9f43', op: 0.13 },
      Thal_MD: { glow: 0.4 * cl01((m.eff - 0.4) / 0.4), ec: '#ff9f43' },
    };
    if (S.hud.spread) {
      const y = m.yrs * 3.6;
      for (const [k, d] of SPREAD) {
        const loss = cl01((y - d) / 1.2), front = cl01(1 - Math.abs(y - d - 0.3) / 0.6), prev = L[k] || {};
        L[k] = { ...prev, heat: 0, dim: 0.7 * loss, glow: Math.max(0.8 * front, 0.1 * (1 - loss) * (prev.glow || 0)), ec: '#ff5a4f', op: 0.13 + 0.35 * Math.max(front, 0.55 * loss) };
      }
      for (const [k, d] of SPREAD_TRACTS) { const front = cl01(1 - Math.abs(y - d) / 0.8); L[k] = { glow: 0.9 * front, ec: '#ff8a6b', op: 0.1 + 0.55 * front }; }
    }
    return L;
  },
  insets: {
    chips: () => ({ html: '<div class="t">What strains the interneurons</div><div class="chips"><span class="chip">Redox load</span><span class="chip">NMDA receptor hypofunction</span><span class="chip">Stress</span></div>' }),
    terminal: terminalInset,
    nmda: nmdaInset,
  },
  scenes: [
    { title: 'Orient', chapter: 'Cascade', dur: 7, state: 'healthy', cam: { dir: MED }, show: [], hud: { dial: false, grid: false },
      caption: 'Six stops: prefrontal cortex, hippocampus, accumbens, pallidum, midbrain, striatum.',
      beats: [{ at: 0.3, labels: ['ilc', 'dl'] }, { at: 1.3, labels: ['ahp'] }, { at: 2.2, labels: ['nac'] }, { at: 3.0, labels: ['vp'] }, { at: 3.8, labels: ['vta', 'sn'] }, { at: 4.7, labels: ['cd', 'md'] }] },
    { title: 'Healthy baseline', chapter: 'Cascade', dur: 10, state: 'healthy', cam: { dir: MED },
      show: ['ilc-re', 're-hp', 'hp-nac', 'nac-vp', 'vp-vta', 'vta-nac'], focus: ['ilc-re', 're-hp', 'ilc', 're', 'ahp'], labels: ['ilc', 're', 'ahp'],
      hud: { dial: true, grid: true, ring: true },
      caption: 'Medial prefrontal cortex reaches the hippocampus through nucleus reuniens; interneurons hold it quiet.',
      beats: [{ at: 5, focus: ['vp-vta', 'vp', 'vta'], labels: ['vp', 'vta'], caption: 'The pallidum keeps most dopamine neurons silent — a reserve, not a deficit.' }] },
    { title: 'A cue that matters, and one that doesn’t', chapter: 'Cascade', dur: 10, state: 'healthy', cam: { dir: LAT, fit: ['ctx', 'cd', 'vta', 'sn'] },
      show: ['ctx-cd', 'sn-cd', 'vta-nac'], focus: ['ctx-cd', 'sn-cd', 'ctx', 'cd', 'sn'], labels: ['ctx', 'cd'], hud: { dial: true, grid: true },
      caption: 'Healthy gain: only what matters gets amplified.',
      beats: [{ at: 0.8, token: { icon: 'wave', from: 'ctx', to: 'cd', kind: 'relevant', flash: 'sn-cd' } }, { at: 4.8, token: { icon: 'car', from: 'ctx', to: 'cd', kind: 'neutral', flash: 'sn-cd' } }] },
    { title: 'NMDA receptor hypofunction', chapter: 'Cascade', dur: 12, state: 'healthy', set: { cs: 0, nmda: 1 }, cam: { fit: ['ahp', 're'], r: 22, dir: [-1, 0.22, 0.32] },
      show: ['ilc-re', 're-hp'], focus: ['ahp'], labels: ['ahp'], hud: { dial: false, grid: true, ring: true }, inset: 'nmda',
      caption: 'Parvalbumin interneurons need NMDA receptor drive to keep firing.',
      beats: [
        { at: 2.5, tween: { nmda: [0.2, 4] }, caption: 'Block the NMDA receptors (ketamine, or the illness) and the interneurons go quiet first.' },
        { at: 7, caption: 'Pyramidal cells are released: glutamate rises and the hippocampus heats.' },
        { at: 10, caption: 'Blocking a glutamate receptor ends up raising glutamate. The midbrain hasn’t noticed yet.' }] },
    { title: 'The interneurons falter', chapter: 'Cascade', dur: 10, state: 'healthy', set: { cs: 0 }, cam: { fit: ['ahp', 're'], r: 22, dir: [-1, 0.22, 0.32] },
      show: ['ilc-re', 're-hp', 'hp-nac'], focus: ['ilc-re', 're-hp', 'ahp', 're', 'ilc'], labels: ['ahp', 're'], hud: { dial: true, grid: true, ring: true }, inset: 'chips',
      caption: 'Anterior hippocampus runs hot.',
      beats: [{ at: 0.6, tween: { pv: [0.15, 6], ctl: [0.45, 6] }, state: 'psychosis' }] },
    { title: 'The cascade', chapter: 'Cascade', dur: 13, state: 'psychosis', set: { cs: 0 }, cam: { fit: ['ahp', 'nac', 'fxb'], dir: MED, r: 22 }, levels: { Fornix: 1 },
      show: ['hp-nac', 'nac-vp', 'vp-vta', 'vta-nac'], focus: ['hp-nac', 'ahp', 'nac'], labels: ['ahp', 'nac', 'fxb'], tags: { 'hp-nac': 'via the fornix' },
      hud: { dial: true, grid: true, ledger: true }, fx: { ledger: 0 },
      caption: 'Subiculum excites accumbens, through the fornix.',
      beats: [
        { at: 0.4, tween: { cs: [1, 2] }, fx: { ledger: 1 } },
        { at: 3.2, tween: { cs: [2, 2] }, fx: { ledger: 2 }, focus: ['nac-vp', 'nac', 'vp'], labels: ['vp'], cam: { fit: ['nac', 'vp'], dir: MED, r: 20 }, caption: 'Accumbens inhibits pallidum.' },
        { at: 6.2, tween: { cs: [3, 2] }, fx: { ledger: 3 }, focus: ['vp-vta', 'vp', 'vta'], labels: ['vta'], cam: { fit: ['vp', 'vta'], dir: MED, r: 20 }, caption: 'The brake lifts.' },
        { at: 9.2, tween: { cs: [4, 2] }, fx: { ledger: 4 }, focus: ['vta-nac', 'vta', 'nac'], cam: { fit: ['vta', 'nac', 'vp'], dir: MED, r: 24 }, caption: 'More dopamine neurons awake.' }] },
    { title: 'Spiral up to the associative striatum', chapter: 'Cascade', dur: 10, state: 'psychosis', cam: { fit: ['vta', 'nac', 'sn', 'cd'], dir: MED },
      show: ['vta-nac', 'nac-sn', 'sn-cd'], focus: ['vta-nac', 'vta', 'nac'], labels: ['vta', 'nac'], hud: { dial: true, grid: true, tint: true },
      caption: 'Ventral tegmental dopamine floods the accumbens.',
      beats: [{ at: 3, focus: ['nac-sn', 'nac', 'sn'], labels: ['sn'], tags: { 'nac-sn': 'untested link' }, caption: 'The accumbens is a relay, not a source: it projects back onto nigral dopamine cells.' },
        { at: 6.2, focus: ['sn-cd', 'sn', 'cd'], labels: ['cd'], caption: 'Nigral neurons carry the excess into the caudate head. It lands in the associative striatum.' }] },
    { title: 'Inside a nigral dopamine terminal', chapter: 'Cascade', dur: 10, state: 'psychosis', cam: { target: 'cd', r: 18, dir: [-0.7, 0.55, 0.55] },
      show: ['sn-cd'], labels: ['cd'], hud: { tint: true }, inset: 'terminal',
      caption: 'More dopamine made and released — the vesicles themselves are normal.' },
    { title: 'Aberrant salience', chapter: 'Cascade', dur: 13, state: 'psychosis', cam: { dir: LAT, fit: ['ctx', 'cd', 'md', 'dl'] },
      show: ['ctx-cd', 'sn-cd', 'cd-md', 'md-dl', 'dl-cd'], focus: ['ctx-cd', 'sn-cd', 'ctx', 'cd'], labels: ['ctx', 'cd'], hud: { dial: true, grid: true, tint: true },
      caption: 'The same passing car comes back.',
      beats: [
        { at: 0.6, token: { icon: 'car', from: 'ctx', to: 'cd', kind: 'neutral', persist: true, ghost: 0.55, flash: 'sn-cd' } },
        { at: 3.4, caption: 'Nothing changed outside. The gain did.', focus: null, labels: ['md', 'dl'], token: { icon: 'plate', from: 'ctx', to: 'cd', kind: 'neutral', persist: true, soff: [98, -66], flash: 'sn-cd' } },
        { at: 5.4, token: { icon: 'radio', from: 'ctx', to: 'cd', kind: 'neutral', persist: true, soff: [-94, -76], flash: 'sn-cd' } },
        { at: 7.8, fx: { threads: true }, caption: 'Linked up, they become an explanation: the delusion.' }] },
    { title: 'Turning the gain down', chapter: 'Cascade', dur: 16, state: 'treated', set: { d2: 0, musc: 0 }, cam: { dir: MED },
      show: ['hp-nac', 'nac-vp', 'vp-vta', 'vta-nac', 'sn-cd', 'ctx-cd'], labels: ['ahp', 'cd'], hud: { dial: true, grid: true, tint: true, shields: true },
      caption: 'D2 receptors in the striatum are blocked.',
      controls: [{ type: 'toggle', var: 'd2', label: 'D2 blocker' }, { type: 'toggle', var: 'musc', label: 'Muscarinic agonist' }, { type: 'toggle', var: 'tr', label: 'Treatment-resistant variant' },
        { type: 'button', label: 'Send a neutral cue', do: S => S.spawn({ icon: 'car', from: 'ctx', to: 'cd', kind: 'neutral', flash: 'sn-cd' }) }],
      beats: [{ at: 0.8, tween: { d2: [1, 1.6] } }, { at: 3.4, token: { icon: 'car', from: 'ctx', to: 'cd', kind: 'neutral', flash: 'sn-cd' } }, { at: 6.4, caption: 'Antipsychotics turn down the speaker, not the source.' },
        { at: 9, tween: { d2: [0, 1.2], musc: [1, 1.6] }, caption: 'A muscarinic agonist (xanomeline) acts upstream: less dopamine released, receptors left alone.' },
        { at: 11, token: { icon: 'car', from: 'ctx', to: 'cd', kind: 'neutral', flash: 'sn-cd' } },
        { at: 13.4, caption: 'US-approved in 2024 with trospium; I couldn’t confirm TGA registration, so check the ARTG.' }] },
    { title: 'The corticostriatal gradient', chapter: 'Network view', dur: 15, state: 'healthy', cam: { dir: [0.4, 0.15, 1], fit: ['dl', 'cd', 'vmp', 'nac'] },
      show: ['fcD', 'fcV'], labels: ['dl', 'cd', 'vmp', 'nac'], hud: { dial: true, tint: true }, badge: 'gradient',
      inset: EVIDENCE_HTML('Evidence', 'Fornito 2013: 19 first-episode patients, 25 unaffected relatives, 26 controls. Resting-state coupling, so no direction is implied. Dopamine PET in relatives is mixed, so the relative preset leaves the gain dial at normal as a simplification.'),
      caption: 'Prefrontal cortex and striatum are coupled: dorsal with dorsal, ventral with ventral.',
      controls: [{ type: 'presets', items: [{ label: 'Healthy', set: { fcD: 1, fcV: 1, pv: 1, ctl: 1, rel: 0 } }, { label: 'First episode', set: { fcD: 0.35, fcV: 1.6, pv: 0.15, ctl: 0.45, rel: 0 } }, { label: 'Unaffected relative', set: { fcD: 0.55, fcV: 1.35, pv: 1, ctl: 1, rel: 1 } }] }],
      beats: [
        { at: 3, tween: { fcD: [0.35, 2], fcV: [1.6, 2], pv: [0.15, 2], ctl: [0.45, 2] }, state: 'psychosis', caption: 'First-episode psychosis: dorsal coupling weakens, ventral coupling strengthens.' },
        { at: 7.5, tween: { fcD: [0.55, 1.5], fcV: [1.35, 1.5], pv: [1, 1.5], ctl: [1, 1.5] }, set: { rel: 1 }, state: null, caption: 'Unaffected first-degree relatives show a milder form of the same gradient: a risk marker, not the illness.' },
        { at: 12, tween: { fcD: [0.35, 1.5], fcV: [1.6, 1.5], pv: [0.15, 1.5], ctl: [0.45, 1.5] }, set: { rel: 0 }, state: 'psychosis', caption: 'Psychosis adds the dopamine excess on top of an inherited wiring gradient.' }] },
    { title: 'Which comes first?', chapter: 'Network view', dur: 15, state: 'psychosis', set: { fs: 0, fcx: 0 }, cam: { dir: MED, fit: ['sn', 'cd', 'md', 'dl'] },
      show: ['sn-cd', 'cd-md', 'md-dl', 'dl-cd'], labels: ['sn', 'cd', 'md', 'dl'], hud: { dial: true }, badge: 'stage',
      inset: EVIDENCE_HTML('Evidence', 'Sabaroedin 2023: 46 antipsychotic-naive first-episode patients, 36 with established illness; modelled effective connectivity (model-dependent). In healthy people, dopamine synthesis tracked nigrostriatal and striatothalamic connectivity.'),
      caption: 'Effective connectivity: which way the influence runs, modelled from resting scans.',
      controls: [{ type: 'presets', items: [{ label: 'First episode', set: { fs: 1, fcx: 0 } }, { label: 'Established', set: { fs: 1, fcx: 1 } }] }],
      beats: [
        { at: 2.5, tween: { fs: [1, 1.5] }, caption: 'Antipsychotic-naive first episode: the faults sit below the cortex — midbrain and thalamus.' },
        { at: 7, tween: { fcx: [1, 1.5] }, caption: 'Established schizophrenia: the cortex joins in.' },
        { at: 11, caption: 'So in humans, “frontal control fails first” may run in the wrong order. Hold that link loosely.' }] },
    { title: 'Different lesions, same circuit', chapter: 'Network view', dur: 21, state: 'healthy', cam: { dir: MED, fit: ['ilc', 'ahp', 'nac', 'vp', 'vta', 'fxb'] },
      show: ['ilc-re', 're-hp', 'hp-nac', 'nac-vp', 'vp-vta', 'vta-nac'], labels: ['ilc', 'ahp', 'vp', 'vta'], hud: { dial: true, grid: true, ring: true }, badge: 'patients',
      inset: EVIDENCE_HTML('Evidence', 'Segal 2023: across 1,294 people with six diagnoses, a given region was abnormal in fewer than 7% of people with the same diagnosis, yet the abnormalities fell within shared circuits in up to 56%. The four patients here illustrate the principle.'),
      caption: 'Four patients, four different broken parts.',
      controls: [{ type: 'button', label: 'Next patient', do: S => patient(S, S.fx.pn || 0) }],
      beats: [{ at: 0.5, do: S => patient(S, 0) }, { at: 5.1, do: S => patient(S, 1) }, { at: 9.7, do: S => patient(S, 2) }, { at: 14.3, do: S => patient(S, 3) },
        { at: 18.6, caption: 'Different lesions, same circuit: the gain still rises.' }] },
    { title: 'Spread along the wiring', chapter: 'Network view', dur: 16, state: 'psychosis', set: { yrs: 0 }, cam: { dir: LAT, fit: ['ahp', 'ilc', 'dl', 'ctx', 'md'] },
      levels: SPREAD_LEVELS, show: ['hp-nac'], labels: ['ahp', 'ilc', 'dl', 'ctx'], tags: { 'hp-nac': 'fornix' }, hud: { spread: true }, badge: 'years',
      inset: EVIDENCE_HTML('Illustration', 'The principle: disease spreads along axonal pathways, shaped by network wiring (Fornito, Zalesky &amp; Breakspear 2015). The order here is hops from the hippocampus, not a fitted model.'),
      caption: 'Prodrome: the hippocampus first.',
      controls: [{ type: 'range', var: 'yrs', label: 'Years', min: 0, max: 1 }],
      beats: [{ at: 0.6, tween: { yrs: [1, 13] } }, { at: 4, caption: 'First episode: its direct neighbours — amygdala, parahippocampal gyrus, accumbens.' },
        { at: 8, caption: 'Years in: medial prefrontal, insula and temporal cortex, along the fornix, uncinate and cingulum.' },
        { at: 12, caption: 'The order follows wiring, not distance. Speculative for schizophrenia specifically.' }] },
    { title: 'Free play', chapter: 'Free play', free: true, dur: 0, state: 'psychosis', set: { hpx: 0.84 }, cam: { dir: MED }, show: ['ilc-re', 're-hp', 'hp-nac', 'nac-vp', 'vp-vta', 'vta-nac', 'nac-sn', 'sn-cd', 'ctx-cd', 'cd-md', 'md-dl', 'dl-cd'], labels: ['ahp', 'vta', 'cd'],
      hud: { dial: true, grid: true, tint: true, ring: true, shields: true },
      caption: 'Drag the hippocampus. Watch the midbrain.',
      controls: [{ type: 'range', var: 'hpx', label: 'Hippocampal drive', min: 0.2, max: 1 }, { type: 'toggle', var: 'd2', label: 'D2 blocker' }, { type: 'toggle', var: 'musc', label: 'Muscarinic agonist' },
        { type: 'button', label: 'Send a neutral cue', do: S => S.spawn({ icon: 'car', from: 'ctx', to: 'cd', kind: 'neutral', flash: 'sn-cd' }) }] },
  ] },

// ---------------------------------------------------------------- affective
{ id: 'aff', name: 'Mood: the full picture', color: '#3fd0c9', hemi: 'L', view: MED_LOW,
  desc: 'All of it at once, in ten autoplay scenes: prefrontal brakes, amygdala, pallidal gate, circadian clock, mixed states, networks and treatment.',
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
    acc:  { key: 'Cingulate_gyrus_anterior_part', ghost: true, label: 'Anterior cingulate', noDot: true, nofit: true },
    hab:  { key: 'Habenula', label: 'Lateral habenula', lo: [0, 12], nofit: true, gate: m => m.habl > 0.5 },
  },
  ghostCast: ['Postcentral_gyrus', 'Cingulate_gyrus_anterior_part', 'Medial_orbital_gyrus'],
  edges: [
    { id: 'ifg-amy', from: 'ifg', to: 'amy', via: [[-36, 8, -12]], sign: 'ctl', ev: 'human', act: m => m.brake },
    { id: 'ofc-nac', from: 'lofc', to: 'nac', via: [[-26, 24, -12]], sign: 'ctl', ev: 'human', act: m => m.brake },
    { id: 'amy-vp', from: 'amy', to: 'vp', via: [[-17, 0, -14]], sign: '+', ev: 'rodent', act: m => m.amy },
    { id: 'hp-nac', from: 'hp', to: 'nac', via: FORNIX, sign: '+', ev: 'rodent', act: () => 0.3 },
    { id: 'nac-vp', from: 'nac', to: 'vp', sign: '-', ev: 'rodent', act: m => m.nac },
    { id: 'vp-vta', from: 'vp', to: 'vta', via: [[-9, -7, -10]], sign: '-', ev: 'rodent', act: m => m.vp },
    { id: 'vta-nac', from: 'vta', to: 'nac', via: [[-6, -4, -12]], sign: 'da', ev: 'human', act: m => m.pop },
    { id: 'scn-vta', from: 'scn', to: 'vta', via: [[-3, -8, -12]], sign: 'clock', ev: 'rodent', act: m => m.clockEff },
    { id: 'rph-mpfc', from: 'rph', to: 'mpfc', via: [[0, -14, -6], [-2, 14, -10]], sign: '5ht', ev: 'proposed', act: m => 0.35 + 0.4 * cl01(-m.tilt) },
    { id: 'nac-sn', from: 'nac', to: 'sn', via: [[-11, -6, -15]], sign: 'spiral', ev: 'proposed', act: m => m.assocDA },
    { id: 'sn-cd', from: 'sn', to: 'cd', via: [[-12, -6, -2], [-13, 4, 4]], sign: 'da', ev: 'human', act: m => m.assocDA },
    { id: 'ctx-cd', from: 'ctx', to: 'cd', via: [[-40, -12, -8], [-24, 2, 4]], sign: '+', ev: 'human', act: () => 0.45 },
    { id: 'hab-vta', from: 'hab', to: 'vta', via: [[-4, -22, -4]], sign: '-', ev: 'rodent', act: m => m.habAct, gate: m => m.habl > 0.5 },
  ],
  shieldOn: [['Nucleus_accumbens', 5, null], ['Caudate_nucleus', 6, p => p[1] > 2], ['Putamen', 3, p => p[1] > 0]],
  vars: { clock: 1, brake: 1, amy: 0.3, b: 0.2, m: 0, ev: 1, d2: 0, lith: 0, rth: 0, ps: 0, af: 0, th: 0, habl: 0, ket: 0 },
  discrete: ['ev'],
  states: [
    { id: 'eu', label: 'Euthymia', vars: { clock: 1, brake: 1, amy: 0.3, b: 0.2, ev: 1, m: 0, d2: 0, lith: 0, rth: 0 } },
    { id: 'mania', label: 'Mania', vars: { clock: 0.3, brake: 0.55, amy: 0.3, b: 0.9, ev: 2, m: 0.6 } },
    { id: 'dep', label: 'Depression', vars: { clock: 0.75, brake: 0.55, amy: 0.9, b: 0.9, ev: 3, m: -0.6 } },
  ],
  model(v, S) {
    const clockEff = Math.min(1, v.clock + (1 - v.clock) * (0.55 * v.rth + 0.45 * v.lith));
    // lateral habenula (speculative layer): bursts with amygdala-driven stress, suppresses the midbrain; ketamine quietens the bursting
    const habAct = (0.25 + 0.6 * cl01((v.amy - 0.3) / 0.6)) * (1 - 0.75 * v.ket);
    const pop = Math.min(0.95, Math.max(0.05, 0.4 + 0.45 * (1 - clockEff) * (1 - 0.4 * v.lith) + 0.2 * v.m - 0.5 * Math.max(0, v.amy - 0.3) - v.habl * 0.3 * (habAct - 0.25)));
    const eff = pop + v.d2 * (0.45 + (pop - 0.4) * 0.25 - pop);
    const day = (S && S.sim && S.sim.day) || 0;
    return { clockEff, pop, popShow: Math.min(1, Math.max(0, pop + 0.07 * Math.sin(day * Math.PI * 2) * clockEff)), eff,
      vp: cl01(0.69 - (pop - 0.4) / 1.3), nac: 0.3 + 0.5 * pop, limbicDA: eff, assocDA: cl01(0.3 + Math.max(0, eff - 0.72) * 3),
      tilt: Math.max(-1, Math.min(1, (pop - 0.4) * 1.6 + 0.45 * v.m)), amy: v.amy, brake: v.brake, b: v.b * (1 - 0.6 * v.lith), m: v.m, habl: v.habl, habAct };
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
      Habenula: { glow: m.habl * 0.85 * m.habAct, ec: '#ff6b5b' },
    };
    if (S.hud.yeo) for (const k of ['Amygdala', 'Nucleus_accumbens', 'VTA', 'Substantia_nigra']) L[k] = { glow: 0.55, ec: '#c43afa' };
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
      tags: { 'amy-vp': 'rodent circuit', 'hab-vta': 'speculative' },
      hud: { dial: true, grid: true, mood: true, seesaw: true, dat: true }, fx: { bias: true },
      caption: 'A stressor hits the amygdala.',
      controls: [{ type: 'toggle', var: 'habl', label: 'Habenula layer (speculative)', after: S => S.labelSet.add('hab') }, { type: 'toggle', var: 'ket', label: 'Ketamine' }],
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
    { title: 'A shared network', dur: 14, state: 'eu', set: { ev: 0 }, cam: { dir: MED_UP, fit: ['ifg', 'lofc', 'amy', 'nac', 'vta', 'smn', 'dmn', 'sal'] },
      show: [], labels: ['sal', 'acc', 'amy', 'nac'], hud: { yeo: 4 },
      inset: EVIDENCE_HTML('Evidence', 'Segal 2023: 1,294 people with attention-deficit/hyperactivity disorder, autism, bipolar disorder, depression, obsessive-compulsive disorder or schizophrenia. The salience–ventral attention system was implicated across diagnoses.'),
      caption: 'Painted purple: the salience–ventral attention network (Yeo 2011).',
      controls: [{ type: 'button', label: 'See: different lesions, same circuit', do: () => startStory('psy', 12) }],
      beats: [{ at: 3.5, caption: 'Across six diagnoses, individual abnormalities most often fell within this one system.' },
        { at: 8, caption: 'Bipolar disorder and schizophrenia both land here: the network that flags what matters.' }] },
    { title: 'Side by side', dur: 16, state: 'eu', set: { ev: 0 }, fx: { swing: true }, cam: { dir: MED, fit: ['vta', 'nac', 'sn', 'cd'] },
      show: ['vta-nac', 'nac-sn', 'sn-cd'], labels: ['nac', 'cd'], hud: { dial: true, grid: true, tint: true }, inset: 'compare',
      caption: 'Stuck gain, wrong territory. Swinging gain, right territory.' },
  ] },
];

// ---------------------------------------------------------------- affective, one step at a time
// Sequential version of the mood story. Rules (storyboard: "Mood, one step at a time"):
// one idea per step; a step adds or changes one thing (two at most); everything introduced earlier stays as dim, still context;
// instruments follow the same hidden → context → focus rule; the camera holds still; the learner presses Next.
const AF_EU = { cg: 1, clock: 1, brake: 1, amy: 0.3, ag: 0.3, m: 0, lith: 0, rth: 0, stream: 0 };
const AF_MANIA = { ...AF_EU, cg: 0.3, clock: 0.3, brake: 0.55 };
const AF_DEP = { ...AF_EU, amy: 0.9, ag: 0.9, brake: 0.55 };
const afStep = (title, o) => { const { base, ...rest } = o; return { title, dur: 4.5, ...rest, set: { ...(base || AF_EU), ...(o.set || {}) } }; };
// An outcome travels orbitofrontal → accumbens. r is the objective outcome (coin = win, cloud = letdown).
// On arrival: felt value = r + bias × mood; positive surprises are scaled by dopamine gain, letdowns by a weight
// that grows with amygdala drive (0.6 → 1.2). Mood integrates the felt surprise. Token size = felt surprise; dashed ring = the same outcome at baseline.
function afOutcome(S, r, o = {}) {
  S.spawn({ icon: r >= 0 ? 'coin' : 'cloud', from: 'lofc', to: 'nac', via: [[-18, 20, -13]], dur: o.dur || 1.3, life: o.life ?? 1.8, kind: r >= 0 ? 'rewardPos' : 'rewardNeg',
    onArrive: (S2, tk) => {
      const mm = S2.def.model(S2.vars, S2), V = S2.vars, felt = r + mm.b * V.m;
      const d = felt > 0 ? felt * (0.3 + 1.2 * mm.eff) : felt * (0.6 + 0.6 * mm.amyN);
      if (!o.noMood) { V.m = Math.max(-1, Math.min(1, V.m * 0.93 + 0.55 * d)); S2.kick = performance.now(); }
      tk.target = 0.6 + Math.min(1.4, 2.4 * Math.abs(d)); tk.kind = felt >= 0 ? 'rewardPos' : 'rewardNeg';
      if (S2.fx.ghost) tk.ghost = 0.6 + Math.min(1.4, 2.4 * Math.abs(r > 0 ? r * 0.78 : r * 0.6));
      S2.flashEdge('vta-nac', cl01(Math.abs(d) * 1.8 + 0.25), d < 0);
    } });
}
const afWin = (r, o) => S => afOutcome(S, r, o);
// Every stream replays the same zero-mean run of outcomes, so euthymia, mania and depression face the same world;
// only how it is felt differs.
const AF_SEQ = [0.3, -0.25, 0.15, -0.35, 0.25, -0.1, 0.35, -0.2, 0.05, -0.15, 0.2, -0.3];

STORIES.splice(1, 0, { id: 'affs', name: 'Mood, one step at a time', color: '#9be38a', hemi: 'L', view: MED_LOW, steps: true,
  desc: 'How a mood episode builds, in 37 short steps you move through yourself: one idea, one change at a time.',
  cam: { dir: [-0.9, -0.6, 0.15], fit: ['lofc', 'nac', 'vta', 'vp', 'scn', 'amy', 'ifg'], r: 12, pad: 5 },
  hl: { out: '#ffb877', nac: '#ffe08a', da: '#ffd34d', mood: '#ffffff', bias: '#ffb454', vp: '#8fcbff', clock: '#5fe0d8', ctl: '#c9adff', amy: '#ff8a7a', mania: '#ffb454', dep: '#8fb8ff', lith: '#a8eb98' },
  nodes: {
    lofc: { key: 'Lateral_orbital_gyrus', mni: [-24, 28, -17], ghost: true, label: 'Orbitofrontal cortex' },
    nac:  { key: 'Nucleus_accumbens', label: 'Accumbens' },
    vta:  { key: 'VTA', label: 'Ventral tegmental area' },
    vp:   { key: 'Ventral_pallidum', label: 'Ventral pallidum', lo: [0, 12] },
    scn:  { key: 'Hypothalamus', mni: [-2, 2, -12], label: 'Body clock (suprachiasmatic)', r: 1.2, dot: '#3fd0c9', lo: [0, 12] },
    ifg:  { key: 'Inferior_frontal_gyrus', mni: [-40, 26, -4], ghost: true, label: 'Ventrolateral prefrontal' },
    amy:  { key: 'Amygdala', label: 'Amygdala', lo: [0, 12] },
    src:  { mni: [-44, 6, -30], noDot: true },
  },
  edges: [
    { id: 'ofc-nac', from: 'lofc', to: 'nac', via: [[-18, 20, -13]], sign: '+', ev: 'human', act: () => 0.45 },
    { id: 'vta-nac', from: 'vta', to: 'nac', via: [[-6, -4, -12]], sign: 'da', ev: 'human', act: m => m.pop },
    { id: 'vp-vta', from: 'vp', to: 'vta', via: [[-9, -7, -10]], sign: '-', ev: 'rodent', act: m => m.vpB },
    { id: 'scn-vta', from: 'scn', to: 'vta', via: [[-3, -8, -12]], sign: 'clock', ev: 'rodent', act: m => m.clockEff },
    { id: 'ifg-nac', from: 'ifg', to: 'nac', via: [[-26, 20, -4]], sign: 'ctl', ev: 'human', act: m => m.brake },
    { id: 'amy-vp', from: 'amy', to: 'vp', via: [[-17, 0, -14]], sign: '+', ev: 'rodent', act: m => m.amyN },
  ],
  vars: { ...AF_EU },
  states: [],
  // cg / ag: the clock's and the amygdala's effect on the dopamine neurons. They are tweened a step after the
  // clock and amygdala themselves (clock, amy), so cause and effect arrive in separate steps.
  model(v, S) {
    const anchor = 0.55 * v.rth + 0.45 * v.lith;
    const grip = Math.min(1, v.cg + (1 - v.cg) * anchor), clockEff = Math.min(1, v.clock + (1 - v.clock) * anchor);
    const amyN = cl01((v.amy - 0.3) / 0.6), agN = cl01((v.ag - 0.3) / 0.6);
    const pop = Math.min(0.95, Math.max(0.05, 0.4 + 0.5 * (1 - grip) * (1 - 0.4 * v.lith) - 0.32 * agN));
    const day = (S && S.sim && S.sim.day) || 0;
    return { grip, clockEff, amyN, pop, eff: pop, popShow: cl01(pop + 0.09 * Math.sin(day * Math.PI * 2) * grip),
      vpB: cl01(0.45 + 0.5 * amyN), b: cl01((0.2 + 1.55 * (1 - v.brake)) * (1 - 0.55 * v.lith)), brake: v.brake, m: v.m };
  },
  gauge: { gain: m => m.eff, pop: m => m.popShow },
  gridAt: 'vta', biasTo: 'nac',
  biasW: m => 0.12 + 0.88 * m.b,
  salience(kind) { return kind === 'stress' ? 1.35 : 1; },
  tick(dt, v, m, S) {
    const sim = S.sim;
    sim.day = (sim.day || 0) + dt * (0.22 + 0.6 * (1 - m.clockEff));
    if (S.fx.swing) {
      const ph = S.t * 0.42, up = Math.max(0, Math.sin(ph)), dn = Math.max(0, -Math.sin(ph));
      v.m = 0.85 * Math.sin(ph); v.clock = v.cg = 1 - 0.7 * up; v.amy = v.ag = 0.3 + 0.6 * dn; return;
    }
    if (!S.fx.hold) v.m -= v.m * dt * (0.22 + 0.4 * v.lith);          // mood relaxes towards baseline; lithium speeds the return
    if (S.fx.sleepLoop && v.m > 0.5) { const d = dt * 0.07 * (v.m - 0.4); v.clock = Math.max(0.06, v.clock - d); v.cg = Math.max(0.06, v.cg - d); }
    if (v.stream > 0.5) { sim.next = (sim.next ?? 0.6) - dt; if (sim.next <= 0) { sim.next = 0.85; sim.k = (sim.k || 0) + 1; afOutcome(S, AF_SEQ[(sim.k - 1) % AF_SEQ.length], { dur: 0.9, life: 0.5 }); } }
  },
  look(m, S) {
    const day = S.sim.day || 0;
    return {
      Nucleus_accumbens: { glow: 0.2 + 0.55 * cl01((m.pop - 0.1) / 0.8), ec: '#ffd34d' },
      VTA: { glow: 0.15 + 0.8 * cl01((m.pop - 0.05) / 0.85), ec: '#ffd34d' },
      Ventral_pallidum: { glow: 0.2 + 0.7 * m.vpB, ec: '#7cc4ff' },
      Hypothalamus: { glow: 0.2 + 0.4 * (0.5 + 0.5 * Math.sin(day * Math.PI * 2)) * m.clockEff, ec: '#3fd0c9' },
      Inferior_frontal_gyrus: { glow: 0.12 + 0.5 * m.brake, ec: '#b48cff' },
      Lateral_orbital_gyrus: { glow: 0.3, ec: '#ff9f43' },
      Amygdala: { heat: m.amyN, glow: 0.12 + 0.7 * m.amyN, ec: '#ff6b5b' },
    };
  },
  keyExtra: `<div class="t">Outcomes</div><div class="note">Coin = a win, cloud = a letdown: what actually happened. The rim on arrival shows how it was felt (gold = good, blue = bad) and its size shows how hard. The dashed ring is how the same outcome lands at baseline.</div>
    <div class="t">Mood bar and arrows</div><div class="note">The mood bar is the running total of felt surprises. The arrow from the mood bar is mood bias: how strongly mood colours the next outcome. The dashed teal arrow is mania cutting sleep.</div>
    <div class="t">Dim versus bright</div><div class="note">Bright and labelled = this step. Dim and still = introduced earlier, kept for context.</div>`,
  scenes: [
    afStep('How to use this', { dur: 1, caption: 'How a mood episode builds, one step at a time. Press {Next|out} (or the right arrow key) to move on.' }),

    afStep('1 · Mood keeps score', { add: ['lofc', 'nac', 'ofc-nac'], ev: 'human imaging',
      caption: 'Something good happens. The {orbitofrontal cortex|out} passes the outcome to the {accumbens|nac}.',
      beats: [{ at: 1, do: afWin(0.35, { noMood: true }) }] }),
    afStep('1 · Mood keeps score', { add: ['vta', 'vta-nac'], ev: 'monkey recordings',
      caption: '{Dopamine neurons|da} in the ventral tegmental area fire a burst: better than expected. That burst is a {prediction error|da}.',
      beats: [{ at: 1, do: afWin(0.35, { noMood: true }) }] }),
    afStep('1 · Mood keeps score', { focus: ['vta', 'vta-nac'], ev: 'monkey recordings',
      caption: 'A letdown. The same neurons {dip|da} below their resting rate: worse than expected.',
      beats: [{ at: 1, do: afWin(-0.3, { noMood: true }) }] }),
    afStep('1 · Mood keeps score', { add: ['@mood'], fx: { hold: true }, ev: 'human experiments',
      caption: '{Mood|mood} keeps a running total of these surprises. A win nudges it up.',
      beats: [{ at: 1, do: afWin(0.6) }] }),
    afStep('1 · Mood keeps score', { focus: ['@mood'], set: { m: 0.26 }, dur: 6, ev: 'human experiments',
      caption: 'Left alone, {mood|mood} drifts back to baseline.' }),
    afStep('1 · Mood keeps score', { focus: ['@mood', 'ofc-nac'], set: { stream: 1 }, dur: 8, ev: 'model',
      caption: 'An ordinary run of ups and downs: {mood|mood} wobbles, then settles. This is euthymia.' }),
    afStep('1 · Mood keeps score', { add: ['@bias'], focus: ['@bias', '@mood'], set: { m: 0.4 }, fx: { hold: true }, ev: 'human experiments',
      caption: 'Mood also colours the next outcome. In a good mood, a win lands a little bigger. This is {mood bias|bias}.',
      beats: [{ at: 1.2, do: afWin(0.35) }] }),
    afStep('1 · Mood keeps score', { focus: ['@bias', 'ofc-nac'], set: { m: 0.4 }, fx: { hold: true, ghost: true }, ev: 'model',
      caption: 'The dashed ring shows how the same win lands at baseline. Here the {bias|bias} is weak, so the gap is small.',
      beats: [{ at: 1, do: afWin(0.35) }] }),
    afStep('1 · Mood keeps score', { recap: true, dur: 2,
      caption: '{Outcome|out} → {dopamine surprise|da} → {mood|mood} → {bias|bias} on the next outcome. A loop, but a gentle one.' }),

    afStep('2 · What keeps it gentle', { add: ['@grid'], focus: ['@grid', 'vta'], ev: 'rat recordings',
      caption: 'How hard each surprise lands depends on how many {dopamine neurons|da} are awake. Call that the {gain|da}.' }),
    afStep('2 · What keeps it gentle', { add: ['vp', 'vp-vta'], ev: 'rat recordings',
      caption: 'The {ventral pallidum|vp} keeps most of them quiet. It is a {brake|vp} on the gain.' }),
    afStep('2 · What keeps it gentle', { add: ['scn', 'scn-vta', '@clock'], focus: ['scn', 'scn-vta', '@clock', '@grid'], dur: 7, ev: 'mouse studies',
      caption: 'The {body clock|clock} sets their daily rhythm: more of them awake by day, fewer by night.' }),
    afStep('2 · What keeps it gentle', { add: ['ifg', 'ifg-nac'], focus: ['ifg', 'ifg-nac', '@bias'], set: { m: 0.4 }, fx: { hold: true }, ev: 'proposed link',
      caption: 'The {ventrolateral prefrontal cortex|ctl} keeps {mood bias|bias} weak, so one good day doesn’t inflate the next.' }),
    afStep('2 · What keeps it gentle', { recap: true, dur: 2,
      caption: 'The {pallidum|vp} and the {clock|clock} hold the gain steady. The {prefrontal cortex|ctl} keeps the bias weak.' }),

    afStep('3 · Mania: the loop runs up', { focus: ['scn', 'scn-vta', '@clock'], ev: 'mice, plus clinical observation',
      caption: 'Nights get short. The {body clock|clock} loses its grip on the dopamine neurons.',
      beats: [{ at: 0.6, tween: { clock: [0.3, 3] } }] }),
    afStep('3 · Mania: the loop runs up', { focus: ['@grid', 'vta'], set: { clock: 0.3 }, ev: 'mouse studies',
      caption: 'Freed from the rhythm, more of them wake. The {gain|da} climbs.',
      beats: [{ at: 0.5, tween: { cg: [0.3, 3] } }] }),
    afStep('3 · Mania: the loop runs up', { focus: ['ifg', 'ifg-nac', '@bias'], set: { clock: 0.3, cg: 0.3, m: 0.4 }, fx: { hold: true }, ev: 'human sleep-loss imaging',
      caption: 'Sleep loss also weakens the {prefrontal brake|ctl}, so {mood bias|bias} grows stronger.',
      beats: [{ at: 0.5, tween: { brake: [0.55, 3] } }] }),
    afStep('3 · Mania: the loop runs up', { base: AF_MANIA, focus: ['ofc-nac', '@mood'], set: { m: 0 }, fx: { hold: true, ghost: true }, ev: 'model',
      caption: 'Now a win lands hard: high gain carries it well past its baseline ring.',
      beats: [{ at: 1, do: afWin(0.3) }] }),
    afStep('3 · Mania: the loop runs up', { base: AF_MANIA, focus: ['@bias', '@mood'], set: { m: 0.2 }, fx: { hold: true, ghost: true }, ev: 'model',
      caption: 'And the higher mood makes the next win feel bigger still.',
      beats: [{ at: 1, do: afWin(0.3) }] }),
    afStep('3 · Mania: the loop runs up', { base: AF_MANIA, focus: ['ofc-nac', '@mood'], set: { m: 0.5, stream: 1 }, dur: 8, ev: 'model (Eldar 2016)',
      caption: 'Each win feeds the next. Momentum builds into {mania|mania}.' }),
    afStep('3 · Mania: the loop runs up', { base: AF_MANIA, focus: ['ofc-nac'], set: { m: 0.85 }, fx: { hold: true, ghost: true }, ev: 'model',
      caption: 'Now even a letdown lands as a win.',
      beats: [{ at: 1, do: afWin(-0.2) }] }),
    afStep('3 · Mania: the loop runs up', { base: AF_MANIA, add: ['@loop'], focus: ['@loop', '@clock'], set: { m: 0.9 }, fx: { hold: true, sleepLoop: true }, dur: 6, ev: 'clinical observation',
      caption: 'Mania cuts sleep, which loosens the {clock|clock} further. The circle closes.' }),
    afStep('3 · Mania: the loop runs up', { base: AF_MANIA, recap: true, set: { m: 0.9 }, fx: { hold: true }, dur: 2,
      caption: '{Short nights|clock} → {gain up|da} and {bias up|bias} → wins compound → less sleep. That is {mania|mania}.' }),

    afStep('4 · Depression: the loop runs down', { add: ['amy'], ease: 1.2, dur: 5, ev: 'rat studies',
      caption: 'Back to baseline. Now a heavy stressor hits the {amygdala|amy}.',
      beats: [{ at: 1.4, token: { icon: 'bolt', from: 'src', to: 'amy', kind: 'stress', dur: 1.3 } }, { at: 2.6, tween: { amy: [0.9, 1.8] } }] }),
    afStep('4 · Depression: the loop runs down', { add: ['amy-vp'], focus: ['amy', 'amy-vp', 'vp', 'vp-vta'], set: { amy: 0.9 }, ev: 'rat studies',
      caption: 'The amygdala drives the {ventral pallidum|vp}, tightening the brake.' }),
    afStep('4 · Depression: the loop runs down', { focus: ['@grid', 'vta'], set: { amy: 0.9 }, ev: 'rat studies',
      caption: 'Fewer dopamine neurons stay awake. The {gain|da} falls.',
      beats: [{ at: 0.5, tween: { ag: [0.9, 3] } }] }),
    afStep('4 · Depression: the loop runs down', { focus: ['ofc-nac', '@mood'], set: { amy: 0.9, ag: 0.9 }, fx: { hold: true, ghost: true }, ev: 'patient studies',
      caption: 'Wins barely register now, falling short of their baseline ring. This is {anhedonia|dep}.',
      beats: [{ at: 1, do: afWin(0.3) }] }),
    afStep('4 · Depression: the loop runs down', { focus: ['ofc-nac', '@mood'], set: { amy: 0.9, ag: 0.9, m: 0.06 }, fx: { hold: true, ghost: true }, ev: 'model',
      caption: 'Letdowns still land in full, so {mood|mood} starts to sink.',
      beats: [{ at: 1, do: afWin(-0.3) }] }),
    afStep('4 · Depression: the loop runs down', { focus: ['ifg', 'ifg-nac', '@bias'], set: { amy: 0.9, ag: 0.9, m: -0.12 }, fx: { hold: true }, ev: 'human imaging',
      caption: 'The {prefrontal brake|ctl} weakens here too, so a low mood darkens the next outcome.',
      beats: [{ at: 0.5, tween: { brake: [0.55, 3] } }] }),
    afStep('4 · Depression: the loop runs down', { base: AF_DEP, focus: ['ofc-nac', '@mood'], set: { m: -0.15, stream: 1 }, dur: 9, ev: 'model',
      caption: 'Each letdown feeds the next. Momentum builds into {depression|dep}.' }),
    afStep('4 · Depression: the loop runs down', { base: AF_DEP, recap: true, set: { m: -0.85 }, fx: { hold: true }, dur: 2,
      caption: '{Stress|amy} → {pallidal brake on|vp} → {gain down|da} → wins fade, letdowns compound. That is {depression|dep}.' }),

    afStep('5 · One loop, two directions', { focus: ['@mood', '@grid'], fx: { swing: true }, dur: 15, ev: 'model',
      caption: 'One loop, pushed either way. A loose {clock|clock} pushes the gain up; {stress|amy} pushes it down.' }),
    afStep('5 · One loop, two directions', { focus: ['@bias', 'ifg', 'ifg-nac'], set: { m: 0.4, brake: 0.55 }, fx: { hold: true }, ev: 'computational proposal',
      caption: 'One proposal: in bipolar disorder the {mood bias|bias} runs strong, so either push can snowball.' }),

    afStep('6 · Steadying the loop', { base: AF_MANIA, focus: ['scn', 'scn-vta', '@clock', '@grid'], set: { m: 0.85 }, fx: { hold: true }, dur: 5, ev: 'clinical trial',
      caption: 'Regular sleep and daily routine re-anchor the {body clock|clock}, and the gain settles.',
      beats: [{ at: 0.6, tween: { rth: [1, 3] } }] }),
    afStep('6 · Steadying the loop', { base: AF_MANIA, focus: ['@mood', '@bias'], set: { m: 0.85, rth: 1 }, dur: 6, ev: 'model; lithium–clock link in mice',
      caption: '{Lithium|lith} steadies the clock and, in this model, damps the loop so {mood|mood} settles faster.',
      beats: [{ at: 0.6, tween: { lith: [1, 2] } }] }),
    afStep('6 · Steadying the loop', { base: AF_MANIA, recap: true, set: { m: 0, rth: 1, lith: 1 }, dur: 2,
      caption: 'Anchor the {clock|clock}, keep the {bias|bias} weak, and the loop is gentle again.' }),
  ],
});
