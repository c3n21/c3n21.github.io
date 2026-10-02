import { z } from "zod";

const emptyToUndefined = z
  .string()
  .optional()
  .transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined));

const requiredString = z
  .string()
  .min(1)
  .transform((val) => val.trim());

export const ProfileCsvRowSchema = z
  .object({
    "First Name": requiredString,
    "Last Name": requiredString,
    Headline: emptyToUndefined,
    Summary: emptyToUndefined,
    "Geo Location": emptyToUndefined,
    Websites: emptyToUndefined,
  })
  .passthrough();

export const PositionsCsvRowSchema = z
  .object({
    "Company Name": requiredString,
    Title: requiredString,
    Description: emptyToUndefined,
    Location: emptyToUndefined,
    "Started On": requiredString,
    "Finished On": emptyToUndefined,
  })
  .passthrough();

export const EducationCsvRowSchema = z
  .object({
    "School Name": requiredString,
    "Start Date": emptyToUndefined,
    "End Date": emptyToUndefined,
    Notes: emptyToUndefined,
    "Degree Name": emptyToUndefined,
    Activities: emptyToUndefined,
  })
  .passthrough();

export const ProjectsCsvRowSchema = z
  .object({
    Title: requiredString,
    Description: emptyToUndefined,
    Url: emptyToUndefined,
    "Started On": emptyToUndefined,
    "Finished On": emptyToUndefined,
  })
  .passthrough();

export const SkillsCsvRowSchema = z
  .object({
    Name: requiredString,
  })
  .passthrough();

export const LanguagesCsvRowSchema = z
  .object({
    Name: requiredString,
    Proficiency: emptyToUndefined,
  })
  .passthrough();

export type ProfileCsvRow = z.infer<typeof ProfileCsvRowSchema>;
export type PositionsCsvRow = z.infer<typeof PositionsCsvRowSchema>;
export type EducationCsvRow = z.infer<typeof EducationCsvRowSchema>;
export type ProjectsCsvRow = z.infer<typeof ProjectsCsvRowSchema>;
export type SkillsCsvRow = z.infer<typeof SkillsCsvRowSchema>;
export type LanguagesCsvRow = z.infer<typeof LanguagesCsvRowSchema>;
