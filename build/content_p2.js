// ---------------------------------------------------------------- Part 2 · The chain of brakes
// Mental model: a brake on a brake on a brake. The ventral pallidum holds most dopamine neurons silent; the hippocampus
// controls that brake through the accumbens. A loud hippocampus drives the accumbens, the accumbens silences the pallidum,
// the pallidum lets go, and more dopamine neurons wake: more gain on every event. The excess spirals up to the associative
// striatum, where each terminal also makes and releases more. Model: the gain story's (PSY_BASE); cs walks the cascade
// one hop at a time (0 = only the hippocampus changed, 4 = every station has followed).

const P2_CAM = {
  chain: { dir: MED, fit: ['ahp', 'nac', 'vp', 'vta', 'fxb'], r: 22, pad: 14 },
  res: { dir: MED, fit: ['vp', 'vta', 'nac'], r: 20, pad: 16 },
  hp: { fit: ['ahp', 'nac', 'fxb'], dir: MED, r: 22, pad: 14 },
  nv: { fit: ['nac', 'vp', 'vta'], dir: MED, r: 20, pad: 16 },
  spiral: { fit: ['vta', 'nac', 'sn', 'cd'], dir: MED, r: 20, pad: 14 },
  term: { target: 'cd', r: 18, dir: [-0.7, 0.55, 0.55] },
  land: { dir: [-0.75, 0.45, 0.55], fit: ['cd', 'nac', 'sn'], r: 20, pad: 14 },
  stress: { dir: MED, fit: ['ctx', 'ahp', 'nac', 'vta'], r: 22, pad: 14 },
};
const P2_EDGES = ['hp-nac', 'nac-vp', 'vp-vta', 'vta-nac'], P2_ALL = [...P2_EDGES, 'nac-sn', 'sn-cd'];
const P2_SEE = ['ahp', 'fxb', 'nac', 'vp', 'vta'], P2_SEE_ALL = [...P2_SEE, 'sn', 'cd'];
const P2_EV = {
  series: 'Part 2 of the series. The circuit is the hippocampus–ventral striatum–pallidum–midbrain loop described in rats (Grace 2016, review, ' + doi('10.1038/nrn.2016.57') + ').',
  reserve: 'In rats, most ventral tegmental dopamine neurons are held silent by ventral pallidal inhibition; only spontaneously active neurons can fire the bursts that carry reward signals (Floresco 2003, from the project research library; Grace 2016, ' + doi('10.1038/nrn.2016.57') + '). Confidence high in animals; dopamine neuron population activity has not been measured in people.',
  gain: 'More spontaneously active dopamine neurons means a larger dopamine response to the same stimulus (Lodge &amp; Grace 2006, recalled). The burst sizes here are illustrative.',
  hp: 'Hippocampal hypermetabolism in CA1 predicts conversion to psychosis and spreads to the subiculum at onset (Schobel 2013, ' + doi('10.1016/j.neuron.2013.02.011') + '); hippocampal hyperperfusion in psychosis, a state marker (McHugo 2019, ' + doi('10.1176/appi.ajp.2019.19020151') + '). Confidence high in patients.',
  fornix: 'Ventral subiculum projects to the accumbens through the fornix and drives it (Grace 2016, rats, ' + doi('10.1038/nrn.2016.57') + '). The tract drawn is the fornix from a human tractography atlas.',
  brake: 'Accumbens → ventral pallidum is inhibitory (GABA); ventral pallidum → ventral tegmental area is inhibitory (Grace 2016, rats). Confidence high in animals.',
  lift: 'Hippocampal overdrive increases the number of spontaneously active dopamine neurons through this pathway; knocking down hippocampal parvalbumin interneurons does the same (Lodge 2009, ' + doi('10.1523/JNEUROSCI.5419-08.2009') + '; Boley 2014, ' + doi('10.1016/j.schres.2014.05.005') + '; rats). Confidence high in animals.',
  spiral: 'Striato-nigro-striatal spirals let ventral striatum influence dopamine cells projecting to dorsal striatum (Haber 2000, primate anatomy, recalled). Their role in psychosis is untested, so the link is dotted.',
  terminal: 'Psychosis versus controls, meta-analysis: dopamine synthesis capacity g 0.65, release 0.66, synaptic dopamine 0.78 (Brugger 2020, ' + doi('10.1016/j.biopsych.2019.07.008') + '). Vesicular transporter binding normal (Taylor 2000, ' + doi('10.1016/S0893-133X(00)00165-2') + '). Confidence high.',
  land: 'The dopamine elevation in schizophrenia is greatest in the associative (dorsal) striatum (McCutcheon 2019, review, ' + doi('10.1016/j.tins.2018.12.004') + '). Which atlas parcel counts as which territory is my judgment.',
  stress: 'In rats, stress raises ventral hippocampal activity and dopamine neuron population activity through the same route (Valenti 2011, from the project research library). People at clinical high risk release more striatal dopamine under psychosocial stress (Mizrahi 2012, from the project research library). Confidence moderate.',
  doors: 'Temporal lobe epilepsy: psychosis in about 7% (Clancy 2014, ' + doi('10.1186/1471-244X-14-75') + '); raised dopamine synthesis in epilepsy with psychosis (Reith 1994, from the project research library). Methamphetamine: psychosis risk 5.3 times higher during use, 11.2 at 16 or more days a month, Sydney and Brisbane cohort (McKetin 2013, ' + doi('10.1001/jamapsychiatry.2013.283') + '). Cannabis: 34% transition from cannabis-induced psychosis (Murrie 2020, ' + doi('10.1093/schbul/sbz102') + ') yet lower dopamine synthesis in users (Bloomfield 2014, ' + doi('10.1016/j.biopsych.2013.05.027') + '). Levodopa psychosis: recalled. Confidence moderate.',
  human: 'Human hippocampus–striatal dopamine coupling: positive (Allen 2016, ' + doi('10.1176/appi.ajp.2015.15040485') + '), null in a larger sample (Howes 2020, ' + doi('10.1038/s41386-019-0541-2') + '), negative in people with poor outcome (Modinos 2021, ' + doi('10.1038/s41386-021-01019-0') + '). The two ends of the chain are well supported in patients; the middle is inferred from rats.',
};
const burstTok = (S, big) => S.spawn({ icon: 'spark', from: 'vta', to: 'nac', via: [[-6, -4, -12]], dur: 1.1, life: 0.9, kind: 'burst', cls: 'tkspark', size0: 0.3, grow: true,
  sal: S2 => 0.45 + 1.8 * cl01((S2.m.pop - 0.25) / 0.65), onArrive: S2 => S2.flashEdge('vta-nac', 0.3 + 0.7 * cl01(S2.m.pop)) });

