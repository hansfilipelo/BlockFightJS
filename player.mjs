import { newShape, randomShapeClass, getShapePreview } from "./shapes.mjs"
import { Stone } from "./stone.mjs"

function startCallback(player, name) {
  player.start(name);
}

const SCORE_PER_ROW = 100;
const SCORE_PER_DROP = 10;

export class Player {
  constructor(board, renderer, player_info_controller,
              preview_board, preview_renderer) {
    this.board_ = board;
    this.renderer_ = renderer;
    this.current_shape_ = null;
    this.next_shape_class_ = null;

    this.preview_board_ = preview_board;
    this.preview_renderer_ = preview_renderer;

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
    this.player_info_controller_.setContinueCallback(() => {
      this.pauseResume();
    });
    this.player_info_controller_.setResetCallback(() => {
      this.start(this.player_name_);
    });
    this.player_info_controller_.setNewPlayerCallback(() => {
      this.reset();
      this.renderer_.draw();
    });
    this.renderer_.draw();
    this.clearPreview_();
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

  reset() {
    this.clearTimers();
    this.is_playing_ = false;
    this.is_paused_ = false;
    this.board_.newStones();
    this.level_ = 1;
    this.n_drops_on_level_ = 0;
    this.score_ = 0;
    this.next_shape_class_ = null;
    this.player_info_controller_.setLevel(this.level_);
    this.player_info_controller_.setScore(this.score_);
    this.clearPreview_();
  }

  start(player_name) {
    this.reset();
    this.player_name_ = player_name;
    this.next_shape_class_ = randomShapeClass();
    this.is_playing_ = this.newShape();
    this.level_up_drops_interval_ = 30 * (1000 / this.getDropTimerInterval());

    this.player_info_controller_.setLevel(this.level_);
    this.player_info_controller_.setScore(this.score_);
    this.player_info_controller_.hideOverlay();

    this.renderer_.draw();
    this.reloadTimer();
  }

  pauseResume() {
    if (!this.is_playing_) {
      return;
    }

    if (this.is_paused_) {
      this.is_paused_ = false;
      this.reloadTimer();
      this.player_info_controller_.hideOverlay();
    } else {
      this.clearTimers();
      this.is_paused_ = true;
      this.player_info_controller_.showPauseMenu();
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
    const ShapeClass = this.next_shape_class_;
    this.next_shape_class_ = randomShapeClass();
    this.renderPreview_();

    if (!ShapeClass.canCreate(this.board_)) {
      this.is_playing_ = false;
      this.clearTimers();
      this.player_info_controller_.showGameOverMenu();
      return false;
    }
    this.current_shape_ = new ShapeClass(this.board_);
    return true;
  }

  // -----------------------------------------------------------------------
  // Preview rendering
  // -----------------------------------------------------------------------

  renderPreview_() {
    if (!this.preview_board_ || !this.next_shape_class_) return;
    this.preview_board_.newStones();
    const preview = getShapePreview(this.next_shape_class_);
    for (const pos of preview.positions) {
      new Stone(pos.x, pos.y, preview.color, this.preview_board_);
    }
    this.preview_renderer_.draw();
  }

  clearPreview_() {
    if (!this.preview_board_) return;
    this.preview_board_.newStones();
    this.preview_renderer_.draw();
  }

  drop(reload_timer) {
    if (!this.is_playing_ || this.is_paused_) {
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
    if (!this.is_playing_ || this.is_paused_) {
      return;
    }

    this.current_shape_.rotate();
    this.renderer_.draw();
  }

  left() {
    if (!this.is_playing_ || this.is_paused_) {
      return;
    }

    this.current_shape_.left();
    this.renderer_.draw();
  }

  right() {
    if (!this.is_playing_ || this.is_paused_) {
      return;
    }

    this.current_shape_.right();
    this.renderer_.draw();
  }

  dropAllTheWay() {
    if (!this.is_playing_ || this.is_paused_) {
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

  // -----------------------------------------------------------------------
  // Overlay / spatial navigation pass-through
  // -----------------------------------------------------------------------

  isOverlayVisible() {
    return this.player_info_controller_.isVisible();
  }

  menuUp() {
    this.player_info_controller_.navigateUp();
  }

  menuDown() {
    this.player_info_controller_.navigateDown();
  }

  menuSelect() {
    this.player_info_controller_.activateFocused();
  }
}
