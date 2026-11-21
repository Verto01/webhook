import { describe, expect, it } from "vitest";

describe("Project runtime", () => {
  it("uses Node.js version 24", () => {
    expect(Number(process.versions.node.split(".")[0])).toBe(24);
  });
});
