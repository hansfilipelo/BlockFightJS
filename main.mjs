import kaplay from "./third_party/kaplay/kaboom.mjs" // TODO: Remove Kaplay
import { Board } from "./board.mjs"
import { BOARD_HEIGHT, BOARD_WIDTH } from "./game_state.mjs"
import { createInputHandler } from "./input.mjs"
import { createRenderer } from "./renderer.mjs"
import { Player } from "./player.mjs"

export async function run() {
  kaplay();  // TODO: Remove Kaplay
  let board = new Board(BOARD_WIDTH, BOARD_HEIGHT, window);
  let renderer = await createRenderer(board);
  let player = new Player(board, renderer);
  let input_handler = await createInputHandler(player);

  return { player, board, renderer, input_handler };
}