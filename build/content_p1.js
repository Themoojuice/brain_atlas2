// ---------------------------------------------------------------- Part 1 · Where it starts: the overworked interneuron
// Mental model: the parvalbumin interneuron is the hippocampus's metronome and brake. It fires fast all day, which is
// expensive, so it runs near its energy and antioxidant limits. Many roads push it over: it dims rather than dies,
// the rhythm frays and the brake weakens. The microscope card carries the cell scale; the brain shows the hippocampus.
// Model, illustrative units: drive = NMDA receptor input; reserve = energy left after the firing bill;
// smoke = superoxide not mopped up by glutathione; output = drive × (1 − dimming) × energy; rhythm and brake follow output.

const MC_GROUPS = ['cells', 'rhythm', 'energy', 'smoke', 'net', 'nmda'];
function microInset(S) {
  const PY = [[34, 70], [82, 74], [130, 70]], PV = [238, 62];
  const pyr = ([x, y], i) => `<g id="mcP${i}">
      <path d="M${x} ${y - 14} L${x} ${y - 46} M${x} ${y - 32} l-9 -9 M${x} ${y - 25} l8 -8" stroke="#ff9f43" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <polygon class="soma" points="${x - 12},${y + 8} ${x},${y - 14} ${x + 12},${y + 8}" fill="rgba(255,159,67,0.16)" stroke="#ff9f43" stroke-width="1.6" stroke-linejoin="round"/>
      <path class="cup" d="M${x - 15} ${y + 11} Q ${x} ${y + 23} ${x + 15} ${y + 11} M${x} ${y + 17} L${x} 96" stroke="#4aa8ff" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>`;
  // perineuronal net: two rings of points joined by short segments, each with its own threshold so the mesh frays unevenly
  const R1 = 19.5, R2 = 26, N = 12, pt = (r, k) => [PV[0] + r * Math.cos(k / N * 2 * Math.PI), PV[1] + r * Math.sin(k / N * 2 * Math.PI)];
  let seg = '', si = 0;
  const line = (a, b) => { const th = hash01(si++, 7.3); seg += `<line data-th="${th.toFixed(3)}" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"/>`; };
  for (let k = 0; k < N; k++) { line(pt(R1, k), pt(R1, k + 1)); line(pt(R2, k + 0.5), pt(R2, k + 1.5)); line(pt(R1, k), pt(R2, k + 0.5)); line(pt(R1, k + 1), pt(R2, k + 0.5)); }
  const mito = [[232, 57], [244, 57], [232, 67], [244, 67]].map(([x, y], i) => `<ellipse class="mito" cx="${x}" cy="${y}" rx="4.2" ry="2.4" transform="rotate(${i % 2 ? -25 : 25} ${x} ${y})" fill="#c9962a" stroke="#ffd34d" stroke-width="0.8"/>`).join('');
  const puffs = [...Array(8)].map(() => '<circle class="puff" r="3" fill="#ff7a6b" opacity="0"/>').join('');
  const bar = (y, lab, id, col) => `<text class="sub" x="208" y="${y + 6}">${lab}</text><rect x="252" y="${y}" width="54" height="7" rx="3.5" fill="rgba(141,155,173,0.22)"/><rect id="${id}" x="252" y="${y}" width="54" height="7" rx="3.5" fill="${col}"/>`;
  const html = `<div class="t lt"><span>Inside the anterior hippocampus</span><b id="mcTag"></b></div>
  <svg viewBox="0 0 312 152" class="cardsvg" id="mcsvg">
    <g id="mc-net" class="grp"><g id="mcNet" stroke="#a9e6a0" stroke-width="1.3" stroke-linecap="round">${seg}</g><text class="sub" x="306" y="100" text-anchor="end" fill="#a9e6a0">perineuronal net</text></g>
    <g id="mc-cells" class="grp">
      <text class="lab" x="6" y="12">Pyramidal cells</text><text class="sub" x="6" y="22">carry the message</text>
      ${PY.map(pyr).join('')}
      <path id="mcBasket" d="M226 74 Q 212 96 186 96 L 20 96" stroke="#4aa8ff" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M142 78 C 168 84, 196 72, 221 65" stroke="#ff9f43" stroke-width="1.5" fill="none"/>
      <circle id="mcPV" cx="${PV[0]}" cy="${PV[1]}" r="14" fill="rgba(108,196,255,0.2)" stroke="#6cc4ff" stroke-width="1.8"/>
      <text class="lab" x="204" y="30" text-anchor="end" fill="#9fd3ff">Parvalbumin</text><text class="lab" x="204" y="40" text-anchor="end" fill="#9fd3ff">interneuron</text>
    </g>
    <g id="mc-nmda" class="grp"><rect x="221.5" y="57" width="2.4" height="5" fill="#ff9f43"/><rect x="221.5" y="65" width="2.4" height="5" fill="#ff9f43"/>
      <circle id="mcPlug" cx="222.7" cy="63.5" r="3.6" fill="#8d9bad" opacity="0"/><text class="sub" x="210" y="54" text-anchor="end" fill="#ffcf9e">NMDA receptors</text></g>
    <g id="mc-energy" class="grp">${mito}${bar(115, 'Energy', 'mcEn', '#ffd34d')}</g>
    <g id="mc-smoke" class="grp"><g id="mcPuffs">${puffs}</g><text class="sub" x="262" y="14" fill="#ff9d90">superoxide</text>${bar(132, 'Glutathione', 'mcGsh', '#7fe0a0')}</g>
    <g id="mc-rhythm" class="grp"><text class="lab" x="6" y="121">Gamma rhythm <tspan class="sub">slowed down</tspan></text><text id="mcRs" class="sub" x="196" y="121" text-anchor="end"></text>
      <line x1="6" y1="139" x2="196" y2="139" stroke="#3a4452" stroke-width="1"/><polyline id="mcWave" fill="none" stroke="#6cc4ff" stroke-width="1.8" stroke-linejoin="round" points=""/></g>
  </svg>`;
  return { html, tick(m, now) {
    const q = id => document.getElementById(id), fx = S.fx; if (!q('mcsvg')) return;
    cardGroups('mc-', MC_GROUPS, fx.mc, fx.mhi);
    setText(q('mcTag'), fx.tag || '');
    const t = now / 1000, f = 1.4, ph = t * f, cyc = Math.floor(ph), fr = ph - cyc, R = m.rhythm;
    // interneuron fires a volley at the top of each cycle; the cups (its synapses) pulse with it
    const pvFire = fr < 0.14 ? (1 - fr / 0.14) * m.out : 0;
    setAttrs(q('mcPV'), { fill: `rgba(108,196,255,${(0.12 + 0.7 * pvFire).toFixed(2)})`, 'stroke-width': (1.4 + 1.6 * pvFire).toFixed(2) });
    const cupOp = (0.2 + 0.8 * m.brake) * (0.55 + 0.45 * pvFire);
    q('mcBasket').setAttribute('opacity', cupOp.toFixed(2)); q('mcBasket').setAttribute('stroke-width', (0.8 + 2.4 * m.brake).toFixed(2));
    PY.forEach((_, i) => {
      // locked: each cell fires just after the inhibition lifts; free: at its own random moments, and more often when loud
      const lockPh = 0.52 + 0.06 * (hash01(cyc, i) - 0.5), freePh = hash01(cyc, i + 9), fire = hash01(cyc, i + 4) < 0.35 + 0.6 * m.pyr;
      const p = R * lockPh + (1 - R) * freePh, d = Math.abs(fr - p), flash = fire && d < 0.08 ? 1 - d / 0.08 : 0;
      const g = q('mcP' + i); if (!g) return;
      g.querySelector('.soma').setAttribute('fill', `rgba(255,159,67,${(0.14 + 0.25 * m.pyr + 0.6 * flash).toFixed(2)})`);
      g.querySelector('.cup').setAttribute('opacity', cupOp.toFixed(2)); g.querySelector('.cup').setAttribute('stroke-width', (0.8 + 2.2 * m.brake).toFixed(2));
    });
    // gamma trace: a clean sine when the cells are in time, an irregular wobble when they are not
    let pts = '';
    for (let x = 6; x <= 196; x += 2) {
      const tt = t - (196 - x) / 95, s = Math.sin(2 * Math.PI * f * tt), nz = 0.55 * Math.sin(2 * Math.PI * 2.3 * tt + 1) + 0.45 * Math.sin(2 * Math.PI * 3.7 * tt + 2) + 0.35 * Math.sin(2 * Math.PI * 0.9 * tt);
      pts += `${x},${(139 - 10 * (0.45 + 0.55 * R) * (R * s + (1 - R) * 0.75 * nz)).toFixed(1)} `;
    }
    setAttrs(q('mcWave'), { points: pts, stroke: mixHex('#c07a7a', '#6cc4ff', R) });
    setText(q('mcRs'), R > 0.7 ? 'in time' : R > 0.4 ? 'fraying' : 'lost');
    // energy, superoxide and glutathione
    q('mcEn').setAttribute('width', (54 * m.reserve).toFixed(1)); q('mcGsh').setAttribute('width', (54 * m.gsh).toFixed(1));
    q('mcGsh').setAttribute('fill', m.mop > 0.5 ? '#7fe0a0' : '#5d6878');
    document.querySelectorAll('#mcsvg .mito').forEach((e, i) => e.setAttribute('fill', mixHex('#3a4452', '#e0a83a', cl01(m.reserve * 1.1 + 0.08 * Math.sin(t * 6 + i)))));
    const nPuff = m.smoke * 8;
    document.querySelectorAll('#mcPuffs .puff').forEach((c, i) => {
      const pp = (t * 0.45 + i / 8) % 1, on = i < nPuff - 0.3 ? 1 : i < nPuff + 0.7 ? cl01(nPuff - i + 0.3) : 0;
      setAttrs(c, { cx: (PV[0] + (hash01(i, 2) - 0.5) * 14 + Math.sin(t * 1.3 + i) * 6 * pp).toFixed(1), cy: (46 - 40 * pp).toFixed(1), r: (2.4 + 3 * pp).toFixed(1), opacity: (on * (0.85 - 0.75 * pp)).toFixed(2) });
    });
    // net segments drop out as integrity falls
    const net = m.net;
    document.querySelectorAll('#mcNet line').forEach(l => { const th = +l.dataset.th; l.setAttribute('opacity', th < net - 0.03 ? 0.9 : th < net + 0.05 ? 0.35 : 0.05); });
    q('mcPlug').setAttribute('opacity', (1 - m.nmda).toFixed(2));
  } };
}

