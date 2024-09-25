import { Stone } from "./stone.mjs"

const ROTATION = Object.freeze({
  VERTICAL: 0,
  HORIZONTAL: 1,
});

export class IShape {
  constructor(board) {
    this.board_ = board;
    this.current_rotation_ = ROTATION.VERTICAL;

    this.stones_ = [
      new Stone(5, -4, this.board_),
      new Stone(5, -3, this.board_),
      new Stone(5, -2, this.board_),
      new Stone(5, -1, this.board_),
    ];
  }

  drop() {
    if (this.current_rotation_ === ROTATION.VERTICAL) {
      if (!this.stones_[3].canMove(0, 1)) {
        return false;
      }
    } else if (this.current_rotation_ === ROTATION.HORIZONTAL) {
      for (const stone of this.stones_) {
        if (!stone.canMove(0, 1)) {
          return false;
        }
      };
    }

    for (let i = 3; i >= 0; --i) {
      this.stones_[i].move(0, 1);
    }
    return true;
  }

  rotate() {
    if (this.current_rotation_ === ROTATION.VERTICAL) {
      if (this.stones_[0].canMove(1, 1) &&
          this.stones_[2].canMove(-1, -1) &&
          this.stones_[3].canMove(-2, -2)) {
        this.stones_[0].move(1, 1);
        this.stones_[2].move(-1, -1);
        this.stones_[3].move(-2, -2);
        this.current_rotation_ = ROTATION.HORIZONTAL;
      }
    } else if (this.current_rotation_ === ROTATION.HORIZONTAL) {
      if (this.stones_[0].canMove(-1, -1) &&
          this.stones_[2].canMove(1, 1) &&
          this.stones_[3].canMove(2, 2)) {
        this.stones_[0].move(-1, -1);
        this.stones_[2].move(1, 1);
        this.stones_[3].move(2, 2);
        this.current_rotation_ = ROTATION.VERTICAL;
      }
    }
  }

  left() {
    if (this.current_rotation_ === ROTATION.VERTICAL) {
      for (const stone of this.stones_) {
        if (!stone.canMove(-1, 0)) {
          return false;
        }
      }
    } else if (this.current_rotation_ === ROTATION.HORIZONTAL) {
      if (!this.stones_[3].canMove(-1, 0)) {
        return false;
      }
    }

    for (let i = 3; i >= 0; --i) {
      this.stones_[i].move(-1, 0);
    }

    return true;
  }

  right() {
    if (this.current_rotation_ === ROTATION.VERTICAL) {
      for (const stone of this.stones_) {
        if (!stone.canMove(1, 0)) {
          return false;
        }
      }
    } else if (this.current_rotation_ === ROTATION.HORIZONTAL) {
      if (!this.stones_[0].canMove(1, 0)) {
        return false;
      }
    }

    for (let i = 0; i < this.stones_.length; ++i) {
      this.stones_[i].move(1, 0);
    }
    return true;
  }
};