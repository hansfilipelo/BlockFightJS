import { Stone, StoneColor } from "./stone.mjs"

const ROTATION = Object.freeze({
  DEFAULT: 0,
  ROTATED_90: 1,
  ROTATED_180: 2,
  ROTATED_270: 3,
});

export class JShape {
  constructor(board) {
    this.board_ = board;
    this.current_rotation_ = ROTATION.DEFAULT;
    this.color_ = StoneColor.BLUE;

    // J-shape in default orientation (0°):
    //    [X]
    //    [X]
    // [X][X]
    this.stones_ = [
      new Stone(5, -3, this.color_, this.board_),  // top
      new Stone(5, -2, this.color_, this.board_),  // middle (pivot)
      new Stone(5, -1, this.color_, this.board_),  // bottom left
      new Stone(4, -1, this.color_, this.board_),  // bottom right
    ];
  }

  static canCreate(board) {
    return !board.hasStone(5, -3) &&
           !board.hasStone(5, -2) &&
           !board.hasStone(4, -1) &&
           !board.hasStone(5, -1);
  }

  getRowSpan() {
    return [this.stones_[0].y_pos(), this.stones_[2].y_pos()];
  }

  drop() {
    if (this.current_rotation_ === ROTATION.DEFAULT) {
      // Check bottom row stones (stones 2 and 3)
      if (!this.stones_[2].canMove(0, 1) || !this.stones_[3].canMove(0, 1)) {
        return false;
      }
      this.stones_[2].move(0, 1);
      this.stones_[3].move(0, 1);
      this.stones_[1].move(0, 1);
      this.stones_[0].move(0, 1);
    } else if (this.current_rotation_ === ROTATION.ROTATED_90) {
      // Check bottom stone (stone 2)
      if (!this.stones_[2].canMove(0, 1) ||
          !this.stones_[0].canMove(0, 1) ||
          !this.stones_[1].canMove(0, 1)) {
        return false;
      }
      this.stones_[2].move(0, 1);
      this.stones_[0].move(0, 1);
      this.stones_[1].move(0, 1);
      this.stones_[3].move(0, 1);
    } else if (this.current_rotation_ === ROTATION.ROTATED_180) {
      // Check bottom row stones (stones 0 and 3)
      if (!this.stones_[0].canMove(0, 1) || !this.stones_[3].canMove(0, 1)) {
        return false;
      }
      this.stones_[0].move(0, 1);
      this.stones_[1].move(0, 1);
      this.stones_[2].move(0, 1);
      this.stones_[3].move(0, 1);
    } else if (this.current_rotation_ === ROTATION.ROTATED_270) {
      // Check bottom row stones (stones 0, 1, 3)
      if (!this.stones_[0].canMove(0, 1) ||
          !this.stones_[1].canMove(0, 1) ||
          !this.stones_[3].canMove(0, 1)) {
        return false;
      }
      this.stones_[0].move(0, 1);
      this.stones_[1].move(0, 1);
      this.stones_[3].move(0, 1);
      this.stones_[2].move(0, 1);
    }

    return true;
  }

  rotate() {
    if (this.current_rotation_ === ROTATION.DEFAULT) {
      // Rotate to 90° clockwise around stone[1] (5, -2):
      // [X]
      // [X][X][X]
      let x_pos = this.stones_[0].x_pos();
      if (x_pos === this.board_.width() - 1) {
        this.left();
      }
      if (this.stones_[0].canMove(1, 1) &&
          this.stones_[2].canMove(-1, -1) &&
          this.stones_[3].canMove(0, -2)) {
        this.stones_[0].move(1, 1);
        // stone[1] stays in place (pivot)
        this.stones_[2].move(-1, -1);
        this.stones_[3].move(0, -2);
        this.current_rotation_ = ROTATION.ROTATED_90;
      }
    } else if (this.current_rotation_ === ROTATION.ROTATED_90) {
      // Rotate to 180° clockwise around stone[1] (5, -2):
      //    [X][X]
      //    [X]
      //    [X]
      if (this.stones_[0].canMove(-1, 1) &&
          this.stones_[2].canMove(1, -1) &&
          this.stones_[3].canMove(2, 0)) {
        this.stones_[0].move(-1, 1);
        // stone[1] stays in place (pivot)
        this.stones_[2].move(1, -1);
        this.stones_[3].move(2, 0);
        this.current_rotation_ = ROTATION.ROTATED_180;
      }
    } else if (this.current_rotation_ === ROTATION.ROTATED_180) {
      // Rotate to 270° clockwise around stone[1] (5, -2):
      // [X][X][X]
      //       [X]
      let x_pos = this.stones_[0].x_pos();
      if (x_pos === 0) {
        this.right();
      }

      if (this.stones_[0].canMove(-1, -1) &&
          this.stones_[2].canMove(1, 1) &&
          this.stones_[3].canMove(0, 2)) {
        this.stones_[0].move(-1, -1);
        // stone[1] stays in place (pivot)
        this.stones_[2].move(1, 1);
        this.stones_[3].move(0, 2);
        this.current_rotation_ = ROTATION.ROTATED_270;
      }
    } else if (this.current_rotation_ === ROTATION.ROTATED_270) {
      // Rotate back to 0° (DEFAULT) clockwise around stone[1] (5, -2):
      //    [X]
      //    [X]
      // [X][X]
      if (this.stones_[0].canMove(1, -1) &&
          this.stones_[2].canMove(-1, 1) &&
          this.stones_[3].canMove(-2, 0)) {
        this.stones_[0].move(1, -1);
        // stone[1] stays in place (pivot)
        this.stones_[2].move(-1, 1);
        this.stones_[3].move(-2, 0);
        this.current_rotation_ = ROTATION.DEFAULT;
      }
    }
  }

