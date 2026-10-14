(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const storageKey = '2048-garden-v1';
  let board = Array(16).fill(0), score = 0, best = 0, won = false, ended = false, previous = null;
  let spawned = -1;
  function validBoard(value) {
    return Array.isArray(value) && value.length === 16 && value.every(n => Number.isSafeInteger(n) && (n === 0 || (n >= 2 && Number.isInteger(Math.log2(n)))));
  }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify({ board, score, best, won })); } catch { /* The game also works without storage. */ }
  }
  function spawn() {
    const empty = board.map((value, index) => value === 0 ? index : -1).filter(index => index >= 0);
    if (!empty.length) return;
    spawned = empty[Math.floor(Math.random() * empty.length)];
    board[spawned] = Math.random() < 0.9 ? 2 : 4;
  }
  function render(message) {
    $('board').replaceChildren(...board.map((value, index) => {
      const cell = document.createElement('div');
      cell.className = 'cell' + (value ? ` tile-${value <= 2048 ? value : 'large'}` : '') + (index === spawned ? ' spawn' : '');
      cell.textContent = value || '';
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `第 ${Math.floor(index / 4) + 1} 行，第 ${index % 4 + 1} 列：${value || '空'}`);
      return cell;
    }));
    $('score').textContent = score;
    $('best').textContent = best;
    $('undo').disabled = previous === null;
    if (message) $('status').textContent = message;
    spawned = -1;
  }
  function showResult(victory) {
    $('result-icon').textContent = victory ? '✦' : '↻';
    $('result-title').textContent = victory ? '你拼出了 2048！' : '这一局，已尽兴。';
    $('result-text').textContent = victory ? '漂亮！继续合并，看看你的极限在哪里。' : `本局得分 ${score}，下一局再创纪录。`;
    $('continue').hidden = !victory;
    $('overlay').hidden = false;
  }
  function start() {
    board = Array(16).fill(0); score = 0; won = false; ended = false; previous = null;
    $('overlay').hidden = true;
    spawn(); spawn(); render('新的开始，祝你好运。'); save();
  }
  function play(direction) {
    if (ended || !$('overlay').hidden) return;
    const next = Engine2048.move(board, direction);
    if (!next.changed) {
      if (!Engine2048.canMove(board)) { ended = true; showResult(false); }
      return;
    }
    previous = { board: board.slice(), score, won };
    board = next.board; score += next.gained; best = Math.max(best, score);
    spawn();
    ended = !Engine2048.canMove(board);
    render(next.gained ? `合并成功，+${next.gained} 分。` : '每一步，都是新的可能。');
    if (!won && board.some(value => value >= 2048)) { won = true; showResult(true); }
    else if (ended) showResult(false);
    save();
  }
  $('restart').addEventListener('click', start);
  $('retry').addEventListener('click', start);
  $('continue').addEventListener('click', () => { $('overlay').hidden = true; if (ended) showResult(false); });
  $('undo').addEventListener('click', () => {
    if (!previous) return;
    ({ board, score, won } = previous); previous = null; ended = false;
    $('overlay').hidden = true; render('已撤销上一步。'); save();
  });
  const keys = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down' };
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const direction = keys[event.key] || keys[event.key.toLowerCase()];
    if (direction) { event.preventDefault(); play(direction); }
  });
  let touchStart = null;
  $('board').addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    touchStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
    $('board').setPointerCapture(event.pointerId);
  });
  $('board').addEventListener('pointerup', event => {
    if (!touchStart || touchStart.id !== event.pointerId) return;
    const dx = event.clientX - touchStart.x, dy = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 25) return;
    play(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  });
  $('board').addEventListener('pointercancel', () => { touchStart = null; });
  let restored = false;
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    if (stored && Number.isSafeInteger(stored.best) && stored.best >= 0) best = stored.best;
    if (stored && validBoard(stored.board) && stored.board.some(Boolean) && Number.isSafeInteger(stored.score) && stored.score >= 0) {
      board = stored.board; score = stored.score; best = Math.max(best, score); won = stored.won === true;
      ended = !Engine2048.canMove(board); restored = true;
      render('欢迎回来，继续上次的挑战。');
      if (!won && board.some(value => value >= 2048)) { won = true; showResult(true); }
      else if (ended) showResult(false);
    }
  } catch { /* Ignore damaged or unavailable local storage. */ }
  if (!restored) start();
})();
