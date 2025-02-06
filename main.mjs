import { Board } from "./board.mjs"
import { BOARD_HEIGHT, BOARD_WIDTH } from "./game_state.mjs"
import { createInputHandler } from "./input.mjs"
import { createRenderer } from "./renderer.mjs"
import { Player } from "./player.mjs"

export async function run(player_info_controller, game_canvas) {
  let board = new Board(BOARD_WIDTH, BOARD_HEIGHT, window);
  let renderer = await createRenderer(board, window, game_canvas);
  let player = new Player(board, renderer, player_info_controller);
  let input_handler = await createInputHandler(player);

  return { player, board, renderer, input_handler };
}