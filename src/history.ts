import fs from "fs";
import crypto from "crypto";
import { getHistoryPath } from "./paths";
import { HistoryFile, HistoryItem } from "./types";

const DEFAULT_LIMIT = 50;

function emptyHistory(): HistoryFile {
  return { version: 1, items: [], limit: DEFAULT_LIMIT };
}

export function loadHistory(): HistoryFile {
  const file = getHistoryPath();
  if (!fs.existsSync(file)) return emptyHistory();
  try {
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as HistoryFile;
    if (!parsed.limit) parsed.limit = DEFAULT_LIMIT;
    if (!Array.isArray(parsed.items)) parsed.items = [];
    return parsed;
  } catch {
    return emptyHistory();
  }
}

export function saveHistory(h: HistoryFile): void {
  const file = getHistoryPath();
  fs.writeFileSync(file, JSON.stringify(h, null, 2), "utf8");
}

export function addEntry(text: string): HistoryItem | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const h = loadHistory();

  // Dedup: if top item has same text, skip
  if (h.items[0]?.text === trimmed) return null;

  const id = `${Date.now()}-${crypto.createHash("sha1").update(trimmed).digest("hex").slice(0, 8)}`;
  const item: HistoryItem = { id, text: trimmed, ts: Date.now() };
  h.items.unshift(item);

  // Trim to limit
  if (h.items.length > h.limit) h.items = h.items.slice(0, h.limit);

  saveHistory(h);
  return item;
}

export function setLimit(limit: number): void {
  const h = loadHistory();
  h.limit = Math.max(1, Math.min(1000, Math.floor(limit)));
  if (h.items.length > h.limit) h.items = h.items.slice(0, h.limit);
  saveHistory(h);
}

export function list(): HistoryItem[] {
  return loadHistory().items;
}

export function clear(): void {
  const h = loadHistory();
  h.items = [];
  saveHistory(h);
}

export function search(term: string): HistoryItem[] {
  const q = term.toLowerCase();
  return list().filter(i => i.text.toLowerCase().includes(q));
}

export function getByIndex(index: number): HistoryItem | null {
  const items = list();
  if (index < 0 || index >= items.length) return null;
  return items[index];
}