STORIES.push({ ...PSY_BASE, id: 'p2', name: 'Part 2 · The chain of brakes', color: '#ffb454', reveal: true, noStates: true, shell: '#7a8494',
  desc: 'How a loud hippocampus reaches dopamine: a brake on a brake on a brake, more dopamine neurons awake, and the excess landing in the associative striatum. Fourteen short scenes.',
  keyIntro: '<div class="t">The chain card</div><div class="note">Stations from left to right: interneuron, hippocampus, accumbens, ventral pallidum, dopamine cells, striatum. Arrows excite; bars brake. The bar on the pallidum lifts as that brake weakens. The dots in the gold box are dopamine neurons awake enough to burst. Meters and dots are illustrative units, read from the same model as the brain.</div>',
  discrete: ['rel'],
  look: seeLook(PSY_BASE.look),
  insets: { ...PSY_BASE.insets, series: seriesInset, chain: chainInset },
  scenes: [
    { title: 'Previously / today', chapter: 'Chain', dur: 13, state: 'psychosis', set: { cs: 0 }, cam: P2_CAM.hp, see: [], show: [], labels: [], inset: 'series', fx: {},
      kicker: 'Part 2', caption: 'Part 1: the interneuron brake dims and the hippocampus gets loud.', ev: P2_EV.series,
      beats: [{ at: 6, see: ['ahp'], hud: { ring: true }, relabel: ['ahp'], fx: { spot: 'ahp' }, kicker: 'Today', caption: 'Today: how a loud hippocampus reaches the dopamine system.' }] },
    { title: 'The dopamine reserve', chapter: 'Chain', dur: 18, state: 'healthy', cam: P2_CAM.res, see: ['vta'], show: [], labels: ['vta'], inset: 'chain', fx: { ch: ['DA'], chi: null, spot: 'vta' },
      kicker: 'Reserve', caption: 'Most dopamine neurons in the ventral tegmental area sit silent.', ev: P2_EV.reserve,
      beats: [{ at: 7, see: ['vp'], show: ['vp-vta'], relabel: ['vp', 'vta'], fx: { ch: ['VP', 'DA'], chi: ['VP', 'DA'], spot: 'vp' }, kicker: 'The brake', caption: 'The ventral pallidum holds them quiet. A reserve, not a deficit.' }] },
    { title: 'Gain', chapter: 'Chain', dur: 22, state: 'healthy', set: { vtax: 0 }, cam: P2_CAM.res, see: ['vta', 'vp', 'nac'], show: ['vp-vta', 'vta-nac'], labels: ['vta', 'nac'], inset: 'chain', fx: { ch: ['VP', 'DA'], chi: 'DA', spot: 'vta' },
      kicker: 'Gain', caption: 'Only awake neurons can burst. A piece of good news, with few awake:', ev: P2_EV.gain,
      beats: [
        { at: 4, do: S => burstTok(S) },
        { at: 8, tween: { vtax: [0.38, 2] }, kicker: null, caption: 'Now wake more of them…' },
        { at: 12.5, do: S => burstTok(S), caption: '…and the same news gives a bigger burst. That is gain.' },
        { at: 18.5, tween: { vtax: [0, 1.5] } }] },
    { title: 'Station 1: a loud hippocampus', chapter: 'Chain', dur: 19, state: 'psychosis', set: { cs: 0 }, cam: P2_CAM.hp, see: ['ahp', 'vp', 'vta'], show: [], labels: ['ahp'], inset: 'chain', hud: { ring: true }, fx: { ch: ['IN', 'HP', 'VP', 'DA'], chi: ['IN', 'HP'], spot: 'ahp' },
      kicker: 'Station 1', caption: 'Back to the hippocampus, loud since its interneuron brakes dimmed.', ev: P2_EV.hp,
      beats: [{ at: 8, kicker: 'In patients', caption: 'Scans show the front of it overactive before, and at, the first episode.' }] },
    { title: 'Station 2: down the fornix', chapter: 'Chain', dur: 18, state: 'psychosis', set: { cs: 0 }, cam: P2_CAM.hp, see: ['ahp', 'fxb', 'vp', 'vta', 'nac'], show: ['hp-nac'], labels: ['ahp', 'fxb', 'nac'], levels: { Fornix: 1 }, inset: 'chain', hud: { ring: true }, fx: { ch: ['IN', 'HP', 'NA', 'VP', 'DA'], chi: ['HP', 'NA'], spot: 'nac' },
      kicker: 'Station 2', caption: 'The subiculum sends its excitement down the fornix to the accumbens.', ev: P2_EV.fornix,
      beats: [{ at: 2.5, tween: { cs: [1, 3] } }, { at: 10, kicker: null, caption: 'The accumbens fires harder.' }] },
    { title: 'Station 3: a brake on the brake', chapter: 'Chain', dur: 20, state: 'psychosis', set: { cs: 1 }, cam: P2_CAM.nv, see: P2_SEE, show: ['hp-nac', 'nac-vp'], labels: ['nac', 'vp'], inset: 'chain', fx: { ch: ['IN', 'HP', 'NA', 'VP', 'DA'], chi: ['NA', 'VP'], spot: 'vp' },
      kicker: 'Station 3', caption: 'The accumbens inhibits the ventral pallidum.', ev: P2_EV.brake,
      beats: [{ at: 3, tween: { cs: [2, 3] } }, { at: 9, kicker: null, caption: 'The pallidum is a brake. The accumbens is now braking the brake.' }] },
    { title: 'Station 4: the brake lifts', chapter: 'Chain', dur: 21, state: 'psychosis', set: { cs: 2 }, cam: P2_CAM.nv, see: P2_SEE, show: P2_EDGES, labels: ['vp', 'vta'], inset: 'chain', fx: { ch: ['IN', 'HP', 'NA', 'VP', 'DA'], chi: ['VP', 'DA'], spot: 'vta' },
      kicker: 'Station 4', caption: 'A quieter pallidum lets go of the dopamine neurons.', ev: P2_EV.lift,
      beats: [{ at: 2.5, tween: { cs: [4, 4] } }, { at: 10, kicker: null, caption: 'More of them wake. The gain goes up, on every event.' }, { at: 15, do: S => burstTok(S) }] },
    { title: 'Recap: the double negative', chapter: 'Chain', dur: 22, state: 'psychosis', set: { cs: 0 }, cam: P2_CAM.chain, see: P2_SEE, show: P2_EDGES, labels: [], inset: 'chain', fx: { ch: ['IN', 'HP', 'NA', 'VP', 'DA'], chi: null, ledger: 0, tag: 'Slowly, once more' },
      kicker: 'Recap', caption: 'Slowly, once more.', ev: P2_EV.lift,
      beats: [
        { at: 2, tween: { cs: [1, 2.4] }, fx: { ledger: 1, chi: ['HP', 'NA'] }, relabel: ['ahp', 'nac'], caption: 'A loud hippocampus excites the accumbens.' },
        { at: 6.5, tween: { cs: [2, 2.4] }, fx: { ledger: 2, chi: ['NA', 'VP'] }, relabel: ['nac', 'vp'], caption: 'The accumbens brakes the pallidum.' },
        { at: 11, tween: { cs: [3, 2.4] }, fx: { ledger: 3, chi: ['VP', 'DA'] }, relabel: ['vp', 'vta'], caption: 'So the pallidum stops braking the dopamine cells.' },
        { at: 15.5, tween: { cs: [4, 2.4] }, fx: { ledger: 4, chi: null }, relabel: ['vta'], caption: 'Brake the brake, and you release. More dopamine.' }] },
    { title: 'Spiral up', chapter: 'Where it lands', dur: 19, state: 'psychosis', cam: P2_CAM.spiral, see: P2_SEE, show: P2_EDGES, labels: [], inset: 'chain', tags: { 'nac-sn': 'untested link' }, fx: { ch: CH_ST.filter(s => s !== 'ST'), chi: 'DA' },
      kicker: 'Spiral', caption: 'The accumbens feeds back onto dopamine cells in the substantia nigra.', ev: P2_EV.spiral,
      beats: [
        { at: 1.5, see: ['sn'], show: [...P2_EDGES, 'nac-sn'], relabel: ['sn'], fx: { spot: 'sn' } },
        { at: 8, see: ['cd'], show: P2_ALL, relabel: ['cd'], fx: { ch: CH_ST, chi: ['DA', 'ST'], spot: 'cd' }, caption: 'They carry the excess up into the caudate head.' }] },
    { title: 'Inside the terminal', chapter: 'Where it lands', dur: 17, state: 'psychosis', cam: P2_CAM.term, see: P2_SEE_ALL, show: ['sn-cd'], labels: ['cd'], inset: 'terminal', fx: { spot: 'cd' },
      kicker: 'Terminal', caption: 'Each nigral terminal in the caudate makes and releases more dopamine.', ev: P2_EV.terminal,
      beats: [{ at: 8, kicker: null, caption: 'The vesicle transporter looks normal, so the extra comes from making and releasing more.' }] },
    { title: 'Where it lands', chapter: 'Where it lands', dur: 18, state: 'psychosis', cam: P2_CAM.land, see: P2_SEE_ALL, show: ['vta-nac', 'nac-sn', 'sn-cd'], labels: ['cd', 'nac'], hud: { tint: true }, inset: 'chain', fx: { ch: CH_ST, chi: 'ST' },
      kicker: 'Associative', caption: 'The excess is greatest in the associative striatum, which steers attention and belief.', ev: P2_EV.land,
      beats: [{ at: 9, kicker: null, caption: 'Gold marks the excess. Part 3 asks what it does to experience.' }] },
    { title: 'Stress takes the same road', chapter: 'Doors', dur: 20, state: 'healthy', set: { hpx: 0.25 }, cam: P2_CAM.stress, see: P2_SEE, show: P2_EDGES, labels: ['ahp'], inset: 'chain', fx: { ch: CH_ST.filter(s => s !== 'ST'), chi: ['HP', 'DA'], spot: 'ahp', doors: [] },
      kicker: 'Stress', caption: 'Stress drives the same route, through the hippocampus.', ev: P2_EV.stress,
      beats: [
        { at: 2, token: { icon: 'bolt', from: 'ctx', to: 'ahp', dur: 1.6, life: 1, sal: () => 1.3, onArrive: S2 => S2.tween('hpx', 0.8, 2.5) } },
        { at: 10, relabel: ['vta'], fx: { spot: 'vta' }, kicker: 'In people', caption: 'People at high risk of psychosis release more dopamine under stress.' }] },
    { title: 'Many doors, one chain', chapter: 'Doors', dur: 26, state: 'psychosis', cam: P2_CAM.chain, see: P2_SEE_ALL, show: P2_ALL, labels: [], inset: 'chain', fx: { ch: CH_ST, chi: null, doors: [] },
      kicker: 'Doors', caption: 'Different causes enter the chain at different stations.', ev: P2_EV.doors,
      beats: [
        { at: 4, fx: { doors: ['nmda'], chi: 'IN' }, caption: 'NMDA receptor blockers, at the interneuron (Part 1).' },
        { at: 8.5, fx: { doors: ['nmda', 'epi'], chi: 'HP' }, caption: 'Temporal lobe epilepsy and stress, at the hippocampus.' },
        { at: 13, fx: { doors: ['nmda', 'epi', 'stim'], chi: 'ST' }, caption: 'Methamphetamine and levodopa, straight at the dopamine terminal.' },
        { at: 18.5, fx: { doors: ['nmda', 'epi', 'stim', 'can'], chi: null }, kicker: 'Unknown', caption: 'Cannabis raises the risk yet lowers dopamine synthesis. Its door is still a question mark.' }] },
    { title: 'What we know in people', chapter: 'Doors', dur: 26, state: 'psychosis', cam: P2_CAM.chain, see: P2_SEE_ALL, show: P2_ALL, labels: [], inset: 'chain', fx: { ch: CH_ST, chi: null, human: true, tag: 'Evidence' },
      kicker: 'Evidence', caption: 'In rats, every link is shown. In people, the loud hippocampus and the striatal excess are seen; the links between are inconsistent.', ev: P2_EV.human,
      beats: [
        { at: 9, fx: { human: false, tag: 'Recap' }, kicker: 'Recap', caption: 'A loud hippocampus, a brake on a brake, more neurons awake, excess in the associative striatum.' },
        { at: 18, kicker: 'Next', caption: 'Part 3: what that excess feels like from the inside.' }] },
  ],
});
