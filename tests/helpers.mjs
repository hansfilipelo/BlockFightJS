export class RecordingRenderer {
  constructor() {
    this.draw_calls_ = [];
    this.resize_calls_ = 0;
  }

  draw(ghost_stones = null) {
    this.draw_calls_.push(ghost_stones);
  }

  onResize() {
    this.resize_calls_++;
  }
}

export class RecordingPlayerInfoController {
  constructor() {
    this.start_game_callback_ = null;
    this.continue_callback_ = null;
    this.reset_callback_ = null;
    this.new_player_callback_ = null;
    this.score_updates_ = [];
    this.level_updates_ = [];
    this.overlay_visible_ = true;
    this.pause_menu_shown_ = 0;
    this.game_over_menu_shown_ = 0;
    this.overlay_hidden_ = 0;
    this.menu_up_calls_ = 0;
    this.menu_down_calls_ = 0;
    this.menu_select_calls_ = 0;
  }

  setStartGameCallback(callback) {
    this.start_game_callback_ = callback;
  }

  setContinueCallback(callback) {
    this.continue_callback_ = callback;
  }

  setResetCallback(callback) {
    this.reset_callback_ = callback;
  }

  setNewPlayerCallback(callback) {
    this.new_player_callback_ = callback;
  }

  showPauseMenu() {
    this.overlay_visible_ = true;
    this.pause_menu_shown_++;
  }

  showGameOverMenu() {
    this.overlay_visible_ = true;
    this.game_over_menu_shown_++;
  }

  hideOverlay() {
    this.overlay_visible_ = false;
    this.overlay_hidden_++;
  }

  isVisible() {
    return this.overlay_visible_;
  }

  navigateUp() {
    this.menu_up_calls_++;
  }

  navigateDown() {
    this.menu_down_calls_++;
  }

  activateFocused() {
    this.menu_select_calls_++;
  }

  setScore(score) {
    this.score_updates_.push(score);
  }

  setLevel(level) {
    this.level_updates_.push(level);
  }
}

export function withMockedRandom(values, callback) {
  const original_random = Math.random;
  let idx = 0;
  Math.random = () => {
    const value = values[Math.min(idx, values.length - 1)];
    idx++;
    return value;
  };

  try {
    return callback();
  } finally {
    Math.random = original_random;
  }
}

export function withMockedTimers(callback) {
  const original_set_timeout = globalThis.setTimeout;
  const original_clear_timeout = globalThis.clearTimeout;
  const scheduled = [];
  const cleared = [];

  globalThis.setTimeout = (fn, delay) => {
    const handle = { fn, delay, id: scheduled.length + 1 };
    scheduled.push(handle);
    return handle;
  };
  globalThis.clearTimeout = (handle) => {
    cleared.push(handle);
  };

  try {
    return callback({ scheduled, cleared });
  } finally {
    globalThis.setTimeout = original_set_timeout;
    globalThis.clearTimeout = original_clear_timeout;
  }
}

export function stonePositions(stones) {
  return stones
    .map((stone) => [stone.x_pos(), stone.y_pos()])
    .sort((left, right) => left[1] - right[1] || left[0] - right[0]);
}

export function ghostPositions(stones) {
  return stones
    .map((stone) => [stone.x_pos, stone.y_pos])
    .sort((left, right) => left[1] - right[1] || left[0] - right[0]);
}
