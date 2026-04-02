import { OUTLINE_SIZE } from "../game_state.mjs"

// ---------------------------------------------------------------------------
// Shader sources
// ---------------------------------------------------------------------------

const VERTEX_SRC = `
  attribute vec2 a_position;
  uniform vec2 u_resolution;

  void main() {
    // Convert pixel coordinates to 0..1, then to clip space -1..1
    vec2 zeroToOne = a_position / u_resolution;
    vec2 clipSpace = zeroToOne * 2.0 - 1.0;
    // Flip Y so 0 is at the top
    gl_Position = vec4(clipSpace.x, -clipSpace.y, 0, 1);
  }
`;

const FRAGMENT_SRC = `
  precision mediump float;
  uniform vec4 u_color;

  void main() {
    gl_FragColor = u_color;
  }
`;

// ---------------------------------------------------------------------------
// GL helpers
// ---------------------------------------------------------------------------

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error("Shader compile error: " + info);
  }
  return shader;
}

function createProgram(gl) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error("Program link error: " + info);
  }
  return program;
}

// ---------------------------------------------------------------------------
// Coordinate helpers (same logic as kaplay renderer)
// ---------------------------------------------------------------------------

function calculateStoneSize(window_width, window_height, board_width, board_height) {
  const width_stones = Math.floor(window_width / board_width);
  const height_stones = Math.floor(window_height / board_height);
  return Math.min(width_stones, height_stones);
}

function xPosToScreen(x_pos, x_start, stone_size) {
  return x_start + x_pos * stone_size;
}

function yPosToScreen(y_pos, y_start, stone_size) {
  return y_start + y_pos * stone_size;
}

// ---------------------------------------------------------------------------
// WebGLRenderer
// ---------------------------------------------------------------------------

class WebGLRenderer {
  constructor(board, game_canvas, is_dark_mode) {
    this.board_ = board;
    this.game_canvas_ = game_canvas;
    this.is_dark_mode_ = is_dark_mode;

    // Obtain a WebGL context
    const gl = game_canvas.getContext("webgl") ||
               game_canvas.getContext("experimental-webgl");
    if (!gl) {
      throw new Error("WebGL is not supported in this browser");
    }
    this.gl_ = gl;

    // Make the canvas fill its parent container (Kaplay does this internally)
    game_canvas.style.width = '100%';
    game_canvas.style.height = '100%';
    game_canvas.style.display = 'block';

    // Build shader program and cache locations
    this.program_ = createProgram(gl);
    this.a_position_ = gl.getAttribLocation(this.program_, "a_position");
    this.u_resolution_ = gl.getUniformLocation(this.program_, "u_resolution");
    this.u_color_ = gl.getUniformLocation(this.program_, "u_color");

    // Reusable vertex buffer (two triangles = one quad)
    this.vertex_buffer_ = gl.createBuffer();

    // Sync canvas backing size with its CSS layout size
    this.syncCanvasSize_();

    // Compute board layout metrics
    this.computeLayout_();
  }

  // -----------------------------------------------------------------------
  // Internal helpers
  // -----------------------------------------------------------------------

  /** Make the canvas drawing-buffer match its CSS dimensions. */
  syncCanvasSize_() {
    const dpr = window.devicePixelRatio || 1;
    const display_w = this.game_canvas_.clientWidth;
    const display_h = this.game_canvas_.clientHeight;
    const buf_w = Math.round(display_w * dpr);
    const buf_h = Math.round(display_h * dpr);

    if (this.game_canvas_.width !== buf_w ||
        this.game_canvas_.height !== buf_h) {
      this.game_canvas_.width = buf_w;
      this.game_canvas_.height = buf_h;
    }
    this.dpr_ = dpr;
  }

  /** Recompute stone size and board origin from current canvas size. */
  computeLayout_() {
    // Use CSS (logical) dimensions for layout, same as kaplay renderer which
    // uses offsetWidth/offsetHeight.
    const css_w = this.game_canvas_.clientWidth;
    const css_h = this.game_canvas_.clientHeight;

    this.stone_size_ = calculateStoneSize(
      css_w, css_h,
      this.board_.width(), this.board_.height());

    this.x_start_ = css_w / 2 -
      (this.board_.width() * this.stone_size_) / 2;
    this.y_start_ = 0;
  }

