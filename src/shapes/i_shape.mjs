import { Stone, StoneColor} from "../stone.mjs"

const ROTATION = Object.freeze({
  VERTICAL: 0,
  HORIZONTAL: 1,
});

export class IShape {
  constructor(board) {
    this.board_ = null;
    this.current_rotation_ = ROTATION.VERTICAL;
    this.color_ = StoneColor.PURPLE;

    this.newStones(board);
  }

  static canCreate(board) {
    const middle_x = board.getMiddleX();
    return !board.hasStone(middle_x, -4) &&
           !board.hasStone(middle_x, -3) &&
           !board.hasStone(middle_x, -2) &&
           !board.hasStone(middle_x, -1);
  }

  newStones(board) {
    this.board_ = board;
    const middle_x = board.getMiddleX();
    this.stones_ = [
      new Stone(middle_x, -4, this.color_, this.board_),
      new Stone(middle_x, -3, this.color_, this.board_),
      new Stone(middle_x, -2, this.color_, this.board_),
      new Stone(middle_x, -1, this.color_, this.board_),
    ];
  }

  getRowSpan() {
    return [this.stones_[0].y_pos(), this.stones_[3].y_pos()];
  }

  canDrop(drop_attempt) {
    if (this.current_rotation_ === ROTATION.VERTICAL) {
      return this.stones_[3].canMove(0, drop_attempt);
    } else if (this.current_rotation_ === ROTATION.HORIZONTAL) {
      for (const stone of this.stones_) {
        if (!stone.canMove(0, drop_attempt)) {
          return false;
        }
      }
      return true;
    }
  }

  drop() {
    if (!this.canDrop(1)) {
      return false;
    }

    for (let i = 3; i >= 0; --i) {
      this.stones_[i].move(0, 1);
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
    if (this.current_rotation_ === ROTATION.VERTICAL) {
      let x_pos = this.stones_[0].x_pos();
      if (x_pos === 0 || x_pos === 1) {
        for (let i = 0; i < 2 - x_pos; ++i) {
          this.right();
        }
      } else if (x_pos === this.board_.width() - 1) {
        this.left();
      }

      if (this.stones_[0].canMove(1, 1) &&
          this.stones_[2].canMove(-1, -1) &&
          this.stones_[3].canMove(-2, -2)) {
        this.stones_[0].move(1, 1);
        this.stones_[2].move(-1, -1);
        this.stones_[3].move(-2, -2);
        this.current_rotation_ = ROTATION.HORIZONTAL;
      } else {
        if (x_pos === 0 || x_pos === 1) {
          for (let i = 0; i < 2 - x_pos; ++i) {
            this.left();
          }
        } else if (x_pos === this.board_.width() - 1) {
          this.right();
        }
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
