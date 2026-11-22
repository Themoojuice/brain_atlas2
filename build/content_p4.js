// ---------------------------------------------------------------- Part 4 · What goes missing: negative and cognitive symptoms
// Mental model: signal to noise. When the highlighter marks everything, real rewards stop standing out, so nothing pulls
// hard enough to be worth the effort. Separately, Part 1's frayed rhythm can't hold a thought in mind. Some of what looks
// like negative symptoms is added on top: depression, sedation, too much D2 block.
// Model: PSY_BASE for the gain; background marks = 0.06 + 0.6 × excess; the reward's mark = 0.85 × (1 − 0.55 × occupancy);
// pull = reward − background (both scaled down by D2 block); rhythm sets how many working-memory slots hold.

function holdInset(S) {
  const icons = ['coin', 'person', 'bird'].map((k, i) => `<g id="wm${i}" transform="translate(${222 + i * 32} 44)"><rect x="-13" y="-13" width="26" height="26" rx="6" fill="#0d141d" stroke="#8fc2ff" stroke-width="1.5"/>
    <g transform="translate(-9 -9) scale(0.75)" fill="none" stroke="#e7edf4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[k].replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g></g>`).join('');
  const html = `<div class="t lt"><span>Holding a thought</span><b id="wmTag"></b></div>
  <svg viewBox="0 0 312 84" class="cardsvg" id="wmsvg">
    <text class="lab" x="6" y="14">Gamma rhythm <tspan class="sub">slowed down</tspan></text><text id="wmRs" class="sub" x="196" y="14" text-anchor="end"></text>
    <line x1="6" y1="44" x2="196" y2="44" stroke="#3a4452" stroke-width="1"/><polyline id="wmWave" fill="none" stroke="#6cc4ff" stroke-width="1.8" points=""/>
    <text class="lab" x="254" y="14" text-anchor="middle">Working memory</text>${icons}<text id="wmN" class="sub" x="254" y="76" text-anchor="middle"></text>
  </svg>`;
  return { html, tick(m, now) {
    const q = id => document.getElementById(id); if (!q('wmsvg')) return;
    setText(q('wmTag'), S.fx.tag || '');
    const t = now / 1000, f = 1.4, R = m.rhythm ?? 1; let pts = '';
    for (let x = 6; x <= 196; x += 2) { const tt = t - (196 - x) / 95, s = Math.sin(2 * Math.PI * f * tt), nz = 0.55 * Math.sin(2 * Math.PI * 2.3 * tt + 1) + 0.45 * Math.sin(2 * Math.PI * 3.7 * tt + 2) + 0.35 * Math.sin(2 * Math.PI * 0.9 * tt);
      pts += `${x},${(44 - 12 * (0.45 + 0.55 * R) * (R * s + (1 - R) * 0.75 * nz)).toFixed(1)} `; }
    setAttrs(q('wmWave'), { points: pts, stroke: mixHex('#c07a7a', '#6cc4ff', R) });
    setText(q('wmRs'), R > 0.7 ? 'in time' : R > 0.4 ? 'fraying' : 'lost');
    let held = 0; for (let i = 0; i < 3; i++) { const o = cl01((R - 0.15 - i * 0.27) / 0.18); if (o > 0.5) held++; q('wm' + i).setAttribute('opacity', (0.12 + 0.88 * o).toFixed(2)); }
    setText(q('wmN'), `${held} of 3 held`);
  } };
}
const LANES = hi => ({ kind: 'html', html: `<div class="t">Two kinds of missing</div><div class="mini2">
  <div class="${hi === 'shown' ? 'on' : hi ? 'off' : ''}"><b>Less shown</b><span>Flat face and voice, few words</span></div>
  <div class="${hi === 'wanted' ? 'on' : hi ? 'off' : ''}"><b>Less wanted</b><span>Little drive, little pleasure in looking forward, withdrawal</span></div></div>` });
const TOPDOWN_HTML = `<div class="t">Dopamine: too much below, too little above</div><div class="bars2">
  <div><b>Associative striatum</b><i style="width:82%;background:#ffd34d"></i><span>raised</span></div>
  <div><b>Prefrontal cortex</b><i style="width:28%;background:#4aa8ff"></i><span>lower release</span></div></div>`;
