// ================= the linear series: shared parts =================
// Psychosis and mood, step by step: eight parts, each one mental model carried by one side card, one idea per beat.
// Storyboard: Claude Doc "Psychosis and mood circuits: checked pathways and animation storyboard", tab "Linear series plan"
// and one sub-tab per part. Part 5 is the affective v2 story (content_story_aff2.js).
const doi = d => `<a href="https://doi.org/${d}" target="_blank" rel="noopener">DOI</a>`;
const SERIES = [
  { id: 'p1', n: 1, short: 'Where it starts', col: '#ff7a6b' },
  { id: 'p2', n: 2, short: 'The chain of brakes', col: '#ffb454' },
  { id: 'p3', n: 3, short: 'When everything matters', col: '#ffd34d' },
  { id: 'p4', n: 4, short: 'What goes missing', col: '#8fc2ff' },
  { id: 'aff2', n: 5, short: 'How mania builds', col: '#ff9f43' },
  { id: 'p6', n: 6, short: 'One trunk, three illnesses', col: '#c49bff' },
  { id: 'p7', n: 7, short: 'When movement locks', col: '#7fe0d0' },
  { id: 'p8', n: 8, short: 'Turning it down', col: '#9fd3ff' },
];
const SERIES_GLYPH = {
  p1: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v4.5M12 17v4.5M2.5 12H7M17 12h4.5M5.3 5.3l3.1 3.1M15.6 15.6l3.1 3.1M18.7 5.3l-3.1 3.1"/>',
  p2: '<rect x="2" y="8.5" width="11" height="7" rx="3.5"/><rect x="11" y="8.5" width="11" height="7" rx="3.5"/>',
  p3: '<path d="M5 19l2.6-.8L18.5 7.3l-2-2L5.8 16.4z"/><path d="M14.6 7.2l2.1 2.1M3.5 21.5h9"/>',
  p4: '<circle cx="12" cy="12" r="7.5" stroke-dasharray="2.6 2.6"/>',
  aff2: '<path d="M18.5 8.5a7.5 7.5 0 1 0 1 5.5"/><path d="M19.5 3.5v5h-5"/>',
  p6: '<path d="M12 21.5v-8.5M12 13L5.5 5.5M12 13l6.5-7.5M12 13V3.5"/>',
  p7: '<circle cx="12" cy="4.8" r="2.5"/><path d="M12 7.8v7.4M12 15.2l-2.6 6.3M12 15.2l2.6 6.3M7 10.5h10"/>',
  p8: '<g transform="rotate(-40 12 12)"><rect x="3" y="8.5" width="18" height="7" rx="3.5"/><path d="M12 8.5v7"/></g>',
};
const seriesItem = id => SERIES.find(p => p.id === id);
const seriesNext = id => { const i = SERIES.findIndex(p => p.id === id); for (let j = i + 1; j < SERIES.length; j++) if (STORIES.some(s => s.id === SERIES[j].id)) return SERIES[j]; return null; };
// last-scene button: on to the next built part
const nextPart = id => { const nx = seriesNext(id); return nx ? [{ type: 'button', label: `Next: Part ${nx.n} · ${nx.short} ›`, do: () => startStory(nx.id) }] : []; };

// opening card of every part: eight icons, the current one lit, parts not yet built drawn dashed
function seriesInset(S) {
  const cur = seriesItem(S.def.id) || SERIES[0], x = i => 22 + i * 38.3;
  const icons = SERIES.map((p, i) => {
    const built = STORIES.some(s => s.id === p.id), on = p.id === cur.id, past = p.n < cur.n;
    const col = on ? p.col : built ? '#8d9bad' : '#4a5462';
    return `<g opacity="${on ? 1 : past ? 0.75 : built ? 0.55 : 0.4}"><circle cx="${x(i).toFixed(1)}" cy="22" r="${on ? 15 : 12.5}" fill="${on ? 'rgba(255,255,255,0.06)' : '#0d141d'}" stroke="${col}" stroke-width="${on ? 2.4 : 1.5}" ${built ? '' : 'stroke-dasharray="3 3"'}/>
      <g transform="translate(${(x(i) - (on ? 9 : 7.5)).toFixed(1)} ${on ? 13 : 14.5}) scale(${on ? 0.75 : 0.625})" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SERIES_GLYPH[p.id]}</g>
      <text x="${x(i).toFixed(1)}" y="48" text-anchor="middle" class="${on ? 'lab' : 'sub'}" ${on ? `fill="${p.col}"` : ''}>${p.n}</text></g>`;
  }).join('');
  const html = `<div class="t lt"><span>Psychosis and mood, step by step</span><b>Part ${cur.n} of 8</b></div>
    <svg viewBox="0 0 312 62" class="cardsvg"><line x1="22" y1="22" x2="290" y2="22" stroke="#3a4452" stroke-width="2"/>${icons}
      <text x="156" y="60" text-anchor="middle" class="lab" fill="${cur.col}">${cur.short}</text></svg>`;
  return { html };
}

