"""Headless QA for the atlas: console errors, circuit framing on phones, and one screenshot per story scene.
Usage: python3 qa_story.py [phone|desk|small] [circuits|stories|all] [story_id:scene,...]"""
import asyncio, sys, json, os
from playwright.async_api import async_playwright
V = '/home/claude/vendor/package/'
OUT = '/home/claude/shots/qa'; os.makedirs(OUT, exist_ok=True)
VIEWPORTS = {'phone': ({'width': 390, 'height': 844}, True), 'small': ({'width': 360, 'height': 800}, True), 'desk': ({'width': 1366, 'height': 820}, False)}
VIS_JS = """(keys) => { const A = window.__atlas, fb = A.freeBand(), r = document.querySelector('#c').getBoundingClientRect(), out = [];
  for (const [k, h, mni] of keys) { const p = mni || A.centroid(k, h); if (!p) continue; const v = A.mni2three(p).project(A.camera);
    const x = (v.x + 1) / 2 * r.width, y = (1 - v.y) / 2 * r.height; out.push({ k, h, x: Math.round(x), y: Math.round(y), ok: x >= 4 && x <= r.width - 4 && y >= fb.top && y <= fb.bot }); }
  return { fb: { top: Math.round(fb.top), bot: Math.round(fb.bot) }, out }; }"""
async def route(r):
    u = r.request.url
    if 'three@0.170.0/' in u: await r.fulfill(path=V + u.split('three@0.170.0/')[1], content_type='application/javascript')
    elif 'fonts.g' in u: await r.abort()
    else: await r.continue_()
async def run(vpname, what, only):
    vp, mob = VIEWPORTS[vpname]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport=vp, device_scale_factor=2 if mob else 1, is_mobile=mob, has_touch=mob)
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(f'PAGEERROR: {e}'))
        pg.on('console', lambda m: errs.append(f'{m.type}: {m.text}') if m.type in ('error', 'warning') else None)
        await pg.route('**/*', route); await pg.goto('file:///home/claude/brain-network-atlas.html'); await pg.wait_for_timeout(2500)
        bad = []
        if what in ('circuits', 'all'):
            ids = await pg.evaluate("CIRCUITS_IDS = [...document.querySelectorAll('#paths [data-c]')].map(b => b.dataset.c)")
            for cid in ids:
                await pg.evaluate(f"window.__atlas.startCircuit('{cid}')"); await pg.wait_for_timeout(1700)
                keys = await pg.evaluate("window.__atlas.state.circuitNodes.flatMap(k => [[k, 'L'], [k, 'R']])")
                res = await pg.evaluate(VIS_JS, keys)
                miss = [f"{o['k']}/{o['h']}@{o['x']},{o['y']}" for o in res['out'] if not o['ok']]
                print(f'circuit {cid}: band {res["fb"]} hidden: {miss or "none"}')
                if miss: bad.append((cid, miss))
                await pg.screenshot(path=f'{OUT}/{vpname}-circuit-{cid}.png')
            await pg.evaluate("window.__atlas.endCircuit()")
        if what in ('stories', 'all'):
            plan = await pg.evaluate("window.__atlas.STORIES.map(s => ({ id: s.id, scenes: s.scenes.map(sc => ({ title: sc.title, dur: sc.dur, free: !!sc.free })) }))")
            for st in plan:
                for i, sc in enumerate(st['scenes']):
                    tag = f"{st['id']}:{i + 1}"
                    times = [x.split('@')[1] for x in (only or []) if x.split('@')[0] == tag and '@' in x]
                    if only and tag not in only and not times: continue
                    t = float(times[0]) if times else (0 if sc['free'] else round(sc['dur'] * 0.85, 1))
                    await pg.evaluate(f"window.__atlas.startStory('{st['id']}', {i}, {{ paused: true, t: {t} }})"); await pg.wait_for_timeout(2200)
                    keys = await pg.evaluate("""(() => { const S = window.__atlas.story, out = []; const ids = new Set(S.labelSet); for (const id of ids) { const n = S.def.nodes[id]; if (!n || n.noDot) continue; out.push([id, 'L', n.mni || window.__atlas.centroid(n.key, 'L')]); } return out; })()""")
                    res = await pg.evaluate(VIS_JS, keys)
                    miss = [f"{o['k']}@{o['x']},{o['y']}" for o in res['out'] if not o['ok']]
                    print(f"{tag} {sc['title']}: band {res['fb']} hidden labels: {miss or 'none'}")
                    if miss: bad.append((tag, miss))
                    await pg.screenshot(path=f"{OUT}/{vpname}-{st['id']}-{i + 1:02d}" + (f"-t{t}" if times else '') + ".png")
        print('ERRORS:', errs[:20] or 'none'); print('FRAMING PROBLEMS:', bad or 'none')
        await b.close()
vpname = sys.argv[1] if len(sys.argv) > 1 else 'phone'
what = sys.argv[2] if len(sys.argv) > 2 else 'all'
only = set(sys.argv[3].split(',')) if len(sys.argv) > 3 else None
asyncio.run(run(vpname, what, only))