const COG_HTML = `<div class="t">Cognition at the first episode</div><div class="cog">
  <div class="scale"><span>0</span><span>−0.5</span><span>−1.0</span><span>−1.5 SD</span></div>
  <div class="track"><i style="left:${0.64 / 1.5 * 100}%;width:${(1.2 - 0.64) / 1.5 * 100}%"></i></div>
  <div class="note">All 10 domains fall in this band (effect sizes −0.64 to −1.20). Largest: verbal memory and processing speed.</div></div>`;

const P4_CAM = {
  st: { dir: [-0.75, 0.45, 0.55], fit: ['cd', 'nac', 'vta'], r: 20, pad: 14 },
  expr: { dir: [0.75, 0.4, 0.4], fit: ['m1', 'cb'], r: 30, pad: 10 },
  pfc: { dir: [0.6, 0.55, 0.6], fit: ['dl', 'cd'], r: 28, pad: 10 },
};
const P4_EV = {
  series: 'Part 4 of the series. Negative and cognitive symptoms predict everyday functioning more than positive symptoms do (recalled: Green 1996).',
  lanes: 'Negative symptoms split into two factors: diminished expression and amotivation (Blanchard 2006; Galderisi 2018; both from the project research library). Confidence high (factor analyses).',
  drown: 'Ventral striatal hypoactivation during reward anticipation in psychosis, 23 studies, 917 patients, Cohen d −0.50 (left) and −0.70 (right); left-side deficit worse with more negative symptoms, r −0.41 (Radua 2015, ' + doi('10.1001/jamapsychiatry.2015.2196') + '). Reading this as signal lost in noise is the aberrant salience account (Kapur 2003; Maia &amp; Frank 2017). Confidence moderate to high for the finding, moderate for the explanation.',
  effort: 'People with schizophrenia are less willing to spend effort for reward, while in-the-moment pleasure is often intact (recalled: Gold 2013; Gard 2007). Confidence moderate.',
  shown: 'Expression deficits tracked motor and cerebellar perfusion; alogia tracked fronto-striatal perfusion; motivation tracked neither, 47 patients vs 44 controls (Gangl 2023, from the project research library). That patients often feel more than they show is recalled. Confidence moderate.',
  rhythm: 'Parvalbumin-driven gamma supports holding information in mind (Sohal 2009, mice, ' + doi('10.1038/nature07991') + '); prefrontal gamma during cognitive control is reduced in schizophrenia (Cho 2006, recalled). Slot counts are illustrative. Confidence moderate.',
  topdown: 'Amphetamine-induced dopamine release is lower in dorsolateral prefrontal cortex in schizophrenia, the opposite of the striatum (Slifstein 2015, from the project research library). Confidence moderate to high (one main PET study).',
  cog: 'First-episode schizophrenia, 47 studies, 2,204 patients: medium-to-large impairments across 10 domains (effect sizes −0.64 to −1.20), largest in immediate verbal memory and processing speed, about as large as in established illness (Mesholam-Gately 2009, ' + doi('10.1037/a0014708') + '). Confidence high.',
  look: 'Depression in 32.6% of stable outpatients with schizophrenia (Etchecopar-Etchart 2021, 18 studies). D2 occupancy and dysphoria, n 12 (Mizrahi 2007); best subjective experience at 60–70% occupancy, n 24 (de Haan 2003). All from the project research library. Confidence moderate.',
};
const P4_SEE = ['vta', 'nac', 'sn', 'cd'];

