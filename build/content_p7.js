// ---------------------------------------------------------------- Part 7 · When movement locks: catatonia
// Mental model: a jam in the motor loop's brake, set mostly in cortex. The brake can stick on (stupor, mutism, posturing)
// or slip (purposeless excitement). Weak GABA-A signalling in motor and orbitofrontal cortex is the best-supported culprit,
// so lorazepam often releases it, at either pole. Dopamine blockade can push the same brake on.
// Model, illustrative units: brake = 0.4 + 0.5 × GABA-A deficit × (1 − lorazepam) + 0.35 × D2 block, all × (1 − ECT effect);
// in the excited form the brake swings around its middle instead.

function motorInset(S) {
  const C = [100, 52], RX = 58, RY = 30, at = a => [C[0] + RX * Math.cos(a), C[1] + RY * Math.sin(a)];
  const ST = { ctx: -Math.PI / 2, str: 0, gp: Math.PI / 2, th: Math.PI };
  const node = (id, lab, col) => { const [x, y] = at(ST[id]); return `<g id="mo-${id}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="#0d141d" stroke="${col}" stroke-width="1.8"/>
    <text class="sub" x="${(x + (id === 'str' || id === 'gp' ? 14 : 0)).toFixed(1)}" y="${(y + (id === 'ctx' ? -19 : id === 'th' ? 25 : id === 'gp' ? 4 : 3)).toFixed(1)}" text-anchor="${id === 'str' || id === 'gp' ? 'start' : 'middle'}" fill="#e7edf4">${lab}</text></g>`; };
  const arc = (a0, a1, col, cap, id) => { let d = ''; for (let i = 0; i <= 20; i++) { const [x, y] = at(a0 + (a1 - a0) * i / 20); d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`; }
    const [ex, ey] = at(a1); return `<path id="${id}" d="${d}" fill="none" stroke="${col}" stroke-width="2"/>${cap === 'bar' ? `<circle id="${id}c" cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="2.5" fill="${col}"/>` : ''}`; };
  const html = `<div class="t lt"><span>The motor loop</span><b id="moTag"></b></div>
  <svg viewBox="0 0 312 104" class="cardsvg" id="mosvg">
    ${arc(ST.ctx + 0.3, ST.str - 0.3, '#ff9f43', 'arrow', 'moA1')}${arc(ST.str + 0.3, ST.gp - 0.3, '#4aa8ff', 'bar', 'moA2')}${arc(ST.gp + 0.3, ST.th - 0.3, '#4aa8ff', 'bar', 'moA3')}${arc(ST.th + 0.3, ST.ctx + 2 * Math.PI - 0.3 - 2 * Math.PI, '#ff9f43', 'arrow', 'moA4')}
    <path id="moBrake" d="" stroke="#4aa8ff" stroke-width="4" stroke-linecap="round"/>
    ${node('ctx', 'Cortex: plans', '#ff8a3d')}${node('str', 'Striatum', '#9aa9bb')}${node('gp', 'Pallidum: the brake', '#7cc4ff')}${node('th', 'Thalamus', '#9aa9bb')}
    <circle id="moGaba" cx="${at(ST.ctx)[0]}" cy="${at(ST.ctx)[1]}" r="14" fill="none" stroke="#7fe0a0" stroke-width="2" stroke-dasharray="3 2"/>
    <text class="sub" x="228" y="12" text-anchor="middle">brake</text><rect x="222" y="16" width="12" height="70" rx="5" fill="rgba(141,155,173,0.22)"/><rect id="moB" x="222" y="86" width="12" height="0" rx="5" fill="#4aa8ff"/>
    <line x1="218" y1="${86 - 70 * 0.72}" x2="238" y2="${86 - 70 * 0.72}" stroke="#ff8f86" stroke-width="1" stroke-dasharray="2 2"/>
    <g id="moFig" stroke="#e7edf4" stroke-width="2.2" stroke-linecap="round" fill="none"><circle id="fgH" cx="278" cy="24" r="6"/><path id="fgB" d=""/></g>
    <text id="moState" class="lab" x="278" y="98" text-anchor="middle"></text>
    <g id="moClips"></g>
  </svg>`;
  return { html, tick(m) {
    const q = id => document.getElementById(id), fx = S.fx; if (!q('mosvg')) return;
    setText(q('moTag'), fx.tag || '');
    const lit = fx.mostep || [];
    for (const id of ['ctx', 'str', 'gp', 'th']) { const c = document.querySelector(`#mo-${id} circle`); if (c) c.setAttribute('stroke-width', lit.includes(id) ? '3.4' : '1.8'); if (c) c.setAttribute('fill', lit.includes(id) ? '#24364a' : '#0d141d'); }
    const b = m.brake, h = 70 * cl01(b);
    setAttrs(q('moB'), { y: (86 - h).toFixed(1), height: h.toFixed(1), fill: b > 0.72 ? '#ff8f86' : '#4aa8ff' });
    // the pallidal brake on the thalamus thickens as it jams
    const [bx, by] = at(ST.th - 0.3); q('moBrake').setAttribute('d', `M${(bx - 6).toFixed(1)} ${(by - 6).toFixed(1)} L${(bx + 6).toFixed(1)} ${(by + 6).toFixed(1)}`); q('moBrake').setAttribute('stroke-width', (1.5 + 6 * b).toFixed(1));
    q('moA3').setAttribute('stroke-width', (1 + 4 * b).toFixed(1)); q('moA4').setAttribute('opacity', (1.2 - b).toFixed(2));
    setAttrs(q('moGaba'), { opacity: (0.15 + 0.85 * (1 - m.gdEff)).toFixed(2), stroke: m.gdEff > 0.4 ? '#ff8f86' : '#7fe0a0' });
    // the figure: frozen with a raised arm in stupor, pacing in excitement, at ease otherwise
    const t = S.t, stu = b > 0.72, exc = m.excNow;
    let d;
    if (stu) d = 'M278 30 V58 M278 38 L266 30 L262 18 M278 38 L290 46 M278 58 L271 78 M278 58 L285 78';
    else { const sw = exc ? Math.sin(t * 9) : 0.25 * Math.sin(t * 1.6), dx = exc ? 3 * Math.sin(t * 4.5) : 0;
      d = `M${278 + dx} 30 V58 M${278 + dx} 38 L${(266 + dx + 6 * sw).toFixed(1)} ${(50 - 4 * Math.abs(sw)).toFixed(1)} M${278 + dx} 38 L${(290 + dx - 6 * sw).toFixed(1)} ${(50 - 4 * Math.abs(sw)).toFixed(1)} M${278 + dx} 58 L${(272 + dx + 7 * sw).toFixed(1)} 78 M${278 + dx} 58 L${(284 + dx - 7 * sw).toFixed(1)} 78`;
      q('fgH').setAttribute('cx', (278 + dx).toFixed(1)); }
    if (stu) q('fgH').setAttribute('cx', 278);
    q('fgB').setAttribute('d', d);
    setText(q('moState'), stu ? 'stupor' : exc ? 'excitement' : 'moving freely');
    q('moState').setAttribute('fill', stu ? '#ff8f86' : exc ? '#ffc46b' : '#c9d4e2');
    const ck = (fx.clips || []).join(',');
    if (q('moClips').dataset.k !== ck) { q('moClips').dataset.k = ck;
      const pos = { lz: [48, 14, 'lorazepam', '#7fe0a0'], d2: [180, 70, 'D2 block', '#7cc0ff'], ect: [182, 97, 'ECT', '#ffd34d'], nmda: [152, 14, 'NMDA', '#ffcf9e'] };
      q('moClips').innerHTML = (fx.clips || []).map(k => { const [x, y, l, c] = pos[k]; const w = 8 + l.length * 5.6; return `<g transform="translate(${x} ${y})"><rect x="${-w / 2}" y="-7" width="${w}" height="13" rx="4" fill="#0d141d" stroke="${c}" stroke-width="1.5"/><text y="3" text-anchor="middle" font-size="9" font-weight="700" fill="${c}">${l}</text></g>`; }).join(''); }
  } };
}

