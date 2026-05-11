

function startGameCallback(player_info_controller) {
  player_info_controller.startGame();
}

class PlayerInfoController {

  constructor(layout_div, overlay_div, sidebar_div, window_obj = globalThis) {
    this.layout_ = layout_div;
    this.overlay_ = overlay_div;
    this.sidebar_ = sidebar_div;
    this.window_ = window_obj;

    this.start_menu_ = overlay_div.querySelector("#start_menu");
    this.pause_menu_ = overlay_div.querySelector("#pause_menu");
    this.game_over_menu_ = overlay_div.querySelector("#game_over_menu");
    this.player_name_input_ = overlay_div.querySelector("#player_name_input");
    this.preview_heading_ = sidebar_div.querySelector("#preview_heading");
    this.preview_text_ = sidebar_div.querySelector("#preview_text");

    this.start_game_callback_ = null;
    this.continue_callback_ = null;
    this.reset_callback_ = null;
    this.new_player_callback_ = null;
    this.compact_sidebar_callback_ = null;
    this.is_compact_sidebar_ = false;

    this.focused_index_ = 0;

    // Start menu
    overlay_div.querySelector("#start_button").addEventListener("click",
      () => { startGameCallback(this); });

    // Pause menu
    overlay_div.querySelector("#continue_button").addEventListener("click",
      () => { if (this.continue_callback_) this.continue_callback_(); });

    overlay_div.querySelector("#reset_button").addEventListener("click",
      () => { if (this.reset_callback_) this.reset_callback_(); });

    overlay_div.querySelector("#new_player_button").addEventListener("click",
      () => {
        if (this.new_player_callback_) this.new_player_callback_();
        this.showStartMenu();
      });

    // Game over menu
    overlay_div.querySelector("#game_over_reset_button").addEventListener("click",
      () => { if (this.reset_callback_) this.reset_callback_(); });

    overlay_div.querySelector("#game_over_new_player_button").addEventListener("click",
      () => {
        if (this.new_player_callback_) this.new_player_callback_();
        this.showStartMenu();
      });

    const update_sidebar_layout = () => { this.updateSidebarLayout_(); };
    if (this.window_.addEventListener) {
      this.window_.addEventListener("resize", update_sidebar_layout);
    }
    if (this.window_.visualViewport?.addEventListener) {
      this.window_.visualViewport.addEventListener("resize", update_sidebar_layout);
    }

    this.updateSidebarLayout_();
  }

  setStartGameCallback(start_game_callback) {
    this.start_game_callback_ = start_game_callback;
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

  setCompactSidebarCallback(callback) {
    this.compact_sidebar_callback_ = callback;
    callback(this.is_compact_sidebar_);
  }

  // -----------------------------------------------------------------------
  // Overlay visibility
  // -----------------------------------------------------------------------

  showStartMenu() {
    this.start_menu_.hidden = false;
    this.pause_menu_.hidden = true;
    this.game_over_menu_.hidden = true;
    this.overlay_.hidden = false;
    this.setFocus_(0);
  }

  showPauseMenu() {
    this.start_menu_.hidden = true;
    this.pause_menu_.hidden = false;
    this.game_over_menu_.hidden = true;
    this.overlay_.hidden = false;
    this.setFocus_(0);
  }

  showGameOverMenu() {
    this.start_menu_.hidden = true;
    this.pause_menu_.hidden = true;
    this.game_over_menu_.hidden = false;
    this.overlay_.hidden = false;
    this.setFocus_(0);
  }

  hideOverlay() {
    this.overlay_.hidden = true;
    // Remove visual focus when hiding
    const prev = this.overlay_.querySelector('.spatnav-focus');
    if (prev) prev.classList.remove('spatnav-focus');
  }

  isVisible() {
    return !this.overlay_.hidden;
  }

  // -----------------------------------------------------------------------
  // Spatial navigation
  // -----------------------------------------------------------------------

  getFocusableElements_() {
    let menu = null;
    if (!this.start_menu_.hidden) menu = this.start_menu_;
    else if (!this.pause_menu_.hidden) menu = this.pause_menu_;
    else if (!this.game_over_menu_.hidden) menu = this.game_over_menu_;
    if (!menu) return [];
    return Array.from(menu.querySelectorAll('button, input'));
  }

  setFocus_(index) {
    const elements = this.getFocusableElements_();
    if (elements.length === 0) return;

    const prev = this.overlay_.querySelector('.spatnav-focus');
    if (prev) prev.classList.remove('spatnav-focus');

    // Wrap around
    this.focused_index_ =
      ((index % elements.length) + elements.length) % elements.length;
    elements[this.focused_index_].classList.add('spatnav-focus');
  }

  navigateUp() {
    if (!this.isVisible()) return;
    this.setFocus_(this.focused_index_ - 1);
  }

  navigateDown() {
    if (!this.isVisible()) return;
    this.setFocus_(this.focused_index_ + 1);
  }

  activateFocused() {
    if (!this.isVisible()) return;
    const elements = this.getFocusableElements_();
    if (elements.length === 0) return;
    const el = elements[this.focused_index_];
    if (el.tagName === 'INPUT') {
      el.focus();
    } else {
      el.click();
    }
  }

  getPlayerName() {
    return this.player_name_input_.value;
  }

  setScore(score) {
    this.sidebar_.querySelector("#score_value").textContent = score;
  }

  setLevel(level) {
    this.sidebar_.querySelector("#level_value").textContent = level;
  }

  setPreviewShape(shape_label) {
    this.preview_text_.textContent = shape_label;
  }

  shouldUseCompactSidebar_() {
    const viewport_height = this.window_.visualViewport?.height ?? this.window_.innerHeight;
    const layout_style = this.window_.getComputedStyle(this.layout_);
    const usable_width = this.window_.innerWidth -
      parseFloat(layout_style.paddingLeft) -
      parseFloat(layout_style.paddingRight);
    const layout_gap = parseFloat(layout_style.columnGap);
    return usable_width < (viewport_height * 0.75) + layout_gap;
  }

  updateSidebarLayout_() {
    const is_compact_sidebar = this.shouldUseCompactSidebar_();
    this.is_compact_sidebar_ = is_compact_sidebar;
    this.layout_.classList.toggle("compact-sidebar", is_compact_sidebar);
    document.body.classList.toggle("compact-sidebar-active", is_compact_sidebar);
    this.preview_heading_.textContent = "Next shape";
    if (this.compact_sidebar_callback_) {
      this.compact_sidebar_callback_(is_compact_sidebar);
    }
  }

  startGame() {
    console.assert(this.start_game_callback_ != null);
    this.start_game_callback_(this.getPlayerName());
  }

};

export { PlayerInfoController };
