const KEY_MAP = {
  "ArrowDown":  { pressed: "onDownPressed",   released: "onDownReleased"  },
  "ArrowUp":    { pressed: "onUpPressed",      released: "onUpReleased"   },
  "ArrowLeft":  { pressed: "onLeftPressed",    released: "onLeftReleased" },
  "ArrowRight": { pressed: "onRightPressed",   released: "onRightReleased"},
  " ":          { pressed: "onSpacePressed",   released: "onSpaceReleased"},
  "Enter":      { pressed: "onEnterPressed",   released: "onEnterReleased"},
  "p":          { pressed: "onPausePressed",   released: "onPauseReleased"},
  "P":          { pressed: "onPausePressed",   released: "onPauseReleased"},
};

// Keys that exit a focused input and resume spatnav
const NAV_KEYS = new Set(["ArrowUp", "ArrowDown", "Enter"]);

class JavascriptInputHandler {
  constructor(input_interceptor) {
    this.interceptor_ = input_interceptor;
    this.pressed_keys_ = new Set();

    this.onKeyDown_ = (e) => {
      if (e.target.tagName === 'INPUT') {
        // Let Up/Down/Enter blur the input and resume spatnav
        if (NAV_KEYS.has(e.key)) {
          e.target.blur();
        } else {
          return;
        }
      }

      const mapping = KEY_MAP[e.key];
      if (mapping) {
        e.preventDefault();
        this.pressed_keys_.add(e.key);
      }
    };

    this.onKeyUp_ = (e) => {
      const mapping = KEY_MAP[e.key];
      if (mapping) {
        this.pressed_keys_.delete(e.key);
        if (e.target.tagName === 'INPUT' && !NAV_KEYS.has(e.key)) return;
        e.preventDefault();
        this.interceptor_[mapping.released]();
      }
    };

    document.addEventListener("keydown", this.onKeyDown_);
    document.addEventListener("keyup", this.onKeyUp_);

    // Poll held keys every frame, matching Kaplay's onKeyDown behavior
    const poll = () => {
      for (const key of this.pressed_keys_) {
        const mapping = KEY_MAP[key];
        if (mapping) {
          this.interceptor_[mapping.pressed]();
        }
      }
      requestAnimationFrame(poll);
    };
    requestAnimationFrame(poll);
  }
}

export default function (input_interceptor) {
  return new JavascriptInputHandler(input_interceptor);
}
