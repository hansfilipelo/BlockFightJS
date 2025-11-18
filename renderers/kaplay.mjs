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
  constructor(board, game_canvas, is_dark_mode) {
    this.board_ = board;
    this.game_canvas_ = game_canvas;
    this.is_dark_mode_ = is_dark_mode;

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

  createStone(x_pos, y_pos, stone_color) {
    return add([
      rect(this.stone_size_, this.stone_size_),
      pos(xPosToScreen(x_pos, this.x_start_, this.stone_size_),
          yPosToScreen(y_pos, this.y_start_, this.stone_size_)),
      outline(OUTLINE_SIZE),
      color(stone_color.r_, stone_color.g_, stone_color.b_),
      "stone"
    ]);
  }

  updateStone(kaplay_stone, x_pos, y_pos, stone_color) {
    kaplay_stone.c("pos").pos.x = xPosToScreen(x_pos, this.x_start_, this.stone_size_);
    kaplay_stone.c("pos").pos.y = yPosToScreen(y_pos, this.y_start_, this.stone_size_);
    kaplay_stone.c("color").color.r = stone_color.r_;
    kaplay_stone.c("color").color.g = stone_color.g_;
    kaplay_stone.c("color").color.b = stone_color.b_;
  }

  onResize() {
    console.log("onResize");
    this.stone_size_ = calculateStoneSize(this.game_canvas_.offsetWidth,
                                          this.game_canvas_.offsetHeight,
                                          this.board_.width(),
                                          this.board_.height());

    this.x_start_ = this.game_canvas_.offsetWidth / 2 -
        (this.board_.width() * this.stone_size_) / 2;
    this.y_start_ = 0;

    this.kaplay_board_.destroy();
    this.kaplay_board_ = add([
      rect(this.board_.width() * this.stone_size_,
           this.board_.height() * this.stone_size_),
      pos(this.x_start_, this.y_start_),
      outline(OUTLINE_SIZE),
      "board"
    ]);

    for (let stone of this.stones_) {
      stone.destroy();
    }
    this.stones_.length = 0;

    this.draw();
  }

  draw() {
    let n_rendered_stones = 0;

    for (let x = 0; x < this.board_.width(); ++x) {
      for (let y = 0; y < this.board_.height(); ++y) {
        let stone = this.board_.getStone(x, y);
        if (stone !== null) {
          if (n_rendered_stones >= this.stones_.length) {
            this.stones_.push(this.createStone(x, y, stone.color()));
          } else {
            this.updateStone(this.stones_[n_rendered_stones],
                              x,
                              y,
                              stone.color());
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

export default function(board, game_canvas, is_dark_mode) {
  kaplay({canvas: game_canvas});
  return new KaplayRenderer(board, game_canvas, is_dark_mode);
}