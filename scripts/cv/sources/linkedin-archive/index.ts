import JSZip from "jszip";
import { parse } from "csv-parse/sync";
import type { z } from "zod";
import type { ProfileSource } from "../../domain/profile-source";
import {
  type ProfessionalProfile,
  ProfessionalProfileSchema,
} from "../../domain/professional-profile";
import {
  ProfileCsvRowSchema,
  PositionsCsvRowSchema,
  EducationCsvRowSchema,
  ProjectsCsvRowSchema,
  SkillsCsvRowSchema,
  LanguagesCsvRowSchema,
} from "./schemas";
import { normalizeLinkedInDate } from "./normalize";

async function readCsv<T>(
  zip: JSZip,
  name: string,
  schema: z.ZodType<T>,
): Promise<T[]> {
  const file = zip.file(name);
  if (!file) return [];

  const text = await file.async("string");
  if (!text.trim()) return [];

  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_column_count: true,
  });

  return records.map((record: unknown) => schema.parse(record));
}

function parseWebsites(raw?: string): Array<{ label: string; url: string }> {
  if (!raw?.trim()) return [];

  const results: Array<{ label: string; url: string }> = [];
  // LinkedIn export format: [LABEL:URL] or comma-separated URLs
  const bracketMatches = raw.matchAll(/\[([^:\]]+):([^\]]+)\]/g);
  let matchedAny = false;

  for (const match of bracketMatches) {
    matchedAny = true;
    const label = (match[1] ?? "").trim();
    const url = (match[2] ?? "").trim();
    try {
      const parsed = new URL(url);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        results.push({ label: label || "Website", url: parsed.toString() });
      }
    } catch {
      // ignore invalid URL
    }
  }

  if (!matchedAny) {
    const parts = raw.split(/[,;\s]+/);
    for (const part of parts) {
      if (!part.trim()) continue;
      try {
        const parsed = new URL(part.trim());
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
          results.push({ label: "Website", url: parsed.toString() });
        }
      } catch {
        // ignore invalid URL
      }
    }
  }

  return results;
}

function parseUrl(raw?: string): string | undefined {
  if (!raw?.trim()) return undefined;
  try {
    const parsed = new URL(raw.trim());
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export class LinkedInArchiveSource implements ProfileSource {
  constructor(private readonly archiveData: Buffer | Uint8Array) {}

  async load(): Promise<ProfessionalProfile> {
    const zip = await JSZip.loadAsync(this.archiveData);

    const profileFile = zip.file("Profile.csv");
    if (!profileFile) {
      throw new Error("Invalid LinkedIn export: Profile.csv not found");
    }

    const [profileRows, positionRows, educationRows, projectRows, skillRows, languageRows] =
      await Promise.all([
        readCsv(zip, "Profile.csv", ProfileCsvRowSchema),
        readCsv(zip, "Positions.csv", PositionsCsvRowSchema),
        readCsv(zip, "Education.csv", EducationCsvRowSchema),
        readCsv(zip, "Projects.csv", ProjectsCsvRowSchema),
        readCsv(zip, "Skills.csv", SkillsCsvRowSchema),
        readCsv(zip, "Languages.csv", LanguagesCsvRowSchema),
      ]);

    const profileRow = profileRows[0];
    if (!profileRow) {
      throw new Error("Invalid LinkedIn export: Profile.csv is empty");
    }

    const profile: ProfessionalProfile = {
      basics: {
        firstName: profileRow["First Name"],
        lastName: profileRow["Last Name"],
        headline: profileRow.Headline,
        summary: profileRow.Summary,
        location: profileRow["Geo Location"],
        websites: parseWebsites(profileRow.Websites),
      },
      positions: positionRows.map((row) => ({
        company: row["Company Name"],
        title: row.Title,
        description: row.Description,
        location: row.Location,
        startDate: normalizeLinkedInDate(row["Started On"])!,
        endDate: normalizeLinkedInDate(row["Finished On"]),
      })),
      education: educationRows.map((row) => ({
        institution: row["School Name"],
        degree: row["Degree Name"],
        field: row.Activities,
        description: row.Notes,
        startDate: normalizeLinkedInDate(row["Start Date"]),
        endDate: normalizeLinkedInDate(row["End Date"]),
      })),
      projects: projectRows.map((row) => ({
        name: row.Title,
        description: row.Description,
        startDate: normalizeLinkedInDate(row["Started On"]),
        endDate: normalizeLinkedInDate(row["Finished On"]),
        url: parseUrl(row.Url),
      })),
      skills: skillRows.map((row) => row.Name),
      languages: languageRows.map((row) => ({
        language: row.Name,
        fluency: row.Proficiency,
      })),
    };

    return ProfessionalProfileSchema.parse(profile);
  }
}
