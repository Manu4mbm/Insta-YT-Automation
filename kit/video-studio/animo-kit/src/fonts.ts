// Fonts bundled locally via @fontsource (works offline / behind proxies; no Google Fonts fetch at render time).
// Want another font? `npm i @fontsource/<font>`, import its weights here and add it to FONTS.
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/800.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/800.css";
import { continueRender, delayRender } from "remotion";

export const FONTS = { Inter: "Inter", SpaceGrotesk: "Space Grotesk", Nunito: "Nunito" };
export type FontName = keyof typeof FONTS;

if (typeof document !== "undefined") {
  const h = delayRender("local fonts");
  Promise.all(["400 40px Inter", "800 40px Inter", "700 40px 'Space Grotesk'", "800 40px Nunito"].map((f) => document.fonts.load(f)))
    .then(() => continueRender(h)).catch(() => continueRender(h));
}
