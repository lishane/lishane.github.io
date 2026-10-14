(() => {
  'use strict';
  const die = document.getElementById('dice-display');
  const cube = document.getElementById('dice-cube');
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

  // Opposite faces total seven. Rotate the fixed cube instead of changing its pips.
  const sides = {front:5, back:2, right:3, left:4, top:1, bottom:6};
  const alignments = {1:'rotateX(-90deg)', 2:'rotateY(180deg)', 3:'rotateY(-90deg)', 4:'rotateY(90deg)', 5:'', 6:'rotateX(90deg)'};
  const poseFor = value => `rotateX(-24deg) rotateY(-30deg) rotateZ(4deg) ${alignments[value]}`.trim();
  let currentPose = poseFor(5);
  for (const [side,value] of Object.entries(sides)) {
    const face = document.createElement('span');
    face.className = `cube-face ${side}`;
    for (const position of positions[value]) {
      const pip = document.createElement('span');
      pip.className = 'pip';
      pip.style.gridRow = Math.ceil(position / 3);
      pip.style.gridColumn = ((position - 1) % 3) + 1;
      face.append(pip);
    }
    cube.append(face);
  }
  function showValue(value) {
    currentPose = poseFor(value);
    cube.style.setProperty('--pose', currentPose);
    cube.setAttribute('data-value', String(value));
    die.setAttribute('aria-label', `Roll the die. Currently showing ${value}.`);
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
    cube.style.setProperty('--from', currentPose);
    cube.style.setProperty('--pose', poseFor(value));
    stage.classList.add('rolling');
    die.classList.add('rolling');
    message.classList.remove('is-five', 'is-out');
    message.textContent = '';
    instruction.textContent = '';
    announcement.textContent = 'Rolling';
    window.setTimeout(() => {
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
  showValue(5);
})();
