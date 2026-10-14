const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../assets/game.js'), 'utf8');
class Element {
  constructor() {
    this.children = []; this.style = {}; this.attrs = {}; this.events = {};
    this.disabled = false; this.textContent = ''; this.classes = new Set();
    this.classList = {
      add: (...xs) => xs.forEach(x => this.classes.add(x)),
      remove: (...xs) => xs.forEach(x => this.classes.delete(x))
    };
  }
  set className(value) { this.classes = new Set(value.split(' ')); }
  setAttribute(key, value) { this.attrs[key] = value; }
  replaceChildren(...children) { this.children = children; }
  append(child) { this.children.push(child); }
  addEventListener(type, handler) { this.events[type] = handler; }
  querySelector() { return this.face ??= new Element(); }
}
function setup(reduced) {
  const nodes = new Map(); const samples = []; const timers = new Map(); let timer = 0;
  const document = {
    getElementById: id => { if (!nodes.has(id)) nodes.set(id,new Element()); return nodes.get(id); },
    createElement: () => new Element()
  };
  const window = {
    matchMedia: () => ({matches:reduced}),
    crypto: {getRandomValues: array => {
      assert(samples.length, 'test must provide RNG sample'); array[0] = samples.shift(); return array;
    }},
    setTimeout: (fn,delay) => {timers.set(++timer,{fn,delay});return timer;},
    setInterval: () => ++timer
  };
  vm.runInNewContext(source, {document,window,clearInterval(){},Uint32Array,Math});
  const finish = () => {
    assert.equal(timers.size,1);
    const [id,task] = [...timers][0];
    assert.equal(task.delay,reduced?100:1200);
    timers.delete(id); task.fn();
  };
  return {
    node:id=>nodes.get(id), samples, timers, finish,
    roll(value) { samples.push(value-1); nodes.get('dice-display').events.click(); finish(); }
  };
}
for (const reduced of [false,true]) {
  for (let value = 1; value <= 6; value++) {
    const game = setup(reduced); const n = game.node;
    assert.equal(n('dice-display').face.children.length,5);
    assert(!n('result').classes.has('drink'), 'initial face is not a rolled five');
    game.samples.push(value-1);
    n('dice-display').events.click();
    assert(n('dice-display').disabled);
    assert(n('dice-stage').classes.has('rolling'));
    assert.equal(n('message').textContent,'');
    n('dice-display').events.click(); // repeated taps must not queue another result
    game.finish();
    assert.equal(n('dice-display').face.children.length,value);
    assert.equal(n('message').textContent,value===5?'Drink!':'Tap to roll');
    assert.equal(n('instruction').textContent,value===5?'Roll out of the five':'');
    assert.equal(n('message').classes.has('is-five'),value===5);
    assert.equal(n('result').classes.has('drink'),value===5);
    assert(!n('dice-display').disabled);
    assert(!n('dice-stage').classes.has('rolling'));
    assert(n('announcement').textContent.includes(`You rolled a ${value}.`));
  }
  const game = setup(reduced); const n = game.node;
  game.roll(5);
  assert.equal(n('message').textContent,'Drink!');
  game.roll(5);
  assert.equal(n('message').textContent,'Drink!');
  assert.equal(n('instruction').textContent,'2 fives in a row. Roll out of the five.');
  game.roll(5);
  assert.equal(n('message').textContent,'Everyone drinks!');
  assert.equal(n('instruction').textContent,'3 fives in a row. Roll out of the five.');
  assert(n('dice-stage').classes.has('everyone'));
  assert(n('result').classes.has('everyone'));
  assert(n('announcement').textContent.includes('Everyone drinks!'));
  game.roll(5);
  assert.equal(n('message').textContent,'Drink!', 'group event occurs on the third five only');
  assert(!n('result').classes.has('everyone'));
  game.roll(2);
  assert.equal(n('message').textContent,"You're out!");
  assert.equal(n('instruction').textContent,'Pass the die');
  assert(!n('result').classes.has('drink'));
  game.roll(5);
  assert.equal(n('instruction').textContent,'Roll out of the five', 'non-five resets the streak');
  game.roll(5);
  game.roll(1);
  game.roll(5);
  assert.equal(n('message').textContent,'Drink!');
  assert(!n('result').classes.has('everyone'), 'separated fives do not count as consecutive');
  game.roll(5);
  game.roll(5);
  assert.equal(n('message').textContent,'Everyone drinks!', 'new streak can trigger another group event');
  game.samples.push(4294967295,0); // discarded sample at RNG boundary
  n('dice-display').events.click();
  game.finish();
  assert.equal(n('dice-display').face.children.length,1);
}
console.log('PASS: all six outcomes, repeat-tap lock, third consecutive five, rolling out/reset, separate streaks, announcements, normal/reduced-motion timing, RNG boundary.');
