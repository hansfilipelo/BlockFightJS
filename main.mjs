import { Board } from "./board.mjs"
import { BOARD_HEIGHT, BOARD_WIDTH } from "./game_state.mjs"
import { createInputHandler } from "./input.mjs"
import { Player } from "./player.mjs"
import { createRenderer } from "./renderer.mjs"

export async function run(player_info_controller, game_canvas) {
  const urlParams = new URLSearchParams(window.location.search);
  const renderer_param = urlParams.get('renderer');
  const force_dark_mode = urlParams.get('force_dark_mode') === 'true';
  const input_param = urlParams.get('input');

  let board = new Board(BOARD_WIDTH, BOARD_HEIGHT, window);

  if (force_dark_mode) {
    document.body.classList.add('dark-mode');
  }

  let renderer = await createRenderer(board,
                                      window,
                                      game_canvas,
                                      renderer_param,
                                      force_dark_mode);
  let player = new Player(board, renderer, player_info_controller);
  let input_handler = await createInputHandler(player, input_param);

  return { player, board, renderer, input_handler };
}
