import { describe, expect, it } from "vitest";
import { ProfessionalProfileSchema } from "./professional-profile";

describe("ProfessionalProfileSchema", () => {
  it("accepts mixed date precision without inventing day values", () => {
    const result = ProfessionalProfileSchema.parse({
      basics: {
        firstName: "Zhifan",
        lastName: "Chen",
        headline: "Software Engineer",
        websites: [],
      },
      positions: [
        {
          company: "Example",
          title: "Software Engineer",
          startDate: "2022-06",
        },
      ],
      education: [
        {
          institution: "Example University",
          startDate: "2019",
        },
      ],
      projects: [],
      skills: [],
      languages: [],
    });

    expect(result.positions[0].startDate).toBe("2022-06");
    expect(result.education[0].startDate).toBe("2019");
  });

  it("rejects full dates that were not part of the supported precision model", () => {
    expect(() =>
      ProfessionalProfileSchema.parse({
        basics: {
          firstName: "Zhifan",
          lastName: "Chen",
          websites: [],
        },
        positions: [
          {
            company: "Example",
            title: "Engineer",
            startDate: "2022-06-01",
          },
        ],
        education: [],
        projects: [],
        skills: [],
        languages: [],
      }),
    ).toThrow();
  });
});
