import { Stone, StoneColor } from "../stone.mjs"

const ROTATION = Object.freeze({
  DEFAULT: 0,
});

export class OShape {
  constructor(board) {
    this.board_ = board;
    this.current_rotation_ = ROTATION.DEFAULT;
    this.color_ = StoneColor.YELLOW;

    this.newStones(board);
  }

  static canCreate(board) {
    const middle_x = board.getMiddleX();
    return !board.hasStone(middle_x - 1, -2) &&
           !board.hasStone(middle_x, -2) &&
           !board.hasStone(middle_x - 1, -1) &&
           !board.hasStone(middle_x, -1);
  }

  newStones(board) {
    this.board_ = board;
    const middle_x = board.getMiddleX();
    this.stones_ = [
      new Stone(middle_x - 1, -2, this.color_, this.board_),  // top left
      new Stone(middle_x, -2, this.color_, this.board_),      // top right
      new Stone(middle_x - 1, -1, this.color_, this.board_),  // bottom left
      new Stone(middle_x, -1, this.color_, this.board_),      // bottom right
    ];
  }

  getRowSpan() {
    let span = [NaN, NaN];
    for (let stone of this.stones_) {
      if (isNaN(span[0]) || stone.y_pos() < span[0]) {
        span[0] = stone.y_pos();
      }
      if (isNaN(span[1]) || stone.y_pos() > span[1]) {
        span[1] = stone.y_pos();
      }
    }
    return span;
  }

  drop() {
    // Check bottom row stones (stones 2 and 3)
    if (!this.stones_[2].canMove(0, 1) || !this.stones_[3].canMove(0, 1)) {
      return false;
    }

    // Move all stones down
    this.stones_[2].move(0, 1);
    this.stones_[3].move(0, 1);
    this.stones_[0].move(0, 1);
    this.stones_[1].move(0, 1);

    return true;
  }

  rotate() {
    // O-shape doesn't rotate - it's a square
    // No-op
  }

  left() {
    // Check leftmost stones (stones 0 and 2)
    if (!this.stones_[0].canMove(-1, 0) || !this.stones_[2].canMove(-1, 0)) {
      return false;
    }

    // Move all stones left
    this.stones_[0].move(-1, 0);
    this.stones_[2].move(-1, 0);
    this.stones_[1].move(-1, 0);
    this.stones_[3].move(-1, 0);

    return true;
  }

  right() {
    // Check rightmost stones (stones 1 and 3)
    if (!this.stones_[1].canMove(1, 0) || !this.stones_[3].canMove(1, 0)) {
      return false;
    }

    // Move all stones right
    this.stones_[1].move(1, 0);
    this.stones_[3].move(1, 0);
    this.stones_[0].move(1, 0);
    this.stones_[2].move(1, 0);

    return true;
  }
};
