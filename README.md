[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/MonyetAku/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/MonyetAku/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# Dapur Kilat — Warung Rush

A complete, original browser cooking game: run a busy Indonesian warung
kitchen, serve customers before their patience runs out, and survive the
shift. Built for the make.fun "Make the best cooking game" bounty.

## How to play

- **Move:** WASD / arrow keys, or click anywhere on the kitchen floor.
- **Use a counter:** press E (or Space), or click the counter to walk over
  and use it on arrival.
- **Cook:** grab raw ingredients from the top counters, chop them on the
  talenan, cook them on the wajan / kompor / panggangan, build dishes on the
  piring counter, and serve them at the Antar window.
- **Watch the clock:** every order has a patience bar. Serve fast for a tip.
  Let an order expire and you lose a heart; lose all three and the warung
  closes. Finish the shift to level up: more customers, less patience.

## Dishes

Es Teh, Nasi Goreng, Mie Ayam, Ayam Bakar, Soto Ayam — each a different
combination of chopped, cooked and grilled ingredients.

## Run it

Serve `game/` with any static HTTP server and open `game/index.html` in
desktop Chrome. No build step, no network requests: every file the game
loads lives under `game/`. Sounds are synthesized with WebAudio.

## Layout

- `game/index.html` — page shell and canvas
- `game/src/config.js` — stations, ingredients, recipes, difficulty
- `game/src/state.js` — game state, orders, plates, scoring
- `game/src/input.js` — keyboard and mouse
- `game/src/logic.js` — movement, cooking, serving, shifts
- `game/src/render.js` — all canvas drawing
- `game/src/audio.js` — synthesized sound effects
- `game/src/shots.js` — staged screenshot scenes (`?shot=cover|assembly|rush|serve`)
- `game/src/main.js` — boot and game loop
- `main.ts` — hand-in program: copies `game/` + `screenshots/` to `/output`
  and writes `dossier.json` with the vendored make.fun library
- `screenshots/` — 4 real renders of the game in a browser (cover first)
