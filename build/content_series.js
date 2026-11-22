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
