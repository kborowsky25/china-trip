import React from "react";
import Svg, { Circle, Ellipse } from "react-native-svg";
import { colors } from "../lib/theme";

const RED = colors.red;
const WHITE = "#FDFDFB";
const BLACK = "#17181C";
const PINK = "#F6B0C0";

// Cute full-body sitting panda — the app's motif. `badge` puts it on the red
// disc (matches the app icon).
export function Panda({ size = 40, badge = true }: { size?: number; badge?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {badge ? <Circle cx={50} cy={50} r={49} fill={RED} /> : null}

      {/* arms + legs (black), behind the white body */}
      <Ellipse cx={24} cy={64} rx={9} ry={17} fill={BLACK} transform="rotate(-16 24 64)" />
      <Ellipse cx={76} cy={64} rx={9} ry={17} fill={BLACK} transform="rotate(16 76 64)" />
      <Ellipse cx={37} cy={92} rx={11} ry={8} fill={BLACK} />
      <Ellipse cx={63} cy={92} rx={11} ry={8} fill={BLACK} />

      {/* body */}
      <Ellipse cx={50} cy={70} rx={28} ry={25} fill={WHITE} />

      {/* ears behind head */}
      <Circle cx={31} cy={16} r={9.5} fill={BLACK} />
      <Circle cx={69} cy={16} r={9.5} fill={BLACK} />

      {/* head */}
      <Circle cx={50} cy={34} r={25} fill={WHITE} />

      {/* eye patches (angled) */}
      <Ellipse cx={40} cy={33} rx={7} ry={9.5} fill={BLACK} transform="rotate(-20 40 33)" />
      <Ellipse cx={60} cy={33} rx={7} ry={9.5} fill={BLACK} transform="rotate(20 60 33)" />

      {/* cheeks */}
      <Ellipse cx={33} cy={44} rx={4} ry={2.8} fill={PINK} />
      <Ellipse cx={67} cy={44} rx={4} ry={2.8} fill={PINK} />

      {/* eyes + pupils */}
      <Circle cx={41.5} cy={34.5} r={3.6} fill={WHITE} />
      <Circle cx={58.5} cy={34.5} r={3.6} fill={WHITE} />
      <Circle cx={42} cy={35.4} r={2.1} fill={BLACK} />
      <Circle cx={59} cy={35.4} r={2.1} fill={BLACK} />

      {/* nose */}
      <Ellipse cx={50} cy={43} rx={3.8} ry={2.9} fill={BLACK} />
    </Svg>
  );
}
