export async function createRenderer(board,
                                     window,
                                     game_canvas,
                                     platform=null,
                                     force_dark_mode=false,
                                     is_preview_renderer=false) {
  let is_dark_mode = force_dark_mode || 
                     (window.matchMedia &&
                      window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (!platform) {
    platform = "webgl";
  }

  let renderer = await import("./renderers/" + platform + ".mjs").then(
    module => module.default(board, game_canvas, is_dark_mode, is_preview_renderer));

  window.addEventListener("resize", () => {
    renderer.onResize();
  });

  return renderer;
}
