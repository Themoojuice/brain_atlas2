"""Open the Key card on a story scene and screenshot it (plus a tap on the first underlined caption word).
Usage: python3 qa_key.py phone|desk STORY SCENE T"""
import asyncio, sys, os
from playwright.async_api import async_playwright
sys.argv += [] ; vpn, sid, sc, t = sys.argv[1], sys.argv[2], int(sys.argv[3]), float(sys.argv[4])
V = '/home/claude/vendor/package/'
VP = {'phone': ({'width': 390, 'height': 844}, True), 'desk': ({'width': 1366, 'height': 820}, False)}
async def route(r):
    u = r.request.url
    if 'three@0.170.0/' in u: await r.fulfill(path=V + u.split('three@0.170.0/')[1], content_type='application/javascript')
    elif 'fonts.g' in u: await r.abort()
    else: await r.continue_()
async def main():
    vp, mob = VP[vpn]; out = f'/home/claude/shots/{sid}'; os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport=vp, device_scale_factor=2 if mob else 1, is_mobile=mob, has_touch=mob)
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(f'PAGEERROR: {e}'))
        await pg.route('**/*', route); await pg.goto('file:///home/claude/brain-network-atlas.html'); await pg.wait_for_timeout(2500)
        await pg.evaluate(f"window.__atlas.startStory('{sid}', {sc-1}, {{ paused: true, t: {t} }})"); await pg.wait_for_timeout(1500)
        await pg.click('#sbkey'); await pg.wait_for_timeout(700)
        await pg.screenshot(path=f'{out}/{vpn}-key-{sc:02d}.png')
        kc = await pg.evaluate("document.querySelector('#keycard').innerText")
        print(kc[:1800])
        await pg.click('#sbkey'); await pg.wait_for_timeout(300)
        g = await pg.query_selector('#sbcap .gl')
        if g: await g.click(); await pg.wait_for_timeout(400); print('TAP ->', await pg.evaluate("document.querySelector('#sbgloss').innerText"))
        print('ERRORS:', errs or 'none'); await b.close()
asyncio.run(main())
