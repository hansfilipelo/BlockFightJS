import { IShape } from "./shapes/i_shape.mjs"
import { SShape } from "./shapes/s_shape.mjs"
import { ZShape } from "./shapes/z_shape.mjs"
import { OShape } from "./shapes/o_shape.mjs"
import { LShape } from "./shapes/l_shape.mjs"
import { JShape } from "./shapes/j_shape.mjs"
import { TShape } from "./shapes/t_shape.mjs"


const ALL_SHAPES = [IShape, SShape, ZShape, OShape, LShape, JShape, TShape];


export function randomShapeClass() {
  const idx = Math.floor(Math.random() * ALL_SHAPES.length);
  return ALL_SHAPES[idx];
}


class GenericShape {
  constructor(board, shape_class) {
    this.board_ = board;
    this.shape_class_ = shape_class;
    this.shape_ = new shape_class(board);
  }

  moveToBoard(board) {
    if (!this.shape_class_.canCreate(board)) {
      return false;
    }

    for (const stone of this.shape_.stones_) {
      this.board_.removeStone(stone);
    }

    this.board_ = board;
    this.shape_.newStones(this.board_);
    return true;
  }

  getRowSpan() {
    return this.shape_.getRowSpan();
  }

  getGhostStones() {
    const drop_count = this.shape_.getDropCount();
    return this.shape_.stones_.map((stone) => ({
      x_pos: stone.x_pos(),
      y_pos: stone.y_pos() + drop_count,
      color: stone.color(),
    }));
  }

  drop() {
    return this.shape_.drop();
  }

  rotate() {
    return this.shape_.rotate();
  }

  left() {
    return this.shape_.left();
  }

  right() {
    return this.shape_.right();
  }
};

export function newShape(board) {
  const shape_class = randomShapeClass();
  if (shape_class.canCreate(board)) {
    return new GenericShape(board, shape_class);
  }
  return null;
}
