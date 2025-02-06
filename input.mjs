
const STICKY_KEY_INTERVAL = 250;

class InputInterceptor {
  constructor(player) {
    this.player_ = player;
    this.down_pressed_ = false;
    this.up_pressed_ = false;
    this.left_pressed_ = false;
    this.right_pressed_ = false;
    this.space_pressed_ = false;
  }
  onDownPressed() {
    if (!this.down_pressed_) {
      this.down_pressed_ = true;
      this.player_.drop();
    }
  }

  onDownReleased() {
    this.down_pressed_ = false;
  }

  onUpPressed() {
    if (!this.up_pressed_) {
      this.up_pressed_ = true;
      this.player_.rotate();
    }
  }

  onUpReleased() {
    this.up_pressed_ = false;
  }

  onLeftPressed() {
    if (!this.left_pressed_) {
      this.left_pressed_ = Date.now();
      this.player_.left();
      return;
    }

    if (Date.now() - this.left_pressed_ > STICKY_KEY_INTERVAL) {
      this.player_.left();
    }
  }

  onLeftReleased() {
    this.left_pressed_ = false;
  }

  onRightPressed() {
    if (!this.right_pressed_) {
      this.right_pressed_ = Date.now();
      this.player_.right();
      return;
    }

    if (Date.now() - this.right_pressed_ > STICKY_KEY_INTERVAL) {
      this.player_.right();
    }
  }

  onRightReleased() {
    this.right_pressed_ = false;
  }

  onSpacePressed() {
    if (!this.space_pressed_) {
        this.space_pressed_ = true;
      this.player_.dropAllTheWay();
    }
  }

  onSpaceReleased() {
    this.space_pressed_ = false;
  }

  onPausePressed() {
    if (!this.pause_pressed_) {
      this.pause_pressed_ = true;
      this.player_.pauseResume();
    }
  }

  onPauseReleased() {
    this.pause_pressed_ = false;
  }
}

export async function createInputHandler(player, platform=null) {
  let input_interceptor = new InputInterceptor(player);

  if (!platform) {
    return await import("./input/kaplay.mjs").then(
      module => module.default(input_interceptor));
  }


  if (platform === "kaplay") {
    return await import("./input/kaplay.mjs").then(
      module => module.default(input_interceptor));
  }

  // TODO: Implement other input methods.
  return null;
}