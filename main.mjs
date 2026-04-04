import { Board } from "./board.mjs"
import { BOARD_HEIGHT, BOARD_WIDTH, PREVIEW_SIZE } from "./game_state.mjs"
import { createInputHandler } from "./input.mjs"
import { Player } from "./player.mjs"
import { createRenderer } from "./renderer.mjs"

export async function run(player_info_controller, game_canvas, preview_canvas) {
  const urlParams = new URLSearchParams(window.location.search);
  const renderer_platform = urlParams.get('renderer');
  const force_dark_mode = urlParams.get('force_dark_mode') === 'true';
  const input_param = urlParams.get('input');

  let board = new Board(BOARD_WIDTH, BOARD_HEIGHT);
  let preview_board = new Board(PREVIEW_SIZE, PREVIEW_SIZE);

  if (force_dark_mode) {
    document.body.classList.add('dark-mode');
  }

  let renderer = await createRenderer(board,
                                      window,
                                      game_canvas,
                                      renderer_platform,
                                      force_dark_mode);
  let preview_renderer = await createRenderer(preview_board,
                                              window,
                                              preview_canvas,
                                              renderer_platform,
                                              force_dark_mode,
                                              true /* is_preview_renderer */);
  let player = new Player(board, renderer, player_info_controller,
                          preview_board, preview_renderer);
  let input_handler = await createInputHandler(player, input_param);

  return { player, board, renderer, input_handler };
}
