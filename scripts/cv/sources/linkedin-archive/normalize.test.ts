import { describe, expect, it } from "vitest";
import { normalizeLinkedInDate, splitDescription } from "./normalize";

describe("normalizeLinkedInDate", () => {
  it.each([
    ["Jun 2022", "2022-06"],
    ["Sep 2019", "2019-09"],
    ["2014", "2014"],
    ["", undefined],
  ])("maps %s to %s", (input, expected) => {
    expect(normalizeLinkedInDate(input)).toBe(expected);
  });
});

describe("splitDescription", () => {
  it("splits LinkedIn inline bullets", () => {
    expect(
      splitDescription("Intro sentence. · First item · Second item"),
    ).toEqual({
      summary: "Intro sentence.",
      highlights: ["First item", "Second item"],
    });
  });

  it("supports bullet characters", () => {
    expect(splitDescription("Intro. • One • Two").highlights).toEqual([
      "One",
      "Two",
    ]);
  });

  it("keeps prose-only descriptions intact", () => {
    expect(splitDescription("Only prose.")).toEqual({
      summary: "Only prose.",
      highlights: [],
    });
  });
});
