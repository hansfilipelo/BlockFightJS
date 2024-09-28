import kaplay from "../third_party/kaplay/kaboom.mjs"
import { OUTLINE_SIZE } from "../game_state.mjs"

function xPosToScreen(x_pos, board) {
  return board.x_start() + x_pos * board.stone_size();
}

function yPosToScreen(y_pos, board) {
  return board.y_start() + y_pos * board.stone_size();
}

class KaplayRenderer {
  constructor(board) {
    this.board_ = board;

    this.kaplay_board_ = add([
      rect(this.board_.width() * this.board_.stone_size(),
                        this.board_.height() * this.board_.stone_size()),
      pos(this.board_.x_start(), this.board_.y_start()),
      outline(OUTLINE_SIZE),
      "board"
    ]);

    this.stones_ = [];
  }

  createStone(x_pos, y_pos) {
    return add([
      rect(this.board_.stone_size(), this.board_.stone_size()),
      pos(xPosToScreen(x_pos, this.board_),
          yPosToScreen(y_pos, this.board_)),
      outline(OUTLINE_SIZE),
      "stone"
    ]);
  }

  updateStone(kaplay_stone, x_pos, y_pos) {
    kaplay_stone.c("pos").pos.x = xPosToScreen(x_pos, this.board_);
    kaplay_stone.c("pos").pos.y = yPosToScreen(y_pos, this.board_);
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

export default function(board) {
  // Hack to only initialize kaplay once in the entire program when using
  // kaplay renderer alongside kaplay input (which is required essentially)
  if (typeof add !== "function") {
    kaplay();
  }
  return new KaplayRenderer(board);
}