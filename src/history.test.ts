import { addEntry, list, clear } from "./history";

describe("history module", () => {
  beforeEach(() => {
    clear();
  });

  it("should add a new clipboard entry", () => {
    const text = "Hello Clipcopy";
    const item = addEntry(text);
    expect(item).not.toBeNull();
    expect(list()[0].text).toBe(text);
  });

  it("should ignore duplicate entries", () => {
    addEntry("repeat");
    const second = addEntry("repeat");
    expect(second).toBeNull();
    expect(list().length).toBe(1);
  });
});