export async function createRenderer(board, window, game_canvas, platform=null) {
  let renderer;

  if (!platform) {
    renderer = await import("./renderers/kaplay.mjs").then(
      module => module.default(board, game_canvas));
  }

  if (platform === "kaplay") {
    renderer = await import("./renderers/kaplay.mjs").then(
      module => module.default(board, game_canvas));
  }

  window.addEventListener("resize", () => {
    renderer.onResize();
  });
  // TODO: Implement other input methods.

  return renderer;
}