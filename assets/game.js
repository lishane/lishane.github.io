(() => {
  'use strict';
  const die = document.getElementById('dice-display');
  const face = die.querySelector('.die-face');
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

  function showFace(value) {
    face.replaceChildren();
    for (const position of positions[value]) {
      const pip = document.createElement('span');
      pip.className = 'pip';
      pip.style.gridRow = Math.ceil(position / 3);
      pip.style.gridColumn = ((position - 1) % 3) + 1;
      face.append(pip);
    }
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
    stage.classList.add('rolling');
    die.classList.add('rolling');
    message.classList.remove('is-five', 'is-out');
    message.textContent = '';
    instruction.textContent = '';
    announcement.textContent = 'Rolling';
    const value = randomFace();
    let preview;
    if (!reducedMotion.matches) {
      let frame = 0;
      preview = window.setInterval(() => {
        showFace((frame++ % 6) + 1);
        die.setAttribute('aria-label', 'Rolling the die');
      }, 80);
    }
    window.setTimeout(() => {
      clearInterval(preview);
      showFace(value);
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
  showFace(5);
})();
