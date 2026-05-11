import { describe, expect, test } from "bun:test";

import { Board } from "../src/board.mjs";
import { Player } from "../src/player.mjs";
import { PREVIEW_SIZE } from "../src/game_state.mjs";
import {
  RecordingPlayerInfoController,
  RecordingRenderer,
  withMockedRandom,
  withMockedTimers,
} from "./helpers.mjs";

function createPlayer() {
  const board = new Board(10, 20);
  const preview_board = new Board(PREVIEW_SIZE, PREVIEW_SIZE);
  const renderer = new RecordingRenderer();
  const preview_renderer = new RecordingRenderer();
  const player_info = new RecordingPlayerInfoController();
  const player = new Player(board, renderer, player_info, preview_board, preview_renderer);
  return { board, preview_board, renderer, preview_renderer, player_info, player };
}

describe("Player", () => {
  test("start initializes play state and schedules the drop timer", () => {
    withMockedTimers(({ scheduled }) => withMockedRandom([0.5, 0.5], () => {
      const { renderer, preview_renderer, player_info, player } = createPlayer();

      player.start("Ada");

      expect(player.is_playing_).toBeTrue();
      expect(player.player_name_).toBe("Ada");
      expect(player_info.overlay_visible_).toBeFalse();
      expect(player_info.level_updates_.at(-1)).toBe(1);
      expect(player_info.score_updates_.at(-1)).toBe(0);
      expect(renderer.draw_calls_.at(-1)).toHaveLength(4);
      expect(preview_renderer.draw_calls_.length).toBeGreaterThan(0);
      expect(scheduled).toHaveLength(1);
      expect(scheduled[0].delay).toBe(player.getDropTimerInterval());
    }));
  });

  test("pauseResume toggles paused state and overlay visibility", () => {
    withMockedTimers(({ scheduled }) => withMockedRandom([0.5, 0.5], () => {
      const { player_info, player } = createPlayer();

      player.start("Ada");
      player.pauseResume();
      expect(player.is_paused_).toBeTrue();
      expect(player_info.pause_menu_shown_).toBe(1);

      player.pauseResume();
      expect(player.is_paused_).toBeFalse();
      expect(player_info.overlay_hidden_).toBe(2);
      expect(scheduled).toHaveLength(2);
    }));
  });

  test("dropAllTheWay awards drop score and advances to the next shape", () => {
    withMockedTimers(() => withMockedRandom([0.5, 0.5, 0.5], () => {
      const { renderer, player_info, player } = createPlayer();

      player.start("Ada");
      player.dropAllTheWay();

      expect(player.score_).toBe(200);
      expect(player_info.score_updates_.at(-1)).toBe(200);
      expect(renderer.draw_calls_.at(-1)).toHaveLength(4);
      expect(player.current_shape_).not.toBeNull();
      expect(player.preview_shape_).not.toBeNull();
    }));
  });

  test("drop levels up when the configured interval is reached", () => {
    withMockedTimers(() => withMockedRandom([0.5, 0.5], () => {
      const { player_info, player } = createPlayer();

      player.start("Ada");
      player.level_up_drops_interval_ = 1;
      player.drop(false);

      expect(player.level_).toBe(2);
      expect(player_info.level_updates_.at(-1)).toBe(2);
    }));
  });

  test("compact sidebar swaps the preview canvas for a shape label", () => {
    withMockedTimers(() => withMockedRandom([0.5, 0.5], () => {
      const { preview_renderer, player_info, player } = createPlayer();

      player.start("Ada");
      const preview_draw_count = preview_renderer.draw_calls_.length;

      expect(player_info.preview_shape_updates_.at(-1)).toBe("O");

      player.setCompactSidebarMode(true);
      expect(player.preview_renderer_).toBeNull();

      player.clearPreview();
      expect(preview_renderer.draw_calls_).toHaveLength(preview_draw_count);
      expect(player_info.preview_shape_updates_.at(-1)).toBe("");

      player.setCompactSidebarMode(false);
      expect(player.preview_renderer_).toBe(preview_renderer);
      expect(preview_renderer.draw_calls_.length).toBe(preview_draw_count + 1);
    }));
  });
});
