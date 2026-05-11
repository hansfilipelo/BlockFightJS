import { OUTLINE_SIZE } from "../game_state.mjs"

// ---------------------------------------------------------------------------
// Shader sources
// ---------------------------------------------------------------------------

const VERTEX_SRC = `
  attribute vec2 a_position;
  uniform vec2 u_resolution;

  void main() {
    vec2 zeroToOne = a_position / u_resolution;
    vec2 clipSpace = zeroToOne * 2.0 - 1.0;
    gl_Position = vec4(clipSpace.x, -clipSpace.y, 0, 1);
  }
`;

// Single-pass fragment shader: draws board background, stone fills, and all
// outlines by looking up per-cell color from a data texture.
const FRAGMENT_SRC = `
  precision mediump float;

  uniform sampler2D u_board_colors;
  uniform vec2 u_board_origin;
  uniform vec2 u_board_size;
  uniform float u_stone_size;
  uniform vec4 u_stone_outline_color;
  uniform float u_outline_size;
  uniform vec4 u_outline_color;
  uniform vec4 u_bg_color;
  uniform vec4 u_column_line_color;
  uniform float u_canvas_height;

  void main() {
    vec2 frag = vec2(gl_FragCoord.x, u_canvas_height - gl_FragCoord.y);
    vec2 board_pos = frag - u_board_origin;
    vec2 board_pixel_size = u_board_size * u_stone_size;

    // Which cell and position within it
    vec2 cell = clamp(floor(board_pos / u_stone_size),
                      vec2(0.0), u_board_size - 1.0);
    vec2 cell_pos = board_pos - cell * u_stone_size;

    // Look up color from data texture
    vec2 uv = (cell + 0.5) / u_board_size;
    vec4 stone_color = texture2D(u_board_colors, uv);

    if (stone_color.a > 0.0) {
      // Stone outline
      if (cell_pos.x < u_outline_size ||
          cell_pos.x > u_stone_size - u_outline_size ||
          cell_pos.y < u_outline_size ||
          cell_pos.y > u_stone_size - u_outline_size) {
        gl_FragColor = u_stone_outline_color;
        return;
      } else {
        gl_FragColor = vec4(stone_color.rgb, 1.0);
      }
    } else {
      gl_FragColor = u_bg_color;
    }

    // Dotted column guide lines
    if (cell.x > 0.0 && cell_pos.x < 1.0) {
      float dot_y = mod(board_pos.y, 6.0);
      if (dot_y < 2.0) {
        gl_FragColor = mix(gl_FragColor, u_column_line_color,
                           u_column_line_color.a);
      }
    }

    // Board outline
    if (board_pos.x < u_outline_size ||
        board_pos.x > board_pixel_size.x - u_outline_size ||
        board_pos.y < u_outline_size ||
        board_pos.y > board_pixel_size.y - u_outline_size) {
      gl_FragColor = u_outline_color;
    }
  }
`;

