(() => {
  'use strict';
  const die = document.getElementById('dice-display');
  const art = document.getElementById('die-art');
  const message = document.getElementById('message');
  const stage = document.getElementById('dice-stage');
  const result = document.getElementById('result');
  const instruction = document.getElementById('instruction');
  const announcement = document.getElementById('announcement');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const positions = {
    1: [5], 2: [1, 9], 3: [1, 5, 9],
    4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9]
  };
  let isRolling = false;
  let fiveStreak = 0;

  // Adjacent faces from rotations of the same conventional die (opposites total 7).
  // The large front face is always the result; the small faces move with it.
  const adjacentFaces = {1:[2,4], 2:[1,3], 3:[2,1], 4:[2,6], 5:[6,3], 6:[2,3]};
  const pipLayers = {
    front: document.getElementById('front-pips'),
    top: document.getElementById('top-pips'),
    side: document.getElementById('side-pips')
  };
  function drawPips(surface, value) {
    const layer = pipLayers[surface];
    layer.replaceChildren();
    for (const position of positions[value]) {
      const u = ((position - 1) % 3) / 2;
      const v = Math.floor((position - 1) / 3) / 2;
      let x, y, rx, ry, angle;
      if (surface === 'front') {
        x = 586 + 344*u - 41*v; y = 740 + 6*u + 285*v;
        rx = 59; ry = 56; angle = -8;
      } else if (surface === 'top') {
        x = 506 + 439*u - 20*v; y = 274 + 28*u + 180*v;
        rx = value === 6 ? 49 : 62; ry = value === 6 ? 33 : 58; angle = -10;
      } else {
        x = 262 + 92*u - 64*v; y = 430 + 107*u + 390*v;
        rx = 34; ry = 63; angle = 20;
      }
      const pip = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
      pip.setAttribute('cx',x);
      pip.setAttribute('cy',y);
      pip.setAttribute('rx',rx);
      pip.setAttribute('ry',ry);
      pip.setAttribute('transform',`rotate(${angle} ${x} ${y})`);
      layer.append(pip);
    }
  }
  function showValue(value) {
    const [top,side] = adjacentFaces[value];
    drawPips('front',value);
    drawPips('top',top);
    drawPips('side',side);
    art.setAttribute('data-value',String(value));
    die.setAttribute('aria-label', `Roll the die. Front face showing ${value}.`);
  }

  // Rejection sampling gives all six sides equal probability.
  function randomFace() {
    if (!window.crypto?.getRandomValues) return Math.floor(Math.random() * 6) + 1;
    const sample = new Uint32Array(1);
    do { window.crypto.getRandomValues(sample); } while (sample[0] >= 4294967292);
    return (sample[0] % 6) + 1;
  }

  function rollDice() {
    if (isRolling) return;
    isRolling = true;
    die.disabled = true;
    die.setAttribute('aria-label', 'Rolling the die');
    stage.classList.remove('drink', 'everyone');
    result.classList.remove('drink', 'everyone');
    const value = randomFace();
    stage.classList.add('rolling');
    die.classList.add('rolling');
    message.classList.remove('is-five', 'is-out');
    message.textContent = '';
    instruction.textContent = '';
    announcement.textContent = 'Rolling';
    let preview;
    if (!reducedMotion.matches) {
      let frame = 0;
      preview = window.setInterval(() => {
        showValue(frame++ % 6 + 1);
        die.setAttribute('aria-label','Rolling the die');
      },90);
    }
    window.setTimeout(() => {
      clearInterval(preview);
      showValue(value);
      die.classList.remove('rolling');
      stage.classList.remove('rolling');
      const wasInFive = fiveStreak > 0;
      fiveStreak = value === 5 ? fiveStreak + 1 : 0;
      if (value === 5) {
        const everyoneDrinks = fiveStreak === 3;
        message.textContent = everyoneDrinks ? 'Everyone drinks!' : 'Drink!';
        message.classList.add('is-five');
        instruction.textContent = fiveStreak === 1
          ? 'Roll out of the five'
          : `${fiveStreak} fives in a row. Roll out of the five.`;
        stage.classList.add('drink');
        result.classList.add('drink');
        if (everyoneDrinks) {
          stage.classList.add('everyone');
          result.classList.add('everyone');
        }
      } else if (wasInFive) {
        message.textContent = "You're out!";
        message.classList.add('is-out');
        instruction.textContent = 'Pass the die';
      } else {
        message.textContent = 'Tap to roll';
      }
      announcement.textContent = `You rolled a ${value}. ${message.textContent} ${instruction.textContent}`.trim();
      isRolling = false;
      die.disabled = false;
    }, reducedMotion.matches ? 100 : 1200);
  }

  // A native button also supports Enter and Space without extra visible controls.
  die.addEventListener('click', rollDice);
  showValue(6);
})();
