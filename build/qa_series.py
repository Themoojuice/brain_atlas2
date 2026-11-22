"""Real-time checks for the series: list order, opening a part from the list, live playback across scenes,
the part-to-part button, the Key, auto-advance and exit. Usage: python3 qa_series.py"""
import asyncio
from playwright.async_api import async_playwright
V = '/home/claude/vendor/package/'
async def route(r):
    u = r.request.url
    if 'three@0.170.0/' in u: await r.fulfill(path=V + u.split('three@0.170.0/')[1], content_type='application/javascript')
    elif 'fonts.g' in u: await r.abort()
    else: await r.continue_()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await (await b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)).new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(f'PAGEERROR: {e}'))
        pg.on('console', lambda m: errs.append(f'{m.type}: {m.text}') if m.type == 'error' and 'ERR_FAILED' not in m.text else None)
        await pg.route('**/*', route); await pg.goto('file:///home/claude/brain-network-atlas.html'); await pg.wait_for_timeout(2500)
        print('list', await pg.evaluate("[...document.querySelectorAll('#stories [data-st] b')].map(b => b.textContent)"))
        await pg.evaluate("document.querySelector('#stories [data-st=p1]').click()"); await pg.wait_for_timeout(1200)
        for sid, scenes in [('p1', [3, 11]), ('p3', [5, 12]), ('p6', [5]), ('p7', [4]), ('p8', [3])]:
            for sc in scenes:
                await pg.evaluate(f"window.__atlas.startStory('{sid}', {sc - 1}, {{}})"); await pg.wait_for_timeout(8000)
                print(sid, sc, await pg.evaluate("(() => { const S = window.__atlas.story; return [S.scene.title, +S.t.toFixed(1), document.querySelector('#sbcap').textContent.slice(0, 60), !document.querySelector('#inset').hidden]; })()"))
        # last scene of each part offers the next part
        for sid in ['p1', 'p2', 'p3', 'p4', 'aff2', 'p6', 'p7']:
            await pg.evaluate(f"window.__atlas.startStory('{sid}', window.__atlas.STORIES.find(s => s.id === '{sid}').scenes.length - 1, {{ paused: true }})"); await pg.wait_for_timeout(400)
            lab = await pg.evaluate("[...document.querySelectorAll('#sbextra button')].map(b => b.textContent).join(' / ')")
            await pg.evaluate("[...document.querySelectorAll('#sbextra button')].find(b => b.textContent.startsWith('Next'))?.click()"); await pg.wait_for_timeout(500)
            print('next', sid, '|', lab, '→', await pg.evaluate("window.__atlas.story.def?.id"))
        await pg.evaluate("window.__atlas.startStory('p2', 4, { paused: true })"); await pg.wait_for_timeout(300)
        await pg.evaluate("document.querySelector('#sbkey').click()"); await pg.wait_for_timeout(300)
        print('key', (await pg.evaluate("document.querySelector('#keycard').innerText"))[:200].replace('\n', ' | '))
        await pg.evaluate("document.querySelector('#sbkey').click(); window.__atlas.startStory('p4', 0, {})"); await pg.wait_for_timeout(16500)
        print('advance', await pg.evaluate("window.__atlas.story.scene.title"))
        await pg.evaluate("window.__atlas.endStory()"); await pg.wait_for_timeout(800)
        print('ended', await pg.evaluate("[document.body.classList.contains('story'), document.querySelector('#inset').hidden]"))
        print('ERRORS:', errs or 'none'); await b.close()
asyncio.run(main())