const P1_CAM = {
  hp: { dir: [-1, 0.18, 0.32], fit: ['ahp'], r: 26, pad: 18 },
  hpIn: { dir: [-0.95, 0.1, 0.42], fit: ['ahp', 'ctx'], r: 26, pad: 16 },
  pfc: { dir: [-0.75, 0.35, 0.65], fit: ['ahp', 'dl'], r: 26, pad: 14 },
};
const P1_EV = {
  series: 'The series follows one chain: interneurons → hippocampus → dopamine → striatum → experience → treatment. Storyboard and sources: Claude Doc "Psychosis and mood circuits", tab "Linear series plan".',
  novelty: 'The hippocampus compares incoming information with stored expectation and signals novelty, which drives the dopamine loop in Part 2 (Lisman &amp; Grace 2005, from the project research library; confidence moderate).',
  cells: 'Parvalbumin basket cells synapse on pyramidal cell bodies and control their output and timing (Lewis 2012, review, ' + doi('10.1016/j.tins.2011.10.004') + '; confidence high).',
  gamma: 'Driving parvalbumin interneurons with light in mice generates gamma rhythm and sharpens circuit signalling (Sohal 2009, ' + doi('10.1038/nature07991') + '; confidence high, animal). 30–80 Hz is the conventional gamma range.',
  energy: 'Fast-spiking interneurons have high energy demand and many mitochondria, so they are sensitive to metabolic stress (Kann 2014, from the project research library; confidence moderate to high).',
  smoke: 'Superoxide from NADPH oxidase 2 and mitochondria damages parvalbumin interneurons; glutathione is the main buffer (Behrens 2007, ' + doi('10.1126/science.1148045') + '; Cabungcal 2013, ' + doi('10.1073/pnas.1300454110') + '; confidence high, mouse).',
  net: 'Perineuronal nets protect parvalbumin interneurons against oxidative stress; glutathione-deficient mice lose both (Cabungcal 2013, ' + doi('10.1073/pnas.1300454110') + '; confidence high, mouse).',
  genes: 'Schizophrenia risk is polygenic: 287 loci, with GRIN2A (an NMDA receptor subunit) among the prioritised genes (Trubetskoy 2022, ' + doi('10.1038/s41586-022-04434-5') + '). Glutathione-pathway genes and early insults converge on these interneurons in mice (Steullet 2017, ' + doi('10.1038/mp.2017.47') + '). Obstetric complications raise risk (Cannon 2002 meta-analysis, recalled). Confidence moderate: human genetics, animal mechanism.',
  teen: 'Perineuronal nets mature into adolescence, and redox stress in that window does lasting damage in rodent models (project storyline, link 4; mechanism animal). Confidence low to moderate.',
  nmda: 'NMDA receptor antagonists quieten interneurons first, releasing pyramidal cells (Homayoun 2007, rat recordings, from the project research library). Ketamine raises NADPH oxidase superoxide and parvalbumin is lost (Behrens 2007, ' + doi('10.1126/science.1148045') + '). Anti-NMDA receptor encephalitis presents with psychosis (Dalmau 2019, ' + doi('10.1016/S1474-4422(19)30244-3') + '). Confidence high for the mechanism in animals.',
  loop: 'Oxidative stress activates a matrix metalloproteinase-9 / RAGE loop that degrades perineuronal nets and feeds back into more oxidative stress (Dwir 2021, from the project research library; animal). Rates in this card are illustrative.',
  dim: 'Post-mortem meta-analysis: fewer parvalbumin-positive interneurons detected in prefrontal cortex in schizophrenia, g −0.27 (Kaar 2019, ' + doi('10.1007/s00702-019-02080-2') + '). Bipolar disorder: fewer in the hippocampus (Konradi 2011, ' + doi('10.1001/archgenpsychiatry.2010.175') + '). Lower parvalbumin signal largely reflects reduced expression rather than cell death. Confidence moderate to high. Human ordering (interneurons first, then hippocampus) is not established.',
};
const P1_H = { nmda: 1, demand: 0.6, ox: 0.35, mop: 1, gsh: 1, net: 1, dim: 0, loop: 0, nov: 0 };

