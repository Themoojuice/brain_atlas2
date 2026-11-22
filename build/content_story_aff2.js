// ---------------------------------------------------------------- Part 5 · How mania builds (affective disruption, version 2)
// One idea per beat. The story builds a single loop (outcome → surprise → mood → tint → back to outcome) with two brakes
// (prefrontal check, nightly reset), then walks a manic episode through that loop, then treatment, then the reverse pole.
// The loop card (inset) and the brain show the same thing: the highlighted station is the spotlighted structure.
// Model, illustrative units: felt = r + C·tint·mood (Eldar 2016: mood biases how outcomes are perceived);
// each dopamine burst adds ALPHA·felt to mood; mood leaks back and is drained each night by the clock.
const A2 = { ALPHA: 0.35, C: 1.5, OFC_VIA: [[-10, 24, -16]], VTA_VIA: [[-6, -4, -12]] };
const A2_STATIONS = ['outcome', 'surprise', 'mood', 'tint', 'brake', 'clock'];

// one outcome travelling round the loop: valued in orbitofrontal cortex → accumbens, then a dopamine burst (or dip) from the
// ventral tegmental area, then mood moves. o.ghost = dashed ring at face value; o.dm = 0 leaves mood untouched (valuation demos);
// o.ret = seconds for the cursor to travel the return arc (mood → tint → outcome) before the next lap.
function a2event(S, icon, r, o = {}) {
  const M = S.def.model(S.vars, S), felt = r + A2.C * M.tint * S.vars.m;
  const swell = Math.min(2.6, Math.max(0.55, 1 + 1.6 * (felt - r))), dur = o.dur ?? 2.2;
  S.fx.cur = { p0: 0, p1: 1, t0: S.t, dur };
  S.spawn({ icon, from: 'ofc', to: 'nac', via: A2.OFC_VIA, dur, life: o.life ?? 1.0, kind: r > 0.05 ? 'rewardPos' : r < -0.05 ? 'rewardNeg' : 'plain',
    grow: true, sal: () => swell, ghost: o.ghost ? 1 : 0,
    onArrive: S2 => {
      if (o.noBurst) return;
      const M2 = S2.def.model(S2.vars, S2), d = felt > 0 ? felt * M2.cap : felt, mag = Math.abs(d), up = d >= -0.03;
      S2.fx.cur = { p0: 1, p1: 2, t0: S2.t, dur: 0.95 };
      S2.spawn({ icon: up ? 'spark' : 'dip', from: 'vta', to: 'nac', via: A2.VTA_VIA, dur: 0.95, life: 0.55, kind: 'burst', cls: up ? 'tkspark' : 'tkdip',
        size0: 0.3, grow: true, sal: () => Math.min(2.3, 0.42 + 1.3 * mag),
        onArrive: S3 => {
          S3.flashEdge('vta-nac', Math.min(1, 0.12 + 1.5 * mag), !up);
          if (o.dm !== 0) S3.vars.m = Math.max(-1, Math.min(1, S3.vars.m + A2.ALPHA * d * (o.dm ?? 1)));
          S3.fx.tankT = S3.t;
          if (o.ret) S3.fx.cur = { p0: 2, p1: 4, t0: S3.t, dur: o.ret };
        } });
    } });
}
const ev2 = (icon, r, o) => S => a2event(S, icon, r, o);

