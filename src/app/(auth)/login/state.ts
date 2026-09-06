export type LoginState = {
  error: string | null;
  fieldErrors: {
    email?: string[];
    password?: string[];
  };
  redirectTo: string | null;
};

export const initialLoginState: LoginState = {
  error: null,
  fieldErrors: {},
  redirectTo: null,
};
