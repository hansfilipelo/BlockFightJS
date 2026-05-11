import { newShape } from "./shapes.mjs"
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

    this.preview_board_ = preview_board;
    this.preview_renderer_ = preview_renderer;
    this.preview_renderer_full_ = preview_renderer;
    this.preview_shape_ = null;
    this.is_compact_sidebar_ = false;

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
      this.drawGame();
    });
    this.player_info_controller_.setCompactSidebarCallback((is_compact_sidebar) => {
      this.setCompactSidebarMode(is_compact_sidebar);
    });
    this.drawGame();
    this.clearPreview();
  }

  drawGame() {
    let ghost_stones = null;
    if (this.current_shape_) {
      ghost_stones = this.current_shape_.getGhostStones();
    }
    this.renderer_.draw(ghost_stones);
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
    this.clearPreview();
    this.level_ = 1;
    this.n_drops_on_level_ = 0;
    this.score_ = 0;
    this.next_shape_class_ = null;
    this.player_info_controller_.setLevel(this.level_);
    this.player_info_controller_.setScore(this.score_);
  }

  start(player_name) {
    this.reset();
    this.player_name_ = player_name;
    this.is_playing_ = this.newShape();
    this.level_up_drops_interval_ = 30 * (1000 / this.getDropTimerInterval());

    this.player_info_controller_.setLevel(this.level_);
    this.player_info_controller_.setScore(this.score_);
    this.player_info_controller_.hideOverlay();

    this.drawGame();
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

  gameOver() {
    this.is_playing_ = false;
    this.clearTimers();
    this.player_info_controller_.showGameOverMenu();
  }

  newShape() {
    if (this.preview_shape_) {
      if (!this.preview_shape_.moveToBoard(this.board_)) {
        this.gameOver();
        return false;
      }
      this.current_shape_ = this.preview_shape_;
    } else {
      // First shape
      this.current_shape_ = newShape(this.board_);
      // This should never fail as board is empty at this point
      console.assert(this.current_shape_, "Failed to create first shape");
    }

    this.preview_shape_ = newShape(this.preview_board_);
    // This should never fail as we just moved shape off the preview board
    console.assert(this.preview_shape_, "Failed to create preview shape");
    // In preview board, drop 4 times so shape is visible.
    for (let i = 0; i < 4; ++i) {
      console.assert(this.preview_shape_.drop());
    }
    this.player_info_controller_.setPreviewShape(this.preview_shape_.getLabel());
    if (this.preview_renderer_) {
      this.preview_renderer_.draw();
    }

    return true;
  }

  clearPreview() {
    if (!this.preview_board_) return;
    this.preview_board_.newStones();
    this.player_info_controller_.setPreviewShape("");
    if (this.preview_renderer_) {
      this.preview_renderer_.draw();
    }
  }

  setCompactSidebarMode(is_compact_sidebar) {
    if (this.is_compact_sidebar_ === is_compact_sidebar) {
      return;
    }

    this.is_compact_sidebar_ = is_compact_sidebar;
    this.preview_renderer_ = is_compact_sidebar ? null : this.preview_renderer_full_;

    if (this.preview_shape_) {
      this.player_info_controller_.setPreviewShape(this.preview_shape_.getLabel());
    } else {
      this.player_info_controller_.setPreviewShape("");
    }

    if (this.preview_renderer_) {
      this.preview_renderer_.draw();
    }
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

    this.drawGame();

    if (this.is_playing_ && reload_timer) {
      this.reloadTimer();
    }
  }

  rotate() {
    if (!this.is_playing_ || this.is_paused_) {
      return;
    }

    this.current_shape_.rotate();
    this.drawGame();
  }

  left() {
    if (!this.is_playing_ || this.is_paused_) {
      return;
    }

    this.current_shape_.left();
    this.drawGame();
  }

  right() {
    if (!this.is_playing_ || this.is_paused_) {
      return;
    }

    this.current_shape_.right();
    this.drawGame();
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
    this.drawGame();
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
