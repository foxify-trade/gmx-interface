import { describe, expect, it } from "vitest";

import { getFundedDashboardSource, sanitizeControllerAddress } from "./funded-utils";

describe("funded utils", () => {
  it("sanitizes controller addresses", () => {
    expect(sanitizeControllerAddress("0x1111111111111111111111111111111111111111")).toBe(
      "0x1111111111111111111111111111111111111111"
    );
    expect(sanitizeControllerAddress("0x123")).toBeUndefined();
    expect(sanitizeControllerAddress(null)).toBeUndefined();
  });

  it("chooses the dashboard source from address and api availability", () => {
    expect(
      getFundedDashboardSource("0x1111111111111111111111111111111111111111", "https://example.com")
    ).toBe("api");
    expect(getFundedDashboardSource(undefined, "https://example.com")).toBe("demo");
    expect(getFundedDashboardSource("0x1111111111111111111111111111111111111111", null)).toBe("demo");
  });
});
