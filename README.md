# Roll Five

One die. One rule. Roll a five and take a sip; any other number passes the turn.

The game runs as a static page on GitHub Pages, with local CSS and JavaScript and no build step or third-party runtime dependencies. Tap the die, use the roll button, or press Space to play. Session counters and the last six rolls reset on page reload or with the reset button.

## Local preview

From the repository root:

```sh
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Checks

With Node.js installed:

```sh
node --check assets/game.js
node tests/game.test.cjs
```

The dependency-free interaction checks cover each die result, roll locking, counters, recent history, reset, keyboard controls, modal blocking, reduced motion, and random-number rejection sampling. Browser checks should also cover the responsive layout, the rules dialog, and focus behavior.
