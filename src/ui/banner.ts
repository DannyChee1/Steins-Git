import { NIXIE_DIM, NIXIE_BRIGHT } from "./theme.js";

export function renderBanner(): string {
  return [
    NIXIE_DIM("  ╔══════════════════════════════════════╗"),
    NIXIE_BRIGHT("  ║   S T E I N S ; G I T                ║"),
    NIXIE_DIM("  ║   El Psy Kongroo                     ║"),
    NIXIE_DIM("  ╚══════════════════════════════════════╝"),
  ].join("\n");
}
