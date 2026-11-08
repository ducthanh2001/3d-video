// Black and white with ONE accent colour. Every shot is drawn twice:
//  - the BASE pass: everything, then the whole layer goes through grayscale (the channel's black-and-white look);
//  - the ACCENT pass on top: the same drawing with everything hidden except what sits inside <Acc> (kept in colour).
// SVG `visibility` is inherited but can be switched back on by a child, so <Acc> shows its children inside a hidden tree.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Grain, KitDefs, Vignette } from "../../kit/materials";

export const ACC = "#ffb53a"; // amber: the light of time well used
type Pass = "all" | "base" | "accent";
const PassCtx = React.createContext<Pass>("all");
export const usePass = () => React.useContext(PassCtx);

/** colour kept in the final picture (in the base pass it simply turns grey under the filter) */
export const Acc: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const p = usePass();
  return p === "accent" ? <g visibility="visible">{children}</g> : <g>{children}</g>;
};

export const TwoPass: React.FC<{ f: number; bg?: string; vig?: number; children: React.ReactNode; html?: React.ReactNode }> = ({ f, bg = "#08080b", vig = 0.75, children, html }) => (
  <AbsoluteFill style={{ background: bg }}>
    <AbsoluteFill style={{ filter: "grayscale(1) contrast(1.12)" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <PassCtx.Provider value="base">{children}</PassCtx.Provider>
        <Vignette a={vig} />
        <Grain f={f} a={0.05} />
      </svg>
    </AbsoluteFill>
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <PassCtx.Provider value="accent"><g visibility="hidden">{children}</g></PassCtx.Provider>
      </svg>
    </AbsoluteFill>
    {html}
  </AbsoluteFill>
);
