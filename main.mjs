import kaplay from "./third_party/kaplay/kaboom.mjs"
import { Board } from "./board.mjs"
import { BOARD_HEIGHT, BOARD_WIDTH } from "./game_state.mjs"
import { createInputHandler } from "./input.mjs"
import { Player } from "./player.mjs"

export function run() {
  kaplay();
  let board = new Board(BOARD_WIDTH, BOARD_HEIGHT, window);
  let player = new Player(board);
  let inputHandler = createInputHandler(player);

  return { player, board, inputHandler };
}
