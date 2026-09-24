import type { TeacherWithStats } from "./teacher.type";

/** ISO 3166-1 alpha-2 — Europe (EU + UK/EFTA/micro-states) + US + CA */
export const ESTABLISHMENT_COUNTRIES = [
  "AD",
  "AT",
  "BE",
  "BG",
  "CA",
  "CH",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FR",
  "GB",
  "GR",
  "HR",
  "HU",
  "IE",
  "IS",
  "IT",
  "LI",
  "LT",
  "LU",
  "LV",
  "MC",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SE",
  "SI",
  "SK",
  "SM",
  "US",
  "VA",
] as const;

export type EstablishmentCountry = (typeof ESTABLISHMENT_COUNTRIES)[number];

export type EstablishmentAddress = {
  street: string;
  zipCode: string;
  city: string;
  country: EstablishmentCountry;
};

export interface Establishment {
  id: string;
  supabaseUserId: string;
  name: string;
  email: string;
  type: EstablishmentType;
  address: EstablishmentAddress;
  createdAt: string;
}

export interface EstablishmentStats {
  totalTeachers: number;
  totalSessions: number;
  totalStudents: number;
}

export interface EstablishmentStatsResponse {
  establishment: Establishment;
  teachers: TeacherWithStats[];
  stats: EstablishmentStats;
}

export const ESTABLISHMENT_TYPES = [
  "primary_school",
  "middle_school",
  "high_school",
  "higher_education",
  "university",
  "graduate_school",
  "vocational_training",
  "other",
] as const;

export type EstablishmentType = (typeof ESTABLISHMENT_TYPES)[number];