const GHOST_FRAGMENT_SRC = `
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

function createProgram(gl, vertSrc, fragSrc) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
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
// Coordinate helpers
// ---------------------------------------------------------------------------

function calculateStoneSize(window_width, window_height, board_width, board_height) {
  const width_stones = Math.floor(window_width / board_width);
  const height_stones = Math.floor(window_height / board_height);
  return Math.min(width_stones, height_stones);
}

// ---------------------------------------------------------------------------
// WebGLRenderer
// ---------------------------------------------------------------------------

class WebGLRenderer {
  constructor(board, game_canvas, is_dark_mode, is_preview_renderer) {
    this.board_ = board;
    this.game_canvas_ = game_canvas;
    this.is_dark_mode_ = is_dark_mode;
    this.is_preview_renderer_ = is_preview_renderer;

    if (this.is_preview_renderer_) {
      this.outline_v_ = this.is_dark_mode_ ? 0.0 : 1.0;
      this.stone_outline_v_ = this.is_dark_mode_ ? 0.7 : 0.0;
      this.bg_v_ = this.is_dark_mode_ ? 0.0 : 1.0;
    } else {
      this.outline_v_ = this.is_dark_mode_ ? 1.0 : 0.0;
      this.stone_outline_v_= this.is_dark_mode_ ? 0.6 : 0.0;
      this.bg_v_ = this.is_dark_mode_ ? 0.15 : 0.95;
    }

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
    this.program_ = createProgram(gl, VERTEX_SRC, FRAGMENT_SRC);
    this.ghost_program_ = createProgram(gl, VERTEX_SRC, GHOST_FRAGMENT_SRC);

    this.a_position_ = gl.getAttribLocation(this.program_, "a_position");
    this.u_resolution_ = gl.getUniformLocation(this.program_, "u_resolution");
    this.u_board_colors_ = gl.getUniformLocation(this.program_,
                                                 "u_board_colors");
    this.u_board_origin_ = gl.getUniformLocation(this.program_,
                                                 "u_board_origin");
    this.u_board_size_ = gl.getUniformLocation(this.program_, "u_board_size");
    this.u_stone_size_ = gl.getUniformLocation(this.program_, "u_stone_size");
    this.u_stone_outline_color_ =
      gl.getUniformLocation(this.program_, "u_stone_outline_color");
    this.u_outline_size_ =
      gl.getUniformLocation(this.program_, "u_outline_size");
    this.u_outline_color_ =
      gl.getUniformLocation(this.program_, "u_outline_color");
    this.u_bg_color_ = gl.getUniformLocation(this.program_, "u_bg_color");
    this.u_column_line_color_ =
      gl.getUniformLocation(this.program_, "u_column_line_color");
    this.u_canvas_height_ =
      gl.getUniformLocation(this.program_, "u_canvas_height");
    this.ghost_a_position_ =
      gl.getAttribLocation(this.ghost_program_, "a_position");
    this.ghost_u_resolution_ =
      gl.getUniformLocation(this.ghost_program_, "u_resolution");
    this.ghost_u_color_ =
      gl.getUniformLocation(this.ghost_program_, "u_color");

    // Pre-allocate per-cell color data (RGBA, never reallocated)
    const bw = this.board_.width();
    const bh = this.board_.height();
    this.color_data_ = new Uint8Array(bw * bh * 4);

    // Create data texture for board cell colors
    this.board_texture_ = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.board_texture_);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, bw, bh, 0,
                  gl.RGBA, gl.UNSIGNED_BYTE, this.color_data_);

    // Pre-allocate board quad vertex buffer (6 verts × 2 floats)
    this.vertex_buffer_ = gl.createBuffer();
    this.quad_vertices_ = new Float32Array(12);
    this.ghost_vertex_buffer_ = gl.createBuffer();
    this.ghost_vertices_ = new Float32Array(4 * 12);

    // Sync canvas backing size with its CSS layout size
    this.syncCanvasSize_();

    // Compute board layout metrics and upload quad vertices
    this.computeLayout_();
  }

  // -----------------------------------------------------------------------
  // Internal helpers
  // -----------------------------------------------------------------------

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

  computeLayout_() {
    const css_w = this.game_canvas_.clientWidth;
    const css_h = this.game_canvas_.clientHeight;
    const bw = this.board_.width();
    const bh = this.board_.height();

    this.stone_size_ = calculateStoneSize(css_w, css_h, bw, bh);
    this.x_start_ = css_w / 2 - (bw * this.stone_size_) / 2;
    this.y_start_ = 0;

    // Build board quad in physical pixels
    const dpr = this.dpr_;
    const px = this.x_start_ * dpr;
    const py = this.y_start_ * dpr;
    const pw = bw * this.stone_size_ * dpr;
    const ph = bh * this.stone_size_ * dpr;

    const v = this.quad_vertices_;
    v[0]  = px;       v[1]  = py;
    v[2]  = px + pw;  v[3]  = py;
    v[4]  = px;       v[5]  = py + ph;
    v[6]  = px;       v[7]  = py + ph;
    v[8]  = px + pw;  v[9]  = py;
    v[10] = px + pw;  v[11] = py + ph;

    const gl = this.gl_;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer_);
    gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
  }

  updateGhostVertices_(ghost_stones) {
    const dpr = this.dpr_;
    const stone_size = this.stone_size_ * dpr;
    const vertices = this.ghost_vertices_;
    let offset = 0;

    for (const ghost_stone of ghost_stones) {
      if (ghost_stone.y_pos < 0) {
        continue;
      }

      const px = (this.x_start_ + ghost_stone.x_pos * this.stone_size_) * dpr;
      const py = (this.y_start_ + ghost_stone.y_pos * this.stone_size_) * dpr;

      vertices[offset++] = px;
      vertices[offset++] = py;
      vertices[offset++] = px + stone_size;
      vertices[offset++] = py;
      vertices[offset++] = px;
      vertices[offset++] = py + stone_size;
      vertices[offset++] = px;
      vertices[offset++] = py + stone_size;
      vertices[offset++] = px + stone_size;
      vertices[offset++] = py;
      vertices[offset++] = px + stone_size;
      vertices[offset++] = py + stone_size;
    }

    return offset / 2;
  }

  drawGhost_(ghost_stones) {
    if (this.is_preview_renderer_ || ghost_stones == null) {
      return;
    }

    const n_vertices = this.updateGhostVertices_(ghost_stones);
    if (n_vertices === 0) {
      return;
    }

    const ghost_color = ghost_stones[0].color;
    const gl = this.gl_;
    gl.useProgram(this.ghost_program_);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.ghost_vertex_buffer_);
    gl.bufferData(gl.ARRAY_BUFFER,
                  this.ghost_vertices_.subarray(0, n_vertices * 2),
                  gl.STREAM_DRAW);
    gl.vertexAttribPointer(this.ghost_a_position_, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.ghost_a_position_);
    gl.uniform2f(this.ghost_u_resolution_,
                 this.game_canvas_.width, this.game_canvas_.height);
    gl.uniform4f(this.ghost_u_color_,
                 ghost_color.r_ / 255,
                 ghost_color.g_ / 255,
                 ghost_color.b_ / 255,
                 0.4);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLES, 0, n_vertices);
    gl.disable(gl.BLEND);
  }

  // -----------------------------------------------------------------------
  // Public API (matches KaplayRenderer)
  // -----------------------------------------------------------------------

  onResize() {
    this.syncCanvasSize_();
    this.computeLayout_();
    this.draw();
  }

  draw(ghost_stones = null) {
    const gl = this.gl_;
    const dpr = this.dpr_;
    const bw = this.board_.width();
    const bh = this.board_.height();

    gl.viewport(0, 0, this.game_canvas_.width, this.game_canvas_.height);
    gl.useProgram(this.program_);

    // Clear canvas background
    if (this.is_dark_mode_) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
    } else {
      gl.clearColor(1.0, 1.0, 1.0, 1.0);
    }
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Update per-cell color data from board state (no allocation)
    const data = this.color_data_;
    for (let y = 0; y < bh; y++) {
      for (let x = 0; x < bw; x++) {
        const i = (y * bw + x) * 4;
        const stone = this.board_.getStone(x, y);
        if (stone !== null) {
          const color = stone.color();
          data[i]     = color.r_;
          data[i + 1] = color.g_;
          data[i + 2] = color.b_;
          data[i + 3] = 255;
        } else {
          data[i]     = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 0;
        }
      }
    }

    // Upload color data to texture (texSubImage2D — no GPU reallocation)
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.board_texture_);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, bw, bh,
                     gl.RGBA, gl.UNSIGNED_BYTE, data);

    // Set uniforms
    gl.uniform2f(this.u_resolution_,
                 this.game_canvas_.width, this.game_canvas_.height);
    gl.uniform1i(this.u_board_colors_, 0);
    gl.uniform2f(this.u_board_origin_, this.x_start_ * dpr, this.y_start_ * dpr);
    gl.uniform2f(this.u_board_size_, bw, bh);
    gl.uniform1f(this.u_stone_size_, this.stone_size_ * dpr);
    gl.uniform4f(this.u_stone_outline_color_,
                 this.stone_outline_v_,
                 this.stone_outline_v_,
                 this.stone_outline_v_, 1.0);
    gl.uniform1f(this.u_outline_size_, OUTLINE_SIZE * dpr);
    gl.uniform1f(this.u_canvas_height_, this.game_canvas_.height);

    gl.uniform4f(this.u_outline_color_, this.outline_v_, this.outline_v_, this.outline_v_, 1.0);
    gl.uniform4f(this.u_bg_color_, this.bg_v_, this.bg_v_, this.bg_v_, 1.0);

    // Column lines: subtle blend using outline color at low opacity
    const col_alpha = this.is_preview_renderer_ ? 0.0 : 0.6;
    gl.uniform4f(this.u_column_line_color_,
                 this.outline_v_, this.outline_v_, this.outline_v_, col_alpha);

    // Draw the entire board in a single call
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer_);
    gl.vertexAttribPointer(this.a_position_, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.a_position_);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    this.drawGhost_(ghost_stones);
  }
}

export default function (board, game_canvas, is_dark_mode, is_preview_renderer) {
  return new WebGLRenderer(board, game_canvas, is_dark_mode, is_preview_renderer);
}