// the loop card: four stations on a ring plus two brakes; a cursor follows each outcome round the ring
function loopInset(S) {
  const cx = 150, cy = 66, rx = 80, ry = 42, TH = p => Math.PI + p * Math.PI / 2;
  const P = p => [cx + rx * Math.cos(TH(p)), cy + ry * Math.sin(TH(p))];
  const arc = (p0, p1) => { let d = ''; for (let i = 0; i <= 28; i++) { const [x, y] = P(p0 + (p1 - p0) * i / 28); d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`; } return d; };
  const chev = p => { const [x, y] = P(p), th = TH(p), a = Math.atan2(ry * Math.cos(th), -rx * Math.sin(th)) * 180 / Math.PI; return `<path d="M-3.5 -3.2 L1.5 0 L-3.5 3.2" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(1)})" fill="none" stroke="#8d9bad" stroke-width="1.4"/>`; };
  const st = (id, p, icon, col) => { const [x, y] = P(p); return `<g id="lp-${id}" class="lpst"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11.5" fill="#0d141d" stroke="${col}" stroke-width="2"/><g transform="translate(${(x - 7.5).toFixed(1)} ${(y - 7.5).toFixed(1)}) scale(0.625)" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</g>`; };
  const ic = k => ICONS[k].replace(/^<svg[^>]*>|<\/svg>$/g, '');
  const glasses = '<circle cx="6.5" cy="13" r="4.2"/><circle cx="17.5" cy="13" r="4.2"/><path d="M10.7 12.4c.9-.8 1.7-.8 2.6 0M2.3 12l-1-3M21.7 12l1-3"/>';
  const html = `<div class="t lt"><span>The mood loop</span><b id="lpTag"></b></div>
  <svg viewBox="0 0 312 132" id="lpsvg">
    <path d="${arc(0, 2)}" fill="none" stroke="#3a4452" stroke-width="2"/><path id="lpBaseB" d="${arc(2, 4)}" fill="none" stroke="#3a4452" stroke-width="2"/>
    <path id="lpRet" d="${arc(2, 4)}" fill="none" stroke="#ffb454" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
    <path id="lpHot" d="" fill="none" stroke="#ffd34d" stroke-width="3.2" stroke-linecap="round" opacity="0"/>
    <g>${[0.5, 1.5].map(chev).join('')}</g><g id="lp-chev">${[2.5, 3.5].map(chev).join('')}</g>
    ${st('outcome', 0, ic('coin'), '#ffb454')}<text class="lab" x="56" y="63" text-anchor="end">Outcome</text><text class="sub" x="56" y="73" text-anchor="end">orbitofrontal</text></g>
    ${st('surprise', 1, ic('spark'), '#ffd34d')}<text class="lab" x="166" y="15">Surprise</text><text class="sub" x="214" y="15">dopamine burst</text></g>
    <g id="lp-mood" class="lpst"><rect x="221" y="38" width="18" height="56" rx="4" fill="#0d141d" stroke="#c9d4e2" stroke-width="1.6"/>
      <rect id="lpFill" x="223.5" y="66" width="13" height="0" rx="2" fill="#ffd34d"/><line x1="217" y1="66" x2="243" y2="66" stroke="#e7edf4" stroke-width="1" opacity="0.7"/>
      <text class="lab" x="248" y="50">Mood</text><text class="sub" x="248" y="60">running total</text><text class="sub" x="248" y="70">of surprises</text></g>
    ${st('tint', 3, glasses, '#ffb454')}<text class="lab" x="167" y="117">Tint</text><text id="lpX" class="sub" x="167" y="127">mood colours the next outcome</text></g>
    <g id="lp-brake" class="lpst"><path d="M62 117 L88 101" stroke="#b48cff" stroke-width="2.4" stroke-linecap="round"/><path id="lpBar" d="M84.5 95 L93 107" stroke="#b48cff" stroke-width="3.4" stroke-linecap="round"/>
      <text class="lab" x="2" y="104" fill="#d6c4ff">Brake</text><text class="sub" x="2" y="114">prefrontal</text><text class="sub" x="2" y="124">check</text></g>
    <g id="lp-clock" class="lpst"><circle id="lpMoon" cx="284" cy="100" r="9" fill="#0d141d" stroke="#3fd0c9" stroke-width="1.8"/><path d="M287 94.5a6 6 0 1 0 0 11 4.6 4.6 0 0 1 0-11z" fill="#3fd0c9"/>
      <path id="lpDrain" d="M274 97 L243 87" stroke="#3fd0c9" stroke-width="2.4" stroke-linecap="round"/><path id="lpDrainBar" d="M241 81 L245 92" stroke="#3fd0c9" stroke-width="3.2" stroke-linecap="round"/>
      <path id="lpLess" d="M241 76 Q 268 72 279 91" fill="none" stroke="#ff9f43" stroke-width="2.2" stroke-dasharray="3 3" opacity="0"/>
      <text id="lpClockT" class="sub" x="279" y="123" text-anchor="middle">nightly reset</text></g>
    <circle id="lpCur" r="5" fill="#ffd34d" opacity="0"/>
  </svg>`;
  let disp = S.vars.m ?? 0;
  return { html, tick(m, now) {
    const q = id => document.getElementById(id), fx = S.fx, n = fx.loop ?? 6, V = S.vars;
    if (!q('lpsvg')) return;
    A2_STATIONS.forEach((id, i) => { const el = q('lp-' + id); if (!el) return; el.classList.toggle('off', i >= n); el.classList.toggle('dim', i < n && !!fx.hi && fx.hi !== id && !(Array.isArray(fx.hi) && fx.hi.includes(id))); });
    q('lp-chev').style.opacity = q('lpBaseB').style.opacity = n >= 4 ? 1 : 0;
    const tag = fx.tag || ''; if (q('lpTag').textContent !== tag) q('lpTag').textContent = tag;
    // mood tank
    disp += ((V.m ?? 0) - disp) * 0.12;
    const h = Math.abs(disp) * 26, f = q('lpFill');
    f.setAttribute('height', h.toFixed(1)); f.setAttribute('y', (disp >= 0 ? 66 - h : 66).toFixed(1)); f.setAttribute('fill', disp >= 0 ? '#ffd34d' : '#4aa8ff');
    const pulse = fx.tankT !== undefined && S.t - fx.tankT < 0.6;
    q('lp-mood').querySelector('rect').setAttribute('stroke', pulse ? '#ffffff' : '#c9d4e2');
    // tint: return arc thickens with tint strength, warm or cool with the sign of mood
    const tw = 1.5 + 7 * m.tint * Math.min(1, 0.35 + Math.abs(disp));
    const ret = q('lpRet'); ret.setAttribute('stroke-width', tw.toFixed(1)); ret.setAttribute('stroke', disp < -0.05 ? '#4aa8ff' : '#ffb454'); ret.setAttribute('opacity', n >= 4 ? (0.25 + 0.55 * Math.min(1, m.tint * 1.4)).toFixed(2) : 0);
    const mult = (0.4 + A2.C * m.tint * disp) / 0.4, xt = n < 4 ? '' : Math.abs(disp) < 0.06 ? 'colours next outcome' : mult < 0.25 ? 'good news barely lands' : `good news ×${mult.toFixed(1)}`;
    if (q('lpX').textContent !== xt) q('lpX').textContent = xt;
    // brakes
    q('lpBar').setAttribute('stroke-width', (0.8 + 3.4 * m.brake).toFixed(1)); const bd = q('lp-brake').classList.contains('dim') ? 0.38 : 1; q('lp-brake').style.opacity = n > 4 ? (bd * (0.3 + 0.7 * m.brake)).toFixed(2) : '';
    const night = !!S.sim.night, r = m.reset, less = n > 5 && fx.loop2 ? cl01((disp - 0.3) / 0.45) : 0;
    q('lpMoon').setAttribute('stroke-width', night ? 3.2 : 1.8); q('lpMoon').setAttribute('fill', night ? 'rgba(63,208,201,0.25)' : '#0d141d');
    q('lpDrain').setAttribute('opacity', (0.25 + 0.75 * r).toFixed(2)); q('lpDrainBar').setAttribute('stroke-width', (0.8 + 3.4 * r).toFixed(1)); q('lpDrainBar').setAttribute('opacity', (0.25 + 0.75 * r).toFixed(2));
    q('lpLess').setAttribute('opacity', less.toFixed(2));
    const ct = less > 0.3 ? 'sleep shrinks' : night && V.dayRate > 0 ? 'night: draining' : 'nightly reset';
    if (q('lpClockT').textContent !== ct) q('lpClockT').textContent = ct;
    // cursor: one outcome's position round the loop
    const cur = fx.cur, c = q('lpCur'), hot = q('lpHot');
    if (!cur) { c.setAttribute('opacity', 0); hot.setAttribute('opacity', 0); return; }
    const e = cl01((S.t - cur.t0) / Math.max(0.01, cur.dur)), p = cur.p0 + (cur.p1 - cur.p0) * e, [x, y] = P(p % 4);
    c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1)); c.setAttribute('opacity', 1); c.setAttribute('fill', disp < -0.05 ? '#8fc2ff' : '#ffd34d');
    if (e < 1) { hot.setAttribute('d', arc(cur.p0, p)); hot.setAttribute('opacity', 0.85); hot.setAttribute('stroke', disp < -0.05 ? '#8fc2ff' : '#ffd34d'); } else hot.setAttribute('opacity', Math.max(0, 0.85 - (S.t - cur.t0 - cur.dur) * 1.5).toFixed(2));
  } };
}

