const test = require('node:test');
const assert = require('node:assert/strict');
const { move, canMove } = require('../engine.js');
const grid = (...rows) => rows.flat();
test('each original tile merges only once and scores correctly', () => {
  const board = grid([2,2,2,2], [2,2,4,0], [4,0,4,4], [0,0,0,0]);
  const snapshot = board.slice();
  const result = move(board, 'left');
  assert.deepEqual(result.board, grid([4,4,0,0], [4,4,0,0], [8,4,0,0], [0,0,0,0]));
  assert.equal(result.gained, 20);
  assert.equal(result.changed, true);
  assert.deepEqual(board, snapshot);
});
test('right, up, and down use the correct traversal order', () => {
  const board = grid([2,0,0,2], [2,0,0,2], [0,0,0,0], [0,0,0,0]);
  assert.deepEqual(move(board, 'right').board, grid([0,0,0,4], [0,0,0,4], [0,0,0,0], [0,0,0,0]));
  assert.deepEqual(move(board, 'up').board, grid([4,0,0,4], [0,0,0,0], [0,0,0,0], [0,0,0,0]));
  assert.deepEqual(move(board, 'down').board, grid([0,0,0,0], [0,0,0,0], [0,0,0,0], [4,0,0,4]));
});
test('an unchanged move awards no points', () => {
  const board = grid([2,4,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]);
  assert.equal(move(board, 'left').changed, false);
  assert.equal(move(board, 'left').gained, 0);
});
test('a full board ends only when no adjacent numbers match', () => {
  const board = grid([2,4,2,4], [4,2,4,2], [2,4,2,4], [4,2,4,2]);
  assert.equal(canMove(board), false);
  board[0] = 4;
  assert.equal(canMove(board), true);
  board[0] = 0;
  assert.equal(canMove(board), true);
});
test('a vertical merge keeps a full board playable', () => {
  const board = grid([2,4,2,4], [2,8,4,2], [8,4,2,4], [4,2,4,2]);
  assert.equal(canMove(board), true);
});