// show / dim / hide named groups inside a card: fx.<show> lists what has been introduced, fx.<hi> what is in focus
function cardGroups(prefix, names, show, hi) {
  const H = hi ? [].concat(hi) : null;
  for (const nm of names) {
    const el = document.getElementById(prefix + nm); if (!el) continue;
    const on = !show || show.includes(nm);
    el.classList.toggle('off', !on); el.classList.toggle('dim', on && !!H && !H.includes(nm));
  }
}
const setText = (el, t) => { if (el && el.textContent !== t) el.textContent = t; };
const setAttrs = (el, o) => { if (el) for (const [k, v] of Object.entries(o)) el.setAttribute(k, typeof v === 'number' ? v.toFixed(2) : v); };
// deterministic 0–1 hash, for animation that must look random but repeat identically
const hash01 = (a, b = 0) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
// reveal-mode stories: only structures already introduced (in `see`) take their look; L._keep lists keys always allowed
const seeLook = fn => (m, S) => {
  const L = fn(m, S); if (!S.def.reveal || !S.see) return L;
  const ok = new Set(L._keep || []); for (const id of S.see) { const n = S.def.nodes[id]; if (n && n.key) ok.add(n.key); }
  return Object.fromEntries(Object.entries(L).filter(([k]) => k !== '_keep' && ok.has(k)));
};

