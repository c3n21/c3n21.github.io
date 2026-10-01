import path from "node:path";
import fs from "node:fs/promises";
import { LinkedInArchiveSource } from "./sources/linkedin-archive";
import { toJsonResume } from "./transformers/json-resume";

async function main() {
  const input = process.argv[2];
  const output = process.argv[3] || "src/cv.json";

  if (!input) {
    console.error("Usage: pnpm cv:import <linkedin-export.zip> [output-path]");
    process.exit(2);
  }

  const resolvedInput = path.resolve(input);
  const resolvedOutput = path.resolve(output);

  const bytes = await fs.readFile(resolvedInput);
  const profile = await new LinkedInArchiveSource(bytes).load();
  const resume = toJsonResume(profile);

  await fs.mkdir(path.dirname(resolvedOutput), { recursive: true });
  await fs.writeFile(
    resolvedOutput,
    `${JSON.stringify(resume, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `Imported LinkedIn archive successfully -> ${resolvedOutput} (${resume.work.length} positions, ${resume.education.length} schools, ${resume.projects.length} projects, ${resume.skills.length} skills, ${resume.languages.length} languages)`,
  );
}

main().catch((err) => {
  console.error("Error importing LinkedIn archive:", err.message);
  process.exit(1);
});