  // -----------------------------------------------------------------------
  // Low-level drawing primitives
  // -----------------------------------------------------------------------

  /** Draw a filled rectangle in pixel (CSS) coordinates. */
  fillRect_(x, y, w, h, r, g, b, a = 1.0) {
    const gl = this.gl_;
    const dpr = this.dpr_;

    // Scale to physical pixels
    const px = x * dpr;
    const py = y * dpr;
    const pw = w * dpr;
    const ph = h * dpr;

    // Two-triangle quad
    const vertices = new Float32Array([
      px,      py,
      px + pw, py,
      px,      py + ph,
      px,      py + ph,
      px + pw, py,
      px + pw, py + ph
    ]);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer_);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(this.a_position_, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.a_position_);

    gl.uniform4f(this.u_color_, r, g, b, a);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /** Draw a rectangle outline (four thin rects). */
  strokeRect_(x, y, w, h, lineWidth, r, g, b, a = 1.0) {
    // Top
    this.fillRect_(x, y, w, lineWidth, r, g, b, a);
    // Bottom
    this.fillRect_(x, y + h - lineWidth, w, lineWidth, r, g, b, a);
    // Left
    this.fillRect_(x, y + lineWidth, lineWidth, h - 2 * lineWidth, r, g, b, a);
    // Right
    this.fillRect_(x + w - lineWidth, y + lineWidth, lineWidth, h - 2 * lineWidth, r, g, b, a);
  }

  // -----------------------------------------------------------------------
  // Public API (matches KaplayRenderer)
  // -----------------------------------------------------------------------

  onResize() {
    this.syncCanvasSize_();
    this.computeLayout_();
    this.draw();
  }

  draw() {
    const gl = this.gl_;

    // Viewport must cover the entire physical-pixel backing store
    gl.viewport(0, 0, this.game_canvas_.width, this.game_canvas_.height);
    gl.useProgram(this.program_);
    gl.uniform2f(this.u_resolution_,
                 this.game_canvas_.width, this.game_canvas_.height);

    // Clear the canvas
    if (this.is_dark_mode_) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
    } else {
      gl.clearColor(1.0, 1.0, 1.0, 1.0);
    }
    gl.clear(gl.COLOR_BUFFER_BIT);

    const bw = this.board_.width() * this.stone_size_;
    const bh = this.board_.height() * this.stone_size_;

    // Draw the board background
    const board_bg_r = this.is_dark_mode_ ? 0.12 : 0.95;
    const board_bg_g = this.is_dark_mode_ ? 0.12 : 0.95;
    const board_bg_b = this.is_dark_mode_ ? 0.12 : 0.95;
    this.fillRect_(this.x_start_, this.y_start_, bw, bh,
                   board_bg_r, board_bg_g, board_bg_b);

    // Board outline
    const outline_r = this.is_dark_mode_ ? 1.0 : 0.0;
    const outline_g = this.is_dark_mode_ ? 1.0 : 0.0;
    const outline_b = this.is_dark_mode_ ? 1.0 : 0.0;
    this.strokeRect_(this.x_start_, this.y_start_, bw, bh,
                     OUTLINE_SIZE, outline_r, outline_g, outline_b);

    // Draw each stone on the board
    for (let x = 0; x < this.board_.width(); ++x) {
      for (let y = 0; y < this.board_.height(); ++y) {
        const stone = this.board_.getStone(x, y);
        if (stone !== null) {
          const color = stone.color();
          const sx = xPosToScreen(x, this.x_start_, this.stone_size_);
          const sy = yPosToScreen(y, this.y_start_, this.stone_size_);

          // Stone fill (color values are 0-255, normalise to 0-1)
          this.fillRect_(sx, sy,
                         this.stone_size_, this.stone_size_,
                         color.r_ / 255, color.g_ / 255, color.b_ / 255);

          // Stone outline
          this.strokeRect_(sx, sy,
                           this.stone_size_, this.stone_size_,
                           OUTLINE_SIZE,
                           outline_r, outline_g, outline_b);
        }
      }
    }
  }
}

export default function (board, game_canvas, is_dark_mode) {
  return new WebGLRenderer(board, game_canvas, is_dark_mode);
}
