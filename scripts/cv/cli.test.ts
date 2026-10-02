import { describe, expect, it } from "vitest";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs";
import JSZip from "jszip";

const execFileAsync = promisify(execFile);
const CLI_PATH = path.resolve("scripts/cv/cli.ts");

describe("cv:import CLI", () => {
  it("fails with error code if no argument is provided", async () => {
    await expect(
      execFileAsync("npx", ["tsx", CLI_PATH]),
    ).rejects.toThrow();
  });

  it("imports a zip archive and writes JSON resume to destination", async () => {
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

    const testZipPath = path.resolve("tmp/test-fixture.zip");
    fs.mkdirSync(path.dirname(testZipPath), { recursive: true });
    const buffer = await zip.generateAsync({ type: "nodebuffer" });
    fs.writeFileSync(testZipPath, buffer);

    const testOutputPath = path.resolve("tmp/test-cv.json");

    const { stdout } = await execFileAsync("npx", [
      "tsx",
      CLI_PATH,
      testZipPath,
      testOutputPath,
    ]);

    expect(stdout).toContain(testOutputPath);
    expect(fs.existsSync(testOutputPath)).toBe(true);
    const parsed = JSON.parse(fs.readFileSync(testOutputPath, "utf-8"));
    expect(parsed.basics.name).toBe("Zhifan Chen");

    fs.rmSync(testZipPath, { force: true });
    fs.rmSync(testOutputPath, { force: true });
  });
});