STORIES.push({ id: 'p1', name: 'Part 1 · Where it starts', color: '#ff7a6b', hemi: 'L', view: [-1, 0.18, 0.32], reveal: true, noStates: true, shell: '#7a8494',
  desc: 'The series begins with one cell: the fast, expensive interneuron that keeps the hippocampus in time, and the many roads that wear it down. Thirteen short scenes.',
  keyIntro: '<div class="t">The microscope card</div><div class="note">Triangles are pyramidal cells; the blue circle is a parvalbumin interneuron, its blue cups the synapses on their cell bodies. Green mesh: its perineuronal net. Gold ovals: mitochondria. Red puffs: superoxide. The wave is the gamma rhythm, slowed right down. Bars and rates are illustrative units. The blue dots round the hippocampus in the brain stand for its interneurons.</div>',
  nodes: {
    ahp: { key: 'Hippocampus', mni: [-25, -13, -20], label: 'Anterior hippocampus', hot: true, lo: [0, 12] },
    ctx: { key: 'Middle_and_inferior_temporal_gyrus', ghost: true, label: 'Temporal cortex', noDot: true, nofit: true },
    dl:  { key: 'Middle_frontal_gyrus', ghost: true, label: 'Prefrontal cortex', nofit: true },
  },
  edges: [],
  ring: 'ahp',
  vars: { ...P1_H },
  discrete: ['loop'],
  states: [{ id: 'h', label: 'Healthy', vars: P1_H }],
  model(v) {
    const drive = 0.25 + 0.75 * v.nmda, reserve = cl01(1.1 - 0.6 * v.demand);
    const out = drive * (1 - 0.8 * v.dim) * (0.7 + 0.3 * reserve);
    const rhythm = cl01((out - 0.2) / 0.7), brake = out, pyr = cl01(0.25 + 0.6 * (1 - brake));
    const smoke = cl01(v.ox * (1 - 0.8 * v.mop * v.gsh) * (1.25 - 0.25 * v.net));
    return { drive, reserve, out, rhythm, brake, pyr, hp: pyr, smoke, gsh: v.gsh, mop: v.mop, net: v.net, nmda: v.nmda, pvEff: out, nov: v.nov };
  },
  gauge: { gain: () => 0.4, raw: () => 0.4, pop: () => 0.4 },
  salience: () => 1,
  tick(dt, v, m, S) {
    v.nov *= Math.exp(-dt * 1.4);
    if (v.loop > 0.5) {
      // the vicious circle: superoxide frays the net, a frayed net lets in more superoxide
      if (!S.tweens.some(tw => tw.k === 'net')) v.net = Math.max(0.12, v.net - dt * 0.03 * (0.3 + m.smoke));
      if (!S.tweens.some(tw => tw.k === 'ox')) v.ox = Math.min(1, v.ox + dt * 0.04 * (1 - v.net));
    }
  },
  look(m, S) {
    const L = {}, see = S.see || new Set();
    if (see.has('ahp')) { const heat = cl01((m.hp - 0.3) / 0.45); L.Hippocampus = { col: '#9aa9bb', heat, glow: 0.12 + 0.55 * heat + 0.55 * m.nov, ec: '#ff8a3d' }; }
    if (S.hud.pfc) L.Middle_frontal_gyrus = { glow: 0.45, ec: '#9fd3ff', op: 0.3 };
    return L;
  },
  insets: { series: seriesInset, micro: microInset },
  scenes: [
    { title: 'Today', chapter: 'The cell', dur: 11, state: 'h', cam: P1_CAM.hp, see: [], show: [], labels: [], inset: 'series', fx: {},
      kicker: 'Part 1', caption: 'Psychosis starts small: in one kind of cell, deep in the temporal lobe.', ev: P1_EV.series,
      beats: [{ at: 5.5, see: ['ahp'], relabel: ['ahp'], fx: { spot: 'ahp' }, kicker: null, caption: 'This series follows one chain from that cell to the experience of psychosis, then to treatment.' }] },
    { title: 'The hippocampus', chapter: 'The cell', dur: 17, state: 'h', cam: P1_CAM.hpIn, see: ['ahp'], show: [], labels: ['ahp'], fx: { spot: 'ahp' },
      kicker: 'Hippocampus', caption: 'The front of the hippocampus compares what is happening with what you expected.', ev: P1_EV.novelty,
      beats: [
        { at: 7, kicker: 'Novelty', caption: 'Something new turns up, and it fires.', token: { icon: 'bird', from: 'ctx', to: 'ahp', dur: 2, life: 1.2, sal: () => 1.2, onArrive: S2 => { S2.vars.nov = 1; } } },
        { at: 12.5, token: { icon: 'bird', from: 'ctx', to: 'ahp', dur: 2, life: 1.2, sal: () => 1.2, onArrive: S2 => { S2.vars.nov = 1; } } }] },
    { title: 'Who talks, who brakes', chapter: 'The cell', dur: 21, state: 'h', cam: P1_CAM.hp, see: ['ahp'], show: [], labels: [], inset: 'micro', fx: { mc: ['cells'], mhi: null },
      kicker: 'Two cells', caption: 'Zoom in. Pyramidal cells, the triangles, carry the hippocampus’s message.', ev: P1_EV.cells,
      beats: [
        { at: 7, fx: { mhi: 'cells' }, kicker: 'The brake', caption: 'A parvalbumin interneuron wraps their cell bodies in blue cups and holds them quiet.' },
        { at: 14, hud: { ring: true }, relabel: ['ahp'], fx: { spot: 'ahp' }, kicker: null, caption: 'Many of these brakes sit throughout the hippocampus: the blue dots.' }] },
    { title: 'Keeping time', chapter: 'The cell', dur: 25, state: 'h', cam: P1_CAM.hp, see: ['ahp'], show: [], labels: [], inset: 'micro', hud: { ring: true }, fx: { mc: ['cells', 'rhythm'], mhi: 'rhythm' },
      kicker: 'Rhythm', caption: 'It fires in fast volleys. Each volley hushes the pyramidal cells, then lets them go together.', ev: P1_EV.gamma,
      beats: [
        { at: 9, caption: 'That pacing is the gamma rhythm: 30 to 80 beats a second, slowed right down here.' },
        { at: 17, kicker: 'Why it matters', caption: 'Cells that fire in time can hold a thought together. Part 4 comes back to this.' }] },
    { title: 'The energy bill', chapter: 'The cell', dur: 23, state: 'h', cam: P1_CAM.hp, see: ['ahp'], show: [], labels: [], inset: 'micro', hud: { ring: true }, fx: { mc: ['cells', 'rhythm', 'energy'], mhi: 'energy' },
      kicker: 'Energy', caption: 'Firing that fast is expensive.', ev: P1_EV.energy,
      beats: [
        { at: 4.5, caption: 'These cells are packed with mitochondria, the gold ovals, and run close to their energy limit.' },
        { at: 12, tween: { demand: [1.05, 2] }, kicker: 'Push it', caption: 'Ask for more and the reserve runs low.' },
        { at: 18, tween: { demand: [0.6, 2] }, kicker: null, caption: 'Ease off and it recovers. There is little spare.' }] },
    { title: 'Exhaust', chapter: 'The cell', dur: 24, state: 'h', set: { mop: 0, ox: 0.4 }, cam: P1_CAM.hp, see: ['ahp'], show: [], labels: [], inset: 'micro', hud: { ring: true }, fx: { mc: ['cells', 'rhythm', 'energy', 'smoke'], mhi: 'smoke' },
      kicker: 'Exhaust', caption: 'Burning that much fuel leaks superoxide, a reactive by-product: the red puffs.', ev: P1_EV.smoke,
      beats: [
        { at: 7, tween: { ox: [0.55, 2] }, caption: 'Mitochondria and an enzyme, NADPH oxidase, are the main sources.' },
        { at: 13, tween: { mop: [1, 2.5], ox: [0.35, 3] }, kicker: 'Glutathione', caption: 'Glutathione mops it up, and the air clears.' }] },
    { title: 'The net', chapter: 'The cell', dur: 18, state: 'h', set: { net: 0 }, cam: P1_CAM.hp, see: ['ahp'], show: [], labels: [], inset: 'micro', hud: { ring: true }, fx: { mc: MC_GROUPS.filter(g => g !== 'nmda'), mhi: 'net' },
      kicker: 'The net', caption: 'A perineuronal net wraps the cell: a mesh of sugars and proteins.', ev: P1_EV.net,
      beats: [{ at: 0.8, tween: { net: [1, 3] } }, { at: 8, caption: 'It shields the cell from oxidative damage.' }] },
    { title: 'A healthy brake', chapter: 'The cell', dur: 16, state: 'h', cam: P1_CAM.hp, see: ['ahp'], show: [], labels: ['ahp'], inset: 'micro', hud: { ring: true }, fx: { mc: MC_GROUPS.filter(g => g !== 'nmda'), mhi: null, tag: 'Healthy' },
      kicker: 'Recap', caption: 'Fast, expensive and protected. It keeps the circuit in time, and quiet between beats.', ev: P1_EV.cells },

    { title: 'Door 1: genes and early life', chapter: 'Many roads', dur: 24, state: 'h', cam: P1_CAM.hp, see: ['ahp'], show: [], labels: [], inset: 'micro', hud: { ring: true }, fx: { mc: MC_GROUPS.filter(g => g !== 'nmda'), mhi: 'smoke', tag: 'Under strain' },
      kicker: 'Door 1', caption: 'Risk genes number in the hundreds. Some touch glutathione, or the NMDA receptor.', ev: P1_EV.genes,
      beats: [
        { at: 2, tween: { gsh: [0.62, 3] } },
        { at: 9, tween: { gsh: [0.48, 3] }, kicker: 'Early life', caption: 'Complications around birth can thin the reserve too.' },
        { at: 16, kicker: null, caption: 'A thinner buffer still copes on a good day. It just has less margin.' }] },
    { title: 'Door 2: adolescence', chapter: 'Many roads', dur: 20, state: 'h', set: { gsh: 0.48 }, cam: P1_CAM.hp, see: ['ahp'], show: [], labels: [], inset: 'micro', hud: { ring: true }, fx: { mc: MC_GROUPS.filter(g => g !== 'nmda'), mhi: 'net', tag: 'Under strain' },
      kicker: 'Door 2', caption: 'In adolescence the net is still maturing.', ev: P1_EV.teen,
      beats: [
        { at: 1.5, tween: { net: [0.72, 2.5] } },
        { at: 8, tween: { ox: [0.62, 3] }, fx: { mhi: 'smoke' }, kicker: 'Stress', caption: 'Stress in that window adds oxidative load.' }] },
    { title: 'Door 3: NMDA receptor blockers', chapter: 'Many roads', dur: 27, state: 'h', set: { gsh: 0.48, net: 0.72, ox: 0.5 }, cam: P1_CAM.hp, see: ['ahp'], show: [], labels: ['ahp'], inset: 'micro', hud: { ring: true }, fx: { mc: MC_GROUPS, mhi: 'nmda', tag: 'Under strain' },
      kicker: 'Door 3', caption: 'The interneuron is driven through NMDA receptors.', ev: P1_EV.nmda,
      beats: [
        { at: 5.5, tween: { nmda: [0.15, 2] }, fx: { mhi: ['nmda', 'cells', 'rhythm'] }, kicker: 'Blocked', caption: 'Ketamine, phencyclidine or anti-NMDA receptor encephalitis block them. The interneuron goes quiet first.' },
        { at: 13.5, fx: { spot: 'ahp' }, kicker: null, caption: 'Released, the pyramidal cells fire out of time and the hippocampus heats up.' },
        { at: 20, tween: { ox: [0.8, 2.5] }, fx: { mhi: 'smoke', spot: null }, kicker: 'More exhaust', caption: 'In mice, ketamine also drives NADPH oxidase: more superoxide.' }] },
    { title: 'The vicious circle', chapter: 'Many roads', dur: 22, state: 'h', set: { gsh: 0.48, net: 0.72, ox: 0.62, loop: 1 }, cam: P1_CAM.hp, see: ['ahp'], show: [], labels: [], inset: 'micro', hud: { ring: true }, fx: { mc: MC_GROUPS.filter(g => g !== 'nmda'), mhi: ['net', 'smoke'], tag: 'Under strain' },
      kicker: 'Vicious circle', caption: 'Oxidative stress frays the net…', ev: P1_EV.loop,
      beats: [
        { at: 7, caption: '…and a frayed net lets in more stress.' },
        { at: 14, kicker: null, caption: 'Each turn makes the next one easier.' }] },
    { title: 'Dimmed, not dead', chapter: 'Many roads', dur: 32, state: 'h', set: { gsh: 0.48, net: 0.32, ox: 0.75, loop: 0 }, cam: P1_CAM.hp, see: ['ahp'], show: [], labels: ['ahp'], inset: 'micro', hud: { ring: true }, fx: { mc: MC_GROUPS.filter(g => g !== 'nmda'), mhi: ['cells', 'rhythm'], tag: 'Dimmed' },
      kicker: 'Dimmed', caption: 'The cells survive, but lose their parvalbumin signal.', ev: P1_EV.dim,
      beats: [
        { at: 1.5, tween: { dim: [0.85, 4] } },
        { at: 8, fx: { spot: 'ahp' }, kicker: 'The result', caption: 'The rhythm frays, the brake weakens, and the hippocampus gets louder.' },
        { at: 16, see: ['dl'], cam: P1_CAM.pfc, hud: { pfc: true }, relabel: ['ahp', 'dl'], fx: { spot: null }, kicker: 'Evidence', caption: 'Post-mortem, parvalbumin is lower in prefrontal cortex in schizophrenia, and in hippocampus in bipolar disorder.' },
        { at: 24.5, kicker: 'Next', caption: 'This can begin years before psychosis. Part 2: what a loud hippocampus does to dopamine.' }] },
  ],
});
