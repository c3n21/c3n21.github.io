import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import fs from "node:fs";
import path from "node:path";
import { LinkedInArchiveSource } from "./index";

describe("LinkedInArchiveSource", () => {
  it("loads from a zip containing sanitized CSV fixtures", async () => {
    const zip = new JSZip();
    const fixtureDir = path.resolve("tests/fixtures/linkedin-export");

    for (const file of [
      "Profile.csv",
      "Positions.csv",
      "Education.csv",
      "Projects.csv",
      "Skills.csv",
      "Languages.csv",
    ]) {
      const content = fs.readFileSync(path.join(fixtureDir, file), "utf-8");
      zip.file(file, content);
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const source = new LinkedInArchiveSource(zipBuffer);
    const profile = await source.load();

    expect(profile.basics.firstName).toBe("Zhifan");
    expect(profile.basics.lastName).toBe("Chen");
    expect(profile.basics.summary).toBe("Builds software end-to-end.");
    expect(profile.positions).toHaveLength(1);
    expect(profile.positions[0]!.company).toBe("Example Company");
    expect(profile.positions[0]!.startDate).toBe("2022-06");
    expect(profile.positions[0]!.endDate).toBeUndefined();
    expect(profile.education).toHaveLength(1);
    expect(profile.education[0]!.institution).toBe("Example University");
    expect(profile.education[0]!.startDate).toBe("2019");
    expect(profile.projects).toHaveLength(1);
    expect(profile.projects[0]!.name).toBe("Example Project");
    expect(profile.projects[0]!.url).toBeUndefined();
    expect(profile.skills).toContain("TypeScript");
    expect(profile.skills).toContain("Nix");
    expect(profile.languages).toHaveLength(2);
    expect(profile.languages[0]!.language).toBe("Italian");
  });

  it("preserves Profile.csv summary when Profile Summary.csv is empty or missing", async () => {
    const zip = new JSZip();
    const fixtureDir = path.resolve("tests/fixtures/linkedin-export");
    zip.file("Profile.csv", fs.readFileSync(path.join(fixtureDir, "Profile.csv"), "utf-8"));
    zip.file("Profile Summary.csv", "Summary\n");

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const source = new LinkedInArchiveSource(zipBuffer);
    const profile = await source.load();

    expect(profile.basics.summary).toBe("Builds software end-to-end.");
  });

  it("throws if Profile.csv is missing", async () => {
    const zip = new JSZip();
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const source = new LinkedInArchiveSource(zipBuffer);
    await expect(source.load()).rejects.toThrow(/Profile\.csv/);
  });
});
