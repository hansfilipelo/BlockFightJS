import { newShape } from "./shapes.mjs"

function startCallback(player, name) {
  player.start(name);
}

const SCORE_PER_ROW = 100;
const SCORE_PER_DROP = 10;

export class Player {
  constructor(board, renderer, player_info_controller) {
    this.board_ = board;
    this.renderer_ = renderer;
    this.current_shape_ = null;

    this.level_ = 1;
    this.n_drops_on_level_ = 0;
    this.score_ = 0;
    this.level_up_drops_interval_ = 30 * (1000 / this.getDropTimerInterval());

    this.drop_timer_ = null;
    this.player_name_ = null;
    this.is_playing_ = false;
    this.is_paused_ = false;

    this.player_info_controller_ = player_info_controller;
    this.player_info_controller_.setStartGameCallback(
      (name) => { startCallback(this, name) });
  }

  reloadTimer() {
    console.assert(this.is_playing_);
    this.drop_timer_ = setTimeout(this.drop.bind(this, true /* reload_timer */),
                                  this.getDropTimerInterval());
  }

  levelUp() {
    this.level_++;
    this.n_drops_on_level_ = 0;
    this.player_info_controller_.setLevel(this.level_);
    this.level_up_drops_interval_ = 30 * (1000 / this.getDropTimerInterval());
  }

  clearTimers() {
    clearTimeout(this.drop_timer_);
  }

  start(player_name) {
    this.player_name_ = player_name;
    this.board_.newStones();
    this.is_playing_ = this.newShape();
    this.is_paused_ = false;

    this.level_ = 1;
    this.score_ = 0;

    this.player_info_controller_.setLevel(this.level_);
    this.player_info_controller_.setScore(this.score_);

    this.reloadTimer();
  }

  pauseResume() {
    if (this.is_paused_) {
      this.is_paused_ = false;
      this.reloadTimer();
    } else {
      this.clearTimers();
      this.is_paused_ = true;
    }
  }

  getDropTimerInterval() {
    return Math.max(500 - (this.level_ - 1) * 25, 100);
  }

  addScore(base_points) {
    this.score_ += base_points * this.level_;
    this.player_info_controller_.setScore(this.score_);
  }

  newShape() {
    this.current_shape_ = newShape(this.board_);
    if (this.current_shape_ !== null) {
      return true;
    }
    this.is_playing_ = false;
    this.clearTimers();
    return false;
  }

  drop(reload_timer) {
    if (!this.is_playing_) {
      return;
    }

    this.n_drops_on_level_++;
    if (this.n_drops_on_level_ >= this.level_up_drops_interval_) {
      this.levelUp();
    }

    if (!this.current_shape_.drop()) {
      this.addScore(SCORE_PER_DROP);
      this.addScore(this.board_.clearFullRows(
        this.current_shape_.getRowSpan()) * SCORE_PER_ROW);
      this.is_playing_ = this.newShape();
    }

    this.renderer_.draw();

    if (this.is_playing_ && reload_timer) {
      this.reloadTimer();
    }
  }

  rotate() {
    if (!this.is_playing_) {
      return;
    }

    this.current_shape_.rotate();
    this.renderer_.draw();
  }

  left() {
    if (!this.is_playing_) {
      return;
    }

    this.current_shape_.left();
    this.renderer_.draw();
  }

  right() {
    if (!this.is_playing_) {
      return;
    }

    this.current_shape_.right();
    this.renderer_.draw();
  }

  dropAllTheWay() {
    if (!this.is_playing_) {
      return;
    }

    while (this.current_shape_.drop(false /* reload_timer */)) {
      this.addScore(SCORE_PER_DROP);
    }

    this.addScore(this.board_.clearFullRows(
      this.current_shape_.getRowSpan()) * SCORE_PER_ROW);
    this.is_playing_ = this.newShape();
    this.renderer_.draw();
  }
}