  left() {
    if (this.current_rotation_ === ROTATION.DEFAULT) {
      // Check leftmost stone (stone 2)
      if (!this.stones_[3].canMove(-1, 0) ||
          !this.stones_[0].canMove(-1, 0) ||
          !this.stones_[1].canMove(-1, 0)) {
        return false;
      }
      this.stones_[3].move(-1, 0);
      this.stones_[0].move(-1, 0);
      this.stones_[1].move(-1, 0);
      this.stones_[2].move(-1, 0);
    } else if (this.current_rotation_ === ROTATION.ROTATED_90) {
      // Check leftmost stones (stones 0, 2)
      if (!this.stones_[2].canMove(-1, 0) ||
          !this.stones_[3].canMove(-1, 0)) {
        return false;
      }
      this.stones_[3].move(-1, 0);
      this.stones_[2].move(-1, 0);
      this.stones_[1].move(-1, 0);
      this.stones_[0].move(-1, 0);
    } else if (this.current_rotation_ === ROTATION.ROTATED_180) {
      // Check leftmost stones (stones 0, 1, 2)
      if (!this.stones_[0].canMove(-1, 0) ||
          !this.stones_[1].canMove(-1, 0) ||
          !this.stones_[2].canMove(-1, 0)) {
        return false;
      }
      this.stones_[0].move(-1, 0);
      this.stones_[1].move(-1, 0);
      this.stones_[2].move(-1, 0);
      this.stones_[3].move(-1, 0);
    } else if (this.current_rotation_ === ROTATION.ROTATED_270) {
      // Check leftmost stones (stones 2, 3)
      if (!this.stones_[0].canMove(-1, 0) ||
          !this.stones_[3].canMove(-1, 0)) {
        return false;
      }
      this.stones_[0].move(-1, 0);
      this.stones_[1].move(-1, 0);
      this.stones_[2].move(-1, 0);
      this.stones_[3].move(-1, 0);
    }

    return true;
  }

  right() {
    if (this.current_rotation_ === ROTATION.DEFAULT) {
      // Check rightmost stones (stones 0, 1, 3)
      if (!this.stones_[0].canMove(1, 0) ||
          !this.stones_[1].canMove(1, 0) ||
          !this.stones_[2].canMove(1, 0)) {
        return false;
      }
      this.stones_[0].move(1, 0);
      this.stones_[1].move(1, 0);
      this.stones_[2].move(1, 0);
      this.stones_[3].move(1, 0);
    } else if (this.current_rotation_ === ROTATION.ROTATED_90) {
      // Check rightmost stones (stones 2, 3)
      if (!this.stones_[0].canMove(1, 0) ||
          !this.stones_[3].canMove(1, 0)) {
        return false;
      }
      this.stones_[0].move(1, 0);
      this.stones_[1].move(1, 0);
      this.stones_[2].move(1, 0);
      this.stones_[3].move(1, 0);
    } else if (this.current_rotation_ === ROTATION.ROTATED_180) {
      // Check rightmost stones (stones 0, 1, 2)
      if (!this.stones_[0].canMove(1, 0) ||
          !this.stones_[1].canMove(1, 0) ||
          !this.stones_[3].canMove(1, 0)) {
        return false;
      }
      this.stones_[0].move(1, 0);
      this.stones_[1].move(1, 0);
      this.stones_[3].move(1, 0);
      this.stones_[2].move(1, 0);
    } else if (this.current_rotation_ === ROTATION.ROTATED_270) {
      // Check rightmost stones (stones 0, 3)
      if (!this.stones_[2].canMove(1, 0) ||
          !this.stones_[3].canMove(1, 0)) {
        return false;
      }
      this.stones_[3].move(1, 0);
      this.stones_[2].move(1, 0);
      this.stones_[1].move(1, 0);
      this.stones_[0].move(1, 0);
    }

    return true;
  }
};

