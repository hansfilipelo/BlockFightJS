import { IShape } from "./i_shape.mjs"

export class Player {
  constructor(board) {
    this.board_ = board;
    this.current_shape_ = null;
    this.newShape()
  }

  newShape() {
    this.current_shape_ = new IShape(this.board_);
  }

  drop() {
    if (!this.current_shape_.drop()) {
      this.newShape();
    }
  }

  rotate() {
    this.current_shape_.rotate();
  }

  left() {
    this.current_shape_.left();
  }

  right() {
    this.current_shape_.right();
  }

  dropAllTheWay() {
    while (this.current_shape_.drop()) {}
    this.newShape();
  }
}