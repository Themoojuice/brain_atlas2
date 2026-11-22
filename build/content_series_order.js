// ---------------------------------------------------------------- the series: list order and part-to-part buttons
// Loaded last. The Stories list shows the eight parts in order, then the network view; each part's last scene
// gets a button on to the next part that exists.
{
  const order = [...SERIES.map(p => p.id), 'net'];
  STORIES.sort((a, b) => (order.indexOf(a.id) + 1 || 99) - (order.indexOf(b.id) + 1 || 99));
  for (const p of SERIES) {
    const def = STORIES.find(s => s.id === p.id); if (!def) continue;
    const last = def.scenes[def.scenes.length - 1], nx = nextPart(p.id);
    if (nx.length && !(last.controls || []).some(c => c.next)) last.controls = [...(last.controls || []), ...nx.map(c => ({ ...c, next: true }))];
  }
}
