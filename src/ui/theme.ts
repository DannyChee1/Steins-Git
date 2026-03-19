import chalk from "chalk";

// Amber nixie-tube palette
export const NIXIE = chalk.hex("#FFB000");
export const NIXIE_DIM = chalk.hex("#CC8800");
export const NIXIE_BRIGHT = chalk.hex("#FFD700").bold;
export const NIXIE_RED = chalk.hex("#FF4444");
export const NIXIE_GREEN = chalk.hex("#44FF44");
export const MUTED = chalk.gray;

export function underlyingAction(action: string): string {
  return MUTED(`  ⟡ Underlying action: ${action}`);
}