// ---------------------------------------------------------------- the chain card (Parts 2 and 8)
// Interneuron ⊣ hippocampus → accumbens ⊣ pallidum ⊣ dopamine cells → striatum, each with a level meter, read live from
// the cascade model (PSY_BASE). fx.ch = stations introduced, fx.chi = in focus, fx.ledger = 0–4 sign steps,
// fx.doors = causes entering at a station, fx.human = dash the links unproven in people, fx.clips / fx.dial for Part 8.
const CH_ST = ['IN', 'HP', 'NA', 'VP', 'DA', 'ST'];
const CH_X = { IN: 14, HP: 62, NA: 118, VP: 174, DA: 232, ST: 288 };
const CH_DOORS = {
  nmda: { st: 'IN', row: 0, label: '▲ NMDA blockers', anchor: 'start', x: 2 },
  epi: { st: 'HP', row: 1, label: '▲ epilepsy, stress', anchor: 'middle' },
  can: { st: 'NA', row: 0, label: '? cannabis', anchor: 'middle', x: 151, unknown: true },
  stim: { st: 'ST', row: 1, label: 'methamphetamine, levodopa ▲', anchor: 'end', x: 310 },
};
function chainInset(S) {
  const Y = 38, lab = (x, a, b, id) => `<text class="lab" x="${x}" y="${Y + 28}" text-anchor="middle" style="font-size:8.8px">${a}</text>${b ? `<text class="sub" x="${x}" y="${Y + 38}" text-anchor="middle">${b}</text>` : ''}`;
  const meter = x => `<rect x="${x - 18}" y="${Y + 44}" width="36" height="5" rx="2.5" fill="rgba(141,155,173,0.22)"/><rect class="mt" x="${x - 18}" y="${Y + 44}" width="0" height="5" rx="2.5"/>`;
  const st = (id, inner, a, b, col) => `<g id="ch-${id}" class="grp">${inner}${lab(CH_X[id], a, b)}${meter(CH_X[id])}</g>`;
  const circ = (id, r, col) => `<circle class="body" cx="${CH_X[id]}" cy="${Y}" r="${r}" fill="#0d141d" stroke="${col}" stroke-width="2"/>`;
  const dots = [...Array(16)].map((_, i) => `<circle class="dad" cx="${220 + (i % 4) * 8}" cy="${Y - 12 + Math.floor(i / 4) * 8}" r="2.6" fill="#3a4452"/>`).join('');
  const link = (id, x0, x1, col, cap) => `<g id="chl-${id}" class="grp"><line class="ln" x1="${x0}" y1="${Y}" x2="${x1}" y2="${Y}" stroke="${col}" stroke-width="2.4"/>${cap === 'bar'
    ? `<line class="cap" x1="${x1}" y1="${Y - 7}" x2="${x1}" y2="${Y + 7}" stroke="${col}" stroke-width="3.4" stroke-linecap="round"/>`
    : `<path class="cap" d="M${x1 - 6} ${Y - 4.5} L${x1} ${Y} L${x1 - 6} ${Y + 4.5}" fill="none" stroke="${col}" stroke-width="2.2"/>`}</g>`;
  const doors = Object.entries(CH_DOORS).map(([k, d]) => `<text id="chd-${k}" class="sub" x="${d.x ?? CH_X[d.st]}" y="${Y + 62 + d.row * 11}" text-anchor="${d.anchor}" fill="${d.unknown ? '#c9d4e2' : '#ffcf9e'}" opacity="0">${d.label}</text>`).join('');
  const LED = ['excite', '× brake', '× brake', '= more dopamine'];
  const html = `<div class="t lt"><span>The chain of brakes</span><b id="chTag"></b></div>
  <svg viewBox="0 0 312 118" class="cardsvg" id="chsvg">
    ${link('IN', 22, 47, '#4aa8ff', 'bar')}${link('HP', 76, 103, '#ff9f43', 'arrow')}${link('NA', 132, 159, '#4aa8ff', 'bar')}${link('VP', 188, 211, '#4aa8ff', 'bar')}${link('DA', 252, 274, '#ffd34d', 'arrow')}
    <g id="chPk">${[0, 1, 2].map(() => '<circle r="2.3" fill="#ffd34d" opacity="0"/>').join('')}</g>
    ${st('IN', circ('IN', 7, '#6cc4ff'), 'Inter-', 'neuron', '#6cc4ff')}
    ${st('HP', circ('HP', 13, '#ff8a3d'), 'Hippocampus', 'subiculum')}
    ${st('NA', circ('NA', 13, '#ff9f43'), 'Accumbens', '')}
    ${st('VP', circ('VP', 13, '#7cc4ff'), 'Pallidum', 'the brake')}
    ${st('DA', `<rect class="body" x="213" y="${Y - 19}" width="38" height="38" rx="7" fill="#0d141d" stroke="#ffd34d" stroke-width="2"/>${dots}`, 'Dopamine', 'cells awake')}
    ${st('ST', circ('ST', 12, '#a98bff'), 'Striatum', 'associative')}
    <g id="chDoors">${doors}</g>
    <text id="chLed" class="lab" x="156" y="${Y + 66}" text-anchor="middle">${LED.map((w, i) => `<tspan class="ld" opacity="0" fill="${i === 0 ? '#ffb36b' : i === 3 ? '#ffd34d' : '#8fc2ff'}">${w} </tspan>`).join('')}</text>
  </svg>`;
  return { html, tick(m, now) {
    const q = id => document.getElementById(id), fx = S.fx; if (!q('chsvg')) return;
    const shown = fx.ch || CH_ST, hi = fx.chi;
    cardGroups('ch-', CH_ST, shown, hi);
    // a link shows once both its ends are on the card; it is in focus if either end is
    const nxt = { IN: 'HP', HP: 'NA', NA: 'VP', VP: 'DA', DA: 'ST' };
    for (const [a, b] of Object.entries(nxt)) {
      const el = q('chl-' + a); if (!el) continue; const on = shown.includes(a) && shown.includes(b), H = hi ? [].concat(hi) : null;
      el.classList.toggle('off', !on); el.classList.toggle('dim', on && !!H && !(H.includes(a) && H.includes(b)));
    }
    setText(q('chTag'), fx.tag || '');
    const lv = { IN: m.pvEff, HP: m.hpOut, NA: m.nac, VP: m.vp, DA: m.pop, ST: m.assocDA };
    const col = { IN: '#6cc4ff', HP: '#ff8a3d', NA: '#ff9f43', VP: '#7cc4ff', DA: '#ffd34d', ST: '#ffc21a' };
    for (const id of CH_ST) { const g = q('ch-' + id); if (!g) continue; const mt = g.querySelector('.mt'); mt.setAttribute('width', (36 * cl01(lv[id])).toFixed(1)); mt.setAttribute('fill', col[id]); }
    q('ch-HP').querySelector('.body').setAttribute('fill', mixHex('#0d141d', '#7a3a18', cl01((m.hpOut - 0.3) / 0.5)));
    q('ch-ST').querySelector('.body').setAttribute('fill', mixHex('#0d141d', '#8a6a10', cl01((m.assocDA - 0.45) / 0.35)));
    const lit = Math.round(cl01(m.pop) * 16); document.querySelectorAll('#chsvg .dad').forEach((d, i) => d.setAttribute('fill', i < lit ? '#ffd34d' : '#3a4452'));
    // the brakes: bar thickness follows the braking station's output; the pallidal brake lifts as it weakens
    const brake = (id, v) => { const el = q('chl-' + id); if (!el) return; const c = el.querySelector('.cap'), ln = el.querySelector('.ln');
      c.setAttribute('stroke-width', (1 + 3.6 * v).toFixed(2)); c.setAttribute('transform', `translate(0 ${(-7 * (1 - v)).toFixed(1)})`); c.setAttribute('opacity', (0.35 + 0.65 * v).toFixed(2));
      ln.setAttribute('stroke-width', (1 + 2.6 * v).toFixed(2)); };
    brake('IN', m.pvEff); brake('NA', cl01((m.nacOut - 0.3) / 0.6)); brake('VP', cl01(m.stream / 0.85));
    q('chl-HP').querySelector('.ln').setAttribute('stroke-width', (1 + 3 * cl01(m.hpOut)).toFixed(2));
    // dashed where human evidence is inconsistent
    for (const id of ['HP', 'NA', 'VP']) q('chl-' + id).querySelector('.ln').setAttribute('stroke-dasharray', fx.human ? '4 4' : 'none');
    // dopamine packets towards the striatum, more when more neurons are awake
    const n = 1 + Math.round(2 * cl01(m.assocDA)), on = shown.includes('DA') && shown.includes('ST');
    document.querySelectorAll('#chPk circle').forEach((c, i) => { const p = ((now / 1000) * (0.5 + m.assocDA) + i / 3) % 1; setAttrs(c, { cx: (254 + 19 * p).toFixed(1), cy: 38, opacity: on && i < n ? (1 - p * 0.5).toFixed(2) : 0 }); });
    const led = fx.ledger || 0; document.querySelectorAll('#chLed .ld').forEach((t, i) => t.setAttribute('opacity', i < led ? 1 : 0));
    const ds = fx.doors || []; for (const k of Object.keys(CH_DOORS)) q('chd-' + k)?.setAttribute('opacity', ds.includes(k) ? 1 : 0);
  } };
}

