export const checkAngles = (angles: number[]): boolean => {
  let maybeCircle = true;
  let totalTraveled = 0;
  let maxNotOkIndex = 0;
  if (angles.length < 5) {
    return false;
  }
  for (let i = 0; i < angles.length - 1; i++) {
    const angle1 = angles[i]; // = 358
    const angle2 = angles[i + 1]; // = 4
    let ok = false;
    if (angle1 > 180 && angle2 < (angle1 + 180) % 360) {
      ok = true;
    } else {
      ok = angle2 > angle1 && angle2 < angle1 + 180;
    }
    if (!ok) {
      totalTraveled = 0;
      maxNotOkIndex = i;
      continue;
    }
    let difference = angle2 - angle1;
    if (difference < 0) {
      difference += 360;
    }
    totalTraveled += difference;
    if (totalTraveled > 720 && ok) {
      console.log("Circle gesture detected");
      console.log("traveled angles = ", totalTraveled);
      // console.log("angles ", angles);
      angles.splice(0);
      return true;
    }
    maybeCircle = maybeCircle && ok;
  }
  const gestureSuccessfull = totalTraveled > 720 && maybeCircle;
  if (!gestureSuccessfull && maxNotOkIndex > 0) {
    angles.splice(0, maxNotOkIndex);
  }
  return gestureSuccessfull;
};