const P7_CAM = {
  loop: { dir: [-1, 0.35, 0.25], fit: ['m1', 'put', 'gp', 'thal'], r: 28, pad: 12 },
  ctx: { dir: [0.7, 0.55, 0.45], fit: ['m1', 'pmc', 'ofc'], r: 30, pad: 10 },
};
const P7_EV = {
  series: 'Part 7 of the series. Catatonia is common in mood disorders, also occurs in schizophrenia and medical illness (Walther 2019, from the project research library). Confidence high.',
  loop: 'The cortico–basal ganglia–thalamic motor loop: cortex excites striatum; striatal output inhibits pallidum; pallidum inhibits thalamus; thalamus excites cortex (standard anatomy; direct and indirect pathways simplified to one brake). Confidence high for the anatomy.',
  stupor: 'Stupor, mutism, posturing and catalepsy as an over-tight brake is a teaching model inferred mostly from what treats catatonia; little imaging is done during episodes (Haroche 2020, ' + doi('10.1017/S0033291720001853') + '). Confidence low to moderate.',
  exc: 'One account treats stupor and excitement as two ends of unstable motor control (Seif 2025, narrative review, ' + doi('10.36131/cnfioritieditore20250306') + '). The model can explain either pole, which makes it hard to test: confidence low.',
  where: 'Reduced GABA-A receptor binding in left sensorimotor cortex in 10 akinetic catatonic patients, tracking motor and affective symptoms (Northoff 1999, ' + doi('10.1136/jnnp.67.4.445') + '). Orbitofrontal hypoactivation, medial prefrontal hyperactivation, poor frontal–motor connectivity (Haroche 2020, ' + doi('10.1017/S0033291720001853') + '); premotor overactivity (Walther 2019). Confidence low to moderate.',
  lz: 'Benzodiazepines are first line and often work within hours; up to 27% do not respond; zolpidem helped in 28 of 35 reported cases; electroconvulsive therapy works across causes (Gunther 2025; Walther 2019; both from the project research library). Confidence moderate.',
  d2: 'D2 blockers can precipitate catatonia, and neuroleptic malignant syndrome resembles malignant catatonia; dopamine agonists and amantadine help in drug-induced cases (Seif 2025, case-level evidence). Confidence low to moderate.',
  nmda: 'Anti-NMDA receptor encephalitis and phencyclidine cause catatonia (Dalmau 2019, ' + doi('10.1016/S1474-4422(19)30244-3') + '), yet amantadine and memantine, NMDA antagonists, are reported to treat it (Seif 2025, case reports). That Part 1’s interneuron route reconciles the two is my judgment: confidence low.',
};
const P7_H = { gd: 0, lz: 0, d2: 0, exc: 0, ect: 0 };

