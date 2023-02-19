/**
 * This is a content script
 * It is used to inject other scripts into
 * the opened windows
 *
 * Read more about content scripts:
 * https://developer.chrome.com/docs/extensions/mv2/content_scripts/
 */
import { checkAngles } from "./gesture_utils";
import { render } from "./view/main";

console.log("Behrooz's content script");

// inject the "injected.ts" script
// addScriptToWindow(chrome.extension.getURL("/build/injected.js"));
// chrome.runtime.sendMessage({ text: "hey" }, function (response) {
//   console.log("Response: ", response);
// });

let timerSetup = false;
// let mouseClickEvents: { x: number; y: number; ms: number }[] = [];
// let lastClickEvent: { x: number; y: number; ms: number } | undefined = undefined;

const centerX = 450;
const centerY = 160;
let previousClick: { x: number; y: number; ms: number } | undefined = undefined;
export const reportMouseClick = async (ev: MouseEvent) => {
  const now = performance.now();
  // mouseClickEvents.push({ x: ev.clientX, y: ev.clientY, ms: now });

  if (previousClick) {
    const timeDiff = now - previousClick.ms;
    if (timeDiff < 150) {
      return;
    }
    const deltaX = ev.clientX - centerX;
    const deltaY = centerY - ev.clientY;
    const arcTan = Math.atan2(deltaX, deltaY) * (180 / Math.PI); // in degress
    const angleDegrees = arcTan < 0 ? 360 + arcTan : arcTan; // 0-360

    console.log(`Angle ${angleDegrees} timediff: ${timeDiff}`);
  }
  previousClick = { x: ev.clientX, y: ev.clientY, ms: now };
  console.log(`${ev.clientX} y: ${ev.clientY}`);
};

let mouseEvents: { x: number; y: number; ms: number }[] = [];
export const reportMouseMove = async (ev: MouseEvent) => {
  const now = performance.now();
  if (
    mouseEvents.length > 1 &&
    now - mouseEvents[mouseEvents.length - 1].ms < 50
  ) {
    return;
  }
  mouseEvents.push({ x: ev.clientX, y: ev.clientY, ms: now });
  if (mouseEvents.length > 400) {
    mouseEvents = mouseEvents.slice(100);
  }
  if (!timerSetup) {
    timerSetup = true;
    setInterval(() => {
      if (mouseEvents.length < 5) {
        return;
      }
      const highMs = performance.now();
      const lowMs = highMs - 2000;
      mouseEvents = mouseEvents.filter(({ ms }) => ms > lowMs && ms <= highMs);
      const centerX =
        mouseEvents.map(({ x }) => x).reduce((a, b) => a + b, 0) /
        mouseEvents.length;
      const centerY =
        mouseEvents.map(({ y }) => y).reduce((a, b) => a + b, 0) /
        mouseEvents.length;
      const angles = mouseEvents.map(({ x, y }) => {
        const deltaX = x - centerX;
        const deltaY = centerY - y;
        if (deltaX === 0) {
          return deltaY > 0 ? -Math.PI / 2 : Math.PI / 2;
        }
        const angleDegrees = Math.atan2(deltaX, deltaY) * (180 / Math.PI); // in degress
        const angleNormalized =
          angleDegrees < 0 ? 360 + angleDegrees : angleDegrees; // 0-360
        return angleNormalized;
      });
      if (checkAngles(angles)) {
        console.log("Detected gesture");
        mouseEvents = [];
      }
    }, 1000);
  }
};

render();
window.addEventListener("mousemove", reportMouseMove);
window.addEventListener("click", reportMouseClick);

// export {};