const CAM2 = {
  value: { dir: [-1, -0.3, 0.55], fit: ['ofc', 'nac'], r: 20, pad: 16 },
  burst: { dir: MED_LOW, fit: ['ofc', 'nac', 'vta'], r: 20, pad: 16 },
  brake: { dir: [-0.55, 0.05, 1], fit: ['vlp', 'nac', 'ofc'], r: 22, pad: 16 },
  clock: { dir: MED_LOW, fit: ['scn', 'vta', 'nac'], r: 18, pad: 16 },
  loop: { dir: MED_LOW, fit: ['ofc', 'nac', 'vta', 'scn'], r: 22, pad: 16 },
  all: { dir: [-0.8, -0.1, 0.75], fit: ['ofc', 'nac', 'vta', 'scn', 'vlp'], r: 24, pad: 16 },
  spill: { dir: MED, fit: ['vta', 'nac', 'sn', 'cd'], r: 20, pad: 16 },
  amy: { dir: MED_LOW, fit: ['amy', 'vp', 'vta', 'nac'], r: 20, pad: 16 },
};
const SEE_LOOP = ['ofc', 'nac', 'vta'], SEE_ALL = ['ofc', 'nac', 'vta', 'vlp', 'scn'];
const EDGES_LOOP = ['ofc-nac', 'vta-nac'], EDGES_ALL = ['ofc-nac', 'vta-nac', 'vlp-nac', 'scn-vta'];
const F2 = (loop, hi, spot, tag, extra = {}) => ({ loop, hi, spot, tag, ...extra });
const EV = {
  rpe: 'Dopamine neurons signal reward prediction errors: a burst when an outcome beats expectation, almost nothing when it is fully expected, a pause when it falls short (Schultz, Dayan &amp; Montague 1997, primate recordings; retrieved, <a href="https://doi.org/10.1126/science.275.5306.1593" target="_blank" rel="noopener">DOI</a>).',
  mood: 'Mood tracks how recent outcomes compare with expectation, and in turn biases how new outcomes are perceived; the authors propose that mood represents momentum (Eldar, Rutledge, Dolan &amp; Niv 2016, review; retrieved, <a href="https://doi.org/10.1016/j.tics.2015.07.010" target="_blank" rel="noopener">DOI</a>). Treating “mood” as a running total that leaks back is this animation’s simplification. Mood has no single home; the accumbens warmth stands in for reward-circuit tone.',
  brake: 'Phillips &amp; Swartz 2014: bipolar disorder as parallel dysfunction of ventrolateral prefrontal–amygdala regulation and a ventral striatal–orbitofrontal reward circuit (review; retrieved earlier in this project). Drawn as net top-down regulation, not one synapse.',
  clock: 'Clock-mutant mice are hyperactive, sleep less and value reward more, with raised ventral tegmental dopamine activity; restoring CLOCK in the ventral tegmental area alone rescues them, and lithium normalises much of it (Roybal 2007; retrieved earlier in this project). Mouse model, single gene: low-to-moderate confidence that this is the human mechanism. The nightly drain is the animation’s simplification.',
  tint: 'Reward hypersensitivity maps onto hypomanic and manic approach symptoms (Nusslock &amp; Alloy 2017). Counterweight: a 21-study meta-analysis found no ventral striatal difference in reward anticipation; differences were angular gyrus and right inferior frontal hypoactivation (Long 2022). Both retrieved earlier in this project. Confidence: moderate for the loop as a computational account, low for a trait striatal hypersensitivity.',
  weak: 'Long 2022 meta-analysis: right inferior frontal gyrus hypoactivation during reward anticipation in bipolar disorder; mood state and subtype confounded results. Phillips &amp; Swartz 2014 for the regulation circuit. Most imaging is in euthymic, medicated patients.',
  sleep: 'Sleep loss triggering high mood was reported more often in bipolar I than II (OR 2.81) and in women (OR 1.43), 3,140 people, self-report (Lewis 2017, retrieved, <a href="https://doi.org/10.1192/bjp.bp.117.202259" target="_blank" rel="noopener">DOI</a>). Goal-attainment life events trigger manic symptoms; negative events mostly do not (Johnson 2005 review, retrieved, <a href="https://doi.org/10.1016/j.cpr.2005.06.004" target="_blank" rel="noopener">DOI</a>).',
  trigger: 'Sleep loss triggering high mood was reported more often in bipolar I (OR 2.81) and in women (OR 1.43), 3,140 people, self-report (Lewis 2017, retrieved, <a href="https://doi.org/10.1192/bjp.bp.117.202259" target="_blank" rel="noopener">DOI</a>). Sleep deprivation lifts mood acutely and can switch bipolar depression into mania (recalled: Wu &amp; Bunney 1990; Colombo 1999). Goal attainment triggers manic symptoms (Johnson 2005, retrieved, <a href="https://doi.org/10.1016/j.cpr.2005.06.004" target="_blank" rel="noopener">DOI</a>). The upward creep on short sleep is the animation’s simplification.',
  ratchet: 'The runaway is the model’s prediction: when mood’s bias on value is strong and damping is weak, each lap returns more than it took (Eldar 2016; Mason, Eldar &amp; Rutledge 2017, content recalled). Lap numbers and coin sizes are illustrative.',
  ofc: 'Orbitofrontal under-activation in mania: Blumberg 1999, five manic patients (retrieved earlier in this project, small sample). Long 2022 for right inferior frontal hypoactivation.',
  twoLoops: 'Decreased need for sleep is both a symptom and an accelerant: clinical observation that sleep loss precedes and worsens mania (Lewis 2017 self-report; Wehr 1987 recalled). The second loop is the animation’s framing.',
  symptoms: 'Mappings, each with its own evidence: elation and grandiosity, confidence surges (Johnson 2005); risk, trait risky choice 167 vs 150 (Adida 2011, retrieved earlier); speed, sensorimotor dominance over default mode at rest in mania, 20 per group (Martino 2016, retrieved earlier); irritability, amygdala over-response in bipolar youth (Thomas 2013; Wiggins 2016, retrieved earlier). The mapping of each symptom to one loop part is teaching judgment.',
  spill: 'Bipolar psychosis matches schizophrenia on striatal dopamine synthesis capacity, which tracks positive symptoms after adjusting for mania (Jauhar 2017, retrieved earlier). The accumbens → nigra spiral’s role in illness is untested.',
  ap: 'Antipsychotics are among the most effective drugs for acute mania (Cipriani 2011 network meta-analysis, recalled). Drawn as capping each burst; the cap size is illustrative.',
  li: 'Lithium lengthens circadian period and inhibits glycogen synthase kinase-3 (recalled, standard pharmacology). Teaching it as a set-point stabiliser acting on the clock and the loop is my judgment.',
  ipsrt: 'Interpersonal and social rhythm therapy in 175 people with bipolar I: longer survival without a new episode, and more regular rhythms predicted fewer recurrences (Frank 2005, retrieved, <a href="https://doi.org/10.1001/archpsyc.62.9.996" target="_blank" rel="noopener">DOI</a>).',
  dep: 'In rats, chronic mild stress cut dopamine neuron population activity through a basolateral amygdala → ventral pallidum pathway (Chang &amp; Grace 2014, retrieved earlier). Rodent circuit, low confidence for humans. Bipolar depression shows raised striatal dopamine transporter (Ashok 2017).',
};