STORIES.push({ id: 'p7', glossInline: ['posturing', 'amantadine'], name: 'Part 7 · When movement locks', color: '#7fe0d0', hemi: 'L', view: [-1, 0.35, 0.25], reveal: true, noStates: true, shell: '#7a8494',
  desc: 'Catatonia as a jam in the motor loop’s brake: stupor and excitement, a weak cortical GABA-A signal, the lorazepam test, and the dopamine and NMDA doors. Nine short scenes.',
  keyIntro: '<div class="t">The motor loop card</div><div class="note">Cortex plans a movement; the basal ganglia gate it; the pallidum brakes the thalamus, which sends it back to cortex. The bar is the brake; above the dashed line, movement locks. The green dashed ring is cortical GABA-A signalling, red when weak. Illustrative units.</div>',
  nodes: {
    m1: { key: 'Precentral_gyrus', ghost: true, label: 'Motor cortex' },
    pmc: { key: 'Superior_frontal_gyrus', ghost: true, mni: [-8, 2, 62], label: 'Premotor cortex', nofit: true },
    ofc: { key: 'Medial_orbital_gyrus', ghost: true, label: 'Orbitofrontal cortex', nofit: true, job: 'emotion, and calming it', say: 'The underside of the frontal lobe, just above the eyes. Besides weighing outcomes, it helps damp fear and anxiety; in catatonia it runs low.' },
    put: { key: 'Putamen', mni: [-25, 2, 2], label: 'Striatum (putamen)', lo: [0, 12] },
    gp: { key: 'Pallidum', label: 'Pallidum', lo: [0, 12] },
    thal: { key: 'Thal_VL', label: 'Motor thalamus', lo: [0, 12] },
  },
  edges: [
    { id: 'm1-put', from: 'm1', to: 'put', via: [[-34, -8, 30]], sign: '+', ev: 'human', act: () => 0.5 },
    { id: 'put-gp', from: 'put', to: 'gp', sign: '-', ev: 'proposed', act: m => 0.3 + 0.5 * m.d2 },
    { id: 'gp-thal', from: 'gp', to: 'thal', via: [[-14, -6, 0]], sign: '-', ev: 'proposed', act: m => m.brake },
    { id: 'thal-m1', from: 'thal', to: 'm1', via: [[-24, -14, 30]], sign: '+', ev: 'human', act: m => 1.1 - m.brake },
  ],
  vars: { ...P7_H },
  discrete: ['exc'],
  states: [{ id: 'h', label: 'Healthy', vars: P7_H }],
  model(v, S) {
    const gdEff = v.gd * (1 - v.lz) * (1 - 0.8 * v.ect);
    let brake = 0.4 + 0.5 * gdEff + 0.35 * v.d2 * (1 - 0.5 * v.ect);
    const swing = v.exc * (1 - v.lz) * (1 - v.ect), excNow = swing > 0.3;
    if (swing > 0) brake = 0.42 + 0.25 * swing * Math.sin((S?.t || 0) * 2.2);
    return { brake: cl01(brake), gdEff, d2: v.d2, excNow };
  },
  gauge: { gain: () => 0.4, raw: () => 0.4, pop: () => 0.4 },
  salience: () => 1,
  look: seeLook((m, S) => ({ _keep: ['Precentral_gyrus', 'Superior_frontal_gyrus', 'Medial_orbital_gyrus'],
    Precentral_gyrus: { heat: m.gdEff, glow: 0.15 + 0.5 * m.gdEff, ec: m.gdEff > 0.3 ? '#ff6b5b' : '#ffb36b', op: 0.28 },
    Superior_frontal_gyrus: S.hud.ctx ? { heat: m.gdEff, glow: 0.4 * m.gdEff + 0.1, ec: '#ff6b5b', op: 0.24 } : undefined,
    Medial_orbital_gyrus: S.hud.ctx ? { dim: 0.6 * m.gdEff, glow: 0.1, ec: '#4a6fa5', op: 0.22 } : undefined,
    Putamen: { glow: 0.15 + 0.4 * m.d2, ec: '#7cc0ff' },
    Pallidum: { col: '#5f86b8', glow: 0.1 + 0.8 * m.brake, ec: m.brake > 0.72 ? '#ff8f86' : '#7cc4ff' },
    Thal_VL: { dim: 0.6 * cl01((m.brake - 0.4) / 0.5), glow: 0.5 * (1 - m.brake), ec: '#ffb36b' },
  })),
  insets: { series: seriesInset, motor: motorInset },
  scenes: [
    { title: 'Previously / today', chapter: 'The brake', dur: 13, state: 'h', cam: P7_CAM.loop, see: [], show: [], labels: [], inset: 'series', fx: {},
      kicker: 'Part 7', caption: 'Catatonia crosses all three illnesses, and is most common in mood disorders.', ev: P7_EV.series,
      beats: [{ at: 6.5, see: ['m1', 'put', 'gp', 'thal'], kicker: 'Today', caption: 'Today: why movement locks, and why lorazepam can unlock it.' }] },
    { title: 'The motor loop', chapter: 'The brake', dur: 22, state: 'h', cam: P7_CAM.loop, see: ['m1', 'put', 'gp', 'thal'], show: ['m1-put', 'put-gp', 'gp-thal', 'thal-m1'], labels: ['m1', 'put'], inset: 'motor', fx: { tag: 'Healthy', spot: 'm1', mostep: ['ctx', 'str'] },
      kicker: 'Motor loop', caption: 'Motor cortex proposes a movement.', ev: P7_EV.loop,
      beats: [{ at: 3.5, relabel: ['put', 'gp'], fx: { spot: 'put', mostep: ['str', 'gp'] }, kicker: null, caption: 'The basal ganglia gate it: go, or not yet.' },
        { at: 7, relabel: ['thal', 'm1'], fx: { spot: 'thal', mostep: ['th', 'ctx'] }, caption: 'The thalamus sends the go-ahead back up to cortex.' },
        { at: 10, relabel: ['gp', 'thal'], fx: { spot: 'gp', mostep: [] }, kicker: 'The brake', caption: 'The pallidum is the brake on that gate. Just enough, and movement flows.' }] },
    { title: 'Stuck on: stupor', chapter: 'The brake', dur: 22, state: 'h', cam: P7_CAM.loop, see: ['m1', 'put', 'gp', 'thal'], show: ['m1-put', 'put-gp', 'gp-thal', 'thal-m1'], labels: ['gp', 'thal'], inset: 'motor', fx: { tag: 'Catatonia', spot: 'gp' },
      kicker: 'Stupor', caption: 'Jam the brake on, and nothing starts.', ev: P7_EV.stupor,
      beats: [{ at: 2, tween: { gd: [0.85, 3] } }, { at: 9, kicker: null, caption: 'Immobility, mutism, posturing: holding a position for hours.' }] },
    { title: 'Slipping: excitement', chapter: 'The brake', dur: 20, state: 'h', set: { gd: 0.5, exc: 1 }, cam: P7_CAM.loop, see: ['m1', 'put', 'gp', 'thal'], show: ['m1-put', 'put-gp', 'gp-thal', 'thal-m1'], labels: ['gp', 'thal'], inset: 'motor', fx: { tag: 'Catatonia', spot: 'gp' },
      kicker: 'Excitement', caption: 'Let the brake slip back and forth, and movement runs without purpose.', ev: P7_EV.exc,
      beats: [{ at: 9, kicker: null, caption: 'The same illness, the other face.' }] },
    { title: 'Where the jam is', chapter: 'Cortex', dur: 22, state: 'h', set: { gd: 0.85 }, cam: P7_CAM.ctx, see: ['m1', 'pmc', 'ofc', 'put', 'gp', 'thal'], show: ['m1-put', 'gp-thal', 'thal-m1'], labels: ['m1', 'ofc'], hud: { ctx: true }, inset: 'motor', fx: { tag: 'Stupor' },
      kicker: 'Cortex', caption: 'What jams the brake seems to start in cortex: GABA-A binding is lower in sensorimotor cortex in stupor.', ev: P7_EV.where,
      beats: [{ at: 10, relabel: ['pmc', 'ofc'], kicker: null, caption: 'Orbitofrontal cortex runs low, premotor runs high, and frontal links to motor areas are weak.' }] },
    { title: 'The lorazepam test', chapter: 'Cortex', dur: 24, state: 'h', set: { gd: 0.85, lz: 0 }, cam: P7_CAM.loop, see: ['m1', 'put', 'gp', 'thal'], show: ['m1-put', 'put-gp', 'gp-thal', 'thal-m1'], labels: ['m1'], inset: 'motor', fx: { tag: 'Stupor', clips: [] },
      kicker: 'Lorazepam', caption: 'Boost GABA-A with lorazepam, and the brake often releases within hours.', ev: P7_EV.lz,
      beats: [
        { at: 2, tween: { lz: [1, 3] }, fx: { clips: ['lz'], tag: 'Treated' } },
        { at: 9, kicker: null, caption: 'It works at either pole, stupor or excitement.' },
        { at: 15, fx: { clips: ['lz', 'ect'] }, kicker: 'If not', caption: 'Up to a quarter don’t respond. Electroconvulsive therapy works whatever the cause.' }] },
    { title: 'The dopamine door', chapter: 'Doors', dur: 22, state: 'h', set: { gd: 0.2 }, cam: P7_CAM.loop, see: ['m1', 'put', 'gp', 'thal'], show: ['m1-put', 'put-gp', 'gp-thal', 'thal-m1'], labels: ['put'], inset: 'motor', fx: { tag: 'Drug-induced', clips: [], spot: 'put' },
      kicker: 'Dopamine', caption: 'D2 blockers can push the same brake on.', ev: P7_EV.d2,
      beats: [
        { at: 2, tween: { d2: [1, 3] }, fx: { clips: ['d2'] } },
        { at: 9, kicker: null, caption: 'Neuroleptic malignant syndrome looks like catatonia’s most dangerous form.' },
        { at: 15.5, caption: 'So, in catatonia, go carefully with D2 blockers. Dopamine-boosting drugs help in drug-induced cases.' }] },
    { title: 'The NMDA door', chapter: 'Doors', dur: 20, state: 'h', set: { gd: 0.7 }, cam: P7_CAM.loop, see: ['m1', 'put', 'gp', 'thal'], show: ['m1-put', 'put-gp', 'gp-thal', 'thal-m1'], labels: [], inset: 'motor', fx: { tag: 'Catatonia', clips: ['nmda'] },
      kicker: 'NMDA', caption: 'Anti-NMDA receptor encephalitis and phencyclidine cause catatonia.', ev: P7_EV.nmda,
      beats: [{ at: 8, kicker: 'A puzzle', caption: 'Yet NMDA blockers such as amantadine can treat it. Part 1’s interneuron route may square the two.' }] },
    { title: 'Recap', chapter: 'Doors', dur: 18, state: 'h', set: { gd: 0.85, lz: 1 }, cam: P7_CAM.loop, see: ['m1', 'put', 'gp', 'thal'], show: ['m1-put', 'put-gp', 'gp-thal', 'thal-m1'], labels: [], inset: 'motor', fx: { tag: 'Recap', clips: ['lz'] },
      kicker: 'Recap', caption: 'A brake jam set in cortex. Lorazepam first, electroconvulsive therapy if not, and care with D2 blockers.', ev: P7_EV.lz,
      beats: [{ at: 10, kicker: 'Next', caption: 'Part 8: treatment along the chain.' }] },
  ],
});
