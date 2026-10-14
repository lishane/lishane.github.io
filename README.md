# Roll Five

Tap the die. Roll a five? Drink, then keep rolling until you roll out of the five.

Three consecutive fives trigger **Everyone drinks!** on the third five. Further fives keep the player rolling; a non-five ends the streak and passes the die. A new streak can trigger the group rule again.

A single-screen static game with local CSS and JavaScript. No build step or runtime dependencies. The die is a native button that also supports Enter and Space, with screen-reader roll announcements and reduced-motion support.

## Preview

```sh
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Check

```sh
node --check assets/game.js
node tests/game.test.cjs
```