STORIES.push({ id: 'aff2', name: 'Part 5 · How mania builds', color: '#ff9f43', hemi: 'L', view: MED_LOW, reveal: true, noStates: true, shell: '#7a8494',
  desc: 'A slower, one-idea-at-a-time telling: the mood loop and its two brakes, what bipolar disorder changes, how a lost night tips it into mania, and how treatment turns it down. Twenty short scenes.',
  keyIntro: '<div class="t">The mood loop card</div><div class="note">Outcome → surprise (dopamine burst) → mood → tint, back to the next outcome. Two brakes: prefrontal check and nightly reset. The dot travelling round the ring is the outcome you are watching in the brain. Coin sizes, tank level and the × number are illustrative units.</div>',
  nodes: {
    ofc: { key: 'Medial_orbital_gyrus', ghost: true, label: 'Orbitofrontal cortex' },
    nac: { key: 'Nucleus_accumbens', label: 'Nucleus accumbens', lo: [0, 12] },
    vta: { key: 'VTA', label: 'Ventral tegmental area', lo: [0, 12] },
    vlp: { key: 'Inferior_frontal_gyrus', ghost: true, label: 'Ventrolateral prefrontal' },
    scn: { key: 'Hypothalamus', mni: [-2, 2, -12], label: 'Master clock (suprachiasmatic, approx.)', r: 1.2, dot: '#3fd0c9' },
    amy: { key: 'Amygdala', label: 'Amygdala', lo: [0, 12] },
    vp:  { key: 'Ventral_pallidum', label: 'Ventral pallidum' },
    sn:  { key: 'Substantia_nigra', label: 'Substantia nigra', lo: [0, 12], nofit: true },
    cd:  { key: 'Caudate_nucleus', ghost: true, mni: [-12, 12, 6], label: 'Caudate head (associative)', nofit: true },
    ctx: { key: 'Middle_and_inferior_temporal_gyrus', ghost: true, label: 'Temporal cortex', nofit: true, noDot: true },
    smn: { key: 'Precentral_gyrus', ghost: true, label: 'Sensorimotor cortex', noDot: true, nofit: true },
  },
  edges: [
    { id: 'ofc-nac', from: 'ofc', to: 'nac', via: A2.OFC_VIA, sign: '+', ev: 'human', act: () => 0.35 },
    { id: 'vta-nac', from: 'vta', to: 'nac', via: A2.VTA_VIA, sign: 'da', ev: 'human', act: m => m.tone },
    { id: 'vlp-nac', from: 'vlp', to: 'nac', via: [[-28, 18, -2]], sign: 'ctl', ev: 'human', act: m => m.brake },
    { id: 'scn-vta', from: 'scn', to: 'vta', via: [[-3, -8, -13]], sign: 'clock', ev: 'rodent', act: m => m.reset },
    { id: 'amy-vp', from: 'amy', to: 'vp', via: [[-17, 0, -14]], sign: '+', ev: 'rodent', act: m => m.amy },
    { id: 'vp-vta', from: 'vp', to: 'vta', via: [[-9, -7, -10]], sign: '-', ev: 'rodent', act: m => 0.3 + 0.6 * cl01((m.amy - 0.3) / 0.6) },
    { id: 'nac-sn', from: 'nac', to: 'sn', via: [[-11, -6, -15]], sign: 'spiral', ev: 'proposed', act: m => m.assocDA },
    { id: 'sn-cd', from: 'sn', to: 'cd', via: [[-12, -6, -2], [-13, 4, 4]], sign: 'da', ev: 'human', act: m => m.assocDA },
    { id: 'ctx-cd', from: 'ctx', to: 'cd', via: [[-40, -12, -8], [-24, 2, 4]], sign: '+', ev: 'human', act: () => 0.45 },
  ],
  shieldOn: [['Nucleus_accumbens', 8, null]],
  vars: { m: 0, b: 0.45, brake: 1, clock: 1, sleep: 1, sleepLoop: 0, leak: 0.12, dayRate: 0, d2: 0, lith: 0, rth: 0, ev: 0, amy: 0.3, spill: 0 },
  discrete: ['ev', 'sleepLoop'],
  states: [
    { id: 'eu', label: 'Healthy', vars: { b: 0.45, brake: 1, clock: 1, sleep: 1, sleepLoop: 0, d2: 0, lith: 0, rth: 0, amy: 0.3, spill: 0, ev: 0 } },
    { id: 'bp', label: 'Bipolar, well', vars: { b: 0.9, brake: 0.65, clock: 0.8, sleep: 1, sleepLoop: 0, d2: 0, lith: 0, rth: 0, amy: 0.3, spill: 0, ev: 0 } },
    { id: 'mania', label: 'Mania', vars: { b: 0.9, brake: 0.2, clock: 0.8, sleep: 0.25, sleepLoop: 1, d2: 0, lith: 0, rth: 0, amy: 0.3, spill: 0, ev: 0 } },
  ],
  // tint = how strongly mood colours value (prefrontal brake and lithium soften it); reset = how much a night drains the tally
  model(v) {
    const clk = Math.min(1, v.clock + (1 - v.clock) * (0.5 * v.lith + 0.5 * v.rth));
    const sleepRaw = v.sleep * (v.sleepLoop > 0.5 ? 1 - 0.8 * cl01((v.m - 0.3) / 0.6) : 1), sleepEff = sleepRaw + (1 - sleepRaw) * v.rth;
    const tint = v.b * (1 - 0.5 * v.brake) * (1 - 0.5 * v.lith), mood = v.m;
    const tone = Math.min(1, Math.max(0.05, 0.38 + 0.45 * Math.max(0, mood) - 0.28 * Math.max(0, -mood))) * (1 - 0.35 * v.d2);
    return { tint, brake: v.brake, reset: clk * sleepEff, clockEff: sleepEff * (0.55 + 0.45 * clk), cap: 1 - 0.8 * v.d2, mood, tone, amy: v.amy,
      limbicDA: tone, assocDA: cl01(0.3 + 0.55 * v.spill) * (1 - 0.5 * v.d2), d2: v.d2 };
  },
  gauge: { gain: m => m.tone, raw: m => m.tone, pop: m => m.tone },
  salience: () => 1,
  tick(dt, v, m, S) {
    const sim = S.sim;
    const free = !S.tweens.some(tw => tw.k === 'm');
    if (v.leak > 0 && free) v.m -= v.m * v.leak * dt;
    // short sleep lifts mood a little by itself (sleep deprivation is mood-elevating; switches into mania are described)
    const sleepEff = m.clockEff / (0.55 + 0.45 * Math.min(1, v.clock + (1 - v.clock) * (0.5 * v.lith + 0.5 * v.rth)));
    if (free && v.dayRate > 0 && sleepEff < 0.9) v.m = Math.min(1, v.m + dt * 0.03 * (1 - sleepEff));
    if (v.dayRate > 0) {
      const nf = 0.12 + 0.3 * m.clockEff;
      sim.day = (sim.day ?? S.scene.day0 ?? 0.3) + dt * v.dayRate;
      sim.night = sim.day % 1 > 1 - nf;
      if (sim.night) v.m *= Math.pow(1 - 0.8 * m.reset, dt * v.dayRate / nf);
    } else sim.night = false;
    const ev = Math.round(v.ev); if (!ev) return;
    sim.next = (sim.next ?? 0.8) - dt; if (sim.next > 0) return;
    const gap = ev === 1 ? 3.3 : Math.max(1.7, 3.6 - 2 * Math.max(0, v.m)); sim.next = gap;
    const SEQ = [0.4, 0, -0.35, 0.3, 0, -0.4, 0.35, -0.2];
    const r = ev === 1 ? SEQ[sim.k = ((sim.k ?? -1) + 1) % SEQ.length] : 0.12 + S.rand() * 0.2;
    a2event(S, r > 0.05 ? 'coin' : r < -0.05 ? 'cloud' : 'cup', r, { ret: Math.max(0.3, gap - 3.2) });
  },
  look(m, S) {
    const see = S.see || new Set(), a = cl01((m.amy - 0.3) / 0.6), cool = m.mood < -0.15, L = {};
    if (see.has('nac')) L.Nucleus_accumbens = { glow: 0.12 + 0.75 * cl01((m.tone - 0.3) / 0.55), ec: cool ? '#4aa8ff' : '#ffd34d' };
    if (see.has('vta')) L.VTA = { col: '#c9962a', glow: 0.12 + 0.75 * cl01((m.tone - 0.25) / 0.6), ec: cool ? '#4aa8ff' : '#ffd34d' };
    if (see.has('ofc')) L.Medial_orbital_gyrus = { glow: 0.32, ec: '#ffb454', op: 0.24 };
    if (see.has('vlp')) L.Inferior_frontal_gyrus = { glow: 0.1 + 0.45 * m.brake, ec: '#b48cff', op: 0.07 + 0.2 * m.brake };
    if (see.has('scn')) L.Hypothalamus = { col: '#2d8c88', glow: 0.18 + (S.sim.night ? 0.55 : 0.18) * Math.max(0.2, m.reset), ec: '#3fd0c9' };
    if (see.has('amy')) L.Amygdala = { heat: a, glow: 0.12 + 0.7 * a, ec: '#ff6b5b' };
    if (see.has('vp')) L.Ventral_pallidum = { glow: 0.25 + 0.55 * a, ec: '#7cc4ff' };
    if (see.has('sn')) L.Substantia_nigra = { glow: 0.5 * cl01((m.assocDA - 0.45) / 0.4), ec: '#ffd34d' };
    if (see.has('cd')) L.Caudate_nucleus = { glow: 0.6 * cl01((m.assocDA - 0.45) / 0.4), ec: '#ffd34d', op: S.hud.tint ? 0.8 : 0.1 };
    if (S.hud.smn) L.Precentral_gyrus = L.Postcentral_gyrus = { glow: 0.6, ec: '#6fa8ff', op: 0.32 };
    return L;
  },
  insets: { loop: loopInset },
  scenes: [
    // ---- chapter 1: the healthy loop, one station at a time
    { title: 'Something good happens', chapter: 'Loop', dur: 12, state: 'eu', set: { m: 0, leak: 0 }, cam: CAM2.value,
      see: ['ofc'], show: [], labels: ['ofc'], fx: F2(0, null, 'ofc'),
      kicker: 'Outcome', caption: 'Something good happens. The orbitofrontal cortex, just above the eyes, weighs how good it is.', ev: EV.rpe,
      beats: [
        { at: 5, see: ['nac'], show: ['ofc-nac'], relabel: ['ofc', 'nac'], fx: { spot: 'nac' }, kicker: 'Compare', caption: 'Its value flows to the nucleus accumbens. The reward circuit checks it against what you expected.', do: ev2('coin', 0.5, { noBurst: true, dur: 2.6 }) }] },
    { title: 'Better than expected', chapter: 'Loop', dur: 25, state: 'eu', set: { m: 0, leak: 0.3 }, cam: CAM2.burst,
      see: SEE_LOOP, show: ['ofc-nac'], labels: ['vta'], fx: F2(0, null, 'vta'),
      kicker: 'Surprise', caption: 'Better than expected? Dopamine neurons in the ventral tegmental area fire a burst.', ev: EV.rpe,
      beats: [
        { at: 2.2, show: ['ofc-nac', 'vta-nac'], do: ev2('coin', 0.5) },
        { at: 7.2, kicker: null, caption: 'That gold burst is a reward prediction error: the brain’s signal for “better than I thought”.' },
        { at: 13, kicker: 'As expected', caption: 'Your usual morning coffee is exactly as expected. Barely a flicker.', do: ev2('cup', 0) },
        { at: 19, kicker: 'Worse', caption: 'The bus doesn’t come: worse than expected. The neurons pause — a dip.', do: ev2('cloud', -0.5) }] },
    { title: 'Mood keeps the tally', chapter: 'Loop', dur: 25, state: 'eu', set: { m: 0, leak: 0 }, cam: CAM2.burst,
      see: SEE_LOOP, show: EDGES_LOOP, labels: [], fx: F2(3, 'mood', null), inset: 'loop',
      kicker: 'Mood', caption: 'Each surprise adds to a running total. In this model, that total is your mood.', ev: EV.mood,
      beats: [
        { at: 4.5, caption: 'A run of good surprises fills it up…', do: ev2('coin', 0.5, { ret: 0.4 }) },
        { at: 8, do: ev2('coin', 0.5, { ret: 0.4 }) }, { at: 11.5, do: ev2('coin', 0.5) },
        { at: 15.5, tween: { leak: [0.22, 0.6] }, caption: '…and with nothing new happening, it slowly drains back toward the middle.' },
        { at: 20.5, relabel: ['nac'], fx: { spot: 'nac' }, caption: 'Mood has no single home. Here the accumbens glow stands in for the reward circuit’s tone.' }] },
    { title: 'Mood tints the next outcome', chapter: 'Loop', dur: 27, state: 'eu', set: { m: 0, leak: 0 }, cam: CAM2.burst,
      see: SEE_LOOP, show: EDGES_LOOP, labels: [], fx: F2(4, 'tint', 'ofc'), inset: 'loop',
      kicker: 'The twist', caption: 'Mood feeds back. It changes how good the next outcome looks.', ev: EV.mood,
      beats: [
        { at: 4.5, kicker: 'Neutral mood', caption: 'In a neutral mood, good news is taken at face value (the dashed ring).', do: ev2('coin', 0.4, { ghost: 1, dm: 0 }) },
        { at: 10.5, tween: { m: [0.75, 2] }, kicker: 'Good mood', caption: 'Now the same news arrives in a good mood…' },
        { at: 13.5, do: ev2('coin', 0.4, { ghost: 1 }) },
        { at: 16.5, kicker: null, caption: '…it looks bigger than face value, so the burst is bigger, so mood rises further.' },
        { at: 22, caption: 'Good news makes the next news look better. That is a feedback loop.' }] },
    { title: 'Brake one: the prefrontal check', chapter: 'Loop', dur: 23, state: 'eu', set: { m: 0.75, leak: 0 }, cam: CAM2.brake,
      see: [...SEE_LOOP, 'vlp'], show: [...EDGES_LOOP, 'vlp-nac'], focus: ['vlp-nac', 'vlp', 'nac', 'ofc-nac', 'ofc'], labels: ['vlp'], fx: F2(5, 'brake', 'vlp'), inset: 'loop',
      kicker: 'Brake 1', caption: 'Ventrolateral prefrontal cortex keeps value honest: a top-down check on the reward circuit.', ev: EV.brake,
      beats: [
        { at: 6.5, tween: { brake: [0, 1.2] }, kicker: 'Brake off', caption: 'Lift the brake, just to see: the same good mood now inflates the news.' },
        { at: 8.5, do: ev2('coin', 0.4, { ghost: 1, dm: 0 }) },
        { at: 14.5, tween: { brake: [1, 1.2] }, kicker: 'Brake on', caption: 'Put it back, and a good mood only nudges the next outcome.' },
        { at: 16.5, do: ev2('coin', 0.4, { ghost: 1, dm: 0 }) }] },
    { title: 'Brake two: the nightly reset', chapter: 'Loop', dur: 29, state: 'eu', set: { m: 0.7, leak: 0, dayRate: 0 }, day0: 0.42, cam: CAM2.clock,
      see: [...SEE_LOOP, 'scn'], show: [...EDGES_LOOP, 'scn-vta'], focus: ['scn-vta', 'scn', 'vta'], labels: ['scn'], fx: F2(6, 'clock', 'scn'), inset: 'loop', hud: { clock: true },
      tags: { 'scn-vta': 'mouse evidence' },
      kicker: 'Brake 2', caption: 'The suprachiasmatic nucleus is the master clock. It sets the daily rhythm of the dopamine system.', ev: EV.clock,
      beats: [
        { at: 7, hud: { strip: true }, tween: { dayRate: [0.13, 0.8] }, kicker: 'Sleep', caption: 'Each night’s sleep drains the tally back toward baseline.' },
        { at: 16, kicker: null, caption: 'Tomorrow starts fresh. Good days don’t pile up into a high.' },
        { at: 22.5, caption: 'In mice, a clock-gene mutation causes a mania-like state; restoring the gene in these dopamine neurons reverses it.' }] },
    { title: 'The healthy loop', chapter: 'Loop', dur: 24, state: 'eu', set: { m: 0, leak: 0.12, dayRate: 0.1, ev: 1 }, cam: CAM2.all,
      see: SEE_ALL, show: EDGES_ALL, labels: [], fx: F2(6, null, null, 'Healthy'), inset: 'loop', hud: { clock: true, strip: true },
      kicker: 'Healthy', caption: 'Put together: surprises nudge mood, mood tints the next outcome a little, two brakes pull it back.', ev: EV.mood,
      beats: [{ at: 12, kicker: 'Euthymia', caption: 'Small swings that settle. Mood moves, but it stays anchored.' }] },

    // ---- chapter 2: three differences, one at a time
    { title: 'Difference 1: a stronger tint', chapter: 'Bipolar', dur: 22, state: 'eu', set: { m: 0.5, leak: 0 }, cam: CAM2.burst,
      see: SEE_ALL, show: EDGES_ALL, focus: ['ofc-nac', 'vta-nac', 'ofc', 'nac', 'vta'], labels: [], fx: F2(6, 'tint', 'ofc', 'Bipolar disorder, well'), inset: 'loop',
      kicker: 'Difference 1', caption: 'In bipolar disorder, mood may colour value more strongly: reward hypersensitivity.', ev: EV.tint,
      beats: [
        { at: 4.5, kicker: 'Typical', caption: 'A typical brain, same mood: the news looks a little better than face value.', do: ev2('coin', 0.4, { ghost: 1, dm: 0 }) },
        { at: 10, tween: { b: [0.9, 1.5] }, kicker: 'Bipolar', caption: 'Turn the tint up: the same news, in the same mood, looks bigger.' },
        { at: 12, do: ev2('coin', 0.4, { ghost: 1, dm: 0 }) },
        { at: 17, kicker: 'Caveat', caption: 'Clear in behaviour and symptoms; less consistent in striatal imaging.' }] },
    { title: 'Difference 2: a weaker brake', chapter: 'Bipolar', dur: 18, state: 'eu', set: { m: 0.2, leak: 0.1, b: 0.9 }, cam: CAM2.brake,
      see: SEE_ALL, show: EDGES_ALL, focus: ['vlp-nac', 'vlp', 'nac'], labels: ['vlp'], fx: F2(6, 'brake', 'vlp', 'Bipolar disorder, well'), inset: 'loop',
      kicker: 'Difference 2', caption: 'Ventrolateral prefrontal regulation tends to be weaker, even between episodes.', ev: EV.weak,
      beats: [{ at: 1.2, tween: { brake: [0.65, 3] } },
        { at: 9, kicker: 'Evidence', caption: 'Meta-analysis: less right inferior frontal activity when people with bipolar disorder anticipate reward.' }] },
    { title: 'Difference 3: a fragile clock', chapter: 'Bipolar', dur: 24, state: 'bp', set: { m: 0, leak: 0.12, dayRate: 0.1 }, cam: CAM2.all,
      see: SEE_ALL, show: EDGES_ALL, focus: ['scn-vta', 'scn', 'vta'], labels: ['scn'], fx: F2(6, 'clock', 'scn', 'Bipolar disorder, well'), inset: 'loop', hud: { clock: true, strip: true },
      kicker: 'Difference 3', caption: 'The clock is easily knocked: lost sleep, jet lag and shift work can all come before an episode.', ev: EV.sleep,
      beats: [{ at: 9, set: { ev: 1 }, focus: null, relabel: [], fx: { spot: null, hi: null }, kicker: 'Still well', caption: 'Between episodes the loop still settles. The swings are bigger: less margin.' }] },

    // ---- chapter 3: a manic episode, step by step
    { title: 'The trigger: short nights', chapter: 'Mania', dur: 26, state: 'bp', set: { m: 0.1, leak: 0.03, dayRate: 0.14, sleep: 1 }, day0: 0.5, cam: CAM2.clock,
      see: SEE_ALL, show: EDGES_ALL, focus: ['scn-vta', 'scn', 'vta'], labels: ['scn'], fx: F2(6, 'clock', 'scn', 'Bipolar disorder, well'), inset: 'loop', hud: { clock: true, strip: true },
      kicker: 'Trigger', caption: 'It can start with lost sleep: a deadline, a newborn, a long-haul flight.', ev: EV.trigger,
      beats: [
        { at: 2.5, tween: { sleep: [0.25, 3] } },
        { at: 9, kicker: null, caption: 'Short nights barely drain the tally, and sleep loss itself lifts mood. Each day starts higher.' },
        { at: 16, cam: CAM2.loop, focus: null, relabel: ['ofc'], fx: { hi: 'outcome', spot: 'ofc', tag: 'Episode starting' }, kicker: 'A win', caption: 'Then a big win lands: a promotion, a new relationship. Goal attainment is a known trigger too.', do: ev2('trophy', 0.45) }] },
    { title: 'The loop catches', chapter: 'Mania', dur: 27, state: 'bp', set: { m: 0.45, leak: 0.03, sleep: 0.25 }, cam: CAM2.loop,
      see: SEE_ALL, show: EDGES_ALL, focus: ['ofc-nac', 'vta-nac', 'ofc', 'nac', 'vta'], labels: [], fx: F2(6, null, null, 'Mania building'), inset: 'loop',
      kicker: 'Lap 1', caption: 'Good news lands on a raised mood and looks bigger than it is.', ev: EV.ratchet,
      beats: [
        { at: 1.5, do: ev2('coin', 0.2, { ret: 2.6 }) },
        { at: 7.5, kicker: 'Lap 2', caption: 'The bigger burst lifts mood, so the next news looks bigger still.', do: ev2('coin', 0.2, { ret: 1.8 }) },
        { at: 12.6, kicker: 'Lap 3', caption: 'Each lap comes sooner. The loop is feeding itself.', do: ev2('coin', 0.2, { ret: 0.9 }) },
        { at: 16.7, do: ev2('coin', 0.2, { ret: 0.5 }) },
        { at: 20.4, kicker: 'Runaway', caption: 'Each lap now returns more than it took. Mood climbs with no new reason to.', do: ev2('coin', 0.2) }] },
    { title: 'Brake one gives way', chapter: 'Mania', dur: 19, state: 'bp', set: { m: 0.9, leak: 0, sleep: 0.25 }, cam: CAM2.brake,
      see: SEE_ALL, show: EDGES_ALL, focus: ['vlp-nac', 'vlp', 'nac'], labels: ['vlp'], fx: F2(6, 'brake', 'vlp', 'Mania building'), inset: 'loop',
      kicker: 'Brake 1 fails', caption: 'As mania builds, prefrontal activity falls further. The check on value goes quiet.', ev: EV.ofc,
      beats: [{ at: 1.2, tween: { brake: [0.2, 3.5] } },
        { at: 9.5, kicker: null, caption: 'Caution, consequences and other people’s worry stop reaching the reward circuit.' }] },
    { title: 'Brake two gives way', chapter: 'Mania', dur: 26, state: 'mania', set: { m: 0.85, leak: 0.03, dayRate: 0.14, ev: 2 }, day0: 0.45, cam: CAM2.clock,
      see: SEE_ALL, show: EDGES_ALL, focus: ['scn-vta', 'scn', 'vta', 'vta-nac', 'nac'], labels: ['scn'], fx: F2(6, 'clock', 'scn', 'Mania building', { loop2: true }), inset: 'loop', hud: { clock: true, strip: true },
      kicker: 'Brake 2 fails', caption: 'High mood shrinks the need for sleep, and less sleep means less reset.', ev: EV.twoLoops,
      beats: [{ at: 12, fx: { hi: ['mood', 'tint', 'clock'] }, kicker: 'Two loops', caption: 'Now two loops feed each other: mood with value, and mood with sleep.' }] },
    { title: 'Mania', chapter: 'Mania', dur: 36, state: 'mania', set: { m: 0.95, leak: 0 }, cam: CAM2.all,
      see: SEE_ALL, show: EDGES_ALL, labels: [], fx: F2(6, null, null, 'Mania', { loop2: true }), inset: 'loop',
      kicker: 'Mania', caption: 'Mood is pinned high. Each symptom maps onto a part of the loop.', ev: EV.symptoms,
      beats: [
        { at: 5, relabel: ['ofc'], fx: { hi: 'tint', spot: 'ofc' }, kicker: 'Elation, grandiosity', caption: 'Ordinary things feel like wins. The usual coffee now fires a burst.', do: ev2('cup', 0) },
        { at: 12, relabel: ['scn'], fx: { hi: 'clock', spot: 'scn' }, kicker: 'Little sleep', caption: 'Three hours feels like plenty: the sleep loop.' },
        { at: 17.5, relabel: ['vlp'], fx: { hi: 'brake', spot: 'vlp' }, kicker: 'Risk', caption: 'Spending, sex, driving: value inflated and the brake off.' },
        { at: 23.5, relabel: ['smn'], hud: { smn: true }, fx: { hi: null, spot: null }, kicker: 'Speed', caption: 'Racing thoughts, pressured speech, restlessness: sensorimotor cortex dominates the resting brain.' },
        { at: 30, see: ['amy'], hud: { smn: false }, relabel: ['amy'], fx: { spot: 'amy' }, set: { amy: 0.75 }, kicker: 'Irritability', caption: 'Blocked goals meet an over-reactive amygdala, with no prefrontal check.' }] },
    { title: 'At the peak: psychosis', chapter: 'Mania', dur: 19, state: 'mania', set: { m: 1, spill: 0, leak: 0 }, cam: CAM2.spill,
      see: ['nac', 'vta', 'sn', 'cd'], show: ['vta-nac', 'nac-sn', 'sn-cd'], labels: ['nac', 'cd'], tags: { 'nac-sn': 'untested link' }, fx: { spot: 'cd' }, hud: { tint: true },
      kicker: 'Overflow', caption: 'Push the gain high enough and dopamine spills up into the associative striatum.', ev: EV.spill,
      controls: [{ type: 'button', label: 'See the highlighter in Part 3', do: () => startStory('p3', 4) }],
      beats: [
        { at: 1, tween: { spill: [1, 3.5] } },
        { at: 8, show: ['vta-nac', 'nac-sn', 'sn-cd', 'ctx-cd'], kicker: 'Psychosis', caption: 'Neutral things start to feel loaded with meaning. Grandiose or persecutory delusions ride on top.',
          token: { icon: 'car', from: 'ctx', to: 'cd', via: [[-40, -12, -8], [-24, 2, 4]], kind: 'neutral', persist: true, sal: () => 2, flash: 'sn-cd' } }] },

    // ---- chapter 4: turning it down, one lever at a time
    { title: 'Antipsychotic: cap the burst', chapter: 'Treatment', dur: 23, state: 'mania', set: { m: 0.95, leak: 0, d2: 0 }, cam: CAM2.burst,
      see: SEE_ALL, show: EDGES_ALL, focus: ['ofc-nac', 'vta-nac', 'ofc', 'nac', 'vta'], labels: ['nac'], fx: F2(6, 'surprise', 'nac', 'Mania'), inset: 'loop', hud: { shields: true },
      kicker: 'Antipsychotic', caption: 'Blocking D2 receptors in the accumbens caps each burst, so each lap returns less.', ev: EV.ap,
      beats: [
        { at: 1.5, tween: { d2: [1, 1.6] } },
        { at: 5, do: ev2('cup', 0, { dm: 0 }) },
        { at: 10.5, tween: { m: [0.65, 7] }, fx: { tag: 'Treated' }, kicker: null, caption: 'The loop loses its push, and mood can start to come down.' }] },
    { title: 'Lithium: steady the clock', chapter: 'Treatment', dur: 21, state: 'mania', set: { m: 0.65, leak: 0, d2: 1, lith: 0 }, cam: CAM2.clock,
      see: SEE_ALL, show: EDGES_ALL, focus: ['scn-vta', 'scn', 'vta'], labels: ['scn'], fx: F2(6, ['clock', 'tint'], 'scn', 'Treated'), inset: 'loop', hud: { clock: true },
      kicker: 'Lithium', caption: 'Lithium lengthens the body clock’s cycle and inhibits GSK-3.', ev: EV.li,
      beats: [
        { at: 1.2, tween: { lith: [1, 2.5] } },
        { at: 8.5, tween: { m: [0.45, 6] }, kicker: 'Set-point', caption: 'Taught here as a set-point stabiliser: it steadies the clock and softens the tint.' }] },
    { title: 'Restore the night', chapter: 'Treatment', dur: 28, state: 'mania', set: { m: 0.45, leak: 0.02, d2: 1, lith: 1, rth: 0, dayRate: 0.14, sleepLoop: 1 }, day0: 0.4, cam: CAM2.clock,
      see: SEE_ALL, show: EDGES_ALL, focus: ['scn-vta', 'scn', 'vta'], labels: ['scn'], fx: F2(6, 'clock', 'scn', 'Treated'), inset: 'loop', hud: { clock: true, strip: true },
      kicker: 'Sleep and rhythm', caption: 'Protecting sleep restores the nightly reset, and mood drains back night by night.', ev: EV.ipsrt,
      beats: [
        { at: 1, tween: { rth: [1, 2.5] } },
        { at: 12, kicker: 'Prevention', caption: 'Regular daily rhythms also delay the next episode: interpersonal and social rhythm therapy.' },
        { at: 21, kicker: 'Summary', fx: { hi: null, spot: null }, relabel: [], focus: null, caption: 'Cap the burst, steady the clock, restore the reset.' }] },

    // ---- coda: the reverse pole
    { title: 'The same loop, run downward', chapter: 'Coda', dur: 27, state: 'bp', set: { m: -0.05, leak: 0, amy: 0.3 }, cam: CAM2.amy,
      see: [...SEE_ALL, 'amy', 'vp'], show: [...EDGES_LOOP, 'amy-vp', 'vp-vta'], focus: ['amy-vp', 'vp-vta', 'amy', 'vp', 'vta'], labels: ['amy'], tags: { 'amy-vp': 'rat circuit' },
      fx: F2(6, 'mood', 'amy', 'Bipolar disorder'), inset: 'loop',
      kicker: 'Coda', caption: 'The loop runs both ways. Loss or stress can start it downward.', ev: EV.dep,
      beats: [
        { at: 3, tween: { amy: [0.9, 2], m: [-0.6, 5] }, relabel: ['amy', 'vp'], fx: { spot: 'vp', tag: 'Depression' },
          token: { icon: 'bolt', from: 'ctx', to: 'amy', kind: 'stress', dur: 1.4, sal: () => 1.3 }, caption: 'In rats, stress drives the amygdala to tighten the pallidal brake on dopamine neurons.' },
        { at: 10.5, relabel: ['nac'], fx: { hi: 'tint', spot: 'nac' }, kicker: 'Lap', caption: 'Now the tint runs cold. Even the usual coffee falls short: a dip, not a flicker.', do: ev2('cup', 0, { dm: 0.5 }) },
        { at: 18.5, fx: { hi: null, spot: null }, relabel: [], kicker: null, caption: 'Same loop, opposite pole. That is what makes the illness bipolar.' }] },
  ],
});
