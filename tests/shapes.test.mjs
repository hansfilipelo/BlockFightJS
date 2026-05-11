import { describe, expect, test } from "bun:test";

import { Board } from "../src/board.mjs";
import { newShape } from "../src/shapes.mjs";
import { IShape } from "../src/shapes/i_shape.mjs";
import { JShape } from "../src/shapes/j_shape.mjs";
import { LShape } from "../src/shapes/l_shape.mjs";
import { OShape } from "../src/shapes/o_shape.mjs";
import { SShape } from "../src/shapes/s_shape.mjs";
import { TShape } from "../src/shapes/t_shape.mjs";
import { ZShape } from "../src/shapes/z_shape.mjs";
import { ghostPositions, stonePositions, withMockedRandom } from "./helpers.mjs";

const SHAPE_CASES = [
  ["IShape", IShape],
  ["JShape", JShape],
  ["LShape", LShape],
  ["OShape", OShape],
  ["SShape", SShape],
  ["TShape", TShape],
  ["ZShape", ZShape],
];

describe("Shapes", () => {
  for (const [name, ShapeClass] of SHAPE_CASES) {
    test(`${name} drop count matches repeated drops on an empty board`, () => {
      const board = new Board(10, 20);
      const shape = new ShapeClass(board);
      const initial_positions = stonePositions(shape.stones_);
      const drop_count = shape.getDropCount();

      expect(drop_count).toBeGreaterThan(0);

      let performed_drops = 0;
      while (shape.drop()) {
        performed_drops++;
      }

      expect(performed_drops).toBe(drop_count);
      expect(shape.drop()).toBeFalse();
      expect(stonePositions(shape.stones_)).toEqual(
        initial_positions.map(([x_pos, y_pos]) => [x_pos, y_pos + drop_count]));
    });
  }

  test("newShape returns a wrapper whose ghost positions do not mutate the piece", () => {
    const board = new Board(10, 20);

    withMockedRandom([0.5], () => {
      const shape = newShape(board);
      const initial_positions = stonePositions(shape.shape_.stones_);
      const ghost_positions = ghostPositions(shape.getGhostStones());

      expect(stonePositions(shape.shape_.stones_)).toEqual(initial_positions);
      expect(ghost_positions).toEqual(
        initial_positions.map(([x_pos, y_pos]) => [x_pos, y_pos + shape.shape_.getDropCount()]));
    });
  });

  test("moveToBoard recreates the wrapped shape on the target board", () => {
    const board = new Board(10, 20);
    const preview_board = new Board(4, 4);

    withMockedRandom([0.5], () => {
      const shape = newShape(preview_board);

      expect(shape.moveToBoard(board)).toBeTrue();
      expect(shape.shape_.stones_.every((stone) => stone.board_ === board)).toBeTrue();
      expect(shape.shape_.stones_.some((stone) => preview_board.getStone(stone.x_pos(), stone.y_pos()) !== stone)).toBeTrue();
    });
  });
});
