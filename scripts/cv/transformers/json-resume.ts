import type { ProfessionalProfile } from "../domain/professional-profile";
import { splitDescription } from "../sources/linkedin-archive/normalize";

export interface JsonResume {
  basics: {
    name: string;
    label?: string;
    image?: string;
    email?: string;
    phone?: string;
    url?: string;
    summary?: string;
    location?: {
      address?: string;
      postalCode?: string;
      city?: string;
      countryCode?: string;
      region?: string;
    };
    profiles?: Array<{
      network: string;
      username?: string;
      url: string;
    }>;
  };
  work: Array<{
    name: string;
    position: string;
    url?: string;
    startDate: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
    location?: string;
  }>;
  education: Array<{
    institution: string;
    url?: string;
    area?: string;
    studyType?: string;
    startDate?: string;
    endDate?: string;
    score?: string;
    courses?: string[];
    description?: string;
  }>;
  projects: Array<{
    name: string;
    description?: string;
    summary?: string;
    highlights?: string[];
    keywords?: string[];
    startDate?: string;
    endDate?: string;
    url?: string;
    roles?: string[];
    entity?: string;
    type?: string;
  }>;
  skills: Array<{
    name: string;
    level?: string;
    keywords?: string[];
  }>;
  languages: Array<{
    language: string;
    fluency?: string;
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
      summary: profile.basics.summary,
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
        startDate: pos.startDate,
        endDate: pos.endDate || undefined,
        summary: summary || undefined,
        highlights: highlights.length > 0 ? highlights : undefined,
        location: pos.location,
      };
    }),
    education: profile.education.map((edu) => ({
      institution: edu.institution,
      studyType: edu.degree,
      area: edu.field || (edu.degree?.includes("Computer Science") ? "Computer Science" : undefined),
      startDate: edu.startDate,
      endDate: edu.endDate || undefined,
      description: edu.description,
    })),
    projects: profile.projects.map((proj) => {
      const { summary, highlights } = splitDescription(proj.description);
      return {
        name: proj.name,
        description: summary || undefined,
        summary: summary || undefined,
        highlights: highlights.length > 0 ? highlights : undefined,
        startDate: proj.startDate,
        endDate: proj.endDate || undefined,
        url: proj.url,
      };
    }),
    skills: profile.skills.map((name) => ({ name })),
    languages: profile.languages.map((lang) => ({
      language: lang.language,
      fluency: lang.fluency,
    })),
  };
}
