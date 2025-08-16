import { homedir } from "os";
import path from "path";
import fs from "fs";

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

export function getConfigDir(): string {
  const isWin = process.platform === "win32";
  if (isWin) {
    const appData = process.env.APPDATA || path.join(homedir(), "AppData", "Roaming");
    const dir = path.join(appData, "clipcopy");
    ensureDir(dir);
    return dir;
  }
  // Linux/macOS: XDG or ~/.config/clipcopy
  const xdg = process.env.XDG_CONFIG_HOME || path.join(homedir(), ".config");
  const dir = path.join(xdg, "clipcopy");
  ensureDir(dir);
  return dir;
}

export function getHistoryPath(): string {
  return path.join(getConfigDir(), "history.json");
}