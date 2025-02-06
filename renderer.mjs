export async function createRenderer(board, window, game_canvas, platform=null) {
  let renderer;
  let is_dark_mode = window.matchMedia &&
                     window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (!platform) {
    renderer = await import("./renderers/kaplay.mjs").then(
      module => module.default(board, game_canvas, is_dark_mode));
  }

  if (platform === "kaplay") {
    renderer = await import("./renderers/kaplay.mjs").then(
      module => module.default(board, game_canvas, is_dark_mode));
  }

  window.addEventListener("resize", () => {
    renderer.onResize();
  });
  // TODO: Implement other input methods.

  return renderer;
}