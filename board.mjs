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

  clearRow(y) {
    for (let x = 0; x < this.width(); ++x) {
      this.addStone(x, y, null);
    }
  }

  moveAllDown(start_row, n_times) {
    for (let y = start_row ; y >= 0; y--) {
      for (let x = 0; x < this.width(); ++x) {
        this.moveStone(x, y, x, y + n_times);
      }
    }
  }

  clearFullRows(row_span) {
    let rows_to_clear = [];
    for (let y = row_span[0]; y <= row_span[1]; ++y) {
      let clear_row = true;
      for (let x = 0; x < this.width(); ++x) {
        if (!this.hasStone(x, y)) {
          clear_row = false;
          break;
        }
      }
      if (clear_row) {
        rows_to_clear.push(y);
      }
    }

    for (let row of rows_to_clear) {
      this.clearRow(row);
    }

    if (rows_to_clear.length > 0) {
      let start_moving_down_from = Math.min.apply(null, rows_to_clear) - 1;
      this.moveAllDown(start_moving_down_from, rows_to_clear.length);
    }
  }
}
