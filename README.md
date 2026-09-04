# Gokulam, a midnight journey

An interactive, real-time 3D web experience for Krishna Janmashtami 2026.
Six chapters, one HTML file, no build step needed to run: everything is procedural,
including the sound.

- Chapter one, Nishita: a prison cell in Mathura, a live countdown to midnight, the birth.
- Chapter two, Yamuna: the storm, the river, the basket under Shesha's hoods.
- Chapter three, Gokulam wakes: dawn over a Kadamba grove, fireflies, peacock feathers.
- Chapter four, Venu Gaanam: a flute you can play (Mohanam scale).
- Chapter five, Utlotsavam: seven pots of butter to break.
- Chapter six, Aahvaanam: a golden invitation card, a name written on it, a thousand lamps.

## Run it

Open `index.html` in Chrome, Edge, Safari or Firefox (an internet connection is needed the
first time, for the Three.js library from cdnjs). Headphones recommended.

For the best experience serve it over http (the share link and gyroscope need this):

```
python3 -m http.server 8000
# then open http://localhost:8000/
```

Query parameters:

- `?for=Name` writes that name on the invitation card, e.g. `?for=Sai`
- `?q=low` or `?q=high` forces the quality preset (mobile defaults to low)

## Controls

- Continue button at the bottom walks you to the next moment. Scroll, swipe or the arrow keys move you faster.
- Mouse moves the view and steers the wind. On a phone, drag sideways to look.
- Flute: glide the mouse across it, click a hole, drag a finger across it, or press keys 1 to 8.
- Pots: click or tap a pot.
- Invitation: move the mouse or tilt the phone to turn the card. Type a name, copy or share the link.
- `m` mutes. There are three secrets hidden in the night.

## Project layout

```
index.html          the built experience (same as gokulam.html)
src/
  part1_head.html   markup, styles, import map
  part2_core.mjs    utilities, GLSL shaders, post-processing, sound engine
  part3b_gokulam.mjs the land: grove, feathers, flute, pots, invitation, lamps
  part3_world.mjs   the cell and the river world, sky, water, rain, Shesha
  part4_flow.mjs    story flow, chapters, controls, UI
build.sh            concatenates src/ into index.html and gokulam.html
test/               headless Chromium render tests (Playwright + swiftshader)
```

Edit files in `src/`, then run `./build.sh` (needs Node for the syntax check).

## Tests

```
cd test && npm install          # installs three@0.185.1 for local serving
cd .. && ./build.sh
cd test
python3 shot.py '[["click","#enter"],["eval","gokulam.ff(6)"],["wait",1],["shot","cell"]]'
python3 flow2.py                # walks the whole journey and checks every station
```

Requires Python 3 with `playwright` installed and its Chromium downloaded.

## Publishing

GitHub Pages works out of the box: publish the `main` branch root and open
`https://<username>.github.io/<repo>/`. The invitation link then becomes
`https://<username>.github.io/<repo>/?for=Name`.

## Credits

Built with Three.js (r185). Everything else, including the music, is generated in the browser.
Janmashtami 2026 falls on Friday, 4 September; the Nishita window is 11:57 pm to 12:43 am.
