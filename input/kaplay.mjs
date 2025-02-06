import kaplay from "../third_party/kaplay/kaboom.mjs"

class KaplayInputHandler {
  constructor(input_interceptor) {
    this.interceptor_ = input_interceptor;

    onKeyDown("down", () => {
      this.interceptor_.onDownPressed();
    });

    onKeyRelease("down", () => {
      this.interceptor_.onDownReleased();
    });

    onKeyDown("up", () => {
      this.interceptor_.onUpPressed();
    });

    onKeyRelease("up", () => {
      this.interceptor_.onUpReleased();
    });

    onKeyDown("left", () => {
      this.interceptor_.onLeftPressed();
    });

    onKeyRelease("left", () => {
      this.interceptor_.onLeftReleased();
    });

    onKeyDown("right", () => {
      this.interceptor_.onRightPressed();
    });

    onKeyRelease("right", () => {
      this.interceptor_.onRightReleased();
    });

    onKeyDown("space", () => {
      this.interceptor_.onSpacePressed();
    });

    onKeyRelease("space", () => {
      this.interceptor_.onSpaceReleased();
    });

    onKeyDown("p", () => {
      this.interceptor_.onPausePressed();
    });

    onKeyRelease("p", () => {
      this.interceptor_.onPauseReleased();
    });
  }
}

export default function(input_interceptor) {
  return new KaplayInputHandler(input_interceptor);
}