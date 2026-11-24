// ---------------------------------------------------------------- Part 8 · Turning it down: treatment along the chain
// Mental model: every treatment acts at one station of Part 2's chain. Antipsychotics turn down the speaker (block D2
// receptors in the striatum; the excess is still there). A muscarinic agonist turns down the source (less released).
// Neither fixes the hippocampus. What is left explains side effects, relapse after stopping, and the third who don't
// respond. Model, illustrative units: drive at the striatum = release × receptors × (1 − 0.85 × occupancy);
// psychosis above 0.5. release = awake dopamine neurons × (1 − 0.4 × muscarinic). Healthy drive ≈ 0.4, untreated ≈ 0.84.

const P8_CAM = {
  chain: { dir: MED, fit: ['ahp', 'nac', 'vp', 'vta', 'sn', 'cd'], r: 22, pad: 14 },
  st: { dir: [-0.75, 0.45, 0.55], fit: ['cd', 'nac', 'sn'], r: 20, pad: 14 },
  roads: { dir: [-1, 0.05, 0.35], fit: ['put', 'sn', 'hyp', 'pit', 'nac', 'vta'], r: 22, pad: 12 },
};
const P8_EV = {
  series: 'Part 8 of the series: treatments mapped onto the chain from Part 2.',
  speaker: 'Antipsychotics share D2 receptor blockade in the striatum; presynaptic dopamine synthesis and release are not normalised (standard pharmacology; the excess persists on PET). Confidence high.',
  window: 'First-episode schizophrenia, PET: clinical response likely above about 65% striatal D2 occupancy, prolactin elevation above about 72%, extrapyramidal side effects above about 78% (Kapur 2000, ' + doi('10.1176/appi.ajp.157.4.514') + '). Confidence high.',
  roads: 'The same blockade acts on every dopamine pathway: nigrostriatal (parkinsonism), tuberoinfundibular (prolactin; dopamine normally inhibits its release) and mesolimbic (dysphoria and secondary negative symptoms at high occupancy: Mizrahi 2007, n 12, from the project research library). Pathways drawn schematically; the pituitary point is approximate.',
  musc: 'Xanomeline stimulates M1 and M4 muscarinic receptors, reducing striatal dopamine release upstream of the receptor; trospium, which stays outside the brain, blocks peripheral cholinergic side effects (mechanism mostly from rodents, recalled). United States: FDA approval 26 Sep 2024. Australia: not on the ARTG at the last direct check, 18 Nov 2026; no listing found in a web search, 22 Nov 2026.',
  lite: 'For predominant negative symptoms, a network meta-analysis favoured amisulpride and cariprazine among the agents studied (Krause 2018, from the project research library). Low-dose amisulpride acts mainly on presynaptic receptors (recalled). Cariprazine is PBS-listed for schizophrenia (checked 19 Nov 2026). Confidence moderate.',
  super: 'Long-term D2 blockade upregulates D2 receptors; abrupt withdrawal can produce rebound or supersensitivity psychosis, and supersensitivity is proposed to contribute to treatment resistance (Chouinard 2017, from the project research library; prevalence figures to re-check before quoting). Receptor numbers here are illustrative. Confidence moderate to low.',
  third: 'Antipsychotic responders had higher striatal dopamine synthesis than treatment-resistant patients (effect size 1.11) and healthy volunteers (1.12); resistant patients did not differ from healthy volunteers, 12 per group (Demjaha 2012, ' + doi('10.1176/appi.ajp.2012.12010144') + '; also Keshavan 2026 in the project library). Small samples: confidence moderate.',
  cloz: 'Clozapine is the only drug with consistent efficacy in treatment-resistant schizophrenia (Kane 1988 and later meta-analyses, recalled). Its mechanism of benefit is not known, so it has no station on the chain. In Australia it needs registration with a monitoring programme for neutrophil counts (recalled).',
  upstream: 'N-acetylcysteine (a glutathione precursor) gave mixed results in early psychosis (Conus 2018, ' + doi('10.1093/schbul/sbx093') + '). Kv3 channel modulators aim to restore fast interneuron firing (early trials, recalled). Phase 3 failures: emraclidine (EMPOWER-1 and -2, Nov 2024), ulotaront (DIAMOND 1 and 2, Jul 2023), iclepertin (CONNEX 1–3, Jan 2025); company releases, from the project research library, checked 18–19 Nov 2026.',
  other: 'Mania: Part 5. Catatonia: Part 7. Psychotic depression: antidepressant plus antipsychotic, or electroconvulsive therapy (Oliva 2024, from the project research library). Confidence moderate.',
};
const P8_PSY = { pv: 0.15, ctl: 0.45, cs: 4, occ: 0, musc: 0, rec: 1, hpx: -1, vtax: 0 };
const OTHER_HTML = `<div class="t">Treatment elsewhere in the series</div><div class="mini3">
  <div><b>Mania</b><span>Lithium, D2 block, regular sleep and rhythm</span><i>Part 5</i></div>
  <div><b>Catatonia</b><span>Lorazepam first; electroconvulsive therapy if not</span><i>Part 7</i></div>
  <div><b>Psychotic depression</b><span>Antidepressant plus antipsychotic, or electroconvulsive therapy</span><i>Part 6</i></div></div>`;

