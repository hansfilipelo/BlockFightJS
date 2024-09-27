export class Stone {
  constructor(x_pos, y_pos, board) {
    this.x_pos_ = x_pos;
    this.y_pos_= y_pos;

    this.board_ = board;
    this.board_.addStone(this.x_pos_, this.y_pos_, this);
  }

  x_pos() {
    return this.x_pos_;
  }

  y_pos() {
    return this.y_pos_;
  }

  canMove(x_pos, y_pos) {
    const new_x_pos = this.x_pos_ + x_pos;
    const new_y_pos = this.y_pos_ + y_pos;

    return new_x_pos >= 0 &&
        new_x_pos < this.board_.width() &&
        new_x_pos >= 0 &&
        new_y_pos >= -4 &&
        new_y_pos < this.board_.height() &&
        !this.board_.hasStone(new_x_pos, new_y_pos);
  }

  move(x_pos, y_pos) {
    const new_x_pos = this.x_pos_ + x_pos;
    const new_y_pos = this.y_pos_ + y_pos;

    this.board_.moveStone(this.x_pos_, this.y_pos_, new_x_pos, new_y_pos);
    this.x_pos_ = new_x_pos;
    this.y_pos_ = new_y_pos;
  }
};