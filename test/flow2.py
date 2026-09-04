import asyncio, sys, json, subprocess, time
from playwright.async_api import async_playwright
import os
ROOT=os.path.dirname(os.path.abspath(__file__)); PORT=8767
async def main():
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
    try:
        async with async_playwright() as p:
            b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
            pg=await b.new_page(viewport={'width':1280,'height':720}); logs=[]
            pg.on('console',lambda m: logs.append(f'[{m.type}] {m.text}')); pg.on('pageerror',lambda e: logs.append(f'[pageerror] {e}'))
            await pg.goto(f'http://127.0.0.1:{PORT}/index.html?for=Sai'); await pg.wait_for_function('window.__gokulamReady===true'); await pg.wait_for_timeout(1500)
            await pg.click('#enter'); await pg.wait_for_timeout(2500)
            await pg.evaluate('gokulam.startRiver(); gokulam.S.flashOn=false; gokulam.S.nextFlash=1e9; gokulam.ff(5)')
            z0 = await pg.evaluate('gokulam.camera.position.z')
            await pg.evaluate('gokulam.advance(2.4); gokulam.ff(0.5)'); z1 = await pg.evaluate('gokulam.camera.position.z')
            await pg.evaluate('gokulam.ff(1.5)'); z2 = await pg.evaluate('gokulam.camera.position.z')
            print(f'one wheel notch: {z0-z1:.2f} m in 0.5s, {z0-z2:.2f} m after 2s (drift included)')
            await pg.evaluate('gokulam.ff(20)'); z3 = await pg.evaluate('gokulam.camera.position.z'); print(f'idle drift 20s: {z2-z3:.1f} m')
            await pg.evaluate('document.querySelector("#next").click(); gokulam.ff(40)')
            print('after Continue x1 (40s):', await pg.evaluate('({ch:gokulam.S.chapter, z:gokulam.camera.position.z.toFixed(1), goal:gokulam.S.goal})'))
            async def go_until(ch, maxn=6):
                for i in range(maxn):
                    cur = await pg.evaluate('gokulam.S.chapter')
                    if cur == ch: return True
                    await pg.evaluate('document.querySelector("#next").classList.add("show"); document.querySelector("#next").click(); gokulam.ff(45)')
                    print('  walked to', await pg.evaluate('({ch:gokulam.S.chapter, z:gokulam.camera.position.z.toFixed(1), locked:gokulam.S.locked, next:document.querySelector("#next").textContent})'))
                return (await pg.evaluate('gokulam.S.chapter')) == ch
            print('reach flute:', await go_until('flute'))
            await pg.evaluate('gokulam.ff(1)'); await pg.screenshot(path=f'{ROOT}/s_p3_flute.png')
            await pg.mouse.move(200, 380)
            for x in range(200, 1100, 60):
                await pg.mouse.move(x, 380); await pg.wait_for_timeout(60)
            print('notes played by glide:', await pg.evaluate('gokulam.S.notes'), 'locked:', await pg.evaluate('gokulam.S.locked'), 'yaw:', await pg.evaluate('gokulam.S.yawT.toFixed(3)'))
            await pg.evaluate('gokulam.ff(0.4)'); await pg.screenshot(path=f'{ROOT}/s_p3_flute2.png')
            print('reach lane:', await go_until('lane'))
            hits=0
            for i in range(7):
                pos = await pg.evaluate(f'(()=>{{const p=gokulam.gk.pots[{i}]; const v=new (gokulam.camera.position.constructor)(); p.pot.getWorldPosition(v); v.y+=0.3; v.project(gokulam.camera); return [(v.x*0.5+0.5)*innerWidth,(0.5-v.y*0.5)*innerHeight];}})()')
                await pg.mouse.move(pos[0], pos[1]); await pg.wait_for_timeout(40)
                await pg.mouse.click(pos[0], pos[1]); await pg.wait_for_timeout(80)
                await pg.evaluate('gokulam.ff(0.2)')
                if i == 2: await pg.screenshot(path=f'{ROOT}/s_p3_lane.png')
            print('pots left after clicking each:', await pg.evaluate('gokulam.gk.potsLeft()'))
            await pg.evaluate('gokulam.ff(7); gokulam.ff(40)')
            print('card chapter:', await pg.evaluate('({ch:gokulam.S.chapter, z:gokulam.camera.position.z.toFixed(1), cardVisible:gokulam.gk.card.visible})'))
            await pg.mouse.move(900, 300); await pg.evaluate('gokulam.ff(1.5)'); await pg.screenshot(path=f'{ROOT}/s_p3_card.png')
            await pg.evaluate('gokulam.lightLamps(); gokulam.ff(9)'); await pg.wait_for_timeout(500); await pg.screenshot(path=f'{ROOT}/s_p3_lamps.png')
            await pg.evaluate('gokulam.ff(14)'); await pg.wait_for_timeout(500); await pg.screenshot(path=f'{ROOT}/s_p3_end.png')
            print('end:', await pg.evaluate('({ch:gokulam.S.chapter, hint:document.querySelector("#hint").textContent, invite:document.querySelector("#invite").classList.contains("show")})'))
            errs=[l for l in logs if 'error' in l.lower() or 'warn' in l.lower()]; print('flagged logs:',len(errs)); [print('  ',l[:300]) for l in errs[:10]]
            await b.close()
    finally: srv.terminate()
asyncio.run(main())
