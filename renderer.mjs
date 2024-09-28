export async function createRenderer(board, game_canvas, platform=null) {
  if (!platform) {
    return await import("./renderers/kaplay.mjs").then(
      module => module.default(board, game_canvas));
  }


  if (platform === "kaplay") {
    return await import("./renderers/kaplay.mjs").then(
      module => module.default(board, game_canvas));
  }

  // TODO: Implement other input methods.
  return null;
}