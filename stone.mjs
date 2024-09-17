import kaplay from "./third_party/kaplay/kaboom.mjs"
import { STONE_SIZE, OUTLINE_SIZE, X_PADDING, Y_PADDING } from "./game_state.mjs"

function XPosToScreen(x_pos) {
  console.log(x_pos * STONE_SIZE + X_PADDING);
  return x_pos * STONE_SIZE + X_PADDING;
}

function YPosToScreen(y_pos) {
  console.log(y_pos * STONE_SIZE + Y_PADDING);
  return y_pos * STONE_SIZE + Y_PADDING;
}

export class Stone {
  constructor(x_pos, y_pos) {
    this.x_pos_ = x_pos;
    this.y_pos_= y_pos;

    this.kaplay_stone_ = add([
      rect(STONE_SIZE, STONE_SIZE),
      pos(XPosToScreen(this.x_pos_), YPosToScreen(this.y_pos_)),
      outline(OUTLINE_SIZE),
      "stone"
    ]);
  }

  move(x_pos, y_pos) {
    this.x_pos_ = this.x_pos_ + x_pos;
    this.y_pos_ = this.y_pos_ + y_pos;
    this.kaplay_stone_.c("pos").pos.x = XPosToScreen(this.x_pos_);
    this.kaplay_stone_.c("pos").pos.y = YPosToScreen(this.y_pos_);
  }
};