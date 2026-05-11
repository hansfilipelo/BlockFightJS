import { describe, expect, test } from "bun:test";

import { Board } from "../src/board.mjs";
import { Stone, StoneColor } from "../src/stone.mjs";

describe("Board", () => {
  test("exposes dimensions and middle x", () => {
    const board = new Board(10, 20);

    expect(board.width()).toBe(10);
    expect(board.height()).toBe(20);
    expect(board.getMiddleX()).toBe(5);
  });

  test("moves stones and updates their stored position", () => {
    const board = new Board(6, 6);
    const stone = new Stone(1, 1, StoneColor.RED, board);

    board.moveStone(1, 1, 2, 3);

    expect(board.getStone(1, 1)).toBeNull();
    expect(board.getStone(2, 3)).toBe(stone);
    expect(stone.x_pos()).toBe(2);
    expect(stone.y_pos()).toBe(3);
  });

  test("clears full rows and shifts rows above them downward", () => {
    const board = new Board(4, 6);

    new Stone(0, 5, StoneColor.BLUE, board);
    new Stone(1, 5, StoneColor.BLUE, board);
    new Stone(2, 5, StoneColor.BLUE, board);
    new Stone(3, 5, StoneColor.BLUE, board);
    const falling_stone = new Stone(1, 4, StoneColor.GREEN, board);

    const cleared_rows = board.clearFullRows([4, 5]);

    expect(cleared_rows).toBe(1);
    expect(board.getStone(1, 5)).toBe(falling_stone);
    expect(board.getStone(1, 4)).toBeNull();
    expect(falling_stone.y_pos()).toBe(5);
  });
});
