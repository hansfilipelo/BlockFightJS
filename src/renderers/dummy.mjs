
class DummyRenderer {
  constructor(board, game_canvas, is_dark_mode, is_preview_renderer) {
    this.board_ = board;
    this.game_canvas_ = game_canvas;
    this.is_dark_mode_ = is_dark_mode;
    this.is_preview_renderer_ = is_preview_renderer;
  }

  onResize() {}
  draw(ghost_stones = null) {}
}

export default function (board, game_canvas, is_dark_mode, is_preview_renderer) {
  return new DummyRenderer(board, game_canvas, is_dark_mode, is_preview_renderer);
}
