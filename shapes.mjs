import { IShape } from "./shapes/i_shape.mjs"
import { SShape } from "./shapes/s_shape.mjs"
import { ZShape } from "./shapes/z_shape.mjs"
import { OShape } from "./shapes/o_shape.mjs"
import { LShape } from "./shapes/l_shape.mjs"
import { JShape } from "./shapes/j_shape.mjs"
import { TShape } from "./shapes/t_shape.mjs"

function randomShape() {
  const shapes = [IShape, SShape, ZShape, OShape, LShape, JShape, TShape];
  const idx = Math.floor(Math.random() * shapes.length);
  return shapes[idx];
}

export function newShape(board) {
  const shape = randomShape();
  if (shape.canCreate(board)) {
    return new shape(board);
  }
  return null;
}