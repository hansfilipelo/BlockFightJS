

function startGameCallback(player_info_controller) {
  player_info_controller.startGame();
}

class PlayerInfoController {

  constructor(overlay_div, sidebar_div) {
    this.overlay_ = overlay_div;
    this.sidebar_ = sidebar_div;

    this.start_menu_ = overlay_div.querySelector("#start_menu");
    this.pause_menu_ = overlay_div.querySelector("#pause_menu");
    this.game_over_menu_ = overlay_div.querySelector("#game_over_menu");
    this.player_name_input_ = overlay_div.querySelector("#player_name_input");

    this.start_game_callback_ = null;
    this.continue_callback_ = null;
    this.reset_callback_ = null;
    this.new_player_callback_ = null;

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

  showStartMenu() {
    this.start_menu_.hidden = false;
    this.pause_menu_.hidden = true;
    this.game_over_menu_.hidden = true;
    this.overlay_.hidden = false;
  }

  showPauseMenu() {
    this.start_menu_.hidden = true;
    this.pause_menu_.hidden = false;
    this.game_over_menu_.hidden = true;
    this.overlay_.hidden = false;
  }

  showGameOverMenu() {
    this.start_menu_.hidden = true;
    this.pause_menu_.hidden = true;
    this.game_over_menu_.hidden = false;
    this.overlay_.hidden = false;
  }

  hideOverlay() {
    this.overlay_.hidden = true;
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

  startGame() {
    console.assert(this.start_game_callback_ != null);
    this.start_game_callback_(this.getPlayerName());
  }

};

export { PlayerInfoController };