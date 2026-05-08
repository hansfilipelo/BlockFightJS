import { Stone, StoneColor } from "../stone.mjs"

const ROTATION = Object.freeze({
  Z_ORIENTATION: 0,
  ALTERNATE: 1,
});

export class ZShape {
  constructor(board) {
    this.board_ = board;
    this.current_rotation_ = ROTATION.Z_ORIENTATION;
    this.color_ = StoneColor.RED;

    this.newStones(board);
  }

  static canCreate(board) {
    const middle_x = board.getMiddleX();
    return !board.hasStone(middle_x - 2, -2) &&
           !board.hasStone(middle_x - 1, -2) &&
           !board.hasStone(middle_x - 1, -1) &&
           !board.hasStone(middle_x, -1);
  }

  newStones(board) {
    this.board_ = board;
    const middle_x = board.getMiddleX();
    this.stones_ = [
      new Stone(middle_x - 2, -2, this.color_, this.board_),  // top left
      new Stone(middle_x - 1, -2, this.color_, this.board_),  // top right
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
    if (this.current_rotation_ === ROTATION.Z_ORIENTATION) {
      if (!this.stones_[0].canMove(0, 1) ||
          !this.stones_[2].canMove(0, 1) ||
          !this.stones_[3].canMove(0, 1)) {
        return false;
      }

      this.stones_[0].move(0, 1);
      this.stones_[2].move(0, 1);
      this.stones_[1].move(0, 1);
      this.stones_[3].move(0, 1);
    } else if (this.current_rotation_ === ROTATION.ALTERNATE) {
      if (!this.stones_[1].canMove(0, 1) ||
          !this.stones_[3].canMove(0, 1)) {
        return false;
      }
      this.stones_[1].move(0, 1);
      this.stones_[0].move(0, 1);
      this.stones_[3].move(0, 1);
      this.stones_[2].move(0, 1);
    }

    return true;
  }

  rotate() {
    if (this.current_rotation_ === ROTATION.Z_ORIENTATION) {
      if (this.stones_[0].canMove(0, 1) &&
          this.stones_[3].canMove(-2, 1)) {
        // stone[1] and stone[2] stay in place
        this.stones_[0].move(1, -1);
        this.stones_[2].move(-1, -1);
        this.stones_[3].move(-2, 0);
        this.current_rotation_ = ROTATION.ALTERNATE;
      }
    } else if (this.current_rotation_ === ROTATION.ALTERNATE) {
      let x_pos = this.stones_[0].x_pos();
      if (x_pos === this.board_.width() - 1) {
        this.left()
      }
      // Rotate from horizontal Z back to vertical Z
      // Reverse the movements
      if (this.stones_[0].canMove(0, -1) &&
          this.stones_[3].canMove(2, -1)) {
        // stone[1] and stone[2] stay in place
        this.stones_[3].move(2, 0);
        this.stones_[2].move(1, 1);
        this.stones_[0].move(-1, 1);
        this.current_rotation_ = ROTATION.Z_ORIENTATION;
      }
    }
  }

  left() {
    if (this.current_rotation_ === ROTATION.Z_ORIENTATION) {
      // Check leftmost stones: stones 0 and 2 (left column)
      if (!this.stones_[0].canMove(-1, 0) || !this.stones_[2].canMove(-1, 0)) {
        return false;
      }

      this.stones_[0].move(-1, 0);
      this.stones_[2].move(-1, 0);
      this.stones_[1].move(-1, 0);
      this.stones_[3].move(-1, 0);
    } else if (this.current_rotation_ === ROTATION.ALTERNATE) {
      // Check leftmost stones: stones 0 and 3 (left column)
      if (!this.stones_[0].canMove(-1, 0) ||
          !this.stones_[2].canMove(-1, 0) ||
          !this.stones_[3].canMove(-1, 0)) {
        return false;
      }

      this.stones_[0].move(-1, 0);
      this.stones_[3].move(-1, 0);
      this.stones_[2].move(-1, 0);
      this.stones_[1].move(-1, 0);
    }

    return true;
  }

  right() {
    if (this.current_rotation_ === ROTATION.Z_ORIENTATION) {
      // Check rightmost stones: stones 1 and 3 (right column)
      if (!this.stones_[1].canMove(1, 0) || !this.stones_[3].canMove(1, 0)) {
        return false;
      }
      this.stones_[1].move(1, 0);
      this.stones_[0].move(1, 0);
      this.stones_[3].move(1, 0);
      this.stones_[2].move(1, 0);
    } else if (this.current_rotation_ === ROTATION.ALTERNATE) {
      // Check rightmost stones: stones 1 and 2 (right column)
      if (!this.stones_[0].canMove(1, 0) ||
          !this.stones_[1].canMove(1, 0) ||
          !this.stones_[3].canMove(1, 0)) {
        return false;
      }
      this.stones_[0].move(1, 0);
      this.stones_[1].move(1, 0);
      this.stones_[2].move(1, 0);
      this.stones_[3].move(1, 0);
    }

    return true;
  }
};