STORIES.push({ ...PSY_BASE, glossInline: ['xanomeline', 'trospium'], id: 'p8', name: 'Part 8 · Turning it down', color: '#9fd3ff', reveal: true, noStates: true, shell: '#7a8494',
  desc: 'Where each treatment acts on the chain: the D2 speaker and its occupancy window, side effects, a muscarinic drug at the source, negative symptoms, rebound, the dopamine-normal third and clozapine. Thirteen short scenes.',
  keyIntro: '<div class="t">The chain card, with drugs</div><div class="note">Clips show where a drug acts. The bar is striatal D2 occupancy, with the 65% (response), 72% (prolactin) and 78% (stiffness and tremor) thresholds from first-episode PET. Hexagons on the striatum in the brain are D2 blockade; green rounds are the muscarinic drug. Drive and receptor numbers are illustrative.</div>',
  nodes: { ...PSY_BASE.nodes,
    put: { key: 'Putamen', mni: [-25, 2, 2], label: 'Putamen (movement)', lo: [0, 12] },
    hyp: { key: 'Hypothalamus', mni: [-3, -2, -12], label: 'Hypothalamus', lo: [0, 12] },
    pit: { mni: [-1, 6, -34], label: 'Pituitary (approx.)', r: 1.4, dot: '#ffd34d' },
  },
  edges: [...PSY_BASE.edges,
    { id: 'sn-put', from: 'sn', to: 'put', via: [[-16, -12, -6]], sign: 'da', ev: 'human', act: m => m.release * (1 - 0.85 * m.occ) },
    { id: 'hyp-pit', from: 'hyp', to: 'pit', via: [[-2, 2, -24]], sign: 'da', ev: 'human', act: m => 0.45 * (1 - 0.85 * m.occ) },
  ],
  capsets: [{ ...PSY_BASE.capsets[0], var: 'occ' }, PSY_BASE.capsets[1]],
  vars: { ...PSY_BASE.vars, occ: 0, rec: 1 },
  discrete: ['rel'],
  model(v) {
    const base = PSY_BASE.model({ ...v, d2: 0, musc: 0 });
    const release = base.pop * (1 - 0.45 * v.musc), drive = release * v.rec * (1 - 0.85 * v.occ);
    return { ...base, release, drive, occ: v.occ, rec: v.rec, musc: v.musc, d2: v.occ, eff: cl01(drive), assocDA: cl01(drive), limbicDA: cl01(0.4 + 0.35 * (drive - 0.4)) };
  },
  gauge: { gain: m => m.eff, raw: m => m.release, pop: m => m.pop },
  look: seeLook((m, S) => {
    const L = PSY_BASE.look(m, S);
    L.Putamen = { glow: 0.15 + 0.5 * cl01(m.release * (1 - 0.85 * m.occ)), ec: '#ffd34d' };
    L.Hypothalamus = { glow: 0.3, ec: '#ffd34d' };
    return L;
  }),
  insets: { ...PSY_BASE.insets, series: seriesInset, chain: chainInset },
  scenes: [
    { title: 'Previously / today', chapter: 'The speaker', dur: 12, state: 'psychosis', set: P8_PSY, cam: P8_CAM.chain, see: [], show: [], labels: [], inset: 'series', fx: {},
      kicker: 'Part 8', caption: 'The chain, the symptoms, the illnesses. Today: where each treatment acts on the chain.', ev: P8_EV.series,
      beats: [{ at: 6, see: ['ahp', 'fxb', 'nac', 'vp', 'vta', 'sn', 'cd'], show: P2_ALL, kicker: null, caption: 'The chain is still running hot: too much dopamine reaching the associative striatum.' }] },
    { title: 'The speaker, not the source', chapter: 'The speaker', dur: 22, state: 'psychosis', set: P8_PSY, cam: P8_CAM.st, see: P2_SEE_ALL, show: P2_ALL, labels: ['cd'], hud: { shields: true }, inset: 'chain', fx: { ch: CH_ST, chi: ['DA', 'ST'], clips: [], spot: 'cd' },
      kicker: 'Antipsychotic', caption: 'Antipsychotics block D2 receptors in the striatum.', ev: P8_EV.speaker,
      beats: [
        { at: 2, tween: { occ: [0.7, 3] }, fx: { clips: ['d2'] } },
        { at: 9, kicker: null, caption: 'The excess dopamine is still there. It just lands on fewer free receptors.' },
        { at: 15.5, caption: 'They turn down the speaker, not the source.' }] },
    { title: 'The window', chapter: 'The speaker', dur: 27, state: 'psychosis', set: { ...P8_PSY, occ: 0.4 }, cam: P8_CAM.st, see: P2_SEE_ALL, show: P2_ALL, labels: [], hud: { shields: true }, inset: 'chain', fx: { ch: CH_ST, chi: 'ST', clips: ['d2'], dial: true },
      kicker: 'Occupancy', caption: 'How much is enough? Below about 65% of receptors blocked, usually too little.', ev: P8_EV.window,
      beats: [
        { at: 6, tween: { occ: [0.67, 2.5] }, kicker: 'Response', caption: 'Around 65%, psychosis usually settles.' },
        { at: 12.5, tween: { occ: [0.75, 2] }, kicker: 'Prolactin', caption: 'Above about 72%, prolactin rises.' },
        { at: 18.5, tween: { occ: [0.82, 2] }, kicker: 'Stiffness', caption: 'Above about 78%, stiffness and tremor appear.' },
        { at: 23, tween: { occ: [0.68, 2] }, kicker: null, caption: 'The aim is the narrow band in between.' }] },
    { title: 'Same block, other roads', chapter: 'The speaker', dur: 24, state: 'psychosis', set: { ...P8_PSY, occ: 0.8 }, cam: P8_CAM.roads, see: [...P2_SEE_ALL, 'put'], show: ['sn-put'], labels: ['put'], hud: { shields: true }, tags: {}, inset: 'chain', fx: { ch: CH_ST, chi: 'ST', clips: ['d2'], dial: true, spot: 'put' },
      kicker: 'Side effects', caption: 'The block lands wherever dopamine goes. In the putamen: stiffness, tremor, restlessness.', ev: P8_EV.roads,
      beats: [
        { at: 8, see: ['hyp', 'pit'], show: ['sn-put', 'hyp-pit'], tags: {}, relabel: ['hyp', 'pit'], fx: { spot: 'hyp' }, kicker: 'Prolactin', caption: 'Dopamine normally holds prolactin down. Block it, and prolactin rises.' },
        { at: 16, show: ['sn-put', 'hyp-pit', 'vta-nac'], tags: { 'vta-nac': 'drive and mood' }, relabel: ['nac'], fx: { spot: 'nac' }, kicker: 'Drive', caption: 'In the accumbens: flatness and low drive, the look-alikes from Part 4.' }] },
    { title: 'Turning down the source', chapter: 'The source', dur: 24, state: 'psychosis', set: P8_PSY, cam: P8_CAM.st, see: P2_SEE_ALL, show: P2_ALL, labels: ['cd'], hud: { shields: true }, inset: 'chain', fx: { ch: CH_ST, chi: ['DA', 'ST'], clips: [], spot: 'cd' },
      kicker: 'Muscarinic', caption: 'Xanomeline stimulates M1 and M4 receptors, which turn down dopamine release upstream.', ev: P8_EV.musc,
      beats: [
        { at: 2, tween: { musc: [1, 3] }, fx: { clips: ['musc'] } },
        { at: 9, kicker: null, caption: 'Less is released, so less reaches the receptors. Trospium blocks its effects outside the brain.' },
        { at: 17, kicker: 'Australia', caption: 'Approved in the US in 2024. Not on the Australian register as of November 2026.' }] },
    { title: 'A lighter touch', chapter: 'The source', dur: 20, state: 'psychosis', set: { ...P8_PSY, occ: 0.5 }, cam: P8_CAM.st, see: P2_SEE_ALL, show: P2_ALL, labels: [], hud: { shields: true }, inset: 'chain', fx: { ch: CH_ST, chi: 'ST', clips: ['lite'], dial: true },
      kicker: 'Negative symptoms', caption: 'For mainly negative symptoms, a lighter touch can help.', ev: P8_EV.lite,
      beats: [{ at: 7, kicker: null, caption: 'Low-dose amisulpride, or cariprazine, a partial agonist that leans on D3. Cariprazine is PBS-listed.' }] },
    { title: 'Why stopping suddenly is risky', chapter: 'Course', dur: 28, state: 'psychosis', set: { ...P8_PSY, occ: 0.7, rec: 1 }, cam: P8_CAM.st, see: P2_SEE_ALL, show: P2_ALL, labels: ['cd'], hud: { shields: true }, inset: 'chain', fx: { ch: CH_ST, chi: 'ST', clips: ['d2'], recep: true, tag: 'On treatment', spot: 'cd' },
      kicker: 'Months', caption: 'Months of blockade: the striatum adds D2 receptors to compensate.', ev: P8_EV.super,
      beats: [
        { at: 2, tween: { rec: [1.35, 5] } },
        { at: 10, tween: { occ: [0, 0.8] }, fx: { clips: [], tag: 'Stopped abruptly' }, kicker: 'Stopped', caption: 'Stop suddenly, and the extra receptors meet the old excess.' },
        { at: 17, kicker: 'Rebound', caption: 'Psychosis can come back harder, and sometimes becomes harder to treat.' },
        { at: 23, kicker: null, caption: 'Reduce slowly, with a plan.' }] },
    { title: 'The dopamine-normal third', chapter: 'Course', dur: 24, state: 'healthy', set: { occ: 0, musc: 0, rec: 1 }, cam: P8_CAM.chain, see: P2_SEE_ALL, show: P2_ALL, labels: [], inset: 'chain', fx: { ch: CH_ST, chi: ['HP', 'ST'], clips: ['q'], tag: 'Treatment-resistant' },
      kicker: 'Resistant', caption: 'About a third don’t respond to D2 block.', ev: P8_EV.third,
      beats: [
        { at: 7, kicker: 'On PET', caption: 'In them, striatal dopamine synthesis looks like healthy volunteers’. There is no excess to block.' },
        { at: 15, tween: { occ: [0.7, 2] }, fx: { clips: ['q', 'd2'] }, kicker: null, caption: 'Blocking more receptors just adds side effects. Something else is driving the psychosis.' }] },
    { title: 'Clozapine', chapter: 'Course', dur: 18, state: 'healthy', set: { occ: 0.45, musc: 0, rec: 1 }, cam: P8_CAM.chain, see: P2_SEE_ALL, show: P2_ALL, labels: [], inset: 'chain', fx: { ch: CH_ST, chi: null, clips: ['q', 'cloz'], tag: 'Treatment-resistant' },
      kicker: 'Clozapine', caption: 'Clozapine still works for many of them.', ev: P8_EV.cloz,
      beats: [{ at: 7, kicker: null, caption: 'How it does is not known, so it has no station on the chain.' }] },
    { title: 'Hopes upstream', chapter: 'Course', dur: 22, state: 'psychosis', set: P8_PSY, cam: P8_CAM.chain, see: [...P2_SEE_ALL], show: P2_ALL, labels: [], hud: { ring: true }, inset: 'chain', fx: { ch: CH_ST, chi: 'IN', clips: ['kv3', 'nacy'] },
      kicker: 'Upstream', caption: 'Some targets sit earlier in the chain: a Kv3 channel drug to help interneurons fire, N-acetylcysteine to restore glutathione.', ev: P8_EV.upstream,
      beats: [{ at: 11, fx: { failed: true, chi: null }, kicker: 'Not yet', caption: 'Several recent candidates failed in phase 3 trials.' }] },
    { title: 'Elsewhere in the series', chapter: 'Course', dur: 16, state: 'psychosis', set: P8_PSY, cam: P8_CAM.chain, see: P2_SEE_ALL, show: P2_ALL, labels: [], inset: { kind: 'html', html: OTHER_HTML }, fx: {},
      kicker: 'Other illnesses', caption: 'Mania, catatonia and psychotic depression each have their own treatments.', ev: P8_EV.other },
    { title: 'The whole series in one lap', chapter: 'Recap', dur: 30, state: 'psychosis', set: { ...P8_PSY, cs: 0 }, cam: P8_CAM.chain, see: P2_SEE_ALL, show: P2_ALL, labels: [], hud: { ring: true }, inset: 'chain', fx: { ch: CH_ST, chi: 'IN', clips: [] },
      kicker: 'Recap', caption: 'Interneurons dim, and the hippocampus gets loud.', ev: P8_EV.series,
      beats: [
        { at: 5, tween: { cs: [2, 3] }, fx: { chi: ['HP', 'NA', 'VP'] }, caption: 'A brake on a brake lets dopamine neurons wake.' },
        { at: 10, tween: { cs: [4, 3] }, fx: { chi: ['DA', 'ST'] }, caption: 'The excess lands in the associative striatum: delusions and voices.' },
        { at: 16, tween: { occ: [0.68, 2.5] }, fx: { chi: null, clips: ['d2', 'musc', 'q', 'kv3'] }, kicker: 'Treatment', caption: 'D2 block at the speaker, muscarinic at the source, upstream targets still to come.' },
        { at: 23, kicker: 'End', caption: 'That is the series. The network view goes deeper, for when you’re ready.' }] },
    { title: 'Free play', chapter: 'Free play', free: true, dur: 0, state: 'psychosis', set: { ...P8_PSY, hpx: 0.95 }, cam: P8_CAM.chain, see: P2_SEE_ALL, show: P2_ALL, labels: ['ahp', 'vta', 'cd'], hud: { shields: true, ring: true }, inset: 'chain', fx: { ch: CH_ST, clips: ['d2', 'musc'], dial: true },
      caption: 'Drag the hippocampus, the D2 occupancy or the muscarinic drug, and watch the striatum.', ev: P8_EV.window,
      controls: [{ type: 'range', var: 'hpx', label: 'Hippocampal drive', min: 0.2, max: 1 }, { type: 'range', var: 'occ', label: 'D2 occupancy', min: 0, max: 0.95 }, { type: 'toggle', var: 'musc', label: 'Muscarinic agonist' },
        { type: 'button', label: 'Network view (advanced) ›', do: () => startStory('net') }] },
  ],
});
