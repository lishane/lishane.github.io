const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../assets/game.js'), 'utf8');
class Element {
  constructor() { this.children = []; this.style = {setProperty(){}}; this.attrs = {}; this.events = {}; this.disabled = false; this.textContent = ''; this.classes = new Set(); this.classList = {add: (...xs) => xs.forEach(x => this.classes.add(x)), remove: (...xs) => xs.forEach(x => this.classes.delete(x))}; }
  set className(value) { this.classes = new Set(value.split(' ')); }
  setAttribute(key, value) { this.attrs[key] = value; }
  replaceChildren(...children) { this.children = children; }
  append(child) { this.children.push(child); }
  addEventListener(type, handler) { this.events[type] = handler; }
  querySelector() { return this.face ??= new Element(); }
  closest() { return false; }
  showModal() { this.open = true; }
  close() { this.open = false; }
  getBoundingClientRect() { return {left:0,right:400,top:0,bottom:600}; }
}
function setup(reduced) {
  const nodes = new Map(); const events = {}; let samples = []; const timers = new Map(); let timer = 0;
  const document = { getElementById: id => { if (!nodes.has(id)) nodes.set(id,new Element()); return nodes.get(id); }, createElement: () => new Element(), addEventListener: (type, handler) => events[type] = handler };
  const window = { matchMedia: () => ({matches:reduced}), crypto: {getRandomValues: array => { assert(samples.length, 'test must provide RNG sample'); array[0] = samples.shift(); return array; }}, setTimeout: (fn,delay) => {timers.set(++timer,{fn,delay});return timer;}, setInterval: () => ++timer };
  const clear = id => timers.delete(id);
  vm.runInNewContext(source, {document,window,clearTimeout:clear,clearInterval:clear,Uint32Array,Math});
  return {node:id=>nodes.get(id), events, sample: (...values) => samples.push(...values), finish: () => {const [id,task] = [...timers].find(([,task])=>task.delay === (reduced?100:800));timers.delete(id);task.fn();}, timers};
}
for (const reduced of [false,true]) {
  const game = setup(reduced); const n = game.node;
  assert.equal(n('dice-display').face.children.length,5);
  for (let value = 1; value <= 6; value++) {
    game.sample(value-1);
    n('dice-display').events.click();
    assert(n('dice-display').disabled);
    assert.equal(n('message').textContent,'');
    n('dice-display').events.click(); // repeated taps must not queue another result
    assert.equal(game.timers.size,1);
    game.finish();
    assert.equal(n('dice-display').face.children.length,value);
    assert.equal(n('message').textContent,value===5?'Drink!':'Tap to roll');
    assert.equal(n('message').classes.has('is-five'),value===5);
    assert.equal(n('announcement').textContent,`You rolled a ${value}.${value === 5 ? ' Drink!' : ''}`);
    assert(!n('dice-display').disabled);
  }
  game.sample(4294967295,0); // discarded sample at RNG boundary
  n('dice-display').events.click();
  game.finish();
  assert.equal(n('dice-display').face.children.length,1);
}
console.log('PASS: all six results, repeat-tap lock, screen-reader announcements, reduced motion, RNG boundary.');
