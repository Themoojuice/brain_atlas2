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
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1, is_mobile=True, has_touch=True)
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(f'PAGEERROR: {e}'))
        pg.on('console', lambda m: errs.append(f'{m.type}: {m.text}') if m.type == 'error' and 'ERR_FAILED' not in m.text else None)
        await pg.route('**/*', route); await pg.goto('file:///home/claude/brain-network-atlas.html'); await pg.wait_for_timeout(2500)
        # open from the Pathways list like a user would
        await pg.evaluate("document.querySelector('#stories [data-st=aff2]').click()"); await pg.wait_for_timeout(1500)
        print(await pg.evaluate("[window.__atlas.story.def.id, window.__atlas.story.scene.title, document.querySelector('#sbstate').hidden]"))
        for sc in [3, 7, 12, 14, 19]:
            await pg.evaluate(f"window.__atlas.gotoScene({sc - 1}, {{ play: true }})")
            await pg.wait_for_timeout(9000)
            print(sc, await pg.evaluate("(() => { const S = window.__atlas.story; return [S.scene.title, +S.t.toFixed(1), +S.vars.m.toFixed(2), S.tokens.length, document.querySelector('#lpTag')?.textContent]; })()"))
        # key card per scene, and in the other stories
        await pg.evaluate("document.querySelector('#sbkey').click()"); await pg.wait_for_timeout(300)
        print('key', (await pg.evaluate("document.querySelector('#keycard').innerText"))[:300].replace('\n', ' | '))
        await pg.evaluate("document.querySelector('#sbnext').click()"); await pg.wait_for_timeout(500)
        print('key next', (await pg.evaluate("document.querySelector('#keycard').innerText"))[:120].replace('\n', ' | '))
        for sid in ['net', 'p2']:
            await pg.evaluate(f"window.__atlas.startStory('{sid}', 1, {{ paused: true }})"); await pg.wait_for_timeout(500)
            await pg.evaluate("document.querySelector('#keycard').hidden = true; document.querySelector('#sbkey').click()"); await pg.wait_for_timeout(200)
            print(sid, (await pg.evaluate("document.querySelector('#keycard').innerText"))[:160].replace('\n', ' | '), await pg.evaluate("document.querySelector('#sbstate').hidden"))
        # scene end auto-advance with narration flag on (no voices in headless)
        await pg.evaluate("window.__atlas.startStory('aff2', 0, {}); window.__atlas.story.narrate = true"); await pg.wait_for_timeout(15500)
        print('advance', await pg.evaluate("window.__atlas.story.scene.title"))
        await pg.evaluate("window.__atlas.endStory()"); await pg.wait_for_timeout(800)
        print('ended', await pg.evaluate("[document.body.classList.contains('story'), window.__atlas.state.level.get('Nucleus_accumbens')]"))
        print('ERRORS:', errs or 'none'); await b.close()
asyncio.run(main())
