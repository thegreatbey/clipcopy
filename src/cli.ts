import { Command } from "commander";
import clipboard from "clipboardy";
import { addEntry, clear, list, search, getByIndex, setLimit } from "./history";

const program = new Command();

program
  .name("clipcopy")
  .description("Tiny CLI clipboard history with search & recall")
  .version("0.0.1");

program
  .command("watch")
  .description("Watch clipboard and store history (Ctrl+C to stop)")
  .option("--interval <ms>", "poll interval in ms (default 750)", "750")
  .action(async (opts) => {
    const interval = Math.max(200, parseInt(String(opts.interval), 10) || 750);
    console.log(`clipcopy: watching clipboard every ${interval}ms (Ctrl+C to stop)...`);
    let last = "";
    const timer = setInterval(async () => {
      try {
        const text = await clipboard.read();
        if (text && text.trim() && text !== last) {
          const added = addEntry(text);
          if (added) {
            console.log(`[saved] #0 "${preview(added.text)}"`);
            last = text;
          }
        }
      } catch (e) {
        // Non-fatal; keep polling
      }
    }, interval);

    // Keep process alive
    process.on("SIGINT", () => {
      clearInterval(timer);
      console.log("\nclipcopy: stopped.");
      process.exit(0);
    });
  });

program
  .command("list")
  .description("Show history items")
  .option("-n, --num <count>", "show first N items", "20")
  .action((opts) => {
    const n = Math.max(1, parseInt(String(opts.num), 10) || 20);
    const items = list().slice(0, n);
    if (items.length === 0) {
      console.log("No history yet. Run: clipcopy watch");
      return;
    }
    items.forEach((i, idx) => console.log(`#${idx} ${preview(i.text)}`));
  });

program
  .command("search <term>")
  .description("Search history")
  .action((term) => {
    const results = search(term);
    if (results.length === 0) {
      console.log(`No matches for "${term}".`);
      return;
    }
    results.forEach((i, idx) => console.log(`#${idx} ${preview(i.text)}`));
  });

program
  .command("copy <index>")
  .alias("get")
  .description("Copy item at index back to clipboard")
  .action(async (indexStr) => {
    const index = parseInt(indexStr, 10);
    if (Number.isNaN(index)) {
      console.error("Index must be a number (e.g., clipcopy copy 2)");
      process.exit(1);
    }
    const item = getByIndex(index);
    if (!item) {
      console.error(`No item at index ${index}.`);
      process.exit(1);
    }
    await clipboard.write(item.text);
    console.log(`Copied #${index} to clipboard: "${preview(item.text)}"`);
  });

program
  .command("limit [n]")
  .description("Get or set history limit")
  .action((n) => {
    if (typeof n === "undefined") {
      console.log("Current limit:", require("./history").loadHistory().limit);
      return;
    }
    const lim = parseInt(String(n), 10);
    if (Number.isNaN(lim) || lim < 1) {
      console.error("Limit must be a positive integer.");
      process.exit(1);
    }
    setLimit(lim);
    console.log("New limit set to", lim);
  });

program
  .command("clear")
  .description("Clear history")
  .action(() => {
    clear();
    console.log("History cleared.");
  });

program
  .argument("[index]")
  .description("Shorthand: with a number, copies that index; otherwise shows help")
  .action(async (maybeIndex) => {
    if (typeof maybeIndex === "string" && /^\d+$/.test(maybeIndex)) {
      const idx = parseInt(maybeIndex, 10);
      const item = getByIndex(idx);
      if (!item) {
        console.error(`No item at index ${idx}.`);
        process.exit(1);
      }
      await clipboard.write(item.text);
      console.log(`Copied #${idx} to clipboard: "${preview(item.text)}"`);
      return;
    }
    program.help();
  });

program.parse(process.argv);

function preview(text: string, max = 80): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
}