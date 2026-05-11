
import * as dummy_input from "./input/dummy.mjs"
import * as javascript_input from "./input/javascript.mjs"

const INPUT_HANDLER_MODULES = {
  dummy: dummy_input,
  javascript: javascript_input,
};

const STICKY_KEY_INTERVAL = 250;

class InputInterceptor {
  constructor(player) {
    this.player_ = player;
    this.down_pressed_ = false;
    this.up_pressed_ = false;
    this.left_pressed_ = false;
    this.right_pressed_ = false;
    this.space_pressed_ = false;
    this.enter_pressed_ = false;
  }
  onDownPressed() {
    if (this.player_.isOverlayVisible()) {
      if (!this.down_pressed_) {
        this.down_pressed_ = Date.now();
        this.player_.menuDown();
      }
      return;
    }

    if (!this.down_pressed_) {
      this.down_pressed_ = Date.now();
      this.player_.drop(false /* reload_timer */);
      return;
    }

    if (Date.now() - this.down_pressed_ > STICKY_KEY_INTERVAL) {
      this.player_.drop(false /* reload_timer */);
    }
  }

  onDownReleased() {
    this.down_pressed_ = false;
  }

  onUpPressed() {
    if (!this.up_pressed_) {
      this.up_pressed_ = true;
      if (this.player_.isOverlayVisible()) {
        this.player_.menuUp();
      } else {
        this.player_.rotate();
      }
    }
  }

  onUpReleased() {
    this.up_pressed_ = false;
  }

  onLeftPressed() {
    if (this.player_.isOverlayVisible()) return;

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
    if (this.player_.isOverlayVisible()) return;

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
      if (this.player_.isOverlayVisible()) {
        this.player_.menuSelect();
      } else {
        this.player_.dropAllTheWay();
      }
    }
  }

  onSpaceReleased() {
    this.space_pressed_ = false;
  }

  onEnterPressed() {
    if (!this.enter_pressed_) {
      this.enter_pressed_ = true;
      if (this.player_.isOverlayVisible()) {
        this.player_.menuSelect();
      }
    }
  }

  onEnterReleased() {
    this.enter_pressed_ = false;
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
    platform = "javascript";
  }

  const input_handler_module = INPUT_HANDLER_MODULES[platform];
  if (!input_handler_module) {
    throw new Error("Unknown input platform: " + platform);
  }

  return input_handler_module.createInputHandler(input_interceptor);
}
