import * as dummy_renderer from "./renderers/dummy.mjs"
import * as webgl_renderer from "./renderers/webgl.mjs"

const RENDERER_MODULES = {
  dummy: dummy_renderer,
  webgl: webgl_renderer,
};

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

  const renderer_module = RENDERER_MODULES[platform];
  if (!renderer_module) {
    throw new Error("Unknown renderer platform: " + platform);
  }

  let renderer = renderer_module.createRenderer(board,
                                                game_canvas,
                                                is_dark_mode,
                                                is_preview_renderer);

  window.addEventListener("resize", () => {
    renderer.onResize();
  });

  return renderer;
}
