export const PASSWORD_MIN_LENGTH = 12;

/** Same rule as the backend RegisterBody / UpdatePasswordBodyDto. */
export const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export type PasswordCriteria = {
  minLength: boolean;
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  special: boolean;
  match: boolean;
};

export function getPasswordCriteria(password: string, confirmPassword: string): PasswordCriteria {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    match: password.length > 0 && confirmPassword.length > 0 && password === confirmPassword,
  };
}

export function isPasswordStrong(password: string): boolean {
  return PASSWORD_COMPLEXITY_REGEX.test(password) && password.length >= PASSWORD_MIN_LENGTH;
}