// first-person quotes (public domain only): shown under a card, never read aloud. fx.quote = { q, who }
const QUOTE_DIV = '<div class="qt" id="qtBox" hidden></div>';
function quoteTick(fx) {
  const el = document.getElementById('qtBox'); if (!el) return;
  const q = fx.quote, key = q ? q.q : '';
  if (el.dataset.k === key) return; el.dataset.k = key;
  if (!q) { el.hidden = true; el.innerHTML = ''; return; }
  el.hidden = false; el.innerHTML = `“${q.q}”<cite>${q.who}</cite>`;
}
const PDQ = {
  perceval_red: { q: '…it was of red silk; the impression came on my mind that it was a token of ill to me', who: 'John Perceval, Narrative, 1840 (public domain)' },
  kraepelin_ref: { q: 'I feel myself referred to there.', who: 'A patient, in Kraepelin, Dementia Praecox, 1919 translation' },
  kraepelin_loud: { q: 'I have the feeling, as if some one beside me said out loud what I think.', who: 'A patient, in Kraepelin, 1919 translation' },
  perceval_hand: { q: 'My hand struck that blow, but it was involuntary on my part, as if my hand had been moved by a violent wind.', who: 'John Perceval, Narrative, 1840 (public domain)' },
  kraepelin_gap: { q: '…the more tormenting the shorter the moment is between my thoughts and the corresponding utterance of the voices.', who: 'A patient, in Kraepelin, 1919 translation' },
  perceval_sound: { q: '…the sound remained but the voice was gone', who: 'John Perceval, Narrative, 1840 (public domain)' },
};
