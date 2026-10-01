import { describe, expect, it } from "vitest";
import {
  ProfileCsvRowSchema,
  PositionsCsvRowSchema,
  EducationCsvRowSchema,
  ProjectsCsvRowSchema,
  SkillsCsvRowSchema,
  LanguagesCsvRowSchema,
} from "./schemas";

describe("LinkedIn CSV schemas", () => {
  it("validates Profile.csv row and ignores extra columns", () => {
    const raw = {
      "First Name": "Zhifan",
      "Last Name": "Chen",
      Headline: "Software Engineer",
      Summary: "Summary text",
      "Geo Location": "Milan",
      Websites: "https://example.dev",
      "Extra Unknown Column": "ignored",
    };
    const parsed = ProfileCsvRowSchema.parse(raw);
    expect(parsed["First Name"]).toBe("Zhifan");
    expect(parsed["Last Name"]).toBe("Chen");
    expect(parsed.Headline).toBe("Software Engineer");
    expect(parsed.Summary).toBe("Summary text");
    expect(parsed["Geo Location"]).toBe("Milan");
    expect(parsed.Websites).toBe("https://example.dev");
  });

  it("handles blank optional fields in Positions.csv", () => {
    const raw = {
      "Company Name": "Example Company",
      Title: "Software Engineer",
      Description: "Built things",
      Location: "Milan",
      "Started On": "Jun 2022",
      "Finished On": "",
    };
    const parsed = PositionsCsvRowSchema.parse(raw);
    expect(parsed["Company Name"]).toBe("Example Company");
    expect(parsed["Finished On"]).toBeUndefined();
  });

  it("validates Education, Projects, Skills, and Languages rows", () => {
    expect(
      EducationCsvRowSchema.parse({
        "School Name": "Example University",
        "Start Date": "2019",
        "End Date": "",
        "Degree Name": "Bachelor of Science",
        Notes: "Ongoing, part-time",
      })["School Name"],
    ).toBe("Example University");

    expect(
      ProjectsCsvRowSchema.parse({
        Title: "Project Alpha",
        Description: "Project description",
        Url: "",
        "Started On": "2025",
        "Finished On": "",
      }).Title,
    ).toBe("Project Alpha");

    expect(
      SkillsCsvRowSchema.parse({
        Name: "TypeScript",
      }).Name,
    ).toBe("TypeScript");

    expect(
      LanguagesCsvRowSchema.parse({
        Name: "Italian",
        Proficiency: "Native or bilingual proficiency",
      }).Name,
    ).toBe("Italian");
  });
});
