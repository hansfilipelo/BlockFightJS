import { IShape } from "./shapes/i_shape.mjs"
import { SShape } from "./shapes/s_shape.mjs"
import { ZShape } from "./shapes/z_shape.mjs"
import { OShape } from "./shapes/o_shape.mjs"
import { LShape } from "./shapes/l_shape.mjs"
import { JShape } from "./shapes/j_shape.mjs"
import { TShape } from "./shapes/t_shape.mjs"
import { StoneColor } from "./stone.mjs"

const ALL_SHAPES = [IShape, SShape, ZShape, OShape, LShape, JShape, TShape];

// Preview positions centered in a 4×4 grid for each shape
const PREVIEW_LAYOUTS = new Map([
  [IShape,  { positions: [{x:2,y:0},{x:2,y:1},{x:2,y:2},{x:2,y:3}],
              color: StoneColor.PURPLE }],
  [OShape,  { positions: [{x:1,y:1},{x:2,y:1},{x:1,y:2},{x:2,y:2}],
              color: StoneColor.YELLOW }],
  [TShape,  { positions: [{x:1,y:1},{x:0,y:2},{x:1,y:2},{x:2,y:2}],
              color: StoneColor.CYAN }],
  [LShape,  { positions: [{x:1,y:0},{x:1,y:1},{x:1,y:2},{x:2,y:2}],
              color: StoneColor.ORANGE }],
  [JShape,  { positions: [{x:2,y:0},{x:2,y:1},{x:1,y:2},{x:2,y:2}],
              color: StoneColor.BLUE }],
  [SShape,  { positions: [{x:1,y:1},{x:2,y:1},{x:0,y:2},{x:1,y:2}],
              color: StoneColor.GREEN }],
  [ZShape,  { positions: [{x:0,y:1},{x:1,y:1},{x:1,y:2},{x:2,y:2}],
              color: StoneColor.RED }],
]);

export function randomShapeClass() {
  const idx = Math.floor(Math.random() * ALL_SHAPES.length);
  return ALL_SHAPES[idx];
}

export function getShapePreview(ShapeClass) {
  return PREVIEW_LAYOUTS.get(ShapeClass);
}

export function newShape(board, ShapeClass = null) {
  if (!ShapeClass) ShapeClass = randomShapeClass();
  if (ShapeClass.canCreate(board)) {
    return new ShapeClass(board);
  }
  return null;
}