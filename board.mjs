export class Board {
  constructor(board_width, board_height) {
    this.board_width_ = board_width;
    this.board_height_ = board_height;
    this.stones_ = new Array(board_width * (board_height + 4)).fill(null);
  }

  width() {
    return this.board_width_;
  }

  height() {
    return this.board_height_;
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