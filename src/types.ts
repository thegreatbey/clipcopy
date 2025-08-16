export interface HistoryItem {
  id: string;          // stable id (e.g., timestamp + hash)
  text: string;        // clipboard text
  ts: number;          // epoch ms
}

export interface HistoryFile {
  version: 1;
  items: HistoryItem[];
  limit: number;       // max items to keep
}