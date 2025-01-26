import { IShape } from "./i_shape.mjs"

function startCallback(player, name) {
  player.start(name);
}

export class Player {
  constructor(board, renderer, player_info_controller) {
    this.board_ = board;
    this.renderer_ = renderer;
    this.current_shape_ = null;
    this.level_ = 0;
    this.drop_timer_ = null;
    this.player_name_ = null;
    this.is_playing_ = false;

    this.player_info_controller_ = player_info_controller;
    this.player_info_controller_.setStartGameCallback(
      (name) => { startCallback(this, name) });
  }

  reloadTimer() {
    this.drop_timer_ = setTimeout(this.drop.bind(this),
                                  this.getDropTimerInterval());
  }

  start(player_name) {
    this.is_playing_ = true;
    this.player_name_ = player_name;
    this.newShape();
    this.reloadTimer();
  }

  getDropTimerInterval() {
    return 450 - this.level_ * 25;
  }

  newShape() {
    this.current_shape_ = new IShape(this.board_);
  }

  drop() {
    if (!this.is_playing_) {
      return;
    }

    if (!this.current_shape_.drop()) {
      this.newShape();
    }
    this.renderer_.draw();
    this.reloadTimer();
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

    while (this.current_shape_.drop()) {}
    this.newShape();
    this.renderer_.draw();
  }
}