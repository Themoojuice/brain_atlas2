// ---------------------------------------------------------------- Part 3 · When everything matters: positive symptoms
// Mental model 1, the highlighter: dopamine in the associative striatum marks events as worth attending to. With the gain
// up, it marks neutral things; a delusion is the explanation of why so much is marked, and new marks then confirm it.
// Mental model 2, the missing signature: a copy of each motor or speech command tells sensory cortex "this is me", so
// self-made sensations are damped. When the copy is imprecise, inner speech arrives unsigned (voices) and movements
// feel done to you (passivity). Model: PSY_BASE for the gain; prec = precision of the copy; heard = 1 − 0.8 × prec.

const FEED_SEQ = ['bird', 'car', 'cup', 'person', 'plate', 'eye', 'car', 'radio', 'bird', 'plate', 'cup', 'person', 'eye', 'car'];
const FEED_LAB = { bird: 'bird', car: 'a car', cup: 'coffee', person: 'your name', plate: 'number plate', eye: 'a glance', radio: 'radio', coin: 'a reward' };
const FEED_SEQ_R = ['bird', 'coin', 'car', 'cup', 'plate', 'eye', 'coin', 'radio', 'car', 'bird', 'coin', 'plate', 'eye', 'cup'];
const FEED_REL = { person: 1 };
const FEED_GAP = 2.4;
const LOOSE = [['I', 0], ['went', 0], ['to', 0], ['the', 0], ['bank', 0], ['river', 'meaning'], ['shiver', 'sound'], ['cold', 'meaning'], ['gold', 'sound'], ['sold', 'sound']];
function feedInset(S) {
  const slot = [...Array(8)].map((_, j) => `<g class="fi" id="fi${j}" opacity="0"><rect class="hl" x="-21" y="-19" width="42" height="40" rx="6" fill="#ffd34d" opacity="0"/>
    <rect x="-14" y="-14" width="28" height="28" rx="7" fill="#0d141d" stroke="#8d9bad" stroke-width="1.5"/><g class="ic" transform="translate(-9 -9) scale(0.75)" fill="none" stroke="#e7edf4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></g>
    <text class="sub" y="31" text-anchor="middle"></text><g class="bang" opacity="0"><circle cx="13" cy="-14" r="6.5" fill="#ffd34d"/><text x="13" y="-10.5" text-anchor="middle" font-size="10" font-weight="700" fill="#1a1300">!</text></g></g>`).join('');
  const words = LOOSE.map(([w], i) => `<text class="lw lab" id="lw${i}" y="76" opacity="0">${w}</text>`).join('');
  const html = `<div class="t lt"><span id="fdT">Today’s feed</span><b id="fdTag"></b></div>
  <svg viewBox="0 0 312 96" class="cardsvg" id="fdsvg">
    <g id="fdRow">${slot}</g><g id="fdThreads"></g>
    <text id="fdStory" class="lab" x="156" y="88" text-anchor="middle" fill="#ffd34d" font-style="italic"></text>
    <g id="fdPull" opacity="0"><text class="sub" x="6" y="88">Pull of the reward</text><rect x="92" y="82" width="120" height="7" rx="3.5" fill="rgba(141,155,173,0.22)"/><rect id="fdPullB" x="92" y="82" width="0" height="7" rx="3.5" fill="#ffd34d"/><text id="fdEff" class="lab" x="306" y="88" text-anchor="end"></text></g>
    <g id="fdWords" opacity="0"><text class="sub" x="6" y="22">Tight</text><text class="lab" x="44" y="22" fill="#8d9bad">I went to the bank to pay the rent.</text>
      <text class="sub" x="6" y="76">Loose</text>${words}<g id="lwArcs"></g></g>
  </svg>${QUOTE_DIV}`;
  const ic = k => ICONS[k].replace(/^<svg[^>]*>|<\/svg>$/g, '');
  return { html, tick(m) {
    const q = id => document.getElementById(id), fx = S.fx; if (!q('fdsvg')) return;
    setText(q('fdTag'), fx.tag || ''); quoteTick(fx);
    const wordsOn = !!fx.words; q('fdRow').style.opacity = wordsOn ? 0 : 1; q('fdWords').setAttribute('opacity', wordsOn ? 1 : 0); setText(q('fdT'), wordsOn ? 'A train of thought' : 'Today’s feed');
    setText(q('fdStory'), wordsOn || fx.pull ? '' : (fx.plot || fx.story || ''));
    q('fdPull').setAttribute('opacity', fx.pull && !wordsOn ? 1 : 0);
    if (fx.pull) { const pl = cl01(m.pull ?? 0); q('fdPullB').setAttribute('width', (120 * pl).toFixed(1)); setText(q('fdEff'), pl > 0.4 ? 'worth the effort' : 'not worth the effort'); q('fdEff').setAttribute('fill', pl > 0.4 ? '#ffd34d' : '#8d9bad'); }
    if (wordsOn) {
      // loose links: the chain jumps by meaning or sound; one word every 1.3 s
      const n = Math.min(LOOSE.length, 1 + Math.floor(Math.max(0, S.t - 1) / 1.3)); let x = 44, arcs = '';
      LOOSE.forEach(([w, kind], i) => { const el = q('lw' + i), wpx = w.length * 5.9 + 4; el.setAttribute('x', x.toFixed(1)); el.setAttribute('opacity', i < n ? 1 : 0); el.setAttribute('fill', kind ? '#ffcf6b' : '#e7edf4');
        if (kind && i < n) { const x0 = x - 18, x1 = x + wpx / 2 - 3; arcs += `<path d="M${x0.toFixed(1)} 64 Q ${((x0 + x1) / 2).toFixed(1)} 50 ${x1.toFixed(1)} 64" fill="none" stroke="${kind === 'sound' ? '#ff9f43' : '#c49bff'}" stroke-width="1.4" stroke-dasharray="3 2"/><text class="sub" x="${((x0 + x1) / 2).toFixed(1)}" y="${48 - (i % 2) * 9}" text-anchor="middle" fill="${kind === 'sound' ? '#ffb36b' : '#d6c4ff'}">${kind}</text>`; }
        x += wpx; });
      q('lwArcs').innerHTML = arcs; return;
    }
    // the conveyor: one new event every FEED_GAP seconds of story time; marks follow the live gain
    const T = S.t + 40, cyc = Math.floor(T / FEED_GAP), fr = (T / FEED_GAP) - cyc, sh = easeIO(Math.min(1, fr / 0.3));
    const g = cl01((m.assocDA - 0.45) / 0.35), marked = [];
    for (let j = 0; j < 8; j++) {
      const SEQ = fx.reward ? FEED_SEQ_R : FEED_SEQ, id = cyc + j - 1, type = SEQ[((id % SEQ.length) + SEQ.length) % SEQ.length], x = 34 + (j - sh) * 48;
      const el = q('fi' + j); if (!el) continue;
      const vis = cl01(Math.min((x + 10) / 30, (330 - x) / 40));
      if (el.dataset.t !== type) { el.dataset.t = type; el.querySelector('.ic').innerHTML = ic(type); el.querySelector('text').textContent = FEED_LAB[type]; }
      const rel = type === 'coin' ? (m.rew ?? 0.85) : (FEED_REL[type] || 0.06), sal = type === 'coin' ? rel : rel + (0.2 + 0.8 * hash01(id, 3)) * g * (1 - 0.4 * (m.occ || 0)), hl = cl01((sal - 0.45) / 0.35);
      el.setAttribute('transform', `translate(${x.toFixed(1)} 30)`); el.setAttribute('opacity', vis.toFixed(2));
      el.querySelector('.hl').setAttribute('opacity', (0.55 * hl).toFixed(2)); el.querySelector('.bang').setAttribute('opacity', sal > 0.75 ? vis.toFixed(2) : 0);
      el.querySelector('rect:nth-of-type(2)').setAttribute('stroke', type === 'coin' ? '#ffb454' : '#8d9bad');
      if (sal > 0.75 && !FEED_REL[type] && type !== 'coin' && vis > 0.5) marked.push(x);
    }
    let th = '';
    if (fx.threads) for (let i = 0; i + 1 < marked.length; i++) { const a = marked[i], b = marked[i + 1]; th += `<path d="M${a.toFixed(1)} 11 Q ${((a + b) / 2).toFixed(1)} -4 ${b.toFixed(1)} 11" fill="none" stroke="#ffd34d" stroke-width="1.8" stroke-dasharray="4 3"/>`; }
    q('fdThreads').innerHTML = th;
  } };
}