STORIES.push({ ...PSY_BASE, id: 'p4', name: 'Part 4 · What goes missing', color: '#8fc2ff', reveal: true, noStates: true, shell: '#7a8494',
  desc: 'Negative and cognitive symptoms: real rewards drowned out by a noisy highlighter, less shown and less wanted, a rhythm too frayed to hold a thought, and the look-alikes. Ten short scenes.',
  keyIntro: '<div class="t">The cards</div><div class="note">The feed card now carries real rewards (coins, amber border). The bar is how strongly a reward stands out from the background marks. The working-memory card links Part 1’s gamma rhythm to how many items stay held. Units are illustrative.</div>',
  nodes: { ...PSY_BASE.nodes,
    m1: { key: 'Precentral_gyrus', ghost: true, label: 'Motor cortex', nofit: true },
    cb: { key: 'Cerebellum', mni: [-20, -62, -30], label: 'Cerebellum', lo: [0, 12] },
  },
  vars: { ...PSY_BASE.vars, occ: 0, rhy: 1 },
  discrete: ['rel'],
  model(v) {
    const m = PSY_BASE.model(v), g = cl01((m.assocDA - 0.45) / 0.35), bg = 0.06 + 0.6 * g, rew = 0.85 * (1 - 0.55 * v.occ);
    return { ...m, bg, rew, pull: cl01(rew - bg * (1 - 0.4 * v.occ)), occ: v.occ, rhythm: v.rhy };
  },
  look: seeLook((m, S) => {
    const L = { _keep: ['Precentral_gyrus', 'Middle_frontal_gyrus'] };
    L.Nucleus_accumbens = { glow: 0.08 + 0.7 * cl01(m.pull), ec: '#ffd34d' };
    L.Caudate_nucleus = { glow: 0.5 * cl01((m.assocDA - 0.45) / 0.35), ec: '#ffc21a' };
    L.VTA = { glow: 0.15 + 0.6 * cl01((m.pop - 0.3) / 0.6), ec: '#ffd34d' };
    L.Substantia_nigra = { glow: 0.5 * cl01((m.assocDA - 0.4) / 0.4), ec: '#ffd34d' };
    if (S.hud.expr) { L.Precentral_gyrus = { glow: 0.12, ec: '#4a6fa5', op: 0.22 }; L.Cerebellum = { col: '#7d8aa0', glow: 0.18, ec: '#4a6fa5' }; }
    if (S.hud.pfc) L.Middle_frontal_gyrus = S.hud.pfc === 'low' ? { glow: 0.12, ec: '#4a6fa5', op: 0.26 } : { glow: 0.12 + 0.5 * m.rhythm, ec: '#6cc4ff', op: 0.3 };
    return L;
  }),
  insets: { ...PSY_BASE.insets, series: seriesInset, feed: feedInset, wm: holdInset },
  scenes: [
    { title: 'Previously / today', chapter: 'Signal and noise', dur: 13, state: 'psychosis', cam: P4_CAM.st, see: [], show: [], labels: [], inset: 'series', fx: {},
      kicker: 'Part 4', caption: 'Part 3 was about what is added. Today: what is taken away.', ev: P4_EV.series,
      beats: [{ at: 6.5, see: P4_SEE, kicker: null, caption: 'These symptoms last longer, and shape everyday life more.' }] },
    { title: 'Two kinds of missing', chapter: 'Signal and noise', dur: 18, state: 'psychosis', cam: P4_CAM.st, see: P4_SEE, show: [], labels: [], inset: LANES(null), fx: {},
      kicker: 'Negative symptoms', caption: 'Less shown: a flat face and voice, few words.', ev: P4_EV.lanes,
      beats: [{ at: 8, caption: 'Less wanted: little drive, little pleasure in looking forward, pulling away from people.' }] },
    { title: 'Drowned rewards', chapter: 'Signal and noise', dur: 27, state: 'healthy', set: { occ: 0 }, cam: P4_CAM.st, see: P4_SEE, show: ['vta-nac', 'nac-sn', 'sn-cd'], labels: ['nac'], inset: 'feed', fx: { reward: true, pull: true, tag: 'Healthy', spot: 'nac' },
      kicker: 'Rewards', caption: 'In a healthy brain, a real reward stands out clearly from the background.', ev: P4_EV.drown,
      beats: [
        { at: 8, tween: { pv: [0.15, 3], ctl: [0.45, 3] }, fx: { tag: 'Psychosis' }, kicker: 'Gain up', caption: 'Now the highlighter marks everything, as in Part 3…' },
        { at: 15, kicker: null, caption: '…and the reward no longer stands out. Its pull drops.' },
        { at: 21, kicker: 'In patients', caption: 'The reward circuit barely responds while patients wait for a reward. More negative symptoms, weaker response.' }] },
    { title: 'No pull, no effort', chapter: 'Signal and noise', dur: 18, state: 'psychosis', cam: P4_CAM.st, see: P4_SEE, show: ['vta-nac', 'nac-sn', 'sn-cd'], labels: ['nac'], inset: 'feed', fx: { reward: true, pull: true, tag: 'Psychosis', spot: 'nac' },
      kicker: 'Effort', caption: 'Without that pull, effort stops looking worth it.', ev: P4_EV.effort,
      beats: [{ at: 8, kicker: null, caption: 'Pleasure in the moment is often intact. What fades is wanting, looking forward.' }] },
    { title: 'Less shown', chapter: 'Signal and noise', dur: 20, state: 'psychosis', cam: P4_CAM.expr, see: [...P4_SEE, 'm1', 'cb'], show: [], labels: ['m1', 'cb'], hud: { expr: true }, inset: LANES('shown'), fx: {},
      kicker: 'Expression', caption: 'Flat expression tracks blood flow in motor cortex and cerebellum.', ev: P4_EV.shown,
      beats: [{ at: 9, kicker: null, caption: 'People often feel more than they can show.' }] },
    { title: 'Back to the rhythm', chapter: 'Cognition', dur: 22, state: 'psychosis', set: { rhy: 1 }, cam: P4_CAM.pfc, see: ['dl'], show: [], labels: ['dl'], hud: { pfc: 'rhythm' }, inset: 'wm', fx: { tag: 'Healthy' },
      kicker: 'Cognition', caption: 'Part 1’s gamma rhythm holds information in mind.', ev: P4_EV.rhythm,
      beats: [
        { at: 7, tween: { rhy: [0.25, 4] }, fx: { tag: 'Dimmed interneurons' }, kicker: null, caption: 'As the interneurons dim, the rhythm frays, and working memory drops items.' },
        { at: 15, caption: 'Attention, memory and planning all suffer.' }] },
    { title: 'Too little dopamine up top', chapter: 'Cognition', dur: 18, state: 'psychosis', cam: P4_CAM.pfc, see: ['dl', 'cd'], show: [], labels: ['dl', 'cd'], hud: { pfc: 'low' }, inset: { kind: 'html', html: TOPDOWN_HTML }, fx: {},
      kicker: 'Prefrontal', caption: 'In prefrontal cortex, dopamine release is lower in schizophrenia.', ev: P4_EV.topdown,
      beats: [{ at: 8, kicker: null, caption: 'The opposite of the striatum. Too much below, too little above.' }] },
    { title: 'Early, broad, stable', chapter: 'Cognition', dur: 20, state: 'psychosis', cam: P4_CAM.pfc, see: ['dl'], show: [], labels: [], inset: { kind: 'html', html: COG_HTML }, fx: {},
      kicker: 'First episode', caption: 'Cognitive deficits are already there at the first episode, across all ten domains tested.', ev: P4_EV.cog,
      beats: [{ at: 9, kicker: null, caption: 'They are about as large as in long illness. Part 1’s dimming starts early.' }] },
    { title: 'Look-alikes', chapter: 'Look-alikes', dur: 25, state: 'psychosis', set: { occ: 0 }, cam: P4_CAM.st, see: P4_SEE, show: ['vta-nac', 'nac-sn', 'sn-cd'], labels: ['nac'], hud: { shields: true }, inset: 'feed', fx: { reward: true, pull: true, tag: 'Psychosis' },
      kicker: 'Look-alikes', caption: 'Some negative symptoms are added on top. Depression affects about a third of stable outpatients.', ev: P4_EV.look,
      beats: [
        { at: 10, tween: { occ: [0.85, 3] }, fx: { tag: 'High D2 block' }, kicker: 'Too much block', caption: 'Too much D2 block dulls the reward signal along with the noise.' },
        { at: 18, kicker: null, caption: 'People feel worst at high occupancy, and best around 60 to 70%.' }] },
    { title: 'Recap', chapter: 'Look-alikes', dur: 20, state: 'psychosis', set: { occ: 0 }, cam: P4_CAM.st, see: P4_SEE, show: ['vta-nac', 'nac-sn', 'sn-cd'], labels: [], inset: 'feed', fx: { reward: true, pull: true, tag: 'Recap' },
      kicker: 'Recap', caption: 'Positive symptoms: too loud in the wrong place. Negative: real signals drowned, plus look-alikes. Cognitive: the rhythm lost early.', ev: P4_EV.drown,
      beats: [{ at: 12, kicker: 'Next', caption: 'Part 5: the mood loop, and how mania builds.' }] },
  ],
});
