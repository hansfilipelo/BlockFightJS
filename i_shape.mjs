import kaplay from "./third_party/kaplay/kaboom.mjs"
import { createStone } from "./common.mjs"
import { STONE_SIZE } from "./game_state.mjs"

const ROTATION = Object.freeze({
  VERTICAL: 0, 
  HORIZONTAL: 1,
});

export class IShape {
  current_rotation_ = ROTATION.VERTICAL;

  stones_ = [
    createStone(120, 80), 
    createStone(120, 80 + STONE_SIZE), 
    createStone(120, 80 + 2*STONE_SIZE), 
    createStone(120, 80 + 3*STONE_SIZE), 
  ];

  drop() {
    this.stones_.forEach(stone => {
      stone.c("pos").pos.y = stone.c("pos").pos.y + STONE_SIZE;
    });
  }

  rotate() {
    if (this.current_rotation_ === ROTATION.VERTICAL) {
      this.stones_[0].c("pos").pos.x = this.stones_[0].c("pos").pos.x + STONE_SIZE;
      this.stones_[0].c("pos").pos.y = this.stones_[0].c("pos").pos.y + STONE_SIZE;

      this.stones_[2].c("pos").pos.x = this.stones_[2].c("pos").pos.x - STONE_SIZE;
      this.stones_[2].c("pos").pos.y = this.stones_[2].c("pos").pos.y - STONE_SIZE;

      this.stones_[3].c("pos").pos.x = this.stones_[3].c("pos").pos.x - 2 * STONE_SIZE;
      this.stones_[3].c("pos").pos.y = this.stones_[3].c("pos").pos.y - 2 * STONE_SIZE;
      this.current_rotation_ = ROTATION.HORIZONTAL;
    } else if (this.current_rotation_ === ROTATION.HORIZONTAL) {
      this.stones_[0].c("pos").pos.x = this.stones_[0].c("pos").pos.x - STONE_SIZE;
      this.stones_[0].c("pos").pos.y = this.stones_[0].c("pos").pos.y - STONE_SIZE;

      this.stones_[2].c("pos").pos.x = this.stones_[2].c("pos").pos.x + STONE_SIZE;
      this.stones_[2].c("pos").pos.y = this.stones_[2].c("pos").pos.y + STONE_SIZE;

      this.stones_[3].c("pos").pos.x = this.stones_[3].c("pos").pos.x + 2 * STONE_SIZE;
      this.stones_[3].c("pos").pos.y = this.stones_[3].c("pos").pos.y + 2 * STONE_SIZE;
      this.current_rotation_ = ROTATION.VERTICAL;
    }
  }

  left() {
    this.stones_.forEach(stone => {
      stone.c("pos").pos.x = stone.c("pos").pos.x - STONE_SIZE;
    });
  }

  right() {
    this.stones_.forEach(stone => {
      stone.c("pos").pos.x = stone.c("pos").pos.x + STONE_SIZE;
    });
  }
};