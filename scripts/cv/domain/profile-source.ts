import type { ProfessionalProfile } from "./professional-profile";

export interface ProfileSource {
  load(): Promise<ProfessionalProfile>;
}
