/**
 * This is a content script
 * It is used to inject other scripts into
 * the opened windows
 *
 * Read more about content scripts:
 * https://developer.chrome.com/docs/extensions/mv2/content_scripts/
 */
import { GestureRecognizer, reportMouseMove2 } from "./gesture_utils";
import { render } from "./view/main";

console.log("Behrooz's content script");

// inject the "injected.ts" script
// addScriptToWindow(chrome.extension.getURL("/build/injected.js"));
// chrome.runtime.sendMessage({ text: "hey" }, function (response) {
//   console.log("Response: ", response);
// });

// let mouseClickEvents: { x: number; y: number; ms: number }[] = [];
// let lastClickEvent: { x: number; y: number; ms: number } | undefined = undefined;
const DEFAULT_RECOGNIZER_CALLBACK = () => console.log("Gesture recognized");
const clickGestureRecognizer = new GestureRecognizer(
  DEFAULT_RECOGNIZER_CALLBACK,
  10000
);
export const reportMouseClick = async (ev: MouseEvent) => {
  // const now = performance.now();
  // mouseClickEvents.push({ x: ev.clientX, y: ev.clientY, ms: now });

  // if (previousClick) {
  //   const timeDiff = now - previousClick.ms;
  //   if (timeDiff < 150) {
  //     return;
  //   }
  //   const deltaX = ev.clientX - centerX;
  //   const deltaY = centerY - ev.clientY;
  //   const arcTan = Math.atan2(deltaX, deltaY) * (180 / Math.PI); // in degress
  //   const angleDegrees = arcTan < 0 ? 360 + arcTan : arcTan; // 0-360

  //   console.log(`Angle ${angleDegrees} timediff: ${timeDiff}`);
  // }
  // previousClick = { x: ev.clientX, y: ev.clientY, ms: now };
  clickGestureRecognizer.addMouseMoveEvent(ev.clientX, ev.clientY);
  console.log(`${ev.clientX} y: ${ev.clientY}`);
};
const gestureRecognizer = new GestureRecognizer(DEFAULT_RECOGNIZER_CALLBACK);
render();
window.addEventListener("mousemove", (ev: MouseEvent) =>
  reportMouseMove2(ev, gestureRecognizer)
);
window.addEventListener("click", reportMouseClick);

// export {};
