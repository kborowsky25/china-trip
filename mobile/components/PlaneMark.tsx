import React from "react";
import Svg, { Path } from "react-native-svg";

// A single crisp plane glyph (nose pointing up by default) used across the
// splash, tab-bar FAB and story player. Rotate the parent to aim it.
const PLANE =
  "M480 256c0 12.9-10.4 23.3-23.3 23.3l-135.3 0-88.4 132.6c-2.6 3.9-7 6.2-11.6 6.2l-30.6 0c-8 0-13.8-7.7-11.6-15.4L188 279.3l-77.1 0-34.4 45.9c-2.2 2.9-5.6 4.6-9.3 4.6l-23.9 0c-7.9 0-13.7-7.5-11.6-15.1L45.8 256 21.8 197.4c-2.1-7.6 3.7-15.1 11.6-15.1l23.9 0c3.7 0 7.1 1.7 9.3 4.6l34.4 45.9 77.1 0L154.6 105.3c-2.2-7.7 3.6-15.4 11.6-15.4l30.6 0c4.6 0 9 2.3 11.6 6.2l88.4 132.6 135.3 0c12.9 0 23.3 10.4 23.3 23.3z";

export function PlaneMark({ size = 26, color = "#fff" }: { size?: number; color?: string }) {
  // The raw glyph points left (nose at +x tip). Rotate -90° so it points UP,
  // which is the neutral orientation callers expect.
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" style={{ transform: [{ rotate: "-90deg" }] }}>
      <Path d={PLANE} fill={color} />
    </Svg>
  );
}
