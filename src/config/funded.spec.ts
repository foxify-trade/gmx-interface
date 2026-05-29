import { describe, expect, it } from "vitest";

import { FUNDED_API_URL, FUNDED_ENABLED, parseFundedFlag, parseOptionalUrl } from "./funded";

describe("funded config helpers", () => {
  it("parses boolean-like env flags", () => {
    expect(parseFundedFlag("true")).toBe(true);
    expect(parseFundedFlag("On")).toBe(true);
    expect(parseFundedFlag("0")).toBe(false);
    expect(parseFundedFlag(undefined)).toBe(false);
  });

  it("normalizes optional urls", () => {
    expect(parseOptionalUrl("https://example.com/api")).toBe("https://example.com/api");
    expect(parseOptionalUrl("")).toBeNull();
    expect(parseOptionalUrl("not-a-url")).toBeNull();
  });

  it("exports stable typed runtime flags", () => {
    expect(typeof FUNDED_ENABLED).toBe("boolean");
    expect(FUNDED_API_URL === null || typeof FUNDED_API_URL === "string").toBe(true);
  });
});
