import { STONE_SIZE } from "./game_state.mjs"
import { Stone } from "./stone.mjs"

const ROTATION = Object.freeze({
  VERTICAL: 0, 
  HORIZONTAL: 1,
});

export class IShape {
  current_rotation_ = ROTATION.VERTICAL;

  stones_ = [
    new Stone(5, 0),
    new Stone(5, 1),
    new Stone(5, 2),
    new Stone(5, 3),
  ];

  drop() {
    this.stones_.forEach(stone => {
      stone.move(0, 1);
    });
  }

  rotate() {
    if (this.current_rotation_ === ROTATION.VERTICAL) {
      this.stones_[0].move(1, 1);
      this.stones_[2].move(-1, -1);
      this.stones_[3].move(-2, -2);
      this.current_rotation_ = ROTATION.HORIZONTAL;
    } else if (this.current_rotation_ === ROTATION.HORIZONTAL) {
      this.stones_[0].move(-1, -1);
      this.stones_[2].move(1, 1);
      this.stones_[3].move(2, 2);
      this.current_rotation_ = ROTATION.VERTICAL;
    }
  }

  left() {
    this.stones_.forEach(stone => {
      stone.move(-1, 0);
    });
  }

  right() {
    this.stones_.forEach(stone => {
      stone.move(1, 0);
    });
  }
};