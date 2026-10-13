(() => {
  'use strict';
  const die = document.getElementById('dice-display');
  const face = die.querySelector('.die-face');
  const rollButton = document.getElementById('roll-button');
  const rollLabel = document.getElementById('roll-label');
  const card = document.getElementById('game-card');
  const message = document.getElementById('message');
  const kicker = document.getElementById('result-kicker');
  const detail = document.getElementById('result-detail');
  const rollCount = document.getElementById('roll-count');
  const fiveCount = document.getElementById('five-count');
  const historyList = document.getElementById('roll-history');
  const resetButton = document.getElementById('reset-button');
  const celebration = document.getElementById('celebration');
  const dialog = document.getElementById('rules-dialog');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const positions = {
    1: [5], 2: [1, 9], 3: [1, 5, 9],
    4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9]
  };
  let isRolling = false;
  let rolls = 0;
  let fives = 0;
  let history = [];
  let celebrationTimer;

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

  function updateSession() {
    rollCount.textContent = String(rolls).padStart(2, '0');
    fiveCount.textContent = String(fives).padStart(2, '0');
    historyList.replaceChildren();
    if (!history.length) {
      const empty = document.createElement('li');
      empty.className = 'empty-history';
      empty.textContent = 'Your story starts with a roll.';
      historyList.append(empty);
      return;
    }
    for (const value of history) {
      const item = document.createElement('li');
      item.textContent = value;
      item.setAttribute('aria-label', value === 5 ? '5. Drink!' : String(value));
      if (value === 5) item.className = 'is-five';
      historyList.append(item);
    }
  }

  function celebrate() {
    if (reducedMotion.matches) return;
    for (let i = 0; i < 20; i++) {
      const piece = document.createElement('span');
      const angle = (i / 20) * Math.PI * 2;
      piece.className = 'confetti';
      piece.style.setProperty('--x', `${Math.cos(angle) * 140}px`);
      piece.style.setProperty('--y', `${Math.sin(angle) * 115}px`);
      piece.style.setProperty('--r', `${i * 73}deg`);
      piece.style.backgroundColor = i % 2 ? '#d9dfae' : '#ff8055';
      celebration.append(piece);
    }
    celebrationTimer = window.setTimeout(() => celebration.replaceChildren(), 900);
  }

  // Rejection sampling gives all six sides equal probability.
  function randomFace() {
    if (!window.crypto?.getRandomValues) return Math.floor(Math.random() * 6) + 1;
    const sample = new Uint32Array(1);
    do { window.crypto.getRandomValues(sample); } while (sample[0] >= 4294967292);
    return (sample[0] % 6) + 1;
  }

  function rollDice() {
    if (isRolling || dialog.open) return;
    isRolling = true;
    rollButton.disabled = true;
    die.disabled = true;
    resetButton.disabled = true;
    die.setAttribute('aria-label', 'Rolling the die');
    clearTimeout(celebrationTimer);
    celebration.replaceChildren();
    card.classList.remove('is-five');
    card.classList.add('rolling-state');
    die.classList.add('rolling');
    rollLabel.textContent = 'Rolling…';
    kicker.textContent = 'A MOMENT OF SUSPENSE';
    message.textContent = 'Here goes…';
    detail.textContent = 'The odds are doing their thing.';
    const value = randomFace();
    let preview;
    if (!reducedMotion.matches) {
      let frame = 0;
      preview = window.setInterval(() => {
        showFace((frame++ % 6) + 1);
        die.setAttribute('aria-label', 'Rolling the die');
      }, 90);
    }
    window.setTimeout(() => {
      clearInterval(preview);
      showFace(value);
      die.classList.remove('rolling');
      card.classList.remove('rolling-state');
      rolls++;
      if (value === 5) fives++;
      history.unshift(value);
      history = history.slice(0, 6);
      updateSession();
      kicker.textContent = `YOU ROLLED A ${value}`;
      if (value === 5) {
        card.classList.add('is-five');
        message.textContent = 'Drink!';
        detail.textContent = 'A five is a five. Take a sip, then pass it on.';
        celebrate();
      } else {
        message.textContent = "You're in the clear.";
        detail.textContent = 'No sip this time. Pass the turn to the next person.';
      }
      rollLabel.textContent = 'Roll again';
      isRolling = false;
      rollButton.disabled = false;
      die.disabled = false;
      resetButton.disabled = false;
    }, reducedMotion.matches ? 180 : 900);
  }

  die.addEventListener('click', rollDice);
  rollButton.addEventListener('click', rollDice);
  document.addEventListener('keydown', event => {
    if (event.code !== 'Space' || event.repeat || event.altKey || event.ctrlKey || event.metaKey || dialog.open) return;
    if (event.target.closest('button, a, input, textarea, select, [contenteditable]')) return;
    event.preventDefault();
    rollDice();
  });
  resetButton.addEventListener('click', () => {
    if (isRolling) return;
    rolls = 0;
    fives = 0;
    history = [];
    updateSession();
    card.classList.remove('is-five');
    clearTimeout(celebrationTimer);
    celebration.replaceChildren();
    showFace(5);
    kicker.textContent = 'FRESH START';
    message.textContent = 'Your move.';
    detail.textContent = 'Session reset. Give the die another roll.';
    rollLabel.textContent = 'Roll the dice';
  });
  document.getElementById('rules-trigger').addEventListener('click', () => dialog.showModal());
  document.getElementById('dialog-close').addEventListener('click', () => dialog.close());
  document.getElementById('rules-done').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  showFace(5);
})();
