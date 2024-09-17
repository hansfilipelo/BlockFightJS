import kaplay from "./third_party/kaplay/kaboom.mjs"
import { STONE_SIZE, OUTLINE_SIZE } from "./game_state.mjs"

export function createStone(xPos, yPos) {
  return add([
    rect(STONE_SIZE, STONE_SIZE),
    pos(xPos, yPos),
    outline(OUTLINE_SIZE),
    "stone"
  ]);
}