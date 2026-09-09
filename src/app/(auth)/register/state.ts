export type RegisterFormValues = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  establishment: string;
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
    establishment?: string[];
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
  establishment: "",
};

export const initialRegisterState: RegisterState = {
  error: null,
  fieldErrors: {},
  redirectTo: null,
  values: emptyRegisterFormValues,
};
