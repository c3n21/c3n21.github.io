import type { ProfessionalProfile } from "../domain/professional-profile";
import { splitDescription } from "../sources/linkedin-archive/normalize";

export interface JsonResume {
  basics: {
    name: string;
    label?: string | null;
    image?: string | null;
    email?: string | null;
    phone?: string | null;
    url?: string | null;
    summary?: string | null;
    location?: {
      address?: string | null;
      postalCode?: string | null;
      city?: string | null;
      countryCode?: string | null;
      region?: string | null;
    } | null;
    profiles?: Array<{
      network: string;
      username?: string | null;
      url: string;
    }> | null;
  };
  work: Array<{
    name: string;
    position: string;
    url?: string | null;
    startDate: string;
    endDate?: string | null;
    summary?: string | null;
    highlights?: string[] | null;
    location?: string | null;
  }>;
  education: Array<{
    institution: string;
    url?: string | null;
    area?: string | null;
    studyType?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    score?: string | null;
    courses?: string[] | null;
    description?: string | null;
  }>;
  projects: Array<{
    name: string;
    description?: string | null;
    summary?: string | null;
    highlights?: string[] | null;
    keywords?: string[] | null;
    startDate?: string | null;
    endDate?: string | null;
    url?: string | null;
    roles?: string[] | null;
    entity?: string | null;
    type?: string | null;
  }>;
  skills: Array<{
    name: string;
    level?: string | null;
    keywords?: string[] | null;
  }>;
  languages: Array<{
    language: string;
    fluency?: string | null;
  }>;
}

export function toJsonResume(profile: ProfessionalProfile): JsonResume {
  const name = `${profile.basics.firstName} ${profile.basics.lastName}`.trim();

  return {
    basics: {
      name,
      label: profile.basics.headline || "Software Engineer",
      email: "me@zhifan.me",
      url: "https://c3n21.github.io",
      summary: profile.basics.summary || null,
      location: {
        city: "Milan",
        region: "Lombardy",
        countryCode: "IT",
      },
      profiles: [
        {
          network: "GitHub",
          username: "c3n21",
          url: "https://github.com/c3n21",
        },
        {
          network: "LinkedIn",
          username: "zhifanchen00",
          url: "https://www.linkedin.com/in/zhifanchen00/",
        },
      ],
    },
    work: profile.positions.map((pos) => {
      const { summary, highlights } = splitDescription(pos.description);
      return {
        name: pos.company,
        position: pos.title,
        url: null,
        startDate: pos.startDate,
        endDate: pos.endDate || null,
        summary: summary || null,
        highlights: highlights.length > 0 ? highlights : null,
        location: pos.location || null,
      };
    }),
    education: profile.education.map((edu) => ({
      institution: edu.institution,
      studyType: edu.degree || null,
      area: edu.field || (edu.degree?.includes("Computer Science") ? "Computer Science" : null),
      startDate: edu.startDate || null,
      endDate: edu.endDate || null,
      description: edu.description || null,
      courses: [] as string[],
      url: null,
    })),
    projects: profile.projects.map((proj) => {
      const { summary, highlights } = splitDescription(proj.description);
      return {
        name: proj.name,
        description: summary || null,
        summary: summary || null,
        highlights: highlights.length > 0 ? highlights : null,
        startDate: proj.startDate || null,
        endDate: proj.endDate || null,
        url: proj.url || null,
      };
    }),
    skills: profile.skills.map((name) => ({ name })),
    languages: profile.languages.map((lang) => ({
      language: lang.language,
      fluency: lang.fluency || null,
    })),
  };
}
