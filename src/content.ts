/**
 * This is a content script
 * It is used to inject other scripts into
 * the opened windows
 *
 * Read more about content scripts:
 * https://developer.chrome.com/docs/extensions/mv2/content_scripts/
 */
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
      const events = mouseEvents.filter(({ ms }) => ms > lowMs && ms <= highMs);
      const centerX =
        events.map(({ x }) => x).reduce((a, b) => a + b, 0) / events.length;
      const centerY =
        events.map(({ y }) => y).reduce((a, b) => a + b, 0) / events.length;
      console.log("center points" + centerX + " " + centerY);
      const angles = events.map(({ x, y }) => {
        const deltaX = x - centerX;
        const deltaY = centerY - y;
        if (deltaX === 0) {
          return deltaY > 0 ? -Math.PI / 2 : Math.PI / 2;
        }
        // const tanget = deltaY / deltaX;
        // const onRHS = deltaX > 0;
        const angleDegrees = Math.atan2(deltaX, deltaY) * (180 / Math.PI); // in degress
        const angleNormalized =
          angleDegrees < 0 ? 360 + angleDegrees : angleDegrees; // 0-360
        return angleNormalized;
        // return onRHS ? angle : angle + Math.PI; // range [-pi/2, 3pi/2]
        // tangent = opp / adj
      });
      // .map(rad => rad + Math.PI / 2) // range [0, 2pi]
      // .map(rad => Math.round((rad / (2 * Math.PI)) * 180)); // range [0, 360]

      let maybeCircle = true;
      for (let i = 0; i < angles.length - 1; i++) {
        const p1 = angles[i]; // = 358
        const p2 = angles[i + 1]; // = 4

        const acceptableP2Min = p1;
        const acceptableP2Max = (p1 + 45) % 360;
        let ok = false;
        if (acceptableP2Max < acceptableP2Min) {
          ok =
            (acceptableP2Min <= p2 && p2 <= 360) ||
            (0 <= p2 && p2 <= acceptableP2Max);
        } else {
          ok = acceptableP2Min <= p2 && p2 <= acceptableP2Max;
        }
        if (!ok) {
          console.log(`Not ok p1 ${p1} p2: ${p2}`);
        }
        maybeCircle = maybeCircle && ok;
      }
      console.log("maybeCircle = ", maybeCircle);
      console.log("angles ", angles);
      // console.log(angles);
      // console.log(mouseEvents);
      //
      //                o
      //                |
      //   center -------
    }, 1000);
  }
};

render();
window.addEventListener("mousemove", reportMouseMove);
window.addEventListener("click", reportMouseClick);

// export {};
