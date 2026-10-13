(() => {
  'use strict';
  const die = document.getElementById('dice-display');
  const face = die.querySelector('.die-face');
  const message = document.getElementById('message');
  const announcement = document.getElementById('announcement');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const positions = {
    1: [5], 2: [1, 9], 3: [1, 5, 9],
    4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9]
  };
  let isRolling = false;

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
    die.classList.add('rolling');
    message.classList.remove('is-five');
    message.textContent = '';
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
      message.textContent = value === 5 ? 'Drink!' : 'Tap to roll';
      if (value === 5) message.classList.add('is-five');
      announcement.textContent = `You rolled a ${value}.${value === 5 ? ' Drink!' : ''}`;
      isRolling = false;
      die.disabled = false;
    }, reducedMotion.matches ? 100 : 800);
  }

  // A native button also supports Enter and Space without extra visible controls.
  die.addEventListener('click', rollDice);
  showFace(5);
})();
