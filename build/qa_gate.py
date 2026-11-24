"""Live check of the reading gate: play a story in real time and log how long each caption stays up vs its reading need.
Usage: python3 qa_gate.py STORY SCENE SECONDS"""
import asyncio, sys, time
from playwright.async_api import async_playwright
V = '/home/claude/vendor/package/'
sid, sc, secs = sys.argv[1], int(sys.argv[2]), float(sys.argv[3])
async def route(r):
    u = r.request.url
    if 'three@0.170.0/' in u: await r.fulfill(path=V + u.split('three@0.170.0/')[1], content_type='application/javascript')
    elif 'fonts.g' in u: await r.abort()
    else: await r.continue_()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await (await b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)).new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.route('**/*', route); await pg.goto('file:///home/claude/brain-network-atlas.html'); await pg.wait_for_timeout(2500)
        await pg.evaluate(f"window.__atlas.startStory('{sid}', {sc-1})")
        t0 = time.time(); log = []; last = None
        while time.time() - t0 < secs:
            s = await pg.evaluate("(() => { const S = window.__atlas.story; return [document.querySelector('#sbcap').textContent, document.querySelector('#sbgloss').hidden ? '' : [...document.querySelectorAll('#sbgloss .gi')].map(e => e.textContent).join('\\n'), S.i, +S.t.toFixed(1)]; })()")
            key = s[0] + '|' + s[1]
            if key != last: log.append((round(time.time() - t0, 1), s)); last = key
            await pg.wait_for_timeout(200)
        caps = []; seen = set()
        for t, s in log:
            items = [x for x in s[1].split('\n') if x]
            if not caps or caps[-1][1] != s[0]: caps.append([t, s[0], [], s[2]])
            for x in items:
                if x not in seen: seen.add(x); caps[-1][2].append(x)
        for i, (t, cap, new, scn) in enumerate(caps[:-1]):
            up = caps[i + 1][0] - t; words = len(cap.split()) + sum(len(x.split()) for x in new)
            need = min(0.6 * (1 + len(new)) + words / 2.5, 16)
            print(f"scene {scn+1} up {up:5.1f}s  need {need:5.1f}s  {'OK ' if up >= need - 0.6 else 'FAST'}  {cap[:55]} ‖ new defs: {[x.split()[0] for x in new]}")
        print('ERRORS:', errs or 'none'); await b.close()
asyncio.run(main())
