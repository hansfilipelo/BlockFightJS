import { IShape } from "./i_shape.mjs"
import { SShape } from "./s_shape.mjs"
import { ZShape } from "./z_shape.mjs"
import { OShape } from "./o_shape.mjs"

function randomShape() {
  const shapes = [IShape, SShape, ZShape, OShape];
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