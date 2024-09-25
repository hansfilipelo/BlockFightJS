import kaplay from "../third_party/kaplay/kaboom.mjs"

class KaplayInputHandler {
  constructor(player) {
    this.player_ = player;
    this.down_pressed_ = false;
    this.up_pressed_ = false;
    this.left_pressed_ = false;
    this.right_pressed_ = false;
    this.space_pressed_ = false;

    onKeyDown("down", () => {
      if (!this.down_pressed_) {
        this.down_pressed_ = true;
        this.player_.drop();
      }
    });

    onKeyRelease("down", () => {
      this.down_pressed_ = false;
    });

    onKeyDown("up", () => {
      if (!this.up_pressed_) {
        this.up_pressed_ = true;
        this.player_.rotate();
      }
    });

    onKeyRelease("up", () => {
      this.up_pressed_ = false;
    });

    onKeyDown("left", () => {
      if (!this.left_pressed_) {
        this.left_pressed_ = true;
        this.player_.left();
      }
    });

    onKeyRelease("left", () => {
      this.left_pressed_ = false;
    });

    onKeyDown("right", () => {
      if (!this.right_pressed_) {
        this.right_pressed_ = true;
        this.player_.right();
      }
    });

    onKeyRelease("right", () => {
      this.right_pressed_ = false;
    });

    onKeyDown("space", () => {
      if (!this.space_pressed_) {
        this.space_pressed_ = true;
        this.player_.dropAllTheWay();
      }
    });

    onKeyRelease("space", () => {
      this.space_pressed_ = false;
    });
  }
}

export default function(player) {
  return new KaplayInputHandler(player);
}