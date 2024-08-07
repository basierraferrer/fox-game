import { ICONS_ARRAY } from "./constants";

const toggleHighlighted = (icon, show) =>
  document
    .querySelector(`.${ICONS_ARRAY[icon]}-icon`)
    .classList.toggle("highlighted", show);

export default function initButtons(handleUserAction) {
  let selectedIcon = 0;

  function buttonClick({ target }) {
    if (target.classList.contains("left-btn")) {
      toggleHighlighted(selectedIcon, false);
      selectedIcon = (2 + selectedIcon) % ICONS_ARRAY.length;
      toggleHighlighted(selectedIcon, true);
    } else if (target.classList.contains("right-btn")) {
      toggleHighlighted(selectedIcon, false);
      selectedIcon = (1 + selectedIcon) % ICONS_ARRAY.length;
      toggleHighlighted(selectedIcon, true);
    } else {
      handleUserAction(ICONS_ARRAY[selectedIcon]);
    }
  }

  document.querySelector(".buttons").addEventListener("click", buttonClick);
}
