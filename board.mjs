import kaplay from "./third_party/kaplay/kaboom.mjs"
import { OUTLINE_SIZE } from "./game_state.mjs"


function calculateStoneSize(window_width, window_height, board_width, board_height) {
  const width_stones = Math.floor(window_width / board_width);
  const height_stones = Math.floor(window_height / board_height);
  return Math.min(width_stones, height_stones);
}


export class Board {
  constructor(board_width, board_height, current_window) {
    this.board_width_ = board_width;
    this.board_height_ = board_height;
    this.stones_ = new Array(board_width * (board_height + 4)).fill(null);
    this.window_ = current_window;

    this.stone_size_ = calculateStoneSize(this.window_.innerWidth,
                                          this.window_.innerHeight,
                                          this.board_width_,
                                          this.board_height_);
    this.x_start_ = this.window_.innerWidth / 2 - (this.board_width_ * this.stone_size_) / 2;
    this.y_start_ = 0;

    this.kaplay_board_ = add([
      rect(this.board_width_ * this.stone_size_,
           this.board_height_ * this.stone_size_),
      pos(this.x_start_, this.y_start_),
      outline(OUTLINE_SIZE),
      "board"
    ]);
  }

  width() {
    return this.board_width_;
  }

  height() {
    return this.board_height_;
  }

  stone_size() {
    return this.stone_size_;
  }

  x_start() {
    return this.x_start_;
  }

  y_start() {
    return this.y_start_;
  }

  getIndex(x_pos, y_pos) {
    return x_pos + (y_pos + 4) * this.board_width_;
  }

  getStone(x_pos, y_pos) {
    return this.stones_[this.getIndex(x_pos, y_pos)];
  }

  hasStone(x_pos, y_pos) {
    return this.stones_[this.getIndex(x_pos, y_pos)] != null;
  }

  addStone(x_pos, y_pos, stone) {
    this.stones_[this.getIndex(x_pos, y_pos)] = stone;
  }

  moveStone(x_pos, y_pos, new_x_pos, new_y_pos) {
    console.assert(x_pos >= 0 && x_pos < this.width() &&
        y_pos >= -4 && y_pos < this.height() &&
        new_x_pos >= 0 && new_x_pos < this.width() &&
        new_y_pos >= -4 && new_y_pos < this.height());

    console.assert(!this.hasStone(new_x_pos, new_y_pos));

    this.stones_[this.getIndex(new_x_pos, new_y_pos)] =
        this.stones_[this.getIndex(x_pos, y_pos)];
    this.stones_[this.getIndex(x_pos, y_pos)] = null;
  }
}