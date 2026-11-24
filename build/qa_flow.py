"""Beat-by-beat transcript of what a student sees in each story, in playback order (glossary memory carried across scenes).
Usage: python3 qa_flow.py phone|desk [story ids...]  -> /tmp/flow/<id>.txt"""
import asyncio, sys, json, os
from playwright.async_api import async_playwright
V = '/home/claude/vendor/package/'
VP = {'phone': ({'width': 390, 'height': 844}, True), 'desk': ({'width': 1366, 'height': 820}, False)}
vpn = sys.argv[1]; ids = sys.argv[2:]
src = open('/home/claude/brain-network-atlas.html').read().replace('window.__atlas = { state,', 'window.__atlas = { fastForward, state,')
open('/tmp/qa_atlas.html', 'w').write(src)
SNAP = """() => { const S = window.__atlas.story, q = s => [...document.querySelectorAll(s)];
  return { cap: document.querySelector('#sbcap').textContent, gl: document.querySelector('#sbgloss').hidden ? '' : [...document.querySelectorAll('#sbgloss .gi')].map(e => e.textContent).join(' | '),
    labs: q('#labels .slab.on:not(.tag)').map(e => e.classList.contains('two') ? e.querySelector('.nm').textContent + (e.classList.contains('nojob') ? '' : ' [' + e.querySelector('.jb').textContent + ']') : e.textContent),
    tags: q('#labels .slab.tag.on').map(e => e.textContent), hit: (document.querySelector('#hitring.on span') || {}).textContent || '',
    under: q('#sbcap .gl').map(e => e.textContent), extra: (document.querySelector('#sbextra') || {}).innerText || '' }; }"""
async def route(r):
    u = r.request.url
    if 'three@0.170.0/' in u: await r.fulfill(path=V + u.split('three@0.170.0/')[1], content_type='application/javascript')
    elif 'fonts.g' in u: await r.abort()
    else: await r.continue_()
async def main():
    vp, mob = VP[vpn]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport=vp, device_scale_factor=1, is_mobile=mob, has_touch=mob)
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(f'PAGEERROR: {e}'))
        await pg.route('**/*', route); await pg.goto('file:///tmp/qa_atlas.html'); await pg.wait_for_timeout(2500)
        for sid in ids:
            out = []
            n = await pg.evaluate(f"window.__atlas.STORIES.find(s => s.id === '{sid}').scenes.length")
            await pg.evaluate(f"window.__atlas.startStory('{sid}', 0, {{ paused: true }})"); await pg.wait_for_timeout(900)
            for i in range(n):
                if i: await pg.evaluate(f"window.__atlas.gotoScene({i})"); await pg.wait_for_timeout(500)
                sc = await pg.evaluate(f"(() => {{ const s = window.__atlas.story.scene; return {{ title: s.title, kicker: s.kicker || '', dur: s.dur, beats: (s.beats || []).map(b => b.at) }}; }})()")
                out.append(f"\n=== Scene {i+1}: {sc['title']}  ({sc['dur']}s)")
                last = None; t = 0.0
                for at in [0.05] + sorted(set(sc['beats'])):
                    if at > t: await pg.evaluate(f"window.__atlas.fastForward({at - t + 0.05:.2f})"); t = at + 0.05
                    await pg.wait_for_timeout(260)
                    s = await pg.evaluate(SNAP)
                    key = json.dumps([s['cap'], s['gl'], s['labs'], s['tags'], s['hit']])
                    if key == last: continue
                    last = key
                    out.append(f"  @{at:>5}  {s['cap']}")
                    if s['gl']: out.append(f"          STRIP: {s['gl']}")
                    if s['labs']: out.append(f"          LABELS: {' · '.join(s['labs'])}")
                    if s['tags']: out.append(f"          ARROWS: {' · '.join(s['tags'])}")
                    if s['hit']: out.append(f"          HIT: {s['hit']}")
                    if s['under']: out.append(f"          underlined: {', '.join(s['under'])}")
            open(f'/tmp/flow/{sid}.txt', 'w').write('\n'.join(out)); print(sid, 'scenes', n, 'lines', len(out))
        print('ERRORS:', errs or 'none'); await b.close()
asyncio.run(main())
