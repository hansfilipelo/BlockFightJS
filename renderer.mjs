export async function createRenderer(board, platform=null) {
  if (!platform) {
    return await import("./renderers/kaplay.mjs").then(
      module => module.default(board));
  }


  if (platform === "kaplay") {
    return await import("./renderers/kaplay.mjs").then(
      module => module.default(board));
  }

  // TODO: Implement other input methods.
  return null;
}