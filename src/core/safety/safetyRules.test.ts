import { describe, expect, it } from "vitest";

import { containsBlockedUxLanguage, preferredUxTerms } from "./safetyRules";

describe("safetyRules", () => {
  it("detects blocked shame language", () => {
    expect(containsBlockedUxLanguage("streak broken")).toBe(true);
    expect(containsBlockedUxLanguage("quest paused")).toBe(false);
  });

  it("keeps preferred copy available for UI", () => {
    expect(preferredUxTerms).toContain("today still counts");
  });
});
