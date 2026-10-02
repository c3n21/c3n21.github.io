import { z } from "zod";

export const PartialDateSchema = z.string().regex(
  /^\d{4}(?:-\d{2})?$/,
  "Expected YYYY or YYYY-MM",
);

export const ProfessionalProfileSchema = z.object({
  basics: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    headline: z.string().optional(),
    summary: z.string().optional(),
    location: z.string().optional(),
    websites: z.array(
      z.object({
        label: z.string().min(1),
        url: z.string().url(),
      }),
    ),
  }),
  positions: z.array(
    z.object({
      company: z.string().min(1),
      title: z.string().min(1),
      description: z.string().optional(),
      location: z.string().optional(),
      startDate: PartialDateSchema,
      endDate: PartialDateSchema.optional(),
    }),
  ),
  education: z.array(
    z.object({
      institution: z.string().min(1),
      degree: z.string().optional(),
      field: z.string().optional(),
      description: z.string().optional(),
      startDate: PartialDateSchema.optional(),
      endDate: PartialDateSchema.optional(),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      startDate: PartialDateSchema.optional(),
      endDate: PartialDateSchema.optional(),
      url: z.string().url().optional(),
    }),
  ),
  skills: z.array(z.string().min(1)),
  languages: z.array(
    z.object({
      language: z.string().min(1),
      fluency: z.string().optional(),
    }),
  ),
});

export type ProfessionalProfile = z.infer<typeof ProfessionalProfileSchema>;
