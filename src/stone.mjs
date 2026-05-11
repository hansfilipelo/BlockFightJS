export class Position {
  constructor(x_pos = NaN, y_pos = NaN) {
    this.x_pos_ = x_pos;
    this.y_pos_ = y_pos;
  }

  x_pos() {
    return this.x_pos_;
  }

  y_pos() {
    return this.y_pos_;
  }

  set_x_pos(x_pos) {
    this.x_pos_ = x_pos;
  }

  set_y_pos(y_pos) {
    this.y_pos_ = y_pos;
  }

  set(x_pos, y_pos) {
    this.x_pos_ = x_pos;
    this.y_pos_ = y_pos;
  }
}

export class Matrix {
  constructor(zero_zero = NaN, one_zero = NaN, zero_one = NaN, one_one = NaN) {
    this.matrix_ = [zero_zero, one_zero, zero_one, one_one];
  }

  getIndex(x_pos, y_pos) {
    return x_pos + y_pos * 2;
  }

  get(x_pos, y_pos) {
    return this.matrix_[this.getIndex(x_pos, y_pos)];
  }

  set(x_pos, y_pos, value) {
    this.matrix_[this.getIndex(x_pos, y_pos)] = value;
  }

  multiplyPos(position) {
    assert(position instanceof Position);

    const x_pos = this.matrix_[0] * position.x_pos() +
        this.matrix_[1] * position.y_pos();
    const y_pos = this.matrix_[2] * position.x_pos() +
        this.matrix_[3] * position.y_pos();

    return new Position(x_pos, y_pos);
  }

  multiplyMatrix(matrix) {
    assert(matrix instanceof Matrix);

    const x_pos = this.matrix_[0] * matrix.matrix_[0] +
        this.matrix_[1] * matrix.matrix_[2];

  }
}

export class Color {
  constructor(r = 0, g = 0, b = 0) {
    this.r_ = r;
    this.g_ = g;
    this.b_ = b;
  }
};

export const StoneColor = Object.freeze({
  RED: new Color(255, 0, 0),
  GREEN: new Color(0, 255, 0),
  BLUE: new Color(0, 0, 255),
  YELLOW: new Color(255, 255, 0),
  PURPLE: new Color(128, 0, 128),
  ORANGE: new Color(255, 165, 0),
  CYAN: new Color(0, 255, 255),
});

export class Stone {
  constructor(x_pos, y_pos, color, board) {
    this.pos_ = new Position(x_pos, y_pos);
    this.color_ = color;

    this.board_ = board;
    this.board_.addStone(this.pos_.x_pos(), this.pos_.y_pos(), this);
  }

  x_pos() {
    return this.pos_.x_pos();
  }

  y_pos() {
    return this.pos_.y_pos();
  }

  color() {
    return this.color_;
  }

  canMove(x_pos, y_pos) {
    const new_x_pos = this.pos_.x_pos() + x_pos;
    const new_y_pos = this.pos_.y_pos() + y_pos;

    return new_x_pos >= 0 &&
        new_x_pos < this.board_.width() &&
        new_x_pos >= 0 &&
        new_y_pos >= -4 &&
        new_y_pos < this.board_.height() &&
        !this.board_.hasStone(new_x_pos, new_y_pos);
  }

  move(x_pos, y_pos) {
    const new_x_pos = this.pos_.x_pos() + x_pos;
    const new_y_pos = this.pos_.y_pos() + y_pos;

    this.board_.moveStone(this.pos_.x_pos(), this.pos_.y_pos(),
                          new_x_pos, new_y_pos);
    this.pos_.set(new_x_pos, new_y_pos);
  }
};