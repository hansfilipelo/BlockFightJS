import kaplay from "../third_party/kaplay/kaboom.mjs"
import { OUTLINE_SIZE } from "../game_state.mjs"

function calculateStoneSize(window_width, window_height, board_width, board_height) {
  const width_stones = Math.floor(window_width / board_width);
  const height_stones = Math.floor(window_height / board_height);
  return Math.min(width_stones, height_stones);
}

function xPosToScreen(x_pos, x_start, stone_size) {
  return x_start + x_pos * stone_size;
}

function yPosToScreen(y_pos, y_start, stone_size) {
  return y_start + y_pos * stone_size;
}

class KaplayRenderer {
  constructor(board, game_canvas) {
    this.board_ = board;
    this.game_canvas_ = game_canvas;

    this.stone_size_ = calculateStoneSize(this.game_canvas_.offsetWidth,
                                          this.game_canvas_.offsetHeight,
                                          this.board_.width(),
                                          this.board_.height());

    this.x_start_ = this.game_canvas_.offsetWidth / 2 -
        (this.board_.width() * this.stone_size_) / 2;
    this.y_start_ = 0;

    this.kaplay_board_ = add([
      rect(this.board_.width() * this.stone_size_,
                        this.board_.height() * this.stone_size_),
      pos(this.x_start_, this.y_start_),
      outline(OUTLINE_SIZE),
      "board"
    ]);

    this.stones_ = [];
  }

  createStone(x_pos, y_pos) {
    return add([
      rect(this.stone_size_, this.stone_size_),
      pos(xPosToScreen(x_pos, this.x_start_, this.stone_size_),
          yPosToScreen(y_pos, this.y_start_, this.stone_size_)),
      outline(OUTLINE_SIZE),
      "stone"
    ]);
  }

  updateStone(kaplay_stone, x_pos, y_pos) {
    kaplay_stone.c("pos").pos.x = xPosToScreen(x_pos, this.x_start_, this.stone_size_);
    kaplay_stone.c("pos").pos.y = yPosToScreen(y_pos, this.y_start_, this.stone_size_);
  }

  draw() {
    let n_rendered_stones = 0;

    for (let x = 0; x < this.board_.width(); ++x) {
      for (let y = 0; y < this.board_.height(); ++y) {
        if (this.board_.hasStone(x, y)) {
          if (n_rendered_stones >= this.stones_.length) {
            this.stones_.push(this.createStone(x, y));
          } else {
            this.updateStone(this.stones_[n_rendered_stones], x, y);
          }
          ++n_rendered_stones;
        }
      }
    }

    if (n_rendered_stones < this.stones_.length) {
      for (let i = n_rendered_stones; i < this.stones_.length; ++i) {
        this.stones_[i].destroy();
      }
      this.stones_ = this.stones_.slice(0, n_rendered_stones);
    }
  }
}

export default function(board, game_canvas) {
  kaplay({canvas: game_canvas});
  return new KaplayRenderer(board, game_canvas);
}