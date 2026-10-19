# Roll Five

Tap the die. Roll a five? Drink, then keep rolling until you roll out of the five.

Three consecutive fives trigger **Everyone drinks!** on the third five. Further fives keep the player rolling; a non-five ends the streak and passes the die. A new streak can trigger the group rule again.

A solid, rounded 3D die tumbles through the air and settles with the winning face aimed toward the viewer, with a matching numeric result below it. White faces, a continuous black outline, and bold black pips keep the logo’s style. The original Roll Five logo stays at the top left.

A single-screen static game with local CSS and JavaScript. The Three.js renderer is bundled locally; the committed bundle deploys directly without a build step or CDN. An SVG die remains playable if WebGL is unavailable. The die is a native button that also supports Enter and Space, with screen-reader roll announcements and reduced-motion support.

## Preview

```sh
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Check

```sh
npm ci
npm test
node --check assets/game.js
```

## Rebuild the 3D renderer

After editing `src/die-3d.mjs` or `src/die-model.mjs`, run `npm run build` and commit the generated `assets/die-3d.js` bundle. Three.js is MIT licensed; see `assets/three-LICENSE.txt`.
