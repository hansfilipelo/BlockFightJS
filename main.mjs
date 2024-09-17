import kaplay from "./third_party/kaplay/kaboom.mjs"
import { IShape } from "./i_shape.mjs"

let down_pressed = false;
let up_pressed = false;
let left_pressed = false;
let right_pressed = false;

export function run() {
  kaplay();
  let current_shape = new IShape();

  onKeyDown("down", () => {
    if (!down_pressed) {
      down_pressed = true;
      current_shape.drop();
    }
  });

  onKeyRelease("down", () => {
    down_pressed = false;
  });
  
  onKeyDown("up", () => {
    if (!up_pressed) {
      up_pressed = true;
      current_shape.rotate();
    }
  });

  onKeyDown("left", () => {
    if (!left_pressed) {
      left_pressed = true;
      current_shape.left();
    }
  });

  onKeyRelease("left", () => {
    left_pressed = false;
  });

  onKeyDown("right", () => {
    if (!right_pressed) {
      right_pressed = true;
      current_shape.right();
    }
  });

  onKeyRelease("right", () => {
    right_pressed = false;
  });

  onKeyRelease("up", () => {
    up_pressed = false;
  });
  
  onKeyDown("space", () => {
    current_shape.drop();
  });
}
