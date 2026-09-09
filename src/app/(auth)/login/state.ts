export type LoginFormValues = {
  email: string;
  password: string;
};

export type LoginState = {
  error: string | null;
  fieldErrors: {
    email?: string[];
    password?: string[];
  };
  redirectTo: string | null;
  values: LoginFormValues;
};

export const emptyLoginFormValues: LoginFormValues = {
  email: "",
  password: "",
};

export const initialLoginState: LoginState = {
  error: null,
  fieldErrors: {},
  redirectTo: null,
  values: emptyLoginFormValues,
};