function sigInset(S) {
  const html = `<div class="t lt"><span id="sgT">The signature</span><b id="sgTag"></b></div>
  <svg viewBox="0 0 312 100" class="cardsvg" id="sgsvg">
    <g id="sgFrom"><circle cx="34" cy="50" r="17" fill="#0d141d" stroke="#c9d4e2" stroke-width="1.6"/><path d="M47 54 l7 2 -7 3" fill="none" stroke="#c9d4e2" stroke-width="1.6"/>
      <text id="sgFromT" class="lab" x="6" y="84">You speak</text><text id="sgFromS" class="sub" x="6" y="94">frontal speech areas</text></g>
    <g><circle cx="248" cy="50" r="17" fill="#0d141d" stroke="#c9d4e2" stroke-width="1.6"/><path d="M243 42 a7 8 0 1 1 6 14 q-3 2 -4 5" fill="none" stroke="#c9d4e2" stroke-width="1.6"/>
      <text id="sgToT" class="lab" x="248" y="84" text-anchor="middle">You hear</text><text id="sgToS" class="sub" x="248" y="94" text-anchor="middle">auditory cortex</text></g>
    <line x1="56" y1="58" x2="226" y2="58" stroke="#3a4452" stroke-width="1.4"/>
    <path id="sgCopy" fill="none" stroke="#c49bff" stroke-width="2" stroke-dasharray="5 3" d=""/>
    <text id="sgCopyT" class="sub" x="141" y="12" text-anchor="middle" fill="#d6c4ff">copy: “this is me, expect it”</text>
    <circle id="sgCopyDot" r="3.2" fill="#c49bff" opacity="0"/>
    <g id="sgMsg" opacity="0"><rect x="-13" y="-9" width="26" height="18" rx="6" fill="#0d141d" stroke="#e7edf4" stroke-width="1.6"/><path id="sgMsgIc" d="M-6 -2h12M-6 2h8" stroke="#e7edf4" stroke-width="1.5"/></g>
    <rect x="282" y="26" width="10" height="50" rx="4" fill="rgba(141,155,173,0.22)"/><rect id="sgMeter" x="282" y="76" width="10" height="0" rx="4" fill="#8d9bad"/>
    <text class="sub" x="287" y="20" text-anchor="middle">loud</text>
    <text id="sgVerdict" class="lab" x="232" y="22" text-anchor="middle"></text>
  </svg>${QUOTE_DIV}`;
  let meter = 0;
  return { html, tick(m) {
    const q = id => document.getElementById(id), fx = S.fx; if (!q('sgsvg')) return;
    setText(q('sgTag'), fx.tag || ''); quoteTick(fx);
    const touch = fx.sig === 'touch';
    setText(q('sgFromT'), touch ? 'You move' : 'You speak'); setText(q('sgFromS'), touch ? 'motor cortex' : 'frontal speech areas');
    setText(q('sgToT'), touch ? 'You feel' : 'You hear'); setText(q('sgToS'), touch ? 'sensory cortex' : 'auditory cortex');
    q('sgMsgIc').setAttribute('d', touch ? 'M-7 3 q4 -9 8 -4 q3 -6 6 0' : 'M-6 -2h12M-6 2h8');
    const P = 3.4, p = (S.t % P) / P, prec = m.prec;
    // the copy leaves first and arrives first; an imprecise copy is faint and wobbly
    const wob = (1 - prec) * 7, cp = cl01(p / 0.32);
    let d = ''; for (let i = 0; i <= 24; i++) { const u = i / 24, x = 56 + 170 * u, y = 42 - 26 * Math.sin(Math.PI * u) + wob * Math.sin(u * 23 + S.t * 3) * (fx.gamma ? 1.4 : 1); d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`; }
    setAttrs(q('sgCopy'), { d, opacity: (0.15 + 0.85 * prec).toFixed(2), 'stroke-dasharray': fx.gamma ? 'none' : '5 3' });
    q('sgCopyT').setAttribute('opacity', (0.3 + 0.7 * prec).toFixed(2));
    const cx = 56 + 170 * cp, cy = 42 - 26 * Math.sin(Math.PI * cp);
    setAttrs(q('sgCopyDot'), { cx: cx.toFixed(1), cy: cy.toFixed(1), opacity: p < 0.34 ? (0.2 + 0.8 * prec).toFixed(2) : 0 });
    const mp = cl01((p - 0.12) / 0.45), mx = 56 + 170 * mp;
    q('sgMsg').setAttribute('transform', `translate(${mx.toFixed(1)} 58)`); q('sgMsg').setAttribute('opacity', p > 0.1 && p < 0.62 ? 1 : 0);
    const arrived = p > 0.57 && p < 0.97, target = arrived ? m.heard : 0; meter += (target - meter) * 0.15;
    const loud = m.heard > 0.5;
    setAttrs(q('sgMeter'), { y: (76 - 50 * meter).toFixed(1), height: (50 * meter).toFixed(1), fill: loud ? '#ff6b9a' : '#8d9bad' });
    setText(q('sgVerdict'), arrived ? (loud ? (touch ? 'strong: not me?' : 'loud: not me?') : 'damped: me') : '');
    q('sgVerdict').setAttribute('fill', loud ? '#ff8fb1' : '#c9d4e2');
  } };
}

const P3_CAM = {
  terr: { dir: [-0.75, 0.45, 0.55], fit: ['cd', 'nac', 'sn', 'vta'], r: 20, pad: 14 },
  feed: { dir: [-0.8, 0.35, 0.5], fit: ['ctx', 'cd', 'nac'], r: 22, pad: 14 },
  speech: { dir: [0.95, 0.25, 0.35], fit: ['ifg', 'stg'], r: 26, pad: 12 },
  touch: { dir: [0.75, 0.6, 0.3], fit: ['m1', 's1'], r: 26, pad: 12 },
  lang: { dir: [0.95, 0.2, 0.3], fit: ['stg', 'mtg', 'ifg'], r: 26, pad: 12 },
};
const P3_EV = {
  series: 'Part 3 of the series: from dopamine excess (Part 2) to positive symptoms.',
  teach: 'Dopamine neurons signal reward prediction errors (Schultz 1997); a second population, more dorsolateral in the monkey substantia nigra, fires for important events whether rewarding or aversive (Matsumoto &amp; Hikosaka 2009, ' + doi('10.1038/nature08028') + '; Bromberg-Martin 2010, ' + doi('10.1016/j.neuron.2010.11.022') + '). Confidence high, primate recordings.',
  terr: 'Limbic (accumbens) striatum handles value and motivation; associative striatum, with prefrontal input, handles attention and belief updating (McCutcheon 2019, review, ' + doi('10.1016/j.tins.2018.12.004') + '). Territory boundaries on the atlas are my judgment.',
  salience: 'Aberrant salience: dopamine excess makes ordinary events feel significant, and delusions are cognitive explanations of that experience (Kapur 2003, from the project research library). A framework that fits the PET and reward data, not a measured mechanism: confidence moderate.',
  mood: 'Delusional mood: the stage of strangeness and significance before any explanation (Kapur 2003). The quote is a patient in Kraepelin’s 1919 textbook, public domain in the US; check the translator’s death date before a public Australian release.',
  explain: 'Delusion as explanation, and relief once it forms (Kapur 2003; Bowers 1974 patient accounts, via the quote library). Confidence moderate (theory).',
  stick: 'Once formed, the explanation shapes how new evidence is read, and the excess keeps supplying new marks (predictive-processing account, project teaching matrix rows 3 and 5). Confidence low to moderate.',
  plot: 'Worry mediated 66% of the link between negative affect and paranoia in 150 people with persecutory delusions (Freeman 2015, from the project research library). Mood-congruent grandiose and guilty content in mania and depression is a clinical observation. Confidence moderate.',
  tickle: 'Self-produced touch feels less intense than the same touch from outside, because a forward model predicts it (Blakemore 2000, from the project research library). Confidence high.',
  speech: 'Frontal speech areas send a corollary discharge that damps auditory cortex during talking and inner speech: the N1 response is reduced in healthy people but not in patients with schizophrenia (Ford &amp; Mathalon 2004, ' + doi('10.1016/s0022-3956(03)00095-5') + '). Confidence moderate to high.',
  voices: 'In 20 patients and 17 controls, healthy people damped the N1 to their own unaltered voice; hallucinating patients did not, and the imprecision correlated with hallucination severity and misattribution errors (Heinks-Maldonado 2007, ' + doi('10.1001/archpsyc.64.3.286') + '). Small sample: confidence moderate. That salience makes the unsigned speech feel meant is my synthesis.',
  passivity: 'Sensory attenuation of self-produced touch fails in schizophrenia, and the failure in secondary somatosensory cortex tracks hallucination severity, 19 vs 19 (Shergill 2014, from the project research library). Confidence moderate.',
  bridge: 'Frontal–temporal gamma coherence rises during talking in healthy people and is disrupted in patients, especially those who hallucinate (Ford &amp; Mathalon 2004, 2005, ' + doi('10.1016/j.ijpsycho.2005.01.014') + '). The 2005 review notes only limited success linking these measures to hallucination reports. Linking this to Part 1’s interneurons is my synthesis: confidence low.',
  ftd: 'Formal thought disorder correlates with left superior temporal and posterior middle temporal gyri (Wensing 2017, 18 studies) and the wider language network (Cavelti 2018, 61 studies); both from the project research library. Confidence moderate for location, low for mechanism. The word chain is illustrative.',
};
const P3_A_SEE = ['ctx', 'vta', 'nac', 'sn', 'cd'], P3_A_SHOW = ['vta-nac', 'nac-sn', 'sn-cd', 'ctx-cd'];
const PSYV = { pv: 0.15, ctl: 0.45 };

STORIES.push({ ...PSY_BASE, id: 'p3', name: 'Part 3 · When everything matters', color: '#ffd34d', reveal: true, noStates: true, shell: '#7a8494',
  desc: 'What dopamine excess feels like: the highlighter that marks neutral things (delusions), the missing signature on inner speech and movement (voices, passivity), and loose links (thought disorder). Sixteen short scenes.',
  keyIntro: '<div class="t">The two cards</div><div class="note">Feed card: everyday events slide past; yellow marks are salience, and a “!” means the event feels important. Gold threads join marks into a story. Signature card: a copy of each command (purple, dashed) races ahead to tell the senses “this is me”; when it is faint the message arrives loud, as if from someone else. All illustrative.</div>',
  nodes: { ...PSY_BASE.nodes,
    ifg: { key: 'Inferior_frontal_gyrus', ghost: true, label: 'Frontal speech area', nofit: true },
    stg: { key: 'Superior_temporal_gyrus_posterior_part', ghost: true, label: 'Auditory cortex', nofit: true },
    mtg: { key: 'Middle_and_inferior_temporal_gyrus', ghost: true, mni: [-54, -40, 0], label: 'Middle temporal gyrus', nofit: true, noDot: true },
    m1: { key: 'Precentral_gyrus', ghost: true, label: 'Motor cortex', nofit: true },
    s1: { key: 'Postcentral_gyrus', ghost: true, label: 'Sensory cortex', nofit: true },
  },
  edges: [...PSY_BASE.edges,
    { id: 'ifg-stg', from: 'ifg', to: 'stg', via: [[-54, -6, 10]], sign: 'ctl', ev: 'human', act: m => m.prec },
    { id: 'm1-s1', from: 'm1', to: 's1', via: [[-40, -24, 58]], sign: 'ctl', ev: 'human', act: m => m.prec },
  ],
  vars: { ...PSY_BASE.vars, prec: 1 },
  discrete: ['rel'],
  model(v) { const m = PSY_BASE.model(v); m.prec = v.prec; m.heard = cl01(1 - 0.8 * v.prec); return m; },
  look: seeLook((m, S) => {
    const L = PSY_BASE.look(m, S);
    if (S.hud.speech) { L.Inferior_frontal_gyrus = { glow: 0.45, ec: '#c49bff', op: 0.3 }; L.Superior_temporal_gyrus_posterior_part = { glow: 0.25 + 0.6 * m.heard, ec: m.heard > 0.5 ? '#ff6b9a' : '#8fc2ff', op: 0.3 }; }
    if (S.hud.touch) { L.Precentral_gyrus = { glow: 0.45, ec: '#c49bff', op: 0.3 }; L.Postcentral_gyrus = { glow: 0.25 + 0.6 * m.heard, ec: m.heard > 0.5 ? '#ff6b9a' : '#8fc2ff', op: 0.3 }; }
    if (S.hud.lang) { L.Superior_temporal_gyrus_posterior_part = { glow: 0.6, ec: '#ffcf6b', op: 0.32 }; L.Middle_and_inferior_temporal_gyrus = { glow: 0.45, ec: '#ffcf6b', op: 0.28 }; }
    return L;
  }),
  insets: { ...PSY_BASE.insets, series: seriesInset, feed: feedInset, sig: sigInset },
  scenes: [
    { title: 'Previously / today', chapter: 'Highlighter', dur: 12, state: 'psychosis', cam: P3_CAM.terr, see: [], show: [], labels: [], inset: 'series', fx: {},
      kicker: 'Part 3', caption: 'Part 2: too much dopamine lands in the associative striatum.', ev: P3_EV.series,
      beats: [{ at: 6, see: ['cd'], hud: { tint: true }, relabel: ['cd'], fx: { spot: 'cd' }, kicker: 'Today', caption: 'Today: what that does to experience.' }] },
    { title: 'Dopamine teaches', chapter: 'Highlighter', dur: 22, state: 'healthy', cam: P3_CAM.terr, see: ['vta', 'nac'], show: ['vta-nac'], labels: ['vta', 'nac'], fx: { spot: 'nac' },
      kicker: 'Teaching signal', caption: 'A dopamine burst tags an event as worth learning.', ev: P3_EV.teach,
      beats: [
        { at: 3, token: { icon: 'spark', from: 'vta', to: 'nac', via: [[-6, -4, -12]], dur: 1.1, life: 0.9, cls: 'tkspark', size0: 0.3, grow: true, sal: () => 1.2 } },
        { at: 10, see: ['sn', 'cd'], show: ['vta-nac', 'nac-sn', 'sn-cd'], relabel: ['sn', 'cd'], tags: { 'nac-sn': 'untested link' }, fx: { spot: 'cd' }, kicker: 'This matters', caption: 'Some dopamine neurons fire for anything important, good or bad. That is salience.' },
        { at: 13, token: { icon: 'spark', from: 'sn', to: 'cd', via: [[-12, -6, -2], [-13, 4, 4]], dur: 1.2, life: 0.9, cls: 'tkspark', size0: 0.3, grow: true, sal: () => 1.2 } }] },
    { title: 'Two territories', chapter: 'Highlighter', dur: 18, state: 'healthy', cam: P3_CAM.terr, see: ['vta', 'nac', 'sn', 'cd'], show: ['vta-nac', 'nac-sn', 'sn-cd'], labels: ['nac', 'cd'], hud: { tint: true }, fx: { spot: 'nac' },
      kicker: 'Two territories', caption: 'The accumbens, in green, weighs value and mood.', ev: P3_EV.terr,
      beats: [{ at: 7, fx: { spot: 'cd' }, caption: 'The associative striatum, in lavender, shapes what you attend to and believe.' }] },
    { title: 'A healthy highlighter', chapter: 'Highlighter', dur: 20, state: 'healthy', cam: P3_CAM.feed, see: P3_A_SEE, show: P3_A_SHOW, labels: ['sn', 'cd'], hud: { tint: true }, inset: 'feed', fx: { tag: 'Healthy' },
      kicker: 'The highlighter', caption: 'Every day brings a stream of events. Dopamine in the associative striatum marks the few that matter.', ev: P3_EV.salience,
      beats: [{ at: 9, kicker: null, caption: 'Your name across a crowded room gets marked. The passing car does not.' }] },
    { title: 'The highlighter sticks', chapter: 'Highlighter', dur: 26, state: 'healthy', cam: P3_CAM.feed, see: P3_A_SEE, show: P3_A_SHOW, labels: ['cd'], hud: { tint: true }, inset: 'feed', fx: { tag: 'Healthy' },
      kicker: 'Gain up', caption: 'Now turn the gain up, as in Part 2.', ev: P3_EV.salience,
      beats: [
        { at: 2, tween: { pv: [0.15, 3], ctl: [0.45, 3] }, fx: { tag: 'Psychosis' } },
        { at: 7, kicker: null, caption: 'The highlighter starts marking neutral things.' },
        { at: 12, token: { icon: 'car', from: 'ctx', to: 'cd', via: [[-40, -12, -8], [-24, 2, 4]], kind: 'neutral', flash: 'sn-cd' }, caption: 'The passing car gets a burst. It feels important, for no reason.' },
        { at: 19, fx: { quote: PDQ.perceval_red } }] },
    { title: 'Delusional mood', chapter: 'Highlighter', dur: 22, state: 'psychosis', cam: P3_CAM.feed, see: P3_A_SEE, show: P3_A_SHOW, labels: [], hud: { tint: true }, inset: 'feed', fx: { tag: 'Psychosis' },
      kicker: 'Delusional mood', caption: 'Many things are marked, and none is explained.', ev: P3_EV.mood,
      beats: [{ at: 8, kicker: null, caption: 'The world feels strange and charged. Something is going on.' }, { at: 14, fx: { quote: PDQ.kraepelin_ref } }] },
    { title: 'The explanation', chapter: 'Highlighter', dur: 22, state: 'psychosis', cam: P3_CAM.feed, see: P3_A_SEE, show: P3_A_SHOW, labels: [], hud: { tint: true }, inset: 'feed', fx: { tag: 'Psychosis', threads: true, story: 'Something is going on…' },
      kicker: 'The explanation', caption: 'The mind joins the marks into a story.', ev: P3_EV.explain,
      beats: [
        { at: 7, fx: { story: '“They are watching me.”' }, kicker: null, caption: 'The story brings relief: now it all makes sense.' },
        { at: 14, caption: 'That story is the delusion.' }] },
    { title: 'Why it sticks', chapter: 'Highlighter', dur: 18, state: 'psychosis', cam: P3_CAM.feed, see: P3_A_SEE, show: P3_A_SHOW, labels: [], hud: { tint: true }, inset: 'feed', fx: { tag: 'Psychosis', threads: true, story: '“They are watching me.”' },
      kicker: 'Why it sticks', caption: 'Each new mark is read through the story…', ev: P3_EV.stick,
      beats: [{ at: 8, kicker: null, caption: '…and the highlighter keeps supplying new marks. Each one seems to confirm it.' }] },
    { title: 'Feeling picks the plot', chapter: 'Highlighter', dur: 24, state: 'psychosis', cam: P3_CAM.feed, see: P3_A_SEE, show: P3_A_SHOW, labels: [], hud: { tint: true }, inset: 'feed', fx: { tag: 'Psychosis', threads: true, plot: '' },
      kicker: 'The plot', caption: 'The same marks can carry different stories. Feeling picks the plot.', ev: P3_EV.plot,
      beats: [
        { at: 5, fx: { plot: 'Fear: “they are onto me”' }, kicker: 'Persecutory', caption: 'Fear and worry make it persecutory.' },
        { at: 11, fx: { plot: 'Mania: “it is a sign I have been chosen”' }, kicker: 'Grandiose', caption: 'Mania makes it grandiose.' },
        { at: 17, fx: { plot: 'Depression: “I deserve what is coming”' }, kicker: 'Guilty', caption: 'Depression makes it guilty. Part 6 comes back to this.' }] },

    { title: 'Signing your own moves', chapter: 'Signature', dur: 22, state: 'psychosis', set: { prec: 1 }, cam: P3_CAM.touch, see: ['m1', 's1'], show: ['m1-s1'], labels: ['m1', 's1'], hud: { touch: true }, inset: 'sig', fx: { sig: 'touch', tag: 'Healthy' },
      kicker: 'The signature', caption: 'When you move, a copy of the command tells your senses what to expect.', ev: P3_EV.tickle,
      beats: [{ at: 9, kicker: null, caption: 'So the touch is felt less. That is why you can’t tickle yourself.' }] },
    { title: 'Inner speech is signed too', chapter: 'Signature', dur: 20, state: 'psychosis', set: { prec: 1 }, cam: P3_CAM.speech, see: ['ifg', 'stg'], show: ['ifg-stg'], labels: ['ifg', 'stg'], hud: { speech: true }, inset: 'sig', fx: { sig: 'speech', tag: 'Healthy' },
      kicker: 'Speech', caption: 'Speech areas send the same copy to hearing areas, so your own voice is damped.', ev: P3_EV.speech,
      beats: [{ at: 9, kicker: null, caption: 'Aloud, or inside your head.' }] },
    { title: 'An unsigned voice', chapter: 'Signature', dur: 27, state: 'psychosis', set: { prec: 1 }, cam: P3_CAM.speech, see: ['ifg', 'stg'], show: ['ifg-stg'], labels: ['ifg', 'stg'], hud: { speech: true }, inset: 'sig', fx: { sig: 'speech', tag: 'Psychosis' },
      kicker: 'Unsigned', caption: 'In people who hear voices, the copy is imprecise. Their own voice is not damped.', ev: P3_EV.voices,
      beats: [
        { at: 2, tween: { prec: [0.22, 3] } },
        { at: 9, kicker: null, caption: 'The worse the imprecision, the worse the voices.' },
        { at: 15, caption: 'Inner speech arrives unsigned, and the highlighter makes it feel meant.' },
        { at: 21, fx: { quote: PDQ.kraepelin_loud } }] },
    { title: 'Passivity', chapter: 'Signature', dur: 22, state: 'psychosis', set: { prec: 0.22 }, cam: P3_CAM.touch, see: ['m1', 's1'], show: ['m1-s1'], labels: ['m1', 's1'], hud: { touch: true }, inset: 'sig', fx: { sig: 'touch', tag: 'Psychosis' },
      kicker: 'Passivity', caption: 'The same failure for movement: self-touch isn’t damped.', ev: P3_EV.passivity,
      beats: [{ at: 8, kicker: null, caption: 'An action arrives unsigned, and feels done to you.' }, { at: 14, fx: { quote: PDQ.perceval_hand } }] },
    { title: 'The bridge back to Part 1', chapter: 'Signature', dur: 21, state: 'psychosis', set: { prec: 0.3 }, cam: P3_CAM.speech, see: ['ifg', 'stg'], show: ['ifg-stg'], labels: ['ifg', 'stg'], hud: { speech: true }, inset: 'sig', fx: { sig: 'speech', gamma: true, tag: 'Psychosis' },
      kicker: 'Timing', caption: 'The copy rides on a fast rhythm linking frontal and temporal cortex.', ev: P3_EV.bridge,
      beats: [{ at: 8, kicker: null, caption: 'That coupling is weaker in patients who hallucinate. Part 1’s frayed rhythm may be one reason.' }, { at: 15, fx: { quote: PDQ.kraepelin_gap } }] },

    { title: 'Thought disorder', chapter: 'Loose links', dur: 24, state: 'psychosis', cam: P3_CAM.lang, see: ['stg', 'mtg', 'ifg'], show: [], labels: ['stg', 'mtg'], hud: { lang: true }, inset: 'feed', fx: { words: true, tag: 'Disorganised' },
      kicker: 'Loose links', caption: 'Speech can lose its thread. Each idea jumps to the next by sound or loose meaning.', ev: P3_EV.ftd,
      beats: [{ at: 13, kicker: null, caption: 'It tracks left superior and middle temporal cortex, part of the language network.' }] },
    { title: 'Recap', chapter: 'Loose links', dur: 22, state: 'psychosis', cam: P3_CAM.feed, see: P3_A_SEE, show: P3_A_SHOW, labels: [], hud: { tint: true }, inset: 'feed', fx: { threads: true, story: '“They are watching me.”', tag: 'Recap' },
      kicker: 'Recap', caption: 'The highlighter gives delusions. The missing signature gives voices and passivity. Loose links give thought disorder.', ev: P3_EV.salience,
      beats: [{ at: 12, kicker: 'Next', caption: 'Part 4: what goes missing.' }] },
  ],
});
