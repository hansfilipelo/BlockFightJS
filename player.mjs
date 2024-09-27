import { IShape } from "./i_shape.mjs"

export class Player {
  constructor(board, renderer) {
    this.board_ = board;
    this.renderer_ = renderer;
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
    this.renderer_.draw();
  }

  rotate() {
    this.current_shape_.rotate();
    this.renderer_.draw();
  }

  left() {
    this.current_shape_.left();
    this.renderer_.draw();
  }

  right() {
    this.current_shape_.right();
    this.renderer_.draw();
  }

  dropAllTheWay() {
    while (this.current_shape_.drop()) {}
    this.newShape();
    this.renderer_.draw();
  }
}