import { IShape } from "./i_shape.mjs"

function startCallback(player, name) {
  player.start(name);
}

const SCORE_PER_ROW = 100;
const SCORE_PER_DROP = 10;
const LEVEL_UP_INTERVAL_SECONDS = 30;

export class Player {
  constructor(board, renderer, player_info_controller) {
    this.board_ = board;
    this.renderer_ = renderer;
    this.current_shape_ = null;

    this.level_ = 1;
    this.score_ = 0;

    this.drop_timer_ = null;
    this.level_timer_ = null;
    this.player_name_ = null;
    this.is_playing_ = false;
    this.is_paused_ = false;

    this.player_info_controller_ = player_info_controller;
    this.player_info_controller_.setStartGameCallback(
      (name) => { startCallback(this, name) });
  }

  reloadTimer() {
    console.assert(this.is_playing_);
    this.drop_timer_ = setTimeout(this.drop.bind(this),
                                  this.getDropTimerInterval());
  }

  levelUp() {
    this.level_++;
    this.player_info_controller_.setLevel(this.level_);
    this.levelTimer();
  }

  levelTimer() {
    this.level_timer_ = setTimeout(this.levelUp.bind(this),
                                  LEVEL_UP_INTERVAL_SECONDS * 1000);
  }

  clearTimers() {
    clearTimeout(this.drop_timer_);
    clearTimeout(this.level_timer_);
  }

  start(player_name) {
    this.player_name_ = player_name;
    this.is_playing_ = this.newShape();
    this.is_paused_ = false;

    this.level_ = 1;
    this.score_ = 0;

    this.player_info_controller_.setLevel(this.level_);
    this.player_info_controller_.setScore(this.score_);

    this.reloadTimer();
    this.levelTimer();
  }

  pauseResume() {
    if (this.is_paused_) {
      this.is_paused_ = false;
      this.reloadTimer();
      this.levelTimer();
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
    if (IShape.canCreate(this.board_)) {
      this.current_shape_ = new IShape(this.board_);
      return true;
    }

    console.log("Game over");
    this.is_playing_ = false;
    this.clearTimers();
    return false;
  }

  drop() {
    if (!this.is_playing_) {
      return;
    }

    if (!this.current_shape_.drop()) {
      this.addScore(SCORE_PER_DROP);
      this.addScore(this.board_.clearFullRows(
        this.current_shape_.getRowSpan()) * SCORE_PER_ROW);
      this.is_playing_ = this.newShape();
    }

    this.renderer_.draw();

    if (this.is_playing_) {
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

    while (this.current_shape_.drop()) {
      this.addScore(SCORE_PER_DROP);
    }

    this.addScore(this.board_.clearFullRows(
      this.current_shape_.getRowSpan()) * SCORE_PER_ROW);
    this.is_playing_ = this.newShape();
    this.renderer_.draw();
  }
}