"""Screenshot any story's scenes at chosen moments (the series QA helper).
Usage: python3 qa_part.py phone|desk|small STORY 'scene@t,scene@t,...'   ('all' = every scene at 80% of its length)
Screenshots go to /home/claude/shots/STORY/. Prints each scene's caption, the model's key numbers and any page errors."""
import asyncio, sys, os, json
from playwright.async_api import async_playwright
V = '/home/claude/vendor/package/'
VP = {'phone': ({'width': 390, 'height': 844}, True), 'desk': ({'width': 1366, 'height': 820}, False), 'small': ({'width': 360, 'height': 800}, True)}
async def route(r):
    u = r.request.url
    if 'three@0.170.0/' in u: await r.fulfill(path=V + u.split('three@0.170.0/')[1], content_type='application/javascript')
    elif 'fonts.g' in u: await r.abort()
    else: await r.continue_()
async def main(vpn, sid, spec):
    vp, mob = VP[vpn]; out = f'/home/claude/shots/{sid}'; os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport=vp, device_scale_factor=2 if mob else 1, is_mobile=mob, has_touch=mob)
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(f'PAGEERROR: {e}'))
        pg.on('console', lambda m: errs.append(f'{m.type}: {m.text}') if m.type == 'error' and 'ERR_FAILED' not in m.text else None)
        await pg.route('**/*', route); await pg.goto('file:///home/claude/brain-network-atlas.html'); await pg.wait_for_timeout(2500)
        n = await pg.evaluate(f"window.__atlas.STORIES.find(s => s.id === '{sid}').scenes.length")
        items = spec.split(',') if spec != 'all' else [f'{i+1}@x' for i in range(n)]
        for it in items:
            sc, t = it.split('@'); sc = int(sc)
            if t == 'x': t = await pg.evaluate(f"(() => {{ const s = window.__atlas.STORIES.find(s => s.id === '{sid}').scenes[{sc-1}]; return Math.round(s.dur * 0.8 * 10) / 10; }})()")
            await pg.evaluate(f"window.__atlas.startStory('{sid}', {sc-1}, {{ paused: true, t: {t} }})"); await pg.wait_for_timeout(1800)
            info = await pg.evaluate("(() => { const S = window.__atlas.story, m = S.m, o = {}; for (const [k, v] of Object.entries(m)) if (typeof v === 'number') o[k] = +v.toFixed(2); return { title: S.scene.title, cap: document.querySelector('#sbcap').textContent, m: o }; })()")
            fn = f"{out}/{vpn}-{sc:02d}-t{t}.png"; await pg.screenshot(path=fn)
            print(sc, t, info['title'], '|', info['cap'][:110], '|', json.dumps(info['m'])[:220])
        print('ERRORS:', errs[:15] or 'none'); await b.close()
asyncio.run(main(sys.argv[1], sys.argv[2], sys.argv[3]))
