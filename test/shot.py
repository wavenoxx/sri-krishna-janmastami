import asyncio, sys, json, subprocess, time, os
from playwright.async_api import async_playwright

import os
ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = 8765

async def main():
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT), '--bind', '127.0.0.1'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.0)
    steps = json.loads(sys.argv[1]) if len(sys.argv) > 1 else []
    vw, vh = (int(sys.argv[2]), int(sys.argv[3])) if len(sys.argv) > 3 else (1280, 720)
    mobile = len(sys.argv) > 4 and sys.argv[4] == 'mobile'
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl', '--autoplay-policy=no-user-gesture-required'])
            ctx = await browser.new_context(viewport={'width': vw, 'height': vh}, device_scale_factor=1, has_touch=mobile, is_mobile=mobile, user_agent=('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148' if mobile else None))
            page = await ctx.new_page()
            logs = []
            page.on('console', lambda m: logs.append(f'[{m.type}] {m.text}'))
            page.on('pageerror', lambda e: logs.append(f'[pageerror] {e}'))
            await page.goto(f'http://127.0.0.1:{PORT}/index.html')
            await page.wait_for_function('window.__gokulamReady === true', timeout=60000)
            await page.wait_for_timeout(2500)
            await page.screenshot(path=f'{ROOT}/s_gate.png')
            for step in steps:
                kind = step[0]
                if kind == 'click':
                    await page.click(step[1])
                elif kind == 'wait':
                    await page.wait_for_timeout(int(step[1] * 1000))
                elif kind == 'eval':
                    await page.evaluate(step[1])
                elif kind == 'shot':
                    await page.screenshot(path=f'{ROOT}/s_{step[1]}.png')
                elif kind == 'until':
                    # fast-forward: run frames until S.time >= t (frames are real, swiftshader is slow)
                    await page.wait_for_function(f'window.gokulam.S.time >= {step[1]}', timeout=600000)
            info = await page.evaluate('({mode: gokulam.S.mode, t: gokulam.S.t, time: gokulam.S.time, hdr: gokulam.hdr, mobile: gokulam.mobile, birthT: gokulam.S.birthT})')
            print('STATE', json.dumps(info))
            errs = [l for l in logs if 'error' in l.lower() or 'warn' in l.lower()]
            print('LOGS', len(logs), 'flagged', len(errs))
            for l in errs[:25]:
                print('  ', l[:600])
            await browser.close()
    finally:
        srv.terminate()

asyncio.run(main())
