export class Board {
  constructor(board_width, board_height) {
    this.board_width_ = board_width;
    this.board_height_ = board_height;
    this.newStones();
  }

  newStones() {
    this.stones_ =
      new Array(this.board_width_ * (this.board_height_ + 4)).fill(null);
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

  getMiddleX() {
    return Math.floor(this.board_width_ / 2);
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

    const stone = this.stones_[this.getIndex(x_pos, y_pos)];
    this.stones_[this.getIndex(new_x_pos, new_y_pos)] = stone;
    this.stones_[this.getIndex(x_pos, y_pos)] = null;
    if (stone != null) {
      stone.pos_.set(new_x_pos, new_y_pos);
    }
  }

  removeStone(stone) {
    const x_pos = stone.x_pos();
    const y_pos = stone.y_pos();
    const internal_stone = this.getStone(x_pos, y_pos);
    console.assert(internal_stone === stone, "Stone is not on the board");
    this.stones_[this.getIndex(x_pos, y_pos)] = null;
  }

  clearRow(y) {
    for (let x = 0; x < this.width(); ++x) {
      this.addStone(x, y, null);
    }
  }

  moveAllDown(rows_to_clear) {
    const rows_to_clear_set = new Set(rows_to_clear);
    let cleared_rows_below = 0;
    for (let y = this.height() - 1; y >= -4; --y) {
      if (rows_to_clear_set.has(y)) {
        ++cleared_rows_below;
        continue;
      }

      if (cleared_rows_below === 0) {
        continue;
      }

      for (let x = 0; x < this.width(); ++x) {
        if (this.hasStone(x, y)) {
          this.moveStone(x, y, x, y + cleared_rows_below);
        }
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
      this.moveAllDown(rows_to_clear);
    }

    return rows_to_clear.length;
  }

  log() {
    let all_str = "";
    for (let y = this.height() + 3; y >= 0; --y) {
      for (let x = 0; x < this.width(); ++x) {
        all_str += this.hasStone(x, y) ? "X" : "-";
      }
      all_str += "\n";
    }
    console.log(all_str);
  }
}
