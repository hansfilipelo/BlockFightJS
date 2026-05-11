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

    this.newStones(board);
  }

  static canCreate(board) {
    const middle_x = board.getMiddleX();
    return !board.hasStone(middle_x - 1, -2) &&
           !board.hasStone(middle_x, -2) &&
           !board.hasStone(middle_x - 2, -1) &&
           !board.hasStone(middle_x - 1, -1);
  }

  newStones(board) {
    this.board_ = board;
    const middle_x = board.getMiddleX();
    this.stones_ = [
      new Stone(middle_x - 1, -2, this.color_, this.board_),  // top left
      new Stone(middle_x, -2, this.color_, this.board_),      // top right
      new Stone(middle_x - 2, -1, this.color_, this.board_),  // bottom left
      new Stone(middle_x - 1, -1, this.color_, this.board_),  // bottom right
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

  canDrop(drop_attempt) {
    if (this.current_rotation_ === ROTATION.S_ORIENTATION) {
      return this.stones_[1].canMove(0, drop_attempt) &&
             this.stones_[2].canMove(0, drop_attempt) &&
             this.stones_[3].canMove(0, drop_attempt);
    } else if (this.current_rotation_ === ROTATION.ALTERNATE) {
      return this.stones_[2].canMove(0, drop_attempt) &&
             this.stones_[0].canMove(0, drop_attempt);
    }
  }

  drop() {
    if (!this.canDrop(1)) {
      return false;
    }

    if (this.current_rotation_ === ROTATION.S_ORIENTATION) {
      this.stones_[2].move(0, 1);
      this.stones_[3].move(0, 1);
      this.stones_[0].move(0, 1);
      this.stones_[1].move(0, 1);
    } else if (this.current_rotation_ === ROTATION.ALTERNATE) {
      this.stones_[0].move(0, 1);
      this.stones_[1].move(0, 1);
      this.stones_[2].move(0, 1);
      this.stones_[3].move(0, 1);
    }

    return true;
  }

  getDropCount() {
    let drop_attempt = 1;
    while (this.canDrop(drop_attempt)) {
      drop_attempt++;
    }

    return drop_attempt - 1;
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
      let x_pos = this.stones_[0].x_pos();
      if (x_pos === 0 ) {
        this.right();
      }
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
