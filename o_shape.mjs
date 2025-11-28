import { Stone, StoneColor } from "./stone.mjs"

const ROTATION = Object.freeze({
  DEFAULT: 0,
});

export class OShape {
  constructor(board) {
    this.board_ = board;
    this.current_rotation_ = ROTATION.DEFAULT;
    this.color_ = StoneColor.YELLOW;

    // O-shape (2x2 square):
    // [X][X]
    // [X][X]
    this.stones_ = [
      new Stone(4, -2, this.color_, this.board_),  // top left
      new Stone(5, -2, this.color_, this.board_),  // top right
      new Stone(4, -1, this.color_, this.board_),  // bottom left
      new Stone(5, -1, this.color_, this.board_),  // bottom right
    ];
  }

  static canCreate(board) {
    return !board.hasStone(4, -2) &&
           !board.hasStone(5, -2) &&
           !board.hasStone(4, -1) &&
           !board.hasStone(5, -1);
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

