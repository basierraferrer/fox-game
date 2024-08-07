import {
  DAY_LENGTH,
  ICONS,
  MOD_FOX,
  MOD_SCENE,
  NIGHT_LENGTH,
  RAIN_CHANCE,
  SCENES,
  STATES,
} from "./constants";
import { modFox, modScene, togglePoopBag, writeModal } from "./ui";
import { getNextDieTime, getNextHungerTime, getNextPoopTime } from "./utils";

const gameState = {
  current: STATES.INIT,
  clock: 1,
  scene: 0,
  dieTime: -1,
  hungryTime: -1,
  poopTime: -1,
  sleepTime: -1,
  timeToStartCelebrating: -1,
  timeToEndCelebrating: -1,
  wakeTime: -1,
  clearTimes() {
    this.wakeTime = -1;
    this.sleepTime = -1;
    this.hungryTime = -1;
    this.dieTime = -1;
    this.poopTime = -1;
    this.timeToStartCelebrating = -1;
    this.timeToEndCelebrating = -1;
  },
  cleanUpPoop() {
    if (this.current !== STATES.POOPING) return;

    this.dieTime = -1;
    togglePoopBag(true);
    this.startCelebrating();
    this.hungryTime = getNextHungerTime(this.clock);
  },
  changeWeather() {
    this.scene = (1 + this.scene) % SCENES.length;
    modScene(SCENES[this.scene]);
    this.determineFoxState();
  },
  determineFoxState() {
    if (this.current === STATES.IDLING) {
      const modFoxState =
        SCENES[this.scene] === MOD_SCENE.RAIN ? MOD_FOX.RAIN : MOD_FOX.IDLING;
      modFox(modFoxState);
    }
  },
  die() {
    this.current = STATES.DEAD;
    this.dieTime = -1;
    modFox(MOD_FOX.DIE);
    modScene(MOD_SCENE.RIP);
    this.clearTimes();
    writeModal("The fox died :( <br/> Press the middle button to start");
  },
  endCelebrating() {
    this.current = STATES.IDLING;
    this.timeToEndCelebrating = -1;
    this.determineFoxState();
    togglePoopBag(false);
  },
  feed() {
    if (this.current !== STATES.HUNGRY) {
      return;
    }

    this.current = STATES.FEEDING;
    this.dieTime = -1;
    this.poopTime = getNextPoopTime(this.clock);
    modFox(MOD_FOX.EATING);
    this.timeToStartCelebrating = this.clock + 2;
  },
  getHungry() {
    this.current = STATES.HUNGRY;
    this.hungryTime = -1;
    this.dieTime = getNextDieTime(this.clock);
    modFox(MOD_FOX.HUNGRY);
  },
  handleUserAction(icon) {
    if (
      [
        STATES.SLEEPING,
        STATES.EATING,
        STATES.CELEBRATING,
        STATES.HATCHING,
      ].includes(this.current)
    ) {
      return;
    }

    if (this.current === STATES.INIT || this.current === STATES.DEAD) {
      this.startGame();
      return;
    }

    switch (icon) {
      case ICONS.WEATHER:
        this.changeWeather();
        break;
      case ICONS.POOP:
        this.cleanUpPoop();
        break;
      case ICONS.FISH:
        this.feed();
        break;
    }
  },
  poop() {
    this.current = STATES.POOPING;
    this.poopTime = -1;
    this.dieTime = getNextDieTime(this.clock);
    modFox(MOD_FOX.POOPING);
  },
  sleep() {
    this.current = STATES.SLEEPING;
    modFox(MOD_FOX.SLEEP);
    modScene(MOD_SCENE.NIGHT);
    this.clearTimes();
    this.wakeTime = this.clock + NIGHT_LENGTH;
  },
  startGame() {
    this.current = STATES.HATCHING;
    this.wakeTime = this.clock + 3;
    modFox(MOD_FOX.EGG);
    modScene(MOD_SCENE.DAY);
    writeModal();
  },
  startCelebrating() {
    this.current = STATES.CELEBRATING;
    modFox(MOD_FOX.CELEBRATE);
    this.timeToStartCelebrating = -1;
    this.timeToEndCelebrating = this.clock + 2;
  },
  tick() {
    this.clock++;

    switch (this.clock) {
      case this.wakeTime:
        this.wake();
        break;
      case this.sleepTime:
        this.sleep();
        break;
      case this.hungryTime:
        this.getHungry();
        break;
      case this.dieTime:
        this.die();
        break;
      case this.timeToStartCelebrating:
        this.startCelebrating();
        break;
      case this.timeToEndCelebrating:
        this.endCelebrating();
        break;
      case this.poopTime:
        this.poop();
        break;
    }

    return this.clock;
  },
  wake() {
    this.current = STATES.IDLING;
    this.wakeTime = -1;
    this.scene = Math.random() > RAIN_CHANCE ? 0 : 1;
    modScene(SCENES[this.scene]);
    this.determineFoxState();
    this.sleepTime = this.clock + DAY_LENGTH;
    this.hungryTime = getNextHungerTime(this.clock);
  },
};

export const handleUserAction = gameState.handleUserAction.bind(gameState);

export default gameState;
