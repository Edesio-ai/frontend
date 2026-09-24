import type { EstablishmentCountry, EstablishmentType } from "@/types";

export type RegisterFormValues = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  establishmentName: string;
  establishmentType: EstablishmentType | "";
  addressStreet: string;
  addressZipCode: string;
  addressCity: string;
  addressCountry: EstablishmentCountry | "";
};

export type RegisterState = {
  error: string | null;
  fieldErrors: {
    firstname?: string[];
    lastname?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    acceptTerms?: string[];
    establishmentName?: string[];
    establishmentType?: string[];
    addressStreet?: string[];
    addressZipCode?: string[];
    addressCity?: string[];
    addressCountry?: string[];
  };
  redirectTo: string | null;
  values: RegisterFormValues;
};

export const emptyRegisterFormValues: RegisterFormValues = {
  firstname: "",
  lastname: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
  establishmentName: "",
  establishmentType: "",
  addressStreet: "",
  addressZipCode: "",
  addressCity: "",
  addressCountry: "",
};

export const initialRegisterState: RegisterState = {
  error: null,
  fieldErrors: {},
  redirectTo: null,
  values: emptyRegisterFormValues,
};
