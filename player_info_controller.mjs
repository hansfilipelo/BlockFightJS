

function startGameCallback(player_info_controller) {
  player_info_controller.startGame();
}

class PlayerInfoController {

  constructor(menu_div) {
    this.menu_div_ = menu_div;
    this.start_button_ = this.menu_div_.querySelector("#start_button_button");
    this.start_button_.addEventListener("click", () => {startGameCallback(this)});
    this.start_game_callback_ = null;
  }

  setStartGameCallback(start_game_callback) {
    this.start_game_callback_ = start_game_callback;
  }

  getPlayerName() {
    return this.menu_div_.querySelector("#player_name_input").value;
  }

  setScore(score) {
    this.menu_div_.querySelector("#score_value").textContent = score;
  }

  setLevel(level) {
    this.menu_div_.querySelector("#level_value").textContent = level;
  }

  startGame() {
    console.assert(this.start_game_callback_ != null);
    this.start_game_callback_(this.getPlayerName());
  }

};

export { PlayerInfoController };