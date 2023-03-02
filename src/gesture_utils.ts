const MIN_TIME_BETWEEN_DETECTION_MS = 1000;
const MIN_TIME_BETWEEN_SAMPLES_MS = 25;
const DEFAULT_WINDOW_SIZE_MS = 2000;
const DEFAULT_ROTATION_THRESHOLD = 720; // 2 rotations

export const average = (array: number[]) =>
  array.reduce((a, b) => a + b) / array.length;

export const findCenter = (
  mouseEvents: { x: number; y: number; ms: number }[]
): { centerX: number; centerY: number } => {
  const centerX = average(mouseEvents.map(({ x }) => x));
  const centerY = average(mouseEvents.map(({ y }) => y));
  return { centerX, centerY };
};

export const generateAngles = (
  mouseEvents: { x: number; y: number; ms: number }[],
  centerX: number,
  centerY: number
): number[] => {
  return mouseEvents.map(({ x, y }) => {
    const deltaX: number = x - centerX;
    const deltaY: number = centerY - y;
    if (deltaX === 0) {
      return deltaY > 0 ? -Math.PI / 2 : Math.PI / 2;
    }
    const angleDegrees = Math.atan2(deltaX, deltaY) * (180 / Math.PI); // in degress
    const angleNormalized =
      angleDegrees < 0 ? 360 + angleDegrees : angleDegrees; // 0-360
    return angleNormalized;
  });
};

export enum GestureDetectionResult {
  NotDetected = "not_detected", // No clear detection
  PartcialDetection = "partial_detection", // Partial loop detection
  GestureDetected = "gesture_detected"
}

export const anglesHaveGesturePresent = (
  angles: number[],
  rotationThreshold: number
): GestureDetectionResult => {
  let maybeCircle = true;
  let totalTraveled = 0;
  if (angles.length < 5) {
    return GestureDetectionResult.NotDetected;
  }
  for (let i = 0; i < angles.length - 1; i++) {
    const angle1 = angles[i]; // = 358
    const angle2 = angles[i + 1]; // = 4
    let anglesAreIncreasing = false;
    if (angle1 > 180 && angle2 < (angle1 + 180) % 360) {
      anglesAreIncreasing = true;
    } else {
      anglesAreIncreasing = angle2 > angle1 && angle2 < angle1 + 180;
    }
    if (!anglesAreIncreasing) {
      totalTraveled = 0;
      continue;
    }
    let difference = angle2 - angle1;
    if (difference < 0) {
      difference += 360;
    }
    totalTraveled += difference;
    if (totalTraveled > rotationThreshold && anglesAreIncreasing) {
      return GestureDetectionResult.GestureDetected;
    }
    maybeCircle = maybeCircle && anglesAreIncreasing;
  }
  if (maybeCircle && totalTraveled > rotationThreshold / 2) {
    return GestureDetectionResult.PartcialDetection;
  }
  return totalTraveled > rotationThreshold && maybeCircle
    ? GestureDetectionResult.GestureDetected
    : GestureDetectionResult.NotDetected;
};

export class GestureRecognizer {
  private mouseEvents: { x: number; y: number; ms: number }[];
  private lastTriggered: number;
  private lastEventAdded: number;
  private windowSizeMs: number;
  private minTimeBetweenDetection: number;
  private detectionCallback: () => void;
  private roationThreshold: number;

  constructor(
    detectionCallback: () => void,
    windowSizeMs = DEFAULT_WINDOW_SIZE_MS,
    minTimeBetweenDetection = MIN_TIME_BETWEEN_DETECTION_MS,
    roationThreshold = DEFAULT_ROTATION_THRESHOLD
  ) {
    this.mouseEvents = [];
    this.lastTriggered = 0;
    this.lastEventAdded = 0;
    this.windowSizeMs = windowSizeMs;
    this.minTimeBetweenDetection = minTimeBetweenDetection;
    this.detectionCallback = detectionCallback;
    this.roationThreshold = roationThreshold;
  }

  addMouseMoveEvent = async (x: number, y: number) => {
    const now = performance.now();
    if (now - this.lastEventAdded < MIN_TIME_BETWEEN_SAMPLES_MS) {
      return;
    }
    this.lastEventAdded = now;
    this.mouseEvents.push({ x, y, ms: now });
    if (this.shouldTriggerRecognizer(now) && this.isGestureDetected(now)) {
      this.detectionCallback();
      return;
    }
    return;
  };

  private shouldTriggerRecognizer = (now: number): boolean => {
    const timeSinceLast = now - this.lastTriggered;
    if (timeSinceLast < this.minTimeBetweenDetection) {
      return false;
    }
    const lowMs = now - this.windowSizeMs;
    this.mouseEvents = this.mouseEvents.filter(
      ({ ms }) => ms > lowMs && ms <= now
    );
    return this.mouseEvents.length > 5;
  };

  private isGestureDetected = (now: number): boolean => {
    this.lastTriggered = now;
    const { centerX, centerY } = findCenter(this.mouseEvents);
    const angles = generateAngles(this.mouseEvents, centerX, centerY);
    return (
      GestureDetectionResult.GestureDetected ===
      anglesHaveGesturePresent(angles, this.roationThreshold)
    );
  };
}

/**
 * Method detects gestures using a class and iterative approach.
 * This method should be called in the following way
 * const gestureRecognizer = new GestureRecognizer(...);
 * window.addEventListener("mousemove", (ev: MouseEvent) =>
 *   reportMouseMove2(ev, gestureRecognizer)
 * );
 * @param ev the current mouse event passed in by the system.
 * @param gestureRecognizer the gesture recognizer being used to detect
 */
export const reportMouseMove2 = async (
  ev: MouseEvent,
  gestureRecognizer: GestureRecognizer
) => {
  gestureRecognizer.addMouseMoveEvent(ev.clientX, ev.clientY);
};

/**
 * This method detects gestures using a time interval loop.
 * @param ev the current mouse event passed in by the system.
 * @param mouseEvents the mouse events that have accumulated so far.
 * @param timerSetup true if the timer has already been setup. Call this with true only on the first call
 * @returns void
 */
export const reportMouseMove = async (
  ev: MouseEvent,
  mouseEvents: { x: number; y: number; ms: number }[],
  timerSetup: boolean
) => {
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
      const centerX = average(mouseEvents.map(({ x }) => x));
      const centerY = average(mouseEvents.map(({ y }) => y));

      const angles = generateAngles(mouseEvents, centerX, centerY);
      if (anglesHaveGesturePresent(angles, DEFAULT_ROTATION_THRESHOLD)) {
        console.log("Detected gesture");
        mouseEvents = [];
      }
    }, 1000);
  }
};
