"""Screenshot aff2 scenes at chosen moments. Usage: python3 qa_aff2.py phone|desk 'scene@t,scene@t,...'"""
import asyncio, sys, os
from playwright.async_api import async_playwright
V = '/home/claude/vendor/package/'; OUT = '/home/claude/shots/aff2'; os.makedirs(OUT, exist_ok=True)
VP = {'phone': ({'width': 390, 'height': 844}, True), 'desk': ({'width': 1366, 'height': 820}, False), 'small': ({'width': 360, 'height': 800}, True)}
async def route(r):
    u = r.request.url
    if 'three@0.170.0/' in u: await r.fulfill(path=V + u.split('three@0.170.0/')[1], content_type='application/javascript')
    elif 'fonts.g' in u: await r.abort()
    else: await r.continue_()
async def main(vpn, spec):
    vp, mob = VP[vpn]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport=vp, device_scale_factor=2 if mob else 1, is_mobile=mob, has_touch=mob)
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(f'PAGEERROR: {e}'))
        pg.on('console', lambda m: errs.append(f'{m.type}: {m.text}') if m.type == 'error' and 'ERR_FAILED' not in m.text else None)
        await pg.route('**/*', route); await pg.goto('file:///home/claude/brain-network-atlas.html'); await pg.wait_for_timeout(2500)
        n = await pg.evaluate("window.__atlas.STORIES.find(s => s.id === 'aff2').scenes.length")
        items = spec.split(',') if spec != 'all' else [f'{i+1}@x' for i in range(n)]
        for it in items:
            sc, t = it.split('@'); sc = int(sc)
            if t == 'x': t = await pg.evaluate(f"(() => {{ const s = window.__atlas.STORIES.find(s => s.id === 'aff2').scenes[{sc-1}]; return Math.round(s.dur * 0.8 * 10) / 10; }})()")
            await pg.evaluate(f"window.__atlas.startStory('aff2', {sc-1}, {{ paused: true, t: {t} }})"); await pg.wait_for_timeout(1800)
            info = await pg.evaluate("(() => { const S = window.__atlas.story; return { cap: document.querySelector('#sbcap').textContent, m: +S.vars.m.toFixed(2), title: S.scene.title }; })()")
            fn = f"{OUT}/{vpn}-{sc:02d}-t{t}.png"; await pg.screenshot(path=fn)
            print(sc, t, info)
        print('ERRORS:', errs[:15] or 'none'); await b.close()
asyncio.run(main(sys.argv[1], sys.argv[2]))
