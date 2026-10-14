/* Pure game rules, shared by the browser and the Node.js checks. */
(function (root) {
  'use strict';
  function move(board, direction) {
    if (!['left', 'right', 'up', 'down'].includes(direction)) throw new Error('Invalid direction');
    const result = Array(16).fill(0);
    let gained = 0;
    for (let line = 0; line < 4; line++) {
      const indexes = Array.from({ length: 4 }, (_, position) => {
        if (direction === 'left') return line * 4 + position;
        if (direction === 'right') return line * 4 + 3 - position;
        if (direction === 'up') return position * 4 + line;
        return (3 - position) * 4 + line;
      });
      const values = indexes.map(index => board[index]).filter(Boolean);
      const merged = [];
      for (let i = 0; i < values.length; i++) {
        if (values[i] === values[i + 1]) {
          const value = values[i] * 2;
          merged.push(value);
          gained += value;
          i++;
        } else merged.push(values[i]);
      }
      indexes.forEach((index, position) => { result[index] = merged[position] || 0; });
    }
    return { board: result, gained, changed: result.some((value, index) => value !== board[index]) };
  }
  function canMove(board) {
    return board.some(value => value === 0) || ['left', 'up'].some(direction => move(board, direction).changed);
  }
  const engine = { move, canMove };
  if (typeof module !== 'undefined' && module.exports) module.exports = engine;
  else root.Engine2048 = engine;
})(typeof globalThis !== 'undefined' ? globalThis : this);
