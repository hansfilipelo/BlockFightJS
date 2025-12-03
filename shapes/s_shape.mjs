import { Stone, StoneColor } from "../stone.mjs"

const ROTATION = Object.freeze({
  S_ORIENTATION: 0,
  ALTERNATE: 1,
});

export class SShape {
  constructor(board) {
    this.board_ = board;
    this.current_rotation_ = ROTATION.S_ORIENTATION;
    this.color_ = StoneColor.GREEN;

    // S-shape in vertical orientation:
    //    [X][X]
    // [X][X]
    this.stones_ = [
      new Stone(4, -2, this.color_, this.board_),  // top left
      new Stone(5, -2, this.color_, this.board_),  // top right
      new Stone(3, -1, this.color_, this.board_),  // bottom left
      new Stone(4, -1, this.color_, this.board_),  // bottom right
    ];
  }

  static canCreate(board) {
    return !board.hasStone(4, -3) &&
           !board.hasStone(5, -3) &&
           !board.hasStone(3, -2) &&
           !board.hasStone(4, -2);
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
    if (this.current_rotation_ === ROTATION.S_ORIENTATION) {
      if (!this.stones_[1].canMove(0, 1) ||
          !this.stones_[2].canMove(0, 1) ||
          !this.stones_[3].canMove(0, 1)) {
        return false;
      }

      this.stones_[2].move(0, 1);
      this.stones_[3].move(0, 1);
      this.stones_[0].move(0, 1);
      this.stones_[1].move(0, 1);
    } else if (this.current_rotation_ === ROTATION.ALTERNATE) {
      if (!this.stones_[2].canMove(0, 1) || !this.stones_[0].canMove(0, 1)) {
        return false;
      }
      this.stones_[0].move(0, 1);
      this.stones_[1].move(0, 1);
      this.stones_[2].move(0, 1);
      this.stones_[3].move(0, 1);
    }

    return true;
  }

  rotate() {
    if (this.current_rotation_ === ROTATION.S_ORIENTATION) {
      if (this.stones_[1].canMove(-1, -1) &&
          this.stones_[2].canMove(2, 0)) {
        // stone[0] stays in place
        this.stones_[1].move(-1, -1);
        this.stones_[2].move(2, 0);
        this.stones_[3].move(1, -1);
        this.current_rotation_ = ROTATION.ALTERNATE;
      }
    } else if (this.current_rotation_ === ROTATION.ALTERNATE) {
      // Rotate from horizontal S back to vertical S
      // Reverse the movements
      if (this.stones_[2].canMove(-2, 0) &&
          this.stones_[3].canMove(-1, 1)) {
        // stone[0] stays in place
        this.stones_[2].move(-2, 0);
        this.stones_[3].move(-1, 1);
        this.stones_[1].move(1, 1);
        this.current_rotation_ = ROTATION.S_ORIENTATION;
      }
    }
  }

  left() {
    if (this.current_rotation_ === ROTATION.S_ORIENTATION) {
      // Check leftmost stones: stone 0 (left column)
      if (!this.stones_[0].canMove(-1, 0) || !this.stones_[2].canMove(-1, 0)) {
        return false;
      }
    } else if (this.current_rotation_ === ROTATION.ALTERNATE) {
      if (!this.stones_[0].canMove(-1, 0) ||
          !this.stones_[1].canMove(-1, 0) ||
          !this.stones_[2].canMove(-1, 0)) {
        return false;
      }
    }

    for (let i = 0; i < this.stones_.length; ++i) {
      this.stones_[i].move(-1, 0);
    }

    return true;
  }

  right() {
    if (this.current_rotation_ === ROTATION.S_ORIENTATION) {
      // Check rightmost stones: stones 1 and 3 (right column)
      if (!this.stones_[1].canMove(1, 0) || !this.stones_[3].canMove(1, 0)) {
        return false;
      }
      this.stones_[1].move(1, 0);
      this.stones_[0].move(1, 0);
      this.stones_[3].move(1, 0);
      this.stones_[2].move(1, 0);
    } else if (this.current_rotation_ === ROTATION.ALTERNATE) {
      // Check rightmost stones: stones 2 and 3 (right column)
      if (!this.stones_[1].canMove(1, 0) || !this.stones_[3].canMove(1, 0)) {
        return false;
      }
      this.stones_[2].move(1, 0);
      this.stones_[3].move(1, 0);
      this.stones_[0].move(1, 0);
      this.stones_[1].move(1, 0);
    }

    return true;
  }
};

