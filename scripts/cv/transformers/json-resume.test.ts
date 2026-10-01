import { describe, expect, it } from "vitest";
import { toJsonResume } from "./json-resume";
import type { ProfessionalProfile } from "../domain/professional-profile";

describe("toJsonResume", () => {
  const sampleProfile: ProfessionalProfile = {
    basics: {
      firstName: "Zhifan",
      lastName: "Chen",
      headline: "Software Engineer",
      summary: "I break things to understand them.",
      location: "Milan, Lombardy, Italy",
      websites: [
        { label: "PORTFOLIO", url: "https://c3n21.github.io" },
      ],
    },
    positions: [
      {
        company: "HRM Group",
        title: "Software Engineer",
        description: "Built systems. · Improved CI. · Debugged issues.",
        location: "Milan",
        startDate: "2022-06",
      },
      {
        company: "TiNoleggio Srl",
        title: "Software Engineer",
        description: "Symfony 4 work.",
        location: "Milan",
        startDate: "2019-10",
        endDate: "2020-04",
      },
    ],
    education: [
      {
        institution: "Università degli Studi di Milano",
        degree: "Bachelor’s degree in Computer Science",
        description: "Ongoing, part-time",
        startDate: "2019-09",
      },
      {
        institution: "ITIS Nullo Baldini",
        degree: "Diploma from a technical institute",
        startDate: "2014",
        endDate: "2019",
      },
    ],
    projects: [
      {
        name: "Nixpkgs Contributor",
        description: "Packaging software. · Improving build reliability.",
      },
      {
        name: "Personal Website",
        description: "Portfolio website.",
        url: "https://c3n21.github.io",
      },
    ],
    skills: ["TypeScript", "Nix", "React"],
    languages: [
      { language: "Italian", fluency: "Native or bilingual proficiency" },
      { language: "English", fluency: "Professional working proficiency" },
    ],
  };

  it("transforms profile into standard JSON Resume format", () => {
    const resume = toJsonResume(sampleProfile);

    expect(resume.basics.name).toBe("Zhifan Chen");
    expect(resume.basics.label).toBe("Software Engineer");
    expect(resume.basics.email).toBe("me@zhifan.me");
    expect(resume.basics.url).toBe("https://c3n21.github.io");
    expect(resume.basics.location?.city).toBe("Milan");
    expect(resume.basics.location?.countryCode).toBe("IT");

    expect(resume.work).toHaveLength(2);
    expect(resume.work[0].name).toBe("HRM Group");
    expect(resume.work[0].position).toBe("Software Engineer");
    expect(resume.work[0].startDate).toBe("2022-06");
    expect(resume.work[0].endDate).toBeUndefined();
    expect(resume.work[0].summary).toBe("Built systems.");
    expect(resume.work[0].highlights).toEqual(["Improved CI.", "Debugged issues."]);

    expect(resume.work[1].endDate).toBe("2020-04");

    expect(resume.education).toHaveLength(2);
    expect(resume.education[0].institution).toBe("Università degli Studi di Milano");
    expect(resume.education[0].studyType).toBe("Bachelor’s degree in Computer Science");
    expect(resume.education[0].endDate).toBeUndefined();

    expect(resume.projects).toHaveLength(2);
    expect(resume.projects[0].name).toBe("Nixpkgs Contributor");
    expect(resume.projects[0].url).toBeUndefined();
    expect(resume.projects[1].url).toBe("https://c3n21.github.io");

    expect(resume.skills).toEqual([
      { name: "TypeScript" },
      { name: "Nix" },
      { name: "React" },
    ]);

    expect(resume.languages).toEqual([
      { language: "Italian", fluency: "Native or bilingual proficiency" },
      { language: "English", fluency: "Professional working proficiency" },
    ]);
  });
});
