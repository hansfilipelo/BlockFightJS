
export async function createInputHandler(player, platform=null) {
  if (!platform) {
    return await import("./input/kaplay.mjs").then(
      module => module.default(player));
  }

  if (platform === "kaplay") {
    return await import("./input/kaplay.mjs").then(
      module => module.default(player));
  }

  // TODO: Implement other input methods.
  return null;
}