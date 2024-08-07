import initButtons from "./buttons";
import { TICK_RATE } from "./constants";
import game, { handleUserAction } from "./gameState";

/**
 * function to start the game
 */
async function init() {
  initButtons(handleUserAction);

  let nextTimeToTick = Date.now();

  /**
   * This function execute every 3s using `requestAnimationFrame`.
   * `requestAnimationFrame` method tells the browser you wish to perform an animation.
   * It requests the browser to call a user-supplied callback function before the next repaint.
   * In this case the callbacks is `nextAnimationFrame`.
   */
  function nextAnimationFrame() {
    const now = Date.now();
    if (nextTimeToTick <= now) {
      game.tick();
      nextTimeToTick = now + TICK_RATE;
    }
    requestAnimationFrame(nextAnimationFrame);
  }

  nextAnimationFrame();
}

init